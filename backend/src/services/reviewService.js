const Fuse = require("fuse.js");
const Review = require("../models/reviewModel");
const HttpMessage = require("../middlewares/HttpMessage");

class ReviewService {
  async createReview({
    place,
    rating,
    visitDate,
    visitType,
    reviewText,
    user,
  }) {
    try {
      if (!place && reviewText && user) {
        throw HttpMessage.BAD_REQUEST;
      }
      const newReview = new Review({
        place,
        rating,
        visitDate,
        visitType,
        reviewText,
        user,
      });

      await newReview.save();
      return newReview;
    } catch (error) {
      throw error;
    }
  }

  async getReviewsByUser(userId) {
    try {
      const reviews = await Review.find({ user: userId }).populate(
        "user",
        "name email"
      );
      return reviews;
    } catch (error) {
      throw error;
    }
  }

  async getReviewsByPlace(place) {
    try {
      const reviews = await Review.find().populate("user", "name email");
      const fuse = new Fuse(reviews, {
        includeScore: true,
        threshold: 0.3,
        keys: ["place"],
      });

      const result = fuse.search(place);
      const matchedReviews = result.map((resultItem) => resultItem.item);

      return matchedReviews;
    } catch (error) {
      throw error;
    }
  }

  async getAllReviews() {
    try {
      const reviews = await Review.find().populate("user", "name email");
      return reviews;
    } catch (error) {
      throw error;
    }
  }

  async updateReview(reviewId, userId, updateData) {
    try {
      const updatedReview = await Review.findById(reviewId);
      if (!updatedReview) {
        throw HttpMessage.NOT_FOUND;
      }

      if (updatedReview.user.toString() !== userId) {
        throw HttpMessage.FORBIDDEN;
      }
      const update = await Review.findByIdAndUpdate(reviewId, updateData, {
        new: true,
      });
      return update;
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(reviewId, userId) {
    try {
      const deletedReview = await Review.findById(reviewId);
      if (!deletedReview) {
        throw HttpMessage.NOT_FOUND;
      }
      if (deletedReview.user.toString() !== userId) {
        throw HttpMessage.FORBIDDEN;
      }
      await Review.findByIdAndDelete(reviewId);
      return "deleted review successfully!";
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReviewService();
