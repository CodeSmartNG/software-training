// 1. Import Dependencies
const express = require('express');
const mongoose = require('mongoose');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
AdminJS.registerAdapter(AdminJSMongoose);

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Define Models (Course, User, Message)
const MessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});
const Message = mongoose.model('Message', MessageSchema);
// ... (Your other models, like Course and User)

// >>>>>> PLACE THE NEW CODE HERE <<<<<<<

// 3. EXPRESS MIDDLEWARE & API ROUTES
// This is where you add the code for your contact form.
// It MUST come after the models are defined.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your new /api/contact route
app.post('/api/contact', async (req, res) => {
  try {
    const newMessage = new Message({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subject,
      message: req.body.message
    });
    await newMessage.save();
    res.status(200).json({ success: true, message: 'Thank you! Your message has been sent.' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

// 4. Configure AdminJS & Its Router
const adminOptions = {
  resources: [ Message, Course, User ], // Add Message to this list
};
const admin = new AdminJS(adminOptions);
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, { ... }); // Your auth config
app.use(admin.options.rootPath, adminRouter); // This line connects AdminJS last

// 5. Start Server & Connect to DB
const startServer = async () => {
    await mongoose.connect('mongodb://localhost:27017/codesmartng');
    app.listen(PORT, () => {
        console.log(`Server running: http://localhost:${PORT}`);
        console.log(`Admin Panel: http://localhost:${PORT}${admin.options.rootPath}`);
    });
};
startServer().catch(console.error);
