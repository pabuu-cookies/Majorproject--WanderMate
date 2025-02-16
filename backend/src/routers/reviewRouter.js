const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const handleResponse = require("../middlewares/handleResponse");
const authenticateToken = require("../middlewares/isAuthenticated");

router.post(
  "/",
  authenticateToken,
  reviewController.createReview,
  handleResponse
);

router.get(
  "/user/:userId",
  authenticateToken,
  reviewController.getReviewsByUser,
  handleResponse
);

router.get(
  "/place",
  authenticateToken,
  reviewController.getReviewsByPlace,
  handleResponse
);

router.get(
  "/all",
  authenticateToken,
  reviewController.getAllReviews,
  handleResponse
);

router.patch(
  "/:reviewId",
  authenticateToken,
  reviewController.updateReview,
  handleResponse
);

router.delete(
  "/:reviewId",
  authenticateToken,
  reviewController.deleteReview,
  handleResponse
);

module.exports = router;
