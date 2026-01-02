
// server.js - COMPLETE WORKING VERSION
const express = require('express');
const mongoose = require('mongoose');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const bcrypt = require('bcrypt');

// Register MongoDB adapter
AdminJS.registerAdapter(AdminJSMongoose);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// ================== MODELS DEFINITION ==================

// 1. User Model (for admin authentication)
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// 2. Message Model (for contact form)
const MessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    course: String,
    subject: String,
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});
const Message = mongoose.model('Message', MessageSchema);

// 3. Course Model
const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    duration: String,
    fee: { type: Number, required: true },
    language: { type: String, default: 'en' },
    status: { type: String, default: 'active' },
    description: String,
    learn: [String],
    prerequisites: [String],
    image: String,
    outline: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Course = mongoose.model('Course', CourseSchema);

// ================== MIDDLEWARE ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== API ROUTES ==================

// 1. Contact Form API
app.post('/api/contact', async (req, res) => {
    try {
        const newMessage = new Message({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            course: req.body.course,
            subject: req.body.subject,
            message: req.body.message
        });
        
        await newMessage.save();
        res.status(200).json({ 
            success: true, 
            message: 'Thank you! Your message has been sent.' 
        });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message.' 
        });
    }
});

// 2. Public API to get courses (for your website)
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find({ status: 'active' });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// ================== ADMINJS CONFIGURATION ==================

const adminOptions = {
    resources: [
        {
            resource: Message,
            options: {
                navigation: { name: 'Messages', icon: 'Message' },
                listProperties: ['name', 'email', 'subject', 'date', 'isRead'],
                properties: {
                    message: { type: 'textarea' },
                    date: { isVisible: { list: true, show: true, edit: false } },
                    isRead: { 
                        isVisible: { list: true, show: true, edit: true },
                        availableValues: [
                            { value: true, label: 'Read' },
                            { value: false, label: 'Unread' }
                        ]
                    }
                },
                actions: {
                    markAsRead: {
                        actionType: 'record',
                        icon: 'Eye',
                        handler: async (request, response, context) => {
                            const { record } = context;
                            await record.update({ isRead: true });
                            return {
                                record: record.toJSON(),
                                redirectUrl: '/admin/resources/Message/records/' + record.id() + '/show',
                                notice: {
                                    message: 'Message marked as read',
                                    type: 'success'
                                }
                            };
                        }
                    }
                }
            }
        },
        {
            resource: Course,
            options: {
                navigation: { name: 'Courses', icon: 'Book' },
                properties: {
                    description: { type: 'textarea' },
                    learn: { type: 'textarea' },
                    prerequisites: { type: 'textarea' },
                    createdAt: { isVisible: { edit: false } },
                    updatedAt: { isVisible: { edit: false } }
                }
            }
        },
        {
            resource: User,
            options: {
                navigation: { name: 'Admins', icon: 'User' },
                properties: {
                    password: {
                        type: 'password',
                        isVisible: {
                            list: false,
                            edit: true,
                            filter: false,
                            show: false
                        }
                    }
                }
            }
        }
    ],
    branding: {
        companyName: 'CodeSmart NG',
        logo: false,
        theme: {
            colors: {
                primary100: '#2563eb',
                primary80: '#3b82f6',
                primary60: '#60a5fa',
                primary40: '#93c5fd',
                primary20: '#dbeafe'
            }
        }
    },
    rootPath: '/admin',
    dashboard: {
        handler: async () => {
            const messageCount = await Message.countDocuments();
            const courseCount = await Course.countDocuments();
            const unreadMessages = await Message.countDocuments({ isRead: false });
            
            return {
                messageCount,
                courseCount,
                unreadMessages
            };
        },
        component: AdminJS.bundle('./components/Dashboard') // Optional custom dashboard
    }
};

const admin = new AdminJS(adminOptions);

// ================== AUTHENTICATION ==================

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
    authenticate: async (email, password) => {
        const user = await User.findOne({ email });
        if (user) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                return { email: user.email, role: user.role };
            }
        }
        return null;
    },
    cookiePassword: process.env.COOKIE_SECRET || 'change-this-to-32-character-secret',
    maxAge: 24 * 60 * 60 // 24 hours
});

app.use(admin.options.rootPath, adminRouter);

// ================== CREATE FIRST ADMIN USER ==================

async function createFirstAdmin() {
    try {
        const adminCount = await User.countDocuments();
        
        if (adminCount === 0) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('admin123', saltRounds);
            
            const adminUser = new User({
                email: 'admin@codesmartng.com',
                password: hashedPassword,
                role: 'superadmin'
            });
            
            await adminUser.save();
            console.log('✅ First admin user created:');
            console.log('   Email: admin@codesmartng.com');
            console.log('   Password: admin123');
            console.log('   CHANGE THESE CREDENTIALS IMMEDIATELY!');
        }
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

// ================== START SERVER ==================

async function startServer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codesmartng');
        console.log('✅ Connected to MongoDB');
        
        // Create first admin if none exists
        await createFirstAdmin();
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`👑 Admin panel: http://localhost:${PORT}/admin`);
            console.log(`📨 Contact API: http://localhost:${PORT}/api/contact`);
            console.log(`📚 Courses API: http://localhost:${PORT}/api/courses`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
