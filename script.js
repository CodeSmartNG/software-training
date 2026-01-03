// TEMPORARY FIX - Use this while deploying your backend
const USE_MOCK_DATA = true; // Set to false after deploying backend
const BACKEND_URL = USE_MOCK_DATA ? '' : ' https://software-training.onrender.com ';

async function callAPI(endpoint, method = 'GET', data = null) {
    // If using mock data, return fake successful responses
    if (USE_MOCK_DATA) {
        console.log('Using mock data for', endpoint);
        return mockAPIResponse(endpoint, method, data);
    }
    
    // Your original fetch code here...
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP ${response.status}`);
        }
        
        return result;
    } catch (error) {
        console.error(`❌ API Error (${endpoint}):`, error);
        throw error;
    }
}

function mockAPIResponse(endpoint, method, data) {
    // Return mock responses for all API calls
    switch(endpoint) {
        case '/contact':
            if (method === 'POST') {
                alert('Thank you! Your message has been received. We\'ll contact you soon.');
                return { success: true, message: 'Message received (mock)' };
            }
            break;
        case '/courses':
            return {
                success: true,
                data: [
                    { name: 'Frontend Development', fee: 50000 },
                    { name: 'Backend Development', fee: 40000 },
                    { name: 'Full Stack Development', fee: 90000 },
                    { name: 'Computer Basics', fee: 20000 }
                ]
            };
        case '/testimonials':
            return {
                success: true,
                data: [
                    {
                        name: 'Sarah Johnson',
                        position: 'Frontend Developer',
                        message: 'The practical approach helped me land my first developer job!',
                        rating: 5
                    }
                ]
            };
        case '/health':
            return { status: 'OK', timestamp: new Date() };
        default:
            return { success: true, message: 'Mock response' };
    }
}

// Show notification message
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification .close-btn {
        margin-left: auto;
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0 5px;
    }
`;
document.head.appendChild(style);

// ================= MAIN FUNCTIONS =================

// WhatsApp Enrollment
function enroll(course) {
    const msg = `Hello CodeSmart NG, I want to enroll for ${course}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
}

// Language Toggle
function initializeLanguageToggle() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.en').forEach(el => {
                el.classList.toggle('hidden', lang !== 'en');
            });
            document.querySelectorAll('.ha').forEach(el => {
                el.classList.toggle('hidden', lang !== 'ha');
            });
        });
    });
}

// Mobile Menu Toggle
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                const navLinks = document.getElementById('navLinks');
                const mobileMenuBtn = document.getElementById('mobileMenuBtn');
                if(navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
}

// ================= PAYSTACK PAYMENT =================
async function payWithPaystack(amount, course) {
    const email = prompt("Please enter your email address for payment receipt:");
    if (!email) return;
    
    const name = prompt("Enter your full name:");
    if (!name) return;
    
    try {
        // Create payment record in backend
        const paymentData = await callAPI('/payment/create', 'POST', {
            amount,
            course,
            email,
            name
        });
        
        // Initialize Paystack
        let handler = PaystackPop.setup({
            key: 'pk_test_xxxxxxxxxxxxx', // REPLACE WITH YOUR PAYSTACK PUBLIC KEY
            email: email,
            amount: amount * 100,
            currency: "NGN",
            ref: paymentData.reference,
            metadata: { 
                course: course,
                customer_name: name,
                payment_id: paymentData.reference
            },
            callback: async function(response){
                try {
                    // Enroll student after successful payment
                    const enrollment = await callAPI('/enroll', 'POST', {
                        name,
                        email,
                        course,
                        paymentReference: response.reference,
                        amountPaid: amount
                    });
                    
                    showNotification(`Payment successful! You are now enrolled in ${course}.`, 'success');
                    
                    // Open WhatsApp for further communication
                    setTimeout(() => {
                        enroll(course);
                    }, 2000);
                } catch (error) {
                    showNotification('Payment processed but enrollment failed. Please contact support.', 'error');
                }
            },
            onClose: function(){
                showNotification('Payment window closed.', 'info');
            }
        });
        handler.openIframe();
    } catch (error) {
        showNotification('Failed to initialize payment. Please try again.', 'error');
    }
}

// ================= LIVE COUNTER ANIMATION =================
function animateCounter() {
    const counters = document.querySelectorAll('.counter, .stat-number');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const increment = target / 200;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                if (counter.classList.contains('stat-number')) {
                    counter.innerText = Math.ceil(current) + (counter.getAttribute('data-target') > 10 ? 'k' : '');
                } else {
                    counter.innerText = Math.ceil(current);
                }
                setTimeout(updateCounter, 10);
            } else {
                if (counter.classList.contains('stat-number')) {
                    counter.innerText = target + (target > 10 ? 'k' : '');
                } else {
                    counter.innerText = target;
                }
            }
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// ================= QUIZ FUNCTIONALITY =================
function toggleQuiz() {
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.classList.toggle('show');
    
    if (quizContainer.classList.contains('show')) {
        resetQuiz();
    }
}

function resetQuiz() {
    quizScore = { frontend: 0, backend: 0, fullstack: 0 };
    document.getElementById('quizResult').classList.add('hidden');
    document.getElementById('quizResult').innerHTML = '';
}

function initializeQuiz() {
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
            const points = this.getAttribute('data-points');
            quizScore[points] += 1;
            showQuizResult();
        });
    });
}

function showQuizResult() {
    const resultElement = document.getElementById('quizResult');
    
    let maxScore = 0;
    let recommendedCourse = '';
    
    for (const [course, score] of Object.entries(quizScore)) {
        if (score > maxScore) {
            maxScore = score;
            recommendedCourse = course;
        }
    }
    
    const courseNames = {
        frontend: 'Frontend Development',
        backend: 'Backend Development',
        fullstack: 'Full Stack Development'
    };
    
    const courseName = courseNames[recommendedCourse] || 'Computer Basics';
    
    resultElement.innerHTML = `
        <h4>🎯 Recommended Path: ${courseName}</h4>
        <p>Based on your answers, we recommend our <strong>${courseName}</strong> course!</p>
        <div class="quiz-actions">
            <button class="btn" onclick="enroll('${courseName}')">Enroll Now</button>
            <button class="btn btn-secondary" onclick="resetQuiz()">Take Again</button>
        </div>
    `;
    resultElement.classList.remove('hidden');
}

// ================= LOAD SCHEDULE FROM BACKEND =================
async function loadSchedule() {
    try {
        const response = await callAPI('/schedule');
        const schedule = response.data;
        
        const container = document.querySelector('.schedule-container');
        if (!container) return;
        
        container.innerHTML = schedule.map(item => `
            <div class="schedule-card">
                <div class="schedule-date">
                    <span class="date-day">${new Date(item.date).getDate()}</span>
                    <span class="date-month">${new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div class="schedule-info">
                    <h3>${item.course}</h3>
                    <p><i class="far fa-clock"></i> ${item.time}</p>
                    <p><i class="fas fa-user"></i> Instructor: ${item.instructor}</p>
                    <p><i class="fas fa-video"></i> Mode: ${item.mode}</p>
                    <span class="seats-badge">${item.seatsLeft} Seats Left</span>
                </div>
                <button class="btn-small" onclick="enroll('${item.course}')">Join Now</button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load schedule:', error);
    }
}

function initializeScheduleToggle() {
    document.querySelectorAll('.schedule-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.schedule-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadSchedule(); // Reload schedule on toggle
        });
    });
}

