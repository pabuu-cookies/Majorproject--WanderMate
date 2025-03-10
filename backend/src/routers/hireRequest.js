const express = require("express");
const router = express.Router();
const hireRequestController = require("../controllers/HireRequestController");
const handleResponse = require("../middlewares/handleResponse");
const isAuthorized = require("../middlewares/isAuthorized");
const isAuthenticated = require("../middlewares/isAuthenticated");

router.get(
  "/guide",
  isAuthenticated,
  isAuthorized("guide"),
  hireRequestController.getHireRequestsForGuide,
  handleResponse
);

router.get(
  "/user",
  isAuthenticated,
  isAuthorized("user"),
  hireRequestController.getHireRequestsForUser,
  handleResponse
);

router.patch(
  "/:hireRequestId",
  isAuthenticated,
  hireRequestController.updateHireRequestStatus,
  handleResponse
);

module.exports = router;
