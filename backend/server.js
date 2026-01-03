
// server.js - UPDATED AND CORRECTED VERSION
const express = require('express');
const mongoose = require('mongoose');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

// Register MongoDB adapter
AdminJS.registerAdapter(AdminJSMongoose);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// ================== CORS MIDDLEWARE ==================
// Allow your live GitHub Pages site and local development
const allowedOrigins = [
    'https://codesmartng.github.io',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:5500'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

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

// 4. Student Enrollment Model
const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    course: { type: String, required: true },
    paymentStatus: { type: String, default: 'pending' },
    amountPaid: Number,
    paymentReference: String,
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, default: 'active' }
});
const Student = mongoose.model('Student', StudentSchema);

// 5. Newsletter Subscription Model
const NewsletterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});
const Newsletter = mongoose.model('Newsletter', NewsletterSchema);

// 6. Testimonial Model
const TestimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: String,
    message: { type: String, required: true },
    avatar: String,
    rating: { type: Number, min: 1, max: 5 },
    isApproved: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});
const Testimonial = mongoose.model('Testimonial', TestimonialSchema);

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
            message: req.body.message,
            subject: `New inquiry for ${req.body.course || 'General Inquiry'}`
        });
        
        await newMessage.save();
        res.status(200).json({ 
            success: true, 
            message: 'Thank you! Your message has been sent successfully.' 
        });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message.' 
        });
    }
});

// 2. Public API to get courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find({ status: 'active' });
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch courses' 
        });
    }
});

// 3. Student Enrollment API
app.post('/api/enroll', async (req, res) => {
    try {
        const { name, email, phone, course, paymentReference, amountPaid } = req.body;
        
        const newStudent = new Student({
            name,
            email,
            phone,
            course,
            paymentReference,
            amountPaid,
            paymentStatus: paymentReference ? 'paid' : 'pending'
        });
        
        await newStudent.save();
        res.status(200).json({ 
            success: true, 
            message: 'Enrollment successful! We will contact you soon.',
            studentId: newStudent._id
        });
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Enrollment failed. Please try again.' 
        });
    }
});

// 4. Newsletter Subscription API
app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if already subscribed
        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return res.json({ 
                success: true, 
                message: 'You are already subscribed to our newsletter!' 
            });
        }
        
        const newSubscriber = new Newsletter({ email });
        await newSubscriber.save();
        
        res.json({ 
            success: true, 
            message: 'Successfully subscribed to our newsletter!' 
        });
    } catch (error) {
        console.error('Newsletter error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Subscription failed. Please try again.' 
        });
    }
});

// 5. Testimonials API
app.get('/api/testimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isApproved: true })
            .sort({ date: -1 })
            .limit(10);
        res.json({ success: true, data: testimonials });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch testimonials' 
        });
    }
});

// 6. Schedule API (Return class schedules)
app.get('/api/schedule', async (req, res) => {
    try {
        const schedule = [
            {
                id: 1,
                course: "Frontend Development",
                date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
                time: "10:00 AM - 1:00 PM (Mon, Wed, Fri)",
                instructor: "Musa Ahmed",
                mode: "Online (Live)",
                seatsLeft: 10
            },
            {
                id: 2,
                course: "Backend Development",
                date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                time: "2:00 PM - 5:00 PM (Tue, Thu)",
                instructor: "Aisha Bello",
                mode: "Hybrid",
                seatsLeft: 5
            },
            {
                id: 3,
                course: "Computer Basics",
                date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                time: "9:00 AM - 12:00 PM (Weekdays)",
                instructor: "Fatima Yusuf",
                mode: "In-Person",
                seatsLeft: 15
            }
        ];
        
        res.json({ success: true, data: schedule });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch schedule' 
        });
    }
});

