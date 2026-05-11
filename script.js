// ==================== THEME TOGGLE ====================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const theme = htmlElement.getAttribute('data-theme');
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ==================== PARTICLE ANIMATION ====================
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = 20;

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        particlesContainer.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 8000);
    }

    // Create initial particles
    for (let i = 0; i < particleCount; i++) {
        setTimeout(createParticle, i * 200);
    }

    // Create particles continuously
    setInterval(() => {
        if (document.querySelectorAll('.particle').length < particleCount) {
            createParticle();
        }
    }, 500);
}

// Create particles on page load
document.addEventListener('DOMContentLoaded', createParticles);

// ==================== REAL-TIME CLOCK ====================
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const digitalClock = document.getElementById('digitalClock');
    if (digitalClock) {
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Update analog clock
    updateAnalogClock(now);
}

function updateAnalogClock(now) {
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    const secondDeg = (seconds / 60) * 360;
    const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
    const hourDeg = (hours / 12) * 360 + (minutes / 60) * 30;

    const secondHand = document.getElementById('secondHand');
    const minuteHand = document.getElementById('minuteHand');
    const hourHand = document.getElementById('hourHand');

    if (secondHand) secondHand.setAttribute('transform', `rotate(${secondDeg} 100 100)`);
    if (minuteHand) minuteHand.setAttribute('transform', `rotate(${minuteDeg} 100 100)`);
    if (hourHand) hourHand.setAttribute('transform', `rotate(${hourDeg} 100 100)`);
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock();

// ==================== POMODORO TIMER ====================
let timerInterval = null;
let timerSeconds = 25 * 60; // Default 25 minutes
let isTimerRunning = false;

const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;

        timerInterval = setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds--;
                updateTimerDisplay();
            } else {
                pauseTimer();
                showNotification('🔔 Timer finished! Time to take a break!');
                playNotificationSound();
            }
        }, 1000);
    }
}

function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetTimer() {
    pauseTimer();
    timerSeconds = 25 * 60;
    updateTimerDisplay();
}

function setTimerMinutes(minutes) {
    pauseTimer();
    timerSeconds = minutes * 60;
    updateTimerDisplay();
}

// ==================== DEADLINES ====================
let deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];

function addDeadline() {
    const titleInput = document.getElementById('deadlineTitle');
    const dateInput = document.getElementById('deadlineDate');
    
    const title = titleInput.value.trim();
    const date = dateInput.value;

    if (title && date) {
        const deadline = {
            id: Date.now(),
            title: title,
            date: new Date(date).getTime(),
            createdAt: new Date().toLocaleString('vi-VN')
        };

        deadlines.push(deadline);
        localStorage.setItem('deadlines', JSON.stringify(deadlines));

        titleInput.value = '';
        dateInput.value = '';

        renderDeadlines();
        showNotification(`✅ Deadline "${title}" added!`);
    }
}

function deleteDeadline(id) {
    deadlines = deadlines.filter(d => d.id !== id);
    localStorage.setItem('deadlines', JSON.stringify(deadlines));
    renderDeadlines();
}

function renderDeadlines() {
    const deadlineList = document.getElementById('deadlineList');
    deadlineList.innerHTML = '';

    const now = Date.now();

    deadlines.forEach(deadline => {
        const timeLeft = deadline.date - now;
        const isOverdue = timeLeft < 0;
        
        const days = Math.floor(Math.abs(timeLeft) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((Math.abs(timeLeft) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((Math.abs(timeLeft) % (1000 * 60 * 60)) / (1000 * 60));

        let timeText = '';
        if (isOverdue) {
            timeText = `Overdue: ${days}d ${hours}h`;
        } else {
            timeText = `${days}d ${hours}h ${minutes}m left`;
        }

        const item = document.createElement('div');
        item.className = 'deadline-item';
        item.innerHTML = `
            <div class="deadline-text">
                <div class="deadline-title">${deadline.title}</div>
                <div class="deadline-time">${timeText}</div>
            </div>
            <button class="delete-btn" onclick="deleteDeadline(${deadline.id})">Delete</button>
        `;

        deadlineList.appendChild(item);
    });
}

// ==================== STICKY NOTES ====================
let notes = JSON.parse(localStorage.getItem('notes')) || [];

function addNote() {
    const noteInput = document.getElementById('noteInput');
    const content = noteInput.value.trim();

    if (content) {
        const note = {
            id: Date.now(),
            content: content,
            createdAt: new Date().toLocaleString('vi-VN')
        };

        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));

        noteInput.value = '';
        renderNotes();
        showNotification('📝 Note added!');
    }
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
}

function renderNotes() {
    const notesContainer = document.getElementById('notesContainer');
    notesContainer.innerHTML = '';

    notes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'note-item';
        item.innerHTML = `
            <div class="note-text">
                <div class="note-content">${note.content}</div>
                <div class="note-time">${note.createdAt}</div>
            </div>
            <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
        `;

        notesContainer.appendChild(item);
    });
}

// ==================== NOTIFICATIONS ====================
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function playNotificationSound() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// ==================== INITIALIZE DASHBOARD ====================
document.addEventListener('DOMContentLoaded', () => {
    renderDeadlines();
    renderNotes();

    // Check deadlines every minute
    setInterval(() => {
        renderDeadlines();
    }, 60000);
});

// ==================== SMOOTH SCROLL NAVIGATION ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ==================== STAR GENERATION ====================
function generateStars() {
    const starsContainer = document.querySelector('.stars');
    const starCount = 50;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background-color: rgba(255, 179, 217, 0.4);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: twinkle ${2 + Math.random() * 3}s infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        starsContainer.appendChild(star);
    }
}

document.addEventListener('DOMContentLoaded', generateStars);

// ==================== SCROLL ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});

// ==================== ACTIVE NAV LINK ==================== 
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.style.color = 'var(--dark-pink)';
        } else {
            link.style.color = '';
        }
    });
});

// ==================== MOBILE MENU TOGGLE (Optional) ====================
// This can be expanded if you want to add a hamburger menu for mobile

// ==================== ANIMATION PERFORMANCE OPTIMIZATION ====================
// Reduce animation on low-power devices
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'auto';
}

// ==================== PAGE VISIBILITY CHECK ====================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations and timers when tab is not visible
        if (isTimerRunning) {
            pauseTimer();
        }
    } else {
        // Update clock when tab becomes visible again
        updateClock();
    }
});

// ==================== ERROR HANDLING ====================
window.addEventListener('error', (event) => {
    console.error('Error occurred:', event.error);
    showNotification('⚠️ An error occurred!');
});

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (event) => {
    // Alt + T to toggle theme
    if (event.altKey && event.key === 't') {
        themeToggle.click();
    }
    
    // Space to start/pause timer (when focused)
    if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault();
        if (isTimerRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }
});

// ==================== EXPORT NOTES (Optional Feature) ====================
function exportNotes() {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notes.json';
    link.click();
}

// ==================== PERFORMANCE OPTIMIZATION ====================
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize on load
window.addEventListener('load', () => {
    console.log('Portfolio website loaded successfully! 🎉');
});
