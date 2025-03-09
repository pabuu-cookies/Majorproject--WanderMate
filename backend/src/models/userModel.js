const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "guide"], default: "user" },
  password: { type: String, required: true },

  profileImage: { type: String },
  bio: { type: String },
  languages: { type: [String] },
  experience: { type: Number, min: 0 },
  certifications: { type: [String] },
  specialties: { type: [String] },
  location: { type: String },
  availability: { type: Boolean, default: true },
  socialLinks: {
    website: { type: String },
    instagram: { type: String },
    facebook: { type: String },
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
