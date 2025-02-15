const express = require("express");
const router = express.Router();
const accomodationController = require("../controllers/accomodationController");
const handleResponse = require("../middlewares/handleResponse");
const authenticateToken = require("../middlewares/isAuthenticated");

router.post(
  "/",
  authenticateToken,
  accomodationController.getAccommodation,
  handleResponse
);

module.exports = router;
