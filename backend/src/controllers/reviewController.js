const HttpMessage = require("../middlewares/HttpMessage");
const reviewService = require("../services/reviewService");

class ReviewController {
  // Create a new review
  async createReview(req, res, next) {
    const { place, rating, visitDate, visitType, reviewText } = req.body;
    const userId = req.userId;
    try {
      const newReview = await reviewService.createReview({
        place,
        rating,
        visitDate,
        visitType,
        reviewText,
        user: userId,
      });

      res.locals.responseData = newReview;
      next();
    } catch (error) {
      res.locals.responseData = { error: error };
      console.log(error);
      next();
    }
  }

  async getReviewsByUser(req, res, next) {
    const userId = req.params.userId; // Get user ID from params

    try {
      const reviews = await reviewService.getReviewsByUser(userId);
      res.locals.responseData = reviews;
      next();
    } catch (error) {
      res.locals.responseData = { error: error };
      console.log(error);
      next();
    }
  }

  // Get reviews by place
  async getReviewsByPlace(req, res, next) {
    const { place } = req.query; // Place name passed as query parameter

    try {
      const reviews = await reviewService.getReviewsByPlace(place);
      res.locals.responseData = reviews;
      next();
    } catch (error) {
      res.locals.responseData = { error: error };
      console.log(error);
      next();
    }
  }

  // Get all reviews (optional)
  async getAllReviews(req, res, next) {
    try {
      const allReviews = await reviewService.getAllReviews();
      res.locals.responseData = allReviews;
      next();
    } catch (error) {
      res.locals.responseData = { error: error };
      console.log(error);
      next();
    }
  }

  // Edit a review
  async updateReview(req, res, next) {
    const { reviewId } = req.params;
    const updateData = req.body;
    const userId = req.userId;

    try {
      const updatedReview = await reviewService.updateReview(
        reviewId,
        userId,
        updateData
      );
      res.locals.responseData = updatedReview;
      next();
    } catch (error) {
      res.locals.responseData = { error: error };
      console.log(error);
      next();
    }
  }

  async deleteReview(req, res, next) {
    const { reviewId } = req.params;
    const userId = req.userId;

    try {
      const deletedReview = await reviewService.deleteReview(reviewId, userId);
      res.locals.responseData = deletedReview;
      next();
    } catch (error) {
      res.locals.responseData = { error: error };
      console.log(error);
      next();
    }
  }
}

module.exports = new ReviewController();
