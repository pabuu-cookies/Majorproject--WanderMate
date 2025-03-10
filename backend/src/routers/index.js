const express = require("express");
const router = express.Router();

const chatbotRouter = require("./botRouter");
const userRouter = require("./userRouter");
const todoRouter = require("./todoRouter");
const accommodationRouter = require("./accomodation");
const chatRouter = require("./chatRouter");
const reviewRouter = require("./reviewRouter");
const notificationRouter = require("./notificationRouter");
const hireRequestRouter = require("./hireRequest");

router.use("/chat", chatRouter);
router.use("/chatbot", chatbotRouter);
router.use("/user", userRouter);
router.use("/todo", todoRouter);
router.use("/accomodation", accommodationRouter);
router.use("/review", reviewRouter);
router.use("/notification", notificationRouter);
router.use("/hire-requests", hireRequestRouter);

module.exports = router;
