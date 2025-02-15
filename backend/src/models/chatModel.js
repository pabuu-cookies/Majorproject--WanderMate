const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  id: { type: String },
  text: { type: String },
  createdAt: { type: Date, default: Date.now },
  user: {
    _id: { type: String },
    name: { type: String },
  },
});

const chatSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
