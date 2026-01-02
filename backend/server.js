const mongoose = require('mongoose');

// Add this Mongoose schema near your other models
const MessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String, // Optional field
    subject: String,
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', MessageSchema);
