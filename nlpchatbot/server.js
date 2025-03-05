const express = require('express');
const fs = require('fs');
const { NlpManager } = require('node-nlp');
const Fuse = require('fuse.js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // For ChatGPT API
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.text());
app.use(express.json());

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your_openai_api_key';
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

// Store session context in memory
const sessionMemory = {}; // Object to store user sessions

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ Unauthorized: No valid token');
        return res.status(401).json({ error: 'Unauthorized: No valid token' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log(`❌ JWT Error: ${err.message}`);
            return res.status(403).json({ error: 'Forbidden: Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

// OpenAI API Function
async function callChatGPT(userInput) {
    const API_URL = 'https://api.openai.com/v1/chat/completions';

    try {
        console.log("input to chatgpt..", userInput);
        const response = await axios.post(API_URL, {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userInput }],
            max_tokens: 100
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
       
        console.error("❌ Error calling ChatGPT API:", error.message);
        return "I'm having trouble understanding you right now. Please try again later.";
    }
}

// Train NLP model and start server
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

            // Check for follow-up questions
            const lastIntent = session.context.lastIntent;

            if (lastIntent) {
                const previousIntent = trainingData.intents.find(i => i.intent === lastIntent);
                
                if (previousIntent && previousIntent.follow_up_questions) {
                    const followUp = previousIntent.follow_up_questions.find(f => 
                        f.examples.some(e => userMessage.toLowerCase().includes(e.toLowerCase()))
                    );

                    if (followUp) {
                        intentToUse = followUp.intent;
                    }
                }
            }

            // NLP processing if no follow-up detected
            if (!intentToUse) {
                const nlpResponse = await manager.process('en', userMessage);
                if (nlpResponse.intent && nlpResponse.score > NLP_SCORE_THRESHOLD) {
                    intentToUse = nlpResponse.intent;
                } else {
                    intentToUse = 'fallback';
                }
            }

            // Retrieve intent's response
            const intent = trainingData.intents.find(i => i.intent === intentToUse);

            if (!intent) {
                console.log("⚠ No matching intent found. Falling back to ChatGPT.");
                const chatGPTResponse = await callChatGPT(userMessage);
                return res.json({ reply: chatGPTResponse });
            }

            let response = intent.responses[Math.floor(Math.random() * intent.responses.length)];

            // If fallback intent, call ChatGPT
            if (intent.intent === "fallback") {
                console.log("🤖 No intent match. Calling ChatGPT...");
                response = await callChatGPT(userMessage);
            }

            // Update session history
            session.context.lastIntent = intentToUse;
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
