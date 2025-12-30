// ================= GLOBAL VARIABLES =================
const phone = "2348160932630";
let quizScore = { frontend: 0, backend: 0, fullstack: 0 };

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

// ================= PAYSTACK PAYMENT =================
function payWithPaystack(amount, course) {
  const email = prompt("Please enter your email address for payment receipt:");
  if (!email) return;
  
  let handler = PaystackPop.setup({
    key: 'pk_test_xxxxxxxxxxxxx', // Replace with your Paystack public key
    email: email,
    amount: amount * 100,
    currency: "NGN",
    metadata: { 
      course: course,
      customer_name: prompt("Enter your full name:")
    },
    callback: function(response){
      alert(`Payment successful! Transaction reference: ${response.reference}`);
      // Redirect to registration page or show success message
      window.location.href = `register.html?course=${encodeURIComponent(course)}&ref=${response.reference}`;
    },
    onClose: function(){
      alert('Payment window closed.');
    }
  });
  handler.openIframe();
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
function initializeScheduleToggle() {
  document.querySelectorAll('.schedule-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.schedule-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const type = this.getAttribute('data-type');
      
      // Filter schedule cards (this is a simple example)
      document.querySelectorAll('.schedule-card').forEach(card => {
        card.style.display = 'flex';
      });
    });
  });
}

// ================= WEBINAR REGISTRATION =================
function registerWebinar() {
  const name = prompt("Enter your name for webinar registration:");
  const email = prompt("Enter your email:");
  
  if (name && email) {
    // In a real app, send this data to your backend
    const webinarData = {
      name: name,
      email: email,
      webinar: "How to Start Your Tech Career in 2025",
      date: "January 25, 2025"
    };
    
    alert(`Thank you ${name}! We've sent webinar details to ${email}. See you on Saturday!`);
    
    // You can send this data to your server
    // fetch('/api/webinar-register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(webinarData)
    // });
  }
}

// ================= VIDEO PLAYER =================
function playVideo(videoId) {
  alert(`Playing video: ${videoId}`);
  // In a real implementation, you would:
  // 1. Load the video player
  // 2. Play the selected video
  // 3. Update UI
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
  window.open('https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', '_blank');
}

// ================= NEWSLETTER SUBSCRIPTION =================
function initializeNewsletter() {
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      
      // Simple validation
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      
      alert(`Thank you for subscribing with ${email}! We'll keep you updated with our latest courses and offers.`);
      this.reset();
      
      // In a real app, send to your backend
      // fetch('/api/newsletter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: email })
      // });
    });
  }
}

// ================= FORM SUBMISSION =================
function initializeContactForm() {
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function() {
      setTimeout(() => {
        alert('Thank you for your message! We will get back to you within 24 hours.');
      }, 100);
    });
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
function initializeEverything() {
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
  // You can add error reporting here
});

// ================= OFFLINE DETECTION =================
window.addEventListener('offline', function() {
  alert('You are offline. Some features may not work.');
});

window.addEventListener('online', function() {
  console.log('You are back online!');
});
