// ================= BLOG FUNCTIONALITY =================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeBlogFeatures();
});

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


// Track article views
function trackArticleView(articleId) {
  const views = JSON.parse(localStorage.getItem('articleViews') || '{}');
  views[articleId] = (views[articleId] || 0) + 1;
  localStorage.setItem('articleViews', JSON.stringify(views));
}

// Track reading time
function trackReadingTime(articleId, seconds) {
  const readingTimes = JSON.parse(localStorage.getItem('readingTimes') || '{}');
  readingTimes[articleId] = (readingTimes[articleId] || 0) + seconds;
  localStorage.setItem('readingTimes', JSON.stringify(readingTimes));
}



function initializeBlogFeatures() {
  // Category Filtering
  setupCategoryFilter();
  
  // Search Functionality
  setupSearch();
  
  // Newsletter Form
  setupNewsletter();
  
  // Comments
  setupComments();
  
  // View Counter Simulation
  simulateViewCounts();
}

// ================= CATEGORY FILTERING =================
function setupCategoryFilter() {
  const categoryBtns = document.querySelectorAll('.category-btn');
  const articles = document.querySelectorAll('.blog-article');
  
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Update active button
      categoryBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const category = this.getAttribute('data-category');
      
      // Filter articles
      articles.forEach(article => {
        const categories = article.getAttribute('data-categories').split(',');
        
        if (category === 'all' || categories.includes(category)) {
          article.style.display = 'block';
          setTimeout(() => {
            article.style.opacity = '1';
          }, 10);
        } else {
          article.style.opacity = '0';
          setTimeout(() => {
            article.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

// ================= SEARCH FUNCTIONALITY =================
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  
  if (searchInput) {
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        searchArticles();
      }
    });
  }
}

function searchArticles() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const articles = document.querySelectorAll('.blog-article');
  const categoryBtns = document.querySelectorAll('.category-btn');
  
  // Reset category filter
  categoryBtns.forEach(btn => {
    if (btn.getAttribute('data-category') === 'all') {
      btn.click();
    }
  });
  
  // Search through articles
  articles.forEach(article => {
    const title = article.querySelector('h2 a, h3 a').textContent.toLowerCase();
    const content = article.querySelector('p').textContent.toLowerCase();
    
    if (title.includes(searchTerm) || content.includes(searchTerm)) {
      article.style.display = 'block';
      setTimeout(() => {
        article.style.opacity = '1';
      }, 10);
    } else {
      article.style.opacity = '0';
      setTimeout(() => {
        article.style.display = 'none';
      }, 300);
    }
  });
  
  // Show message if no results
  const visibleArticles = Array.from(articles).filter(a => a.style.display !== 'none');
  if (visibleArticles.length === 0 && searchTerm !== '') {
    showNoResultsMessage(searchTerm);
  }
}

function showNoResultsMessage(searchTerm) {
  // Remove existing message
  const existingMsg = document.querySelector('.no-results');
  if (existingMsg) existingMsg.remove();
  
  // Create message
  const msg = document.createElement('div');
  msg.className = 'no-results';
  msg.innerHTML = `
    <p>No articles found for "<strong>${searchTerm}</strong>"</p>
    <button onclick="clearSearch()">Clear Search</button>
  `;
  msg.style.cssText = `
    text-align: center;
    padding: 3rem;
    background: var(--light-color);
    border-radius: 10px;
    margin: 2rem 0;
  `;
  
  const articlesGrid = document.querySelector('.articles-grid');
  if (articlesGrid) {
    articlesGrid.parentNode.insertBefore(msg, articlesGrid);
  }
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.querySelector('.category-btn[data-category="all"]').click();
  document.querySelector('.no-results')?.remove();
}

// ================= NEWSLETTER SIGNUP =================
function setupNewsletter() {
  const newsletterForm = document.getElementById('blogNewsletter');
  
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      
      // Simple validation
      if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
      }
      
      // In a real app, send to your backend
      // fetch('/api/newsletter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: email, source: 'blog' })
      // });
      
      alert(`Thank you for subscribing with ${email}! You'll receive weekly coding tips.`);
      this.reset();
      
      // Track in localStorage
      trackNewsletterSignup(email);
    });
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function trackNewsletterSignup(email) {
  const signups = JSON.parse(localStorage.getItem('blogNewsletterSignups') || '[]');
  signups.push({
    email: email,
    date: new Date().toISOString()
  });
  localStorage.setItem('blogNewsletterSignups', JSON.stringify(signups));
}