// ================= WEBINAR REGISTRATION =================
async function registerWebinar() {
    const name = prompt("Enter your name for webinar registration:");
    if (!name) return;
    
    const email = prompt("Enter your email:");
    if (!email) return;
    
    try {
        // For now, just show success message
        // In future, connect to backend
        showNotification(`Thank you ${name}! We've sent webinar details to ${email}.`, 'success');
        
    } catch (error) {
        showNotification('Failed to register for webinar. Please try again.', 'error');
    }
}

// ================= LOAD TESTIMONIALS FROM BACKEND =================
async function loadTestimonials() {
    try {
        const response = await callAPI('/testimonials');
        const testimonials = response.data;
        
        const container = document.querySelector('.testimonials-grid');
        if (!container) return;
        
        container.innerHTML = testimonials.map(testimonial => `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <i class="fas fa-quote-left quote-icon"></i>
                    <p>"${testimonial.message}"</p>
                    <div class="rating">
                        ${'★'.repeat(testimonial.rating || 5)}
                    </div>
                </div>
                <div class="testimonial-author">
                    <img src="${testimonial.avatar}" alt="${testimonial.name}">
                    <div>
                        <h4>${testimonial.name}</h4>
                        <p>${testimonial.position}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load testimonials:', error);
    }
}

// ================= LOAD COURSES FROM BACKEND =================
async function loadCourses() {
    try {
        const response = await callAPI('/courses');
        const courses = response.data;
        
        console.log('Loaded courses:', courses);
        
        // Update course prices dynamically
        courses.forEach(course => {
            const courseName = course.name;
            const fee = course.fee;
            
            // Find and update corresponding course cards
            document.querySelectorAll('.training-card').forEach(card => {
                const cardTitle = card.querySelector('h3').textContent;
                if (cardTitle.includes(courseName) || courseName.includes(cardTitle)) {
                    const feeElement = card.querySelector('li:last-child');
                    if (feeElement) {
                        feeElement.innerHTML = `Fee: <strong>₦${fee.toLocaleString()}</strong>`;
                    }
                }
            });
        });
        
    } catch (error) {
        console.error('Failed to load courses:', error);
    }
}

// ================= NEWSLETTER SUBSCRIPTION =================
function initializeNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!email || !email.includes('@')) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            try {
                await callAPI('/newsletter/subscribe', 'POST', { email });
                showNotification(`Thank you for subscribing with ${email}!`, 'success');
                this.reset();
            } catch (error) {
                showNotification('Subscription failed. Please try again.', 'error');
            }
        });
    }
}

// ================= CONTACT FORM =================
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    // Remove inline event listener if exists
    contactForm.onsubmit = null;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // Send to backend
            await callAPI('/contact', 'POST', data);
            
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            this.reset();
            
        } catch (error) {
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ================= TEST BACKEND CONNECTION =================
async function testBackendConnection() {
    try {
        const health = await callAPI('/health');
        console.log('✅ Backend connection successful:', health);
        return true;
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        showNotification('Cannot connect to server. Please make sure backend is running.', 'error');
        return false;
    }
}

// ================= LOAD ALL DATA FROM BACKEND =================
async function loadAllData() {
    const isConnected = await testBackendConnection();
    if (!isConnected) return;
    
    try {
        await Promise.all([
            loadCourses(),
            loadTestimonials(),
            loadSchedule()
        ]);
        
        console.log('✅ All data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading some data:', error);
    }
}

// ================= INITIALIZE EVERYTHING =================
async function initializeEverything() {
    // Core functionality
    initializeLanguageToggle();
    initializeMobileMenu();
    initializeSmoothScrolling();
    
    // Interactive features
    animateCounter();
    initializeQuiz();
    initializeScheduleToggle();
    initializeNewsletter();
    initializeContactForm();
    
    // Load data from backend
    await loadAllData();
    
    // Add animation classes
    addAnimationClasses();
}

// ================= ANIMATION HELPERS =================
function addAnimationClasses() {
    document.querySelectorAll('.training-card, .service-card, .portfolio-item, .resource-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// ================= ON LOAD =================
window.addEventListener('load', function() {
    initializeEverything();
    
    // Check backend health
    setTimeout(() => {
        testBackendConnection();
    }, 1000);
    
    // Remove preloader if exists
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// ================= ON SCROLL EFFECTS =================
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        navbar.style.padding = '10px 0';
    } else {
        navbar.style.boxShadow = 'var(--shadow)';
        navbar.style.padding = '15px 0';
    }
});

// ================= ERROR HANDLING =================
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// ================= OFFLINE DETECTION =================
window.addEventListener('offline', function() {
    showNotification('You are offline. Some features may not work.', 'error');
});

window.addEventListener('online', function() {
    showNotification('You are back online!', 'success');
});

// ================= EXPORT FUNCTIONS FOR HTML USE =================
// Make functions available globally for onclick attributes
window.payWithPaystack = payWithPaystack;
window.enroll = enroll;
window.registerWebinar = registerWebinar;
window.toggleQuiz = toggleQuiz;
window.viewCertificate = viewCertificate;
window.playVideo = playVideo;
