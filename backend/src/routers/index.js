const express = require("express");
const router = express.Router();

const chatbotRouter = require("./botRouter");
const userRouter = require("./userRouter");
const todoRouter = require("./todoRouter");
const accommodationRouter = require("./accomodation");
const chatRouter = require("./chatRouter");

router.use("/chat", chatRouter);
router.use("/chatbot", chatbotRouter);
router.use("/user", userRouter);
router.use("/todo", todoRouter);
router.use("/accomodation", accommodationRouter);

module.exports = router;
