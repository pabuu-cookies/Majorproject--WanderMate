const express = require('express');
const fs = require('fs');
const { NlpManager } = require('node-nlp');
const Fuse = require('fuse.js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const NLP_SCORE_THRESHOLD = 0.6;
const FUZZY_MATCH_THRESHOLD = 0.4;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Initialize NLP Manager
const manager = new NlpManager({ languages: ['en'], autoSave: false, nlu: { useNoneFeature: false } });

// Load training data
let trainingData;
try {
    console.log('📥 Loading training data...');
    const rawData = fs.readFileSync('trainingData.json', 'utf-8');
    trainingData = JSON.parse(rawData);

    if (!trainingData || !trainingData.intents || !Array.isArray(trainingData.intents)) {
        throw new Error("Invalid training data format: 'intents' key is missing or not an array.");
    }

    console.log(`✅ Loaded ${trainingData.intents.length} intents.`);

    trainingData.intents.forEach(intent => {
        intent.examples.forEach(example => {
            manager.addDocument('en', example, intent.intent);
        });

        if (intent.follow_up_questions) {
            intent.follow_up_questions.forEach(followUp => {
                followUp.examples.forEach(example => {
                    manager.addDocument('en', example, followUp.intent);
                });
            });
        }

        intent.responses.forEach(response => {
            manager.addAnswer('en', intent.intent, response);
        });
    });

    console.log('✅ NLP Model ready.');
} catch (error) {
    console.error('❌ ERROR: Failed to load training data.', error);
    process.exit(1);
}

// Fuse.js for fuzzy matching
const fuseOptions = { includeScore: true, threshold: FUZZY_MATCH_THRESHOLD, keys: ['examples'] };
const fuse = new Fuse(trainingData.intents, fuseOptions);

// Store session context in memory
const sessionMemory = {};

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No valid token' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
        req.user = decoded;
        next();
    });
};

// Session cleanup (auto-clear sessions after inactivity)
const cleanUpSessions = () => {
    const now = Date.now();
    Object.keys(sessionMemory).forEach(userId => {
        if (now - sessionMemory[userId].lastActivity > SESSION_TIMEOUT) {
            delete sessionMemory[userId];
        }
    });
};
setInterval(cleanUpSessions, 60 * 1000); // Clean up every minute

// Rate Limiter to avoid abuse
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit to 10 requests per minute
    message: "Too many requests, please try again later."
});
app.use('/chat', limiter);

// Train NLP model and start server
(async () => {
    if (fs.existsSync('./model.nlp')) {
        await manager.load('./model.nlp');
    } else {
        await manager.train();
        manager.save('./model.nlp');
    }
    console.log('✅ NLP Model training completed.');

    // Login endpoint
    app.post('/login', (req, res) => {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'User ID is required' });
        const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });

    app.post('/chat', authenticateToken, async (req, res) => {
        try {
            const userId = req.user.id;
            const userMessage = req.body.message?.trim().toLowerCase();

            if (!userMessage) {
                return res.status(400).json({ error: "No message provided." });
            }

            // Initialize session if it doesn't exist
            if (!sessionMemory[userId]) {
                sessionMemory[userId] = { context: { lastIntent: null }, history: [], lastActivity: Date.now() };
            }

            let session = sessionMemory[userId];
            let intentToUse = null;

            // Check for follow-up intent
            if (session.context.lastIntent) {
                const lastIntentData = trainingData.intents.find(i => i.intent === session.context.lastIntent);

                if (lastIntentData && lastIntentData.follow_up_questions) {
                    console.log(`🔍 Checking for follow-up intent in last intent: ${session.context.lastIntent}`);

                    // NLP.js check
                    const followUpResponse = await manager.process('en', userMessage);
                    let matchedFollowUp = lastIntentData.follow_up_questions.find(f => f.intent === followUpResponse.intent);

                    // Fuzzy matching check
                    if (!matchedFollowUp) {
                        const followUpFuse = new Fuse(lastIntentData.follow_up_questions, { keys: ['intent'], threshold: 0.4 });
                        const fuzzyMatch = followUpFuse.search(userMessage);

                        if (fuzzyMatch.length > 0) {
                            matchedFollowUp = fuzzyMatch[0].item;
                        }
                    }

                    // Return follow-up response if found
                    if (matchedFollowUp) {
                        console.log(`🔗 Follow-up detected: ${matchedFollowUp.intent}`);
                        return res.json({ reply: matchedFollowUp.responses[0] });
                    }
                }
            }

            // NLP Processing for regular message
            const nlpResponse = await manager.process('en', userMessage);
            if (nlpResponse.intent && nlpResponse.score > NLP_SCORE_THRESHOLD) {
                intentToUse = nlpResponse.intent;
                console.log(`🤖 NLP recognized intent: ${intentToUse}`);
            } else {
                intentToUse = 'fallback'; // Default fallback intent
                console.log('⚠ No strong intent recognized, using fallback.');
            }

            // Fetch the intent and ensure it exists
            const intent = trainingData.intents.find(i => i.intent === intentToUse);

            if (!intent) {
                console.error("❌ Intent not found:", intentToUse);
                return res.json({ reply: "Sorry, I couldn't understand that." });
            }

            // If responses exist, select a random response
            if (intent.responses && intent.responses.length > 0) {
                const response = intent.responses[Math.floor(Math.random() * intent.responses.length)];

                // Update session context with the new intent
                session.context.lastIntent = intentToUse;
                session.history.push({ userMessage, response });
                session.lastActivity = Date.now();

                return res.json({ reply: response });
            } else {
                console.error("❌ No responses found for intent:", intentToUse);
                return res.json({ reply: "Sorry, I couldn't provide an answer to that." });
            }
        } catch (error) {
            console.error("❌ Error in chat endpoint:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // Start the server
    app.listen(port, () => console.log(`🚀 SERVER ONLINE at http://localhost:${port}`));
})();
