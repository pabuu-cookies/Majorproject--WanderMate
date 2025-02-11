const express = require("express");
const router = express.Router();

const chatbotRouter = require("./botRouter");
const userRouter = require("./userRouter");
const todoRouter = require("./todoRouter");

router.use("/chatbot", chatbotRouter);
router.use("/user", userRouter);
router.use("/todo", todoRouter);

module.exports = router;
