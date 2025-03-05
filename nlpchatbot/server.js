const express = require('express');
const fs = require('fs');
const { NlpManager } = require('node-nlp');
const Fuse = require('fuse.js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.text());
app.use(express.json());

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const NLP_SCORE_THRESHOLD = 0.6;
const FUZZY_MATCH_THRESHOLD = 0.4;

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

    console.log(`✅ Found ${trainingData.intents.length} intents.`);

    trainingData.intents.forEach(intent => {
        if (!intent.intent || !Array.isArray(intent.examples) || !Array.isArray(intent.responses)) {
            console.error(`❌ Skipping invalid intent:`, intent);
            return;
        }
        intent.examples.forEach(example => manager.addDocument('en', example, intent.intent));
        intent.responses.forEach(response => manager.addAnswer('en', intent.intent, response));
    });

    console.log('✅ Training data successfully loaded.');
} catch (error) {
    console.error('❌ ERROR: Failed to load training data.', error);
    process.exit(1);
}

// Fuse.js for fuzzy matching
const fuseOptions = { includeScore: true, threshold: FUZZY_MATCH_THRESHOLD, keys: ['examples'] };
const fuse = new Fuse(trainingData.intents, fuseOptions);

// Store session context in memory (instead of Redis)
const sessionMemory = {}; // Object to store user sessions

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No valid token' });
    }

    jwt.verify(authHeader.split(' ')[1], JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
        req.user = decoded;
        next();
    });
};

// Train the NLP model and start the server
(async () => {
    if (fs.existsSync('./model.nlp')) {
        await manager.load('./model.nlp');
    } else {
        await manager.train();
        manager.save('./model.nlp');
    }
    console.log('✅ NLP Model training completed and saved.');

    // Login endpoint to generate JWT
    app.post('/login', (req, res) => {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'User ID is required' });
        const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });

    // Chat endpoint
    app.post('/chat', authenticateToken, async (req, res) => {
        try {
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({ error: "Invalid JSON format. Please send a valid JSON body." });
            }

            const userId = req.user.id;
            const userMessage = req.body.message?.trim();

            if (!userMessage) {
                return res.status(400).json({ error: "Invalid input: No message provided." });
            }

            // Get or create a session in memory
            if (!sessionMemory[userId]) {
                sessionMemory[userId] = {
                    context: { lastIntent: null, lastPlace: null, followUpIntent: null },
                    history: [],
                    lastActivity: Date.now()
                };
            }

            let session = sessionMemory[userId];
            let intentToUse = null;

            // Check if the user is asking a follow-up question
            const lastIntent = session.context.lastIntent;

            if (lastIntent) {
                // Find the previous intent in training data
                const previousIntent = trainingData.intents.find(i => i.intent === lastIntent);
                
                if (previousIntent && previousIntent.follow_up_questions) {
                    // Check if the user’s question matches any follow-up examples
                    const followUp = previousIntent.follow_up_questions.find(f => 
                        f.examples.some(e => userMessage.toLowerCase().includes(e.toLowerCase()))
                    );

                    if (followUp) {
                        intentToUse = followUp.intent;
                    }
                }
            }

            // If no follow-up intent is detected, perform normal NLP processing
            if (!intentToUse) {
                const nlpResponse = await manager.process('en', userMessage);

                if (nlpResponse.intent && nlpResponse.score > NLP_SCORE_THRESHOLD) {
                    intentToUse = nlpResponse.intent;
                } else {
                    intentToUse = 'fallback';
                }
            }

            // Retrieve the intent's response
            const intent = trainingData.intents.find(i => i.intent === intentToUse);
            let response = "Sorry, I didn't understand that. Can you rephrase?";

            if (intent) {
                response = intent.responses[Math.floor(Math.random() * intent.responses.length)];
                session.context.lastIntent = intentToUse; // Update last intent
            }

            // Update session history
            session.history.push({ userMessage, response });
            session.lastActivity = Date.now();

            return res.json({ reply: response });

        } catch (error) {
            console.error("❌ Error in chat endpoint:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // Start the server
    app.listen(port, () => console.log(`🚀 SERVER ONLINE at http://localhost:${port}`));
})();
