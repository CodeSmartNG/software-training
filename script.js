// ================= CONFIGURATION =================
const BACKEND_URL = 'http://localhost:3000/api'; // Your backend URL
const phone = "2348160932630";
let quizScore = { frontend: 0, backend: 0, fullstack: 0 };

// ================= API FUNCTIONS =================

// Generic API call function
async function callAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Show notification message
function showNotification(message, type = 'success') {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
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
      
      // Update active button
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Toggle language content
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
        
        // Close mobile menu if open
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

// ================= PAYSTACK PAYMENT (Updated) =================
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
    
    let handler = PaystackPop.setup({
      key: 'pk_test_xxxxxxxxxxxxx', // Replace with your Paystack public key
      email: email,
      amount: amount * 100,
      currency: "NGN",
      ref: paymentData.reference,
      metadata: { 
        course: course,
        customer_name: name,
        payment_id: paymentData._id
      },
      callback: async function(response){
        try {
          // Verify payment on backend
          const verification = await callAPI('/payment/verify', 'POST', {
            reference: response.reference
          });
          
          if (verification.success) {
            showNotification(`Payment successful! You are now enrolled in ${course}.`, 'success');
            
            // Auto-enroll the student
            setTimeout(() => {
              enroll(course);
            }, 2000);
          }
        } catch (error) {
          showNotification('Payment verification failed. Please contact support.', 'error');
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
    
    // Start animation when element is in viewport
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
  
  // Reset quiz if opening
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
      
      // Show result
      showQuizResult();
    });
  });
}

function showQuizResult() {
  const resultElement = document.getElementById('quizResult');
  
  // Find max score
  let maxScore = 0;
  let recommendedCourse = '';
  
  for (const [course, score] of Object.entries(quizScore)) {
    if (score > maxScore) {
      maxScore = score;
      recommendedCourse = course;
    }
  }
  
  // Map to display names
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

// ================= SCHEDULE TOGGLE =================
async function loadSchedule() {
  try {
    const scheduleData = await callAPI('/schedule');
    
    const container = document.querySelector('.schedule-container');
    if (!container) return;
    
    container.innerHTML = scheduleData.map(item => `
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
      const type = this.getAttribute('data-type');
      
      // You can filter schedule by type here
      loadSchedule(type); // Pass type to API
    });
  });
}

// ================= WEBINAR REGISTRATION (Updated) =================
async function registerWebinar() {
  const name = prompt("Enter your name for webinar registration:");
  if (!name) return;
  
  const email = prompt("Enter your email:");
  if (!email) return;
  
  try {
    await callAPI('/webinar/register', 'POST', {
      name,
      email,
      webinar: "How to Start Your Tech Career in 2025",
      date: "January 25, 2025"
    });
    
    showNotification(`Thank you ${name}! We've sent webinar details to ${email}.`, 'success');
    
  } catch (error) {
    showNotification('Failed to register for webinar. Please try again.', 'error');
  }
}

// ================= VIDEO PLAYER =================
function playVideo(videoId) {
  // In a real implementation, you would load the video
  showNotification('Video playback would start here', 'info');
}

function initializeVideoPlayer() {
  document.querySelectorAll('.thumb').forEach(thumb => {
    thumb.addEventListener('click', function() {
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// ================= CERTIFICATE VIEWER =================
function viewCertificate() {
  window.open('https://www.canva.com/design/DAG9NFTRqFQ/Y5HQbCdXFTYkXGkMImg4ig/view', '_blank');
}

// ================= NEWSLETTER SUBSCRIPTION (Updated) =================
function initializeNewsletter() {
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value;
      
      // Simple validation
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

// ================= CONTACT FORM (Updated) =================
function initializeContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  
  // Remove the inline event listener and use this one
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
      
      await callAPI('/contact', 'POST', data);
      
      showNotification('Thank you! Your message has been sent.', 'success');
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

// ================= LOAD TESTIMONIALS FROM BACKEND =================
async function loadTestimonials() {
  try {
    const testimonials = await callAPI('/testimonials');
    
    const container = document.querySelector('.testimonials-grid');
    if (!container) return;
    
    container.innerHTML = testimonials.map(testimonial => `
      <div class="testimonial-card">
        <div class="testimonial-content">
          <i class="fas fa-quote-left quote-icon"></i>
          <p>${testimonial.message}</p>
        </div>
        <div class="testimonial-author">
          <img src="${testimonial.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}" alt="${testimonial.name}">
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
    const courses = await callAPI('/courses');
    
    // Update course information dynamically
    courses.forEach(course => {
      const card = document.querySelector(`[data-course="${course.id}"]`);
      if (card) {
        const priceElement = card.querySelector('.course-price');
        if (priceElement) {
          priceElement.innerHTML = `Fee: <strong>₦${course.price.toLocaleString()}</strong>`;
        }
        
        const seatsElement = card.querySelector('.seats-badge');
        if (seatsElement && course.seatsLeft) {
          seatsElement.textContent = `${course.seatsLeft} Seats Left`;
        }
      }
    });
    
  } catch (error) {
    console.error('Failed to load courses:', error);
  }
}

// ================= LANGUAGE DETECTION =================
function detectUserLanguage() {
  const userLang = navigator.language || navigator.userLanguage;
  const isHausa = userLang.includes('ha') || userLang.includes('HA');
  
  if (isHausa) {
    document.querySelector('[data-lang="ha"]').click();
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
  initializeVideoPlayer();
  initializeNewsletter();
  initializeContactForm();
  
  // Load data from backend
  try {
    await Promise.all([
      loadSchedule(),
      loadTestimonials(),
      loadCourses()
    ]);
  } catch (error) {
    console.error('Failed to load some data:', error);
  }
  
  // Additional features
  detectUserLanguage();
  
  // Add animation classes
  addAnimationClasses();
}

// ================= ANIMATION HELPERS =================
function addAnimationClasses() {
  // Add animation delay classes for staggered animations
  document.querySelectorAll('.training-card, .service-card, .portfolio-item, .resource-card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });
}

// ================= ON LOAD =================
window.addEventListener('load', function() {
  initializeEverything();
  
  // Remove preloader if you add one
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
  console.error('Error occurred:', e.error);
  // You can add error reporting to your backend here
  // callAPI('/errors', 'POST', { error: e.error.toString(), url: window.location.href });
});

// ================= OFFLINE DETECTION =================
window.addEventListener('offline', function() {
  showNotification('You are offline. Some features may not work.', 'error');
});

window.addEventListener('online', function() {
  showNotification('You are back online!', 'success');
});
