const express = require("express");
const router = express.Router();
const rasaController = require("../controllers/botController");
const handleResponse = require("../middlewares/handleResponse");
const authenticateToken = require("../middlewares/isAuthenticated");

router.post(
  "/suggestions/:location",
  authenticateToken,
  rasaController.getSuggestions,
  handleResponse
);
router.post(
  "/translate",
  authenticateToken,
  rasaController.translate,
  handleResponse
);

module.exports = router;
