const mongoose = require("mongoose");

const hireRequestSchema = new mongoose.Schema({
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Referring to the User model
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Referring to the User model for the person who is hiring
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "cancelled", "completed"],
    default: "pending",
  },
  hireDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp of when the hire request was created
  },
});

const HireRequest = mongoose.model("HireRequest", hireRequestSchema);

module.exports = HireRequest;
