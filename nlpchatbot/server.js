const express = require('express');
const fs = require('fs');
const { NlpManager } = require('node-nlp');
const Fuse = require('fuse.js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chatbot';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => { console.error('❌ MongoDB Connection Failed', err); process.exit(1); });

const sessionSchema = new mongoose.Schema({
    userId: String,
    context: Object,
    history: Array,
});
const Session = mongoose.model('Session', sessionSchema);

// Initialize NLP Manager
const manager = new NlpManager({ languages: ['en'], autoSave: false, nlu: { useNoneFeature: false } });

// Load training data
let trainingData;
try {
    console.log('📥 Loading training data...');
    const rawData = fs.readFileSync('trainingData.json', 'utf-8');
    trainingData = JSON.parse(rawData);
    trainingData.intents.forEach(intent => {
        intent.examples.forEach(example => manager.addDocument('en', example, intent.intent));
        intent.responses.forEach(response => manager.addAnswer('en', intent.intent, response));
    });
    console.log('✅ Training data successfully loaded.');
} catch (error) {
    console.error('❌ ERROR: Failed to load training data.', error);
    process.exit(1);
}

const fuseOptions = { includeScore: true, threshold: 0.3, keys: ['examples'] };
const fuse = new Fuse(trainingData.intents, fuseOptions);

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized: No valid token' });

    jwt.verify(authHeader.split(' ')[1], JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
        req.user = decoded;
        next();
    });
};

(async () => {
    await manager.train();
    manager.save();
    console.log('✅ NLP Model training completed and saved.');

    app.post('/chat', authenticateToken, async (req, res) => {
        const userId = req.user.id;
        const userMessage = req.body?.trim();

        if (!userMessage) return res.status(400).send('Invalid input. Please send a valid text message.');

        let session = await Session.findOne({ userId });
        if (!session) {
            session = new Session({ userId, context: {}, history: [] });
            await session.save();
        }

        if (userMessage.toLowerCase() === "more") {
            if (!session.context.lastMentioned) return res.send("More about what? Please specify.");
            return res.send(`Here is more about ${session.context.lastMentioned}. [Add more details here]`);
        }

        const fuseResults = fuse.search(userMessage);
        if (fuseResults.length > 0 && fuseResults[0].score < 0.4) {
            const bestMatch = fuseResults[0].item;
            const response = bestMatch.responses[Math.floor(Math.random() * bestMatch.responses.length)];
            session.context.lastMentioned = bestMatch.intent;
            session.history.push({ userMessage, response });
            await session.save();
            return res.send(response);
        } else {
            const nlpResponse = await manager.process('en', userMessage);
            const reply = nlpResponse.answer || "Sorry, I didn't understand that.";
            session.history.push({ userMessage, reply });
            await session.save();
            return res.send(reply);
        }
    });

    app.listen(port, () => console.log(`🚀 SERVER ONLINE at http://localhost:${port}`));
})();
