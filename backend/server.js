
// 1. IMPORTS & SETUP
const express = require('express');
const mongoose = require('mongoose');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
AdminJS.registerAdapter(AdminJSMongoose);

const app = express();
const PORT = process.env.PORT || 3000;

// 2. DEFINE MODELS
const Message = mongoose.model('Message', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: String,
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
}));

// ... your other models (Course, User, etc.) here ...

// 3. CONFIGURE ADMINJS - PUT YOUR CODE HERE
// >>>>>>>>>>>>>>>>>>>> START OF YOUR CODE <<<<<<<<<<<<<<<<<<<<
const admin = new AdminJS({
  resources: [
    // Your existing resources (Course, User, etc.)
    {
      resource: Message,
      options: {
        listProperties: ['name', 'email', 'subject', 'date', 'isRead'],
        properties: {
          message: { type: 'textarea' },
          date: { isVisible: { show: true, edit: false } }
        },
        actions: {
          markAsRead: {
            actionType: 'record',
            handler: async (request, response, context) => {
              const { record } = context;
              await record.update({ isRead: true });
              return { record: record.toJSON() };
            }
          }
        }
      }
    },
    // DON'T FORGET TO KEEP YOUR OTHER RESOURCES HERE!
    Course,  // Your Course model
    User,    // Your User model (for admin logins)
  ],
  rootPath: '/admin',
});
// >>>>>>>>>>>>>>>>>>>> END OF YOUR CODE <<<<<<<<<<<<<<<<<<<<

// 4. CREATE THE ROUTER (with authentication)
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate: async (email, password) => {
    // ... your authentication code ...
  },
  cookiePassword: 'your-secure-cookie-password'
});

// 5. ADD API ROUTES (like /api/contact)
app.use(express.json());
app.post('/api/contact', async (req, res) => {
  // ... your contact form handling code ...
});

// 6. CONNECT ADMINJS ROUTER (LAST!)
app.use(admin.options.rootPath, adminRouter);

// 7. START SERVER
const startServer = async () => {
  await mongoose.connect('mongodb://localhost:27017/codesmartng');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}${admin.options.rootPath}`);
  });
};

startServer().catch(console.error);