// ================= COMMENTS SYSTEM =================
function setupComments() {
  const commentForm = document.getElementById('commentForm');
  
  if (commentForm) {
    commentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = this.querySelector('input[type="text"]').value;
      const email = this.querySelector('input[type="email"]').value;
      const comment = this.querySelector('textarea').value;
      
      // Validate
      if (!name || !email || !comment) {
        alert('Please fill all fields.');
        return;
      }
      
      if (!validateEmail(email)) {
        alert('Please enter a valid email.');
        return;
      }
      
      // Add comment to UI
      addCommentToUI(name, comment);
      
      // Reset form
      this.reset();
      
      // In a real app, send to backend
      // fetch('/api/comments', {
      //   method: 'POST',
      //   body: new FormData(this)
      // });
      
      alert('Comment submitted successfully! It will appear after moderation.');
    });
  }
  
  // Reply buttons
  document.querySelectorAll('.reply-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const commentItem = this.closest('.comment-item');
      const author = commentItem.querySelector('h4').textContent;
      
      const textarea = document.querySelector('#commentForm textarea');
      textarea.value = `@${author} `;
      textarea.focus();
      
      // Scroll to comment form
      document.querySelector('#commentForm').scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
}

function addCommentToUI(name, comment) {
  const commentsList = document.querySelector('.comments-list');
  
  const newComment = document.createElement('div');
  newComment.className = 'comment-item';
  newComment.innerHTML = `
    <div class="comment-header">
      <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random" alt="${name}">
      <div>
        <h4>${name}</h4>
        <span>Just now</span>
      </div>
    </div>
    <p>${comment}</p>
    <div class="comment-actions">
      <button><i class="far fa-thumbs-up"></i> 0</button>
      <button><i class="far fa-thumbs-down"></i> 0</button>
      <button class="reply-btn">Reply</button>
    </div>
  `;
  
  commentsList.prepend(newComment);
  
  // Update comment count
  const commentCount = document.querySelector('h2')?.textContent.match(/\d+/);
  if (commentCount) {
    const newCount = parseInt(commentCount[0]) + 1;
    document.querySelector('h2').textContent = `Discussion (${newCount} Comments)`;
  }
}

// ================= VIEW COUNTER SIMULATION =================
function simulateViewCounts() {
  // In a real app, this would come from your backend
  const articles = document.querySelectorAll('.blog-article');
  
  articles.forEach((article, index) => {
    const id = article.getAttribute('data-id');
    const views = getArticleViews(id);
    
    // Update view count in popular posts if exists
    const popularPost = document.querySelector(`.popular-post[href*="blog-post-${id}"] span`);
    if (popularPost) {
      popularPost.textContent = `${views} views`;
    }
  });
}

function getArticleViews(id) {
  // Mock view counts based on article ID
  const viewCounts = {
    1: '1.2k',
    2: '850',
    3: '720',
    4: '980',
    5: '650',
    6: '580',
    7: '890'
  };
  
  return viewCounts[id] || '500';
}

// ================= SHARE BUTTONS =================
function shareArticle(platform, title, url) {
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  };
  
  if (shareUrls[platform]) {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  }
}

// ================= READING PROGRESS =================
function setupReadingProgress() {
  const progressBar = document.createElement('div');
  progressBar.id = 'reading-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: var(--primary-color);
    z-index: 1001;
    transition: width 0.1s;
  `;
  
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', function() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    progressBar.style.width = scrolled + '%';
  });
}

// Initialize reading progress
setupReadingProgress();

// ================= DARK MODE TOGGLE =================
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  
  // Update icon
  const toggleBtn = document.querySelector('.dark-mode-toggle');
  if (toggleBtn) {
    toggleBtn.innerHTML = document.body.classList.contains('dark-mode') 
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }
}

// Check for saved preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

// ================= RELATED ARTICLES =================
function getRelatedArticles(currentId) {
  // This would normally come from a backend
  const articles = [
    { id: 1, title: "HTML/CSS Guide", category: "frontend" },
    { id: 2, title: "React Hooks", category: "frontend" },
    { id: 3, title: "Node.js API", category: "backend" },
    { id: 4, title: "Tech Interviews", category: "career" },
    { id: 5, title: "CSS Grid Hausa", category: "frontend" },
    { id: 6, title: "Python Guide", category: "backend" },
    { id: 7, title: "Freelancing", category: "career" }
  ];
  
  const currentArticle = articles.find(a => a.id == currentId);
  if (!currentArticle) return [];
  
  return articles
    .filter(a => a.id != currentId && a.category === currentArticle.category)
    .slice(0, 3);
}

// ================= LAZY LOAD IMAGES =================
function lazyLoadImages() {
  const images = document.querySelectorAll('.article-image img');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => {
    img.dataset.src = img.src;
    observer.observe(img);
  });
}

// Initialize lazy loading
lazyLoadImages();
