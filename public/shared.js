// ===================================
// Shared JavaScript for All Pages
// Common utilities, WebSocket, Theme
// ===================================

// Configuration
const API_URL = window.location.origin;
const WS_URL = `ws://${window.location.host}`;

// Global State
let ws = null;
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let pageHidden = false;
let wsInitialized = false;

// ===================================
// Initialize on Page Load
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    if (!wsInitialized) {
        wsInitialized = true;
        initializeWebSocket();
        getLocalIP();
        setupThemeToggle();
        setupNavigation();
    }
});

// Handle page visibility to prevent reconnections when tab is hidden
document.addEventListener('visibilitychange', () => {
    pageHidden = document.hidden;
});

// ===================================
// WebSocket Connection
// ===================================
function initializeWebSocket() {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting || (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING))) {
        console.log('Connection already exists or in progress');
        return;
    }
    
    // Don't reconnect if page is hidden
    if (pageHidden) {
        console.log('Page is hidden, skipping reconnection');
        return;
    }
    
    isConnecting = true;
    
    try {
        ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
            console.log('✓ Connected');
            isConnecting = false;
            reconnectAttempts = 0;
            updateStatus(true);
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Dispatch events for page-specific handling
                if (data.type === 'file_update') {
                    window.dispatchEvent(new CustomEvent('fileUpdate', { detail: data }));
                } else if (data.type === 'system' || data.type === 'command' || data.type === 'clear') {
                    window.dispatchEvent(new CustomEvent('chatMessage', { detail: data }));
                } else {
                    window.dispatchEvent(new CustomEvent('chatMessage', { detail: data }));
                }
            } catch (err) {
                console.error('Error parsing message:', err);
            }
        };
        
        ws.onclose = (event) => {
            isConnecting = false;
            ws = null;
            updateStatus(false);
            
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !event.wasClean && !pageHidden) {
                const delay = Math.min(10000, 2000 * (reconnectAttempts + 1));
                console.log(`Reconnecting in ${delay/1000}s (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
                
                setTimeout(() => {
                    reconnectAttempts++;
                    initializeWebSocket();
                }, delay);
            } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                console.log('Connection lost. Please refresh the page.');
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error');
            isConnecting = false;
        };
    } catch (err) {
        console.error('Failed to create WebSocket:', err);
        isConnecting = false;
        updateStatus(false);
    }
}

function updateStatus(connected) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (connected) {
        statusDot?.classList.add('connected');
        if (statusText) statusText.textContent = 'Connected';
    } else {
        statusDot?.classList.remove('connected');
        if (statusText) statusText.textContent = 'Disconnected';
    }
}

// ===================================
// Theme Toggle
// ===================================
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Add rotation animation
            themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 500);
        });
    }
}

// ===================================
// Get Local IP Address
// ===================================
async function getLocalIP() {
    const localIPElement = document.getElementById('localIP');
    if (!localIPElement) return;
    
    try {
        const response = await fetch('/api/files');
        const host = window.location.host;
        localIPElement.textContent = host;
    } catch (err) {
        localIPElement.textContent = 'Unable to detect';
    }
}

// ===================================
// Navigation Active State
// ===================================
function setupNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ===================================
// Utility Functions
// ===================================
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    
    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than 1 day
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Default: show date
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// Export functions for other scripts to use
window.sharedUtils = {
    ws: () => ws,
    API_URL,
    formatFileSize,
    formatDate,
    isVideoFile,
    initializeWebSocket
};
