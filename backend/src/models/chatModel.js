const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;