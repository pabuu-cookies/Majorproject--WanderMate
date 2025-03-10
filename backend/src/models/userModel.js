const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "guide"], default: "user" },
  password: { type: String, required: true },

  // New fields based on demoGuides
  profileImage: { type: String },
  description: { type: String },
  availableDates: { type: [String] },
  status: {
    type: String,
    enum: ["pending", "hired", "available"],
    default: "available",
  },

  languages: { type: [String] },
  experience: { type: Number, min: 0 },

  socialLinks: {
    website: { type: String },
    instagram: { type: String },
    facebook: { type: String },
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
