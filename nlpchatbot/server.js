const express = require("express");
const fs = require("fs");
const { NlpManager } = require("node-nlp");
const Fuse = require("fuse.js");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chatbot";

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed", err);
    process.exit(1);
  });

// Session Schema
const sessionSchema = new mongoose.Schema(
  {
    userId: String,
    context: {
      lastIntent: String, // Last intent mentioned by the user
      lastPlace: String, // Last place mentioned by the user
      followUpIntent: String, // Follow-up intent for multi-turn conversations
    },
    history: Array, // Stores the conversation history
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

// Initialize NLP Manager
const manager = new NlpManager({
  languages: ["en"],
  autoSave: false,
  nlu: { useNoneFeature: false },
});

// Load training data
let trainingData;
try {
  console.log("📥 Loading training data...");
  const rawData = fs.readFileSync("trainingData.json", "utf-8");
  trainingData = JSON.parse(rawData);

  if (
    !trainingData ||
    !trainingData.intents ||
    !Array.isArray(trainingData.intents)
  ) {
    throw new Error(
      "Invalid training data format: 'intents' key is missing or not an array."
    );
  }

  console.log(`✅ Found ${trainingData.intents.length} intents.`);

  trainingData.intents.forEach((intent) => {
    if (
      !intent.intent ||
      !Array.isArray(intent.examples) ||
      !Array.isArray(intent.responses)
    ) {
      console.error(`❌ Skipping invalid intent:`, intent);
      return;
    }
    intent.examples.forEach((example) =>
      manager.addDocument("en", example, intent.intent)
    );
    intent.responses.forEach((response) =>
      manager.addAnswer("en", intent.intent, response)
    );
  });

  console.log("✅ Training data successfully loaded.");
} catch (error) {
  console.error("❌ ERROR: Failed to load training data.", error);
  process.exit(1);
}

// Fuse.js for fuzzy matching
const fuseOptions = { includeScore: true, threshold: 0.3, keys: ["examples"] };
const fuse = new Fuse(trainingData.intents, fuseOptions);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized: No valid token" });

  jwt.verify(authHeader.split(" ")[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Forbidden: Invalid token" });
    req.user = decoded;
    next();
  });
};

// Train the NLP model and start the server
(async () => {
  await manager.train();
  manager.save();
  console.log("✅ NLP Model training completed and saved.");

  // Chat endpoint
  app.post("/chat", authenticateToken, async (req, res) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({
          error: "Invalid JSON format. Please send a valid JSON body.",
        });
      }

      const userId = req.user.id;
      const userMessage = req.body.message?.trim();

      if (!userMessage) {
        return res
          .status(400)
          .json({ error: "Invalid input. Please send a valid text message." });
      }

      let session = await Session.findOne({ userId });
      if (!session) {
        session = new Session({
          userId,
          context: { lastIntent: null, lastPlace: null, followUpIntent: null },
          history: [],
        });
        await session.save();
      }

      // Check if the user is asking a follow-up question
      const lastIntent = session.context.lastIntent;
      const lastPlace = session.context.lastPlace;
      let intentToUse = lastIntent;

      // If no follow-up, perform fuzzy matching or NLP processing
      if (!lastIntent) {
        const fuseResults = fuse.search(userMessage);
        if (fuseResults.length > 0 && fuseResults[0].score < 0.4) {
          intentToUse = fuseResults[0].item.intent;
        } else {
          const nlpResponse = await manager.process("en", userMessage);
          intentToUse = nlpResponse.intent || "fallback";
        }
      }

      // Find the intent in the training data
      const intent = trainingData.intents.find((i) => i.intent === intentToUse);
      let response;

      if (intent) {
        // Check if the intent has follow-up questions
        if (intent.follow_up_questions && session.context.followUpIntent) {
          const followUpIntent = intent.follow_up_questions.find(
            (f) => f.intent === session.context.followUpIntent
          );
          if (followUpIntent) {
            response =
              followUpIntent.responses[
                Math.floor(Math.random() * followUpIntent.responses.length)
              ];
          }
        } else {
          response =
            intent.responses[
              Math.floor(Math.random() * intent.responses.length)
            ];
        }

        // Update context with the last mentioned place and intent
        if (intent.entities && intent.entities.length > 0) {
          const placeEntity = intent.entities.find((e) => e.entity === "place");
          if (placeEntity) {
            session.context.lastPlace = placeEntity.option;
          }
        }
        session.context.lastIntent = intentToUse;
      } else {
        // Fallback response
        response = "Sorry, I didn't understand that. Can you rephrase?";
      }

      // Update session history
      session.history.push({ userMessage, response });
      await session.save();

      return res.json({ reply: response });
    } catch (error) {
      console.error("❌ Error in chat endpoint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Start the server
  app.listen(port, () =>
    console.log(`🚀 SERVER ONLINE at http://localhost:${port}`)
  );
})();
