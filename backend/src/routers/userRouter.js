const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const handleResponse = require("../middlewares/handleResponse");
const isAuthorized = require("../middlewares/isAuthorized");
const isAuthenticated = require("../middlewares/isAuthenticated");
const upload = require("../utils/multer");
const parseJsonFields = require("../middlewares/parseJson");
const appendFile = require("../middlewares/appendFile");

router.post("/register", userController.registerUser, handleResponse);
router.post("/login", userController.loginUser, handleResponse);

router.post(
  "/profile/update",
  isAuthenticated,
  isAuthorized("guide"),
  upload.single("profileImage"),
  appendFile([{ fileField: "profileImage", bodyField: "profileImage" }]),
  parseJsonFields(["availableDates", "languages"]),
  userController.updateGuideProfile,
  handleResponse
);

router.get(
  "/guides",
  isAuthenticated,
  userController.getAllGuides,
  handleResponse
);

router.get(
  "/hire/:guideId",
  isAuthenticated,
  isAuthorized("user"),
  userController.hireGuide,
  handleResponse
);

module.exports = router;
