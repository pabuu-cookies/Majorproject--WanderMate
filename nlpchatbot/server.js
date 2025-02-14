const express = require('express');
const bodyParser = require('body-parser');
const { NlpManager } = require('node-nlp');
const fs = require('fs');

const app = express();
const port = 3000;

// Initialize NLP manager
const manager = new NlpManager({ languages: ['en'] });

// Load and validate training data
let trainingData;
try {
    const rawData = fs.readFileSync('trainingData.json', 'utf-8');
    trainingData = JSON.parse(rawData);
    console.log('✅ Training data loaded successfully.');
} catch (error) {
    console.error('❌ Error loading training data:', error);
    process.exit(1); // Exit if file cannot be read
}

// Validate training data format
if (!trainingData || !Array.isArray(trainingData.intents)) {
    console.error("❌ Invalid training data format: Missing or incorrect 'intents' array.");
    process.exit(1);
}

// Add training data to NLP manager
trainingData.intents.forEach(intent => {
    if (Array.isArray(intent.examples)) {
        intent.examples.forEach(example => manager.addDocument('en', example, intent.intent));
    } else {
        console.error(`⚠️ Warning: 'examples' is not an array for intent: ${intent.intent}`);
    }

    if (Array.isArray(intent.responses)) {
        intent.responses.forEach(response => manager.addAnswer('en', intent.intent, response));
    } else {
        console.error(`⚠️ Warning: 'responses' is not an array for intent: ${intent.intent}`);
    }
});

// Train the model
(async () => {
    console.log('🛠 Training model...');
    await manager.train();
    manager.save();
    console.log('✅ Model trained and saved.');

    // Middleware to parse raw text body
    app.use(bodyParser.text());

    // Chatbot endpoint
    app.post('/chat', async (req, res) => {
        console.log('📩 Received message:', req.body);

        let userMessage = req.body;

        // Validate input type
        if (typeof userMessage !== 'string' || userMessage.trim() === '') {
            console.error('❌ Invalid input: Expected a text message.');
            return res.status(400).send('Invalid input. Please send a text message.');
        }

        try {
            const response = await manager.process('en', userMessage);
            const reply = response.answer || "Sorry, I didn't understand that.";
            console.log('🤖 Bot reply:', reply);
            res.send(reply);
        } catch (error) {
            console.error('❌ Error processing the message:', error);
            res.status(500).send('An error occurred while processing your message.');
        }
    });

    // Start the server
    app.listen(port, () => {
        console.log(`🚀 Chatbot server running at http://localhost:${port}`);
    });
})();
