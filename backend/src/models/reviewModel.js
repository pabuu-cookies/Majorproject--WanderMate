const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    place: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    visitDate: {
      type: Date,
    },
    visitType: {
      type: String,
      enum: ["solo", "friends", "family", "business", "couple"],
    },
    reviewText: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
