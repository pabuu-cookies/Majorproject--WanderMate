const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const handleResponse = require("../middlewares/handleResponse");
const isAuthorized = require("../middlewares/isAuthorized");
const isAuthenticated = require("../middlewares/isAuthenticated");
const upload = require("../utils/multer");

router.post("/register", userController.registerUser, handleResponse);
router.post("/login", userController.loginUser, handleResponse);
router.post(
  "/guide-info",
  upload.fields(""),
  isAuthenticated,
  isAuthorized("guide"),
  userController.updateuserInfo,
  handleResponse
);

module.exports = router;
