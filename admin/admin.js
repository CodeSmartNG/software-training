// ================= ADMIN DASHBOARD FUNCTIONALITY =================


const admin = new AdminJS({
  resources: [
    // Your existing resources (Course, User, etc.)
    {
      resource: Message,
      options: {
        listProperties: ['name', 'email', 'subject', 'date', 'isRead'],
        properties: {
          message: { type: 'textarea' }, // Better display for long text
          date: { isVisible: { show: true, edit: false } } // Auto-set date
        },
        actions: {
          // Optional: Add a custom action to mark as read
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
  ],
  rootPath: '/admin',
});

// Check authentication
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const adminUser = localStorage.getItem('adminUser');
    
    if(!isLoggedIn || !adminUser) {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    window.location.href = 'index.html';
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('active');
    
    if(window.innerWidth > 992) {
        if(sidebar.classList.contains('active')) {
            mainContent.style.marginLeft = '0';
        } else {
            mainContent.style.marginLeft = '250px';
        }
    }
}

// Initialize sidebar toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    if(menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Check auth on all pages except login
    if(!window.location.href.includes('index.html')) {
        checkAuth();
    }
});

// ================= DATA MANAGEMENT =================

// Save data to JSON file (simulated - in real app, use backend API)
function saveData(dataType, data) {
    return new Promise((resolve, reject) => {
        try {
            // In a real app, you would send this to a backend API
            // For now, we'll use localStorage as a simulation
            localStorage.setItem(`admin_${dataType}`, JSON.stringify(data));
            
            // Also save to session for current use
            sessionStorage.setItem(`current_${dataType}`, JSON.stringify(data));
            
            resolve({ success: true, message: 'Data saved successfully' });
        } catch (error) {
            reject({ success: false, message: 'Failed to save data', error });
        }
    });
}

// Load data from storage
function loadData(dataType) {
    return new Promise((resolve, reject) => {
        try {
            // Try to get from session first, then localStorage
            let data = sessionStorage.getItem(`current_${dataType}`);
            
            if(!data) {
                data = localStorage.getItem(`admin_${dataType}`);
            }
            
            if(data) {
                resolve(JSON.parse(data));
            } else {
                // Return default structure if no data exists
                const defaultData = getDefaultData(dataType);
                resolve(defaultData);
            }
        } catch (error) {
            reject({ success: false, message: 'Failed to load data', error });
        }
    });
}

// Get default data structure
function getDefaultData(dataType) {
    const defaults = {
        courses: {
            courses: [
                {
                    id: 1,
                    name: "Frontend Development",
                    category: "frontend",
                    duration: "3 Months",
                    fee: 50000,
                    language: "both",
                    status: "active",
                    description: "Learn HTML, CSS, JavaScript and React",
                    learn: ["HTML5", "CSS3", "JavaScript", "React", "Responsive Design"],
                    prerequisites: ["Basic computer knowledge"],
                    image: "frontend-course.jpg",
                    outline: "frontend.pdf",
                    createdAt: "2024-01-01",
                    updatedAt: "2024-01-01"
                }
            ]
        },
        events: {
            events: [
                {
                    id: 1,
                    title: "Free Webinar: Tech Career in 2025",
                    type: "webinar",
                    start: "2025-01-25T14:00:00",
                    end: "2025-01-25T16:00:00",
                    venue: "Online (Zoom)",
                    capacity: 100,
                    fee: 0,
                    description: "Learn how to start your tech career in 2025",
                    image: "webinar.jpg",
                    status: "upcoming",
                    createdAt: "2024-12-20"
                }
            ]
        },
        students: {
            students: [
                {
                    id: 1,
                    name: "Ahmed Musa",
                    email: "ahmed@email.com",
                    phone: "+2348012345678",
                    course: "Frontend Development",
                    enrollmentDate: "2025-01-15",
                    progress: 75,
                    payment: "paid",
                    status: "active"
                }
            ]
        }
    };
    
    return defaults[dataType] || { [dataType]: [] };
}

// ================= NOTIFICATION SYSTEM =================

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="close-notification">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1200;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Close button
    notification.querySelector('.close-notification').addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if(notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || '#3b82f6';
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

// ================= FILE UPLOAD HANDLER =================

// Handle file uploads (simulated)
function uploadFile(file, type) {
    return new Promise((resolve, reject) => {
        if(!file) {
            resolve(null);
            return;
        }
        
        // Validate file type
        const validTypes = {
            image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            pdf: ['application/pdf']
        };
        
        const allowedTypes = validTypes[type] || validTypes.image;
        
        if(!allowedTypes.includes(file.type)) {
            reject(`Invalid file type. Please upload ${type === 'pdf' ? 'a PDF file' : 'an image'}.`);
            return;
        }
        
        // Validate file size (5MB max for images, 10MB for PDFs)
        const maxSize = type === 'pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if(file.size > maxSize) {
            reject(`File too large. Maximum size is ${type === 'pdf' ? '10MB' : '5MB'}.`);
            return;
        }
        
        // In a real app, you would upload to a server
        // For simulation, we'll create a fake URL
        const fakeUpload = {
            url: URL.createObjectURL(file),
            filename: file.name,
            size: file.size,
            type: file.type
        };
        
        // Simulate upload delay
        setTimeout(() => {
            resolve(fakeUpload);
        }, 1000);
    });
}

// ================= FORM VALIDATION =================

// Validate course form
function validateCourseForm(formData) {
    const errors = [];
    
    if(!formData.name || formData.name.length < 3) {
        errors.push('Course name must be at least 3 characters');
    }
    
    if(!formData.category) {
        errors.push('Please select a category');
    }
    
    if(!formData.duration) {
        errors.push('Please specify duration');
    }
    
    if(!formData.fee || formData.fee < 0) {
        errors.push('Please enter a valid fee amount');
    }
    
    if(!formData.description || formData.description.length < 10) {
        errors.push('Description must be at least 10 characters');
    }
    
    return errors;
}

// Validate event form
function validateEventForm(formData) {
    const errors = [];
    
    if(!formData.title || formData.title.length < 3) {
        errors.push('Event title must be at least 3 characters');
    }
    
    if(!formData.start || !formData.end) {
        errors.push('Please specify start and end dates');
    }
    
    if(new Date(formData.start) >= new Date(formData.end)) {
        errors.push('End date must be after start date');
    }
    
    if(!formData.venue) {
        errors.push('Please specify venue or link');
    }
    
    if(!formData.description || formData.description.length < 10) {
        errors.push('Description must be at least 10 characters');
    }
    
    return errors;
}

// ================= EXPORT FUNCTIONS =================

// Export data as CSV
function exportToCSV(data, filename) {
    if(!data || data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    // Convert array of objects to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const cell = row[header];
                // Handle commas and quotes in cells
                const escaped = ('' + cell).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        )
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification('Data exported successfully', 'success');
}

// Export data as JSON
function exportToJSON(data, filename) {
    if(!data || data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification('Data exported successfully', 'success');
}

// ================= SEARCH AND FILTER =================

// Generic search function
function searchTable(tableId, searchId) {
    const searchTerm = document.getElementById(searchId).value.toLowerCase();
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName('tr');
    
    for(let i = 1; i < rows.length; i++) { // Skip header row
        const row = rows[i];
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    }
}

// Filter data by criteria
function filterData(data, filters) {
    return data.filter(item => {
        for(const key in filters) {
            if(filters[key] && item[key] !== filters[key]) {
                return false;
            }
        }
        return true;
    });
}

// ================= DASHBOARD UTILITIES =================

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount);
}