// 7. Payment initialization API (for Paystack)
app.post('/api/payment/create', async (req, res) => {
    try {
        const { amount, course, email, name } = req.body;
        
        // Generate a unique reference
        const reference = `CSN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Save payment intent to database (you might create a Payment model)
        // For now, just return the reference
        res.json({
            success: true,
            reference,
            amount,
            email,
            message: 'Payment initialized successfully'
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to initialize payment' 
        });
    }
});

// 8. Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        service: 'CodeSmart NG Backend',
        version: '1.0.0'
    });
});

// 9. Get contact messages (for testing)
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ date: -1 });
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});

// 10. Get enrollment stats
app.get('/api/stats', async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalMessages = await Message.countDocuments();
        const totalCourses = await Course.countDocuments({ status: 'active' });
        
        res.json({
            success: true,
            data: {
                totalStudents,
                totalMessages,
                totalCourses,
                unreadMessages: await Message.countDocuments({ isRead: false })
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

// ================== ADMINJS CONFIGURATION ==================

const adminOptions = {
    resources: [
        {
            resource: Message,
            options: {
                navigation: { name: 'Messages', icon: 'Message' },
                listProperties: ['name', 'email', 'course', 'date', 'isRead'],
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
            resource: Student,
            options: {
                navigation: { name: 'Students', icon: 'Users' },
                listProperties: ['name', 'email', 'course', 'paymentStatus', 'enrollmentDate'],
                properties: {
                    paymentStatus: {
                        availableValues: [
                            { value: 'pending', label: 'Pending' },
                            { value: 'paid', label: 'Paid' },
                            { value: 'refunded', label: 'Refunded' }
                        ]
                    }
                }
            }
        },
        {
            resource: Newsletter,
            options: {
                navigation: { name: 'Newsletter', icon: 'Mail' }
            }
        },
        {
            resource: Testimonial,
            options: {
                navigation: { name: 'Testimonials', icon: 'Star' },
                properties: {
                    message: { type: 'textarea' },
                    isApproved: {
                        availableValues: [
                            { value: true, label: 'Approved' },
                            { value: false, label: 'Pending' }
                        ]
                    }
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
            const courseCount = await Course.countDocuments({ status: 'active' });
            const unreadMessages = await Message.countDocuments({ isRead: false });
            const studentCount = await Student.countDocuments();
            const newsletterCount = await Newsletter.countDocuments({ isActive: true });
            
            return {
                messageCount,
                courseCount,
                unreadMessages,
                studentCount,
                newsletterCount
            };
        }
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
    cookiePassword: process.env.COOKIE_SECRET || 'your-32-character-secret-key-here-change-this',
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

// ================== SEED INITIAL DATA ==================

async function seedInitialData() {
    try {
        // Check if courses exist
        const courseCount = await Course.countDocuments();
        if (courseCount === 0) {
            const courses = [
                {
                    name: 'Frontend Development',
                    category: 'development',
                    duration: '3 Months',
                    fee: 50000,
                    language: 'en',
                    description: 'Learn HTML, CSS, JavaScript & React',
                    learn: ['HTML5 & CSS3', 'JavaScript ES6+', 'React.js', 'Responsive Design'],
                    prerequisites: ['Basic computer knowledge'],
                    status: 'active'
                },
                {
                    name: 'Backend Development',
                    category: 'development',
                    duration: '2 Months',
                    fee: 40000,
                    language: 'en',
                    description: 'Node.js / Python with Databases',
                    learn: ['Node.js', 'Express.js', 'MongoDB', 'API Development'],
                    prerequisites: ['Basic programming knowledge'],
                    status: 'active'
                },
                {
                    name: 'Full Stack Development',
                    category: 'development',
                    duration: '5 Months',
                    fee: 90000,
                    language: 'en',
                    description: 'Complete web development course',
                    learn: ['Frontend Development', 'Backend Development', 'Database Design', 'Deployment'],
                    prerequisites: ['Basic computer knowledge'],
                    status: 'active'
                },
                {
                    name: 'Computer Basics',
                    category: 'basics',
                    duration: '1 Month',
                    fee: 20000,
                    language: 'ha',
                    description: 'Complete beginner computer course',
                    learn: ['Microsoft Office', 'Internet Basics', 'Email', 'File Management'],
                    prerequisites: ['None'],
                    status: 'active'
                }
            ];
            
            await Course.insertMany(courses);
            console.log('✅ Sample courses created');
        }
        
        // Check if testimonials exist
        const testimonialCount = await Testimonial.countDocuments();
        if (testimonialCount === 0) {
            const testimonials = [
                {
                    name: 'Sarah Johnson',
                    position: 'Frontend Developer',
                    message: 'The practical approach helped me land my first developer job within 2 months of completing the course!',
                    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
                    rating: 5,
                    isApproved: true
                },
                {
                    name: 'Ahmed Musa',
                    position: 'Freelance Web Developer',
                    message: 'Learning in Hausa made everything click for me. Now I\'m building websites for local businesses.',
                    avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
                    rating: 5,
                    isApproved: true
                }
            ];
            
            await Testimonial.insertMany(testimonials);
            console.log('✅ Sample testimonials created');
        }
        
    } catch (error) {
        console.error('Error seeding data:', error);
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
        
        // Seed initial data
        await seedInitialData();
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`👑 Admin panel: http://localhost:${PORT}/admin`);
            console.log(`📨 Contact API: POST http://localhost:${PORT}/api/contact`);
            console.log(`📚 Courses API: GET http://localhost:${PORT}/api/courses`);
            console.log(`🎓 Students API: POST http://localhost:${PORT}/api/enroll`);
            console.log(`📰 Newsletter: POST http://localhost:${PORT}/api/newsletter/subscribe`);
            console.log(`⭐ Testimonials: GET http://localhost:${PORT}/api/testimonials`);
            console.log(`📅 Schedule: GET http://localhost:${PORT}/api/schedule`);
            console.log(`💳 Payment: POST http://localhost:${PORT}/api/payment/create`);
            console.log(`💚 Health Check: GET http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
