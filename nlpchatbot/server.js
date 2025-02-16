const express = require('express');
const bodyParser = require('body-parser');
const { NlpManager } = require('node-nlp');
const fs = require('fs');
const Fuse = require('fuse.js');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());  // Middleware to parse JSON requests

// Initialize NLP Manager
const manager = new NlpManager({ languages: ['en'], autoSave: false, nlu: { useNoneFeature: false } });

// Load and validate training data
let trainingData;
try {
    const rawData = fs.readFileSync('trainingData.json', 'utf-8');
    trainingData = JSON.parse(rawData);
    if (!Array.isArray(trainingData.intents)) throw new Error("Invalid format: Missing or incorrect 'intents' array.");
    console.log('✅ Training data loaded successfully.');
} catch (error) {
    console.error('❌ Error loading training data:', error);
    process.exit(1);
}

// Add training data to NLP Manager
trainingData.intents.forEach(intent => {
    const { intent: intentName, examples, responses } = intent;
    if (Array.isArray(examples)) examples.forEach(example => manager.addDocument('en', example, intentName));
    if (Array.isArray(responses)) responses.forEach(response => manager.addAnswer('en', intentName, response));
});

// Fuse.js options for fuzzy matching
const fuseOptions = {
    includeScore: true,
    threshold: 0.3,  // Controls fuzzy matching sensitivity
    keys: ['examples']  // Search within 'examples' field of intents
};
const fuse = new Fuse(trainingData.intents, fuseOptions);

// Train NLP Model
(async () => {
    try {
        console.log('🛠 Training model...');
        await manager.train();
        manager.save();
        console.log('✅ Model trained and saved.');

        // Store user context for handling session-specific info
        const sessionContext = {};

        // Chatbot Endpoint
        app.post('/chat', async (req, res) => {
            const userId = req.headers['user-id'] || 'default';  // Use session ID if available
            const userMessage = req.body.message?.trim();

            if (!userMessage) {
                return res.status(400).json({ error: 'Invalid input. Please send a valid text message.' });
            }

            try {
                // Fuzzy search for the best matching example
                const fuseResults = fuse.search(userMessage);

                if (fuseResults.length > 0 && fuseResults[0].score < 0.4) {
                    const bestMatch = fuseResults[0].item;
                    const response = bestMatch.responses[Math.floor(Math.random() * bestMatch.responses.length)];

                    // Check for place entities
                    const placeEntities = bestMatch.entities?.filter(entity => entity.entity === 'place') || [];

                    if (placeEntities.length > 0) {
                        const place = placeEntities[0].option;

                        // Store the last mentioned place in the session context
                        sessionContext[userId] = { lastMentionedPlace: place };
                    }

                    // If a place is mentioned, use it for follow-up questions
                    if (sessionContext[userId]?.lastMentionedPlace) {
                        const lastPlace = sessionContext[userId].lastMentionedPlace;
                        return res.json({ reply: `You're asking about ${lastPlace}. How can I assist you further with ${lastPlace}?` });
                    }

                    // Return the matched response
                    return res.json({ reply: response });
                } else {
                    // Fallback to NLP model if no close fuzzy match
                    const nlpResponse = await manager.process('en', userMessage);
                    const reply = nlpResponse.answer || "Sorry, I didn't understand that.";
                    res.json({ reply });
                }
            } catch (error) {
                console.error('❌ Error processing the message:', error);
                res.status(500).json({ error: 'An error occurred while processing your message.' });
            }
        });

        // Start the server
        app.listen(port, () => {
            console.log(`🚀 Chatbot server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('❌ Error training the NLP model:', error);
        process.exit(1);
    }
})();