// Generate random ID
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// ================= INITIALIZATION =================

// Initialize admin dashboard
function initializeAdminDashboard() {
    // Check authentication
    if(!checkAuth()) return;
    
    // Update admin name display
    const adminName = localStorage.getItem('adminUser');
    const nameElements = document.querySelectorAll('.admin-name');
    nameElements.forEach(el => {
        el.textContent = adminName || 'Admin';
    });
    
    // Load initial data
    loadInitialData();
}

// Load initial data for dashboard
function loadInitialData() {
    // Load courses count
    loadData('courses').then(data => {
        const coursesCount = data.courses.length;
        const coursesElement = document.getElementById('totalCourses');
        if(coursesElement) coursesElement.textContent = coursesCount;
    });
    
    // Load events count
    loadData('events').then(data => {
        const eventsCount = data.events.length;
        const eventsElement = document.getElementById('totalEvents');
        if(eventsElement) eventsElement.textContent = eventsCount;
    });
    
    // Load students count
    loadData('students').then(data => {
        const studentsCount = data.students.length;
        const studentsElement = document.getElementById('totalStudents');
        if(studentsElement) studentsElement.textContent = studentsCount;
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    if(!window.location.href.includes('index.html')) {
        initializeAdminDashboard();
    }
});

// ================= SECURITY UTILITIES =================

// Basic input sanitization
function sanitizeInput(input) {
    if(typeof input !== 'string') return input;
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number (Nigeria format)
function isValidPhone(phone) {
    const re = /^(\+234|0)[789][01]\d{8}$/;
    return re.test(phone.replace(/\s/g, ''));
}
