// ===================================
// Chat Page JavaScript  
// Real-time messaging functionality
// ===================================

let username = '';

document.addEventListener('DOMContentLoaded', () => {
    initializeChat();
    setupChatInput();
    setupEmojiPicker();
});

// Listen for chat messages from WebSocket
window.addEventListener('chatMessage', (e) => {
    const data = e.detail;
    
    if (data.type === 'system') {
        addSystemMessage(data.message);
    } else if (data.type === 'command') {
        addCommandMessage(data.message);
    } else if (data.type === 'clear') {
        clearChat();
    } else {
        addMessage(data);
    }
});

// ===================================
// Initialize Chat
// ===================================
function initializeChat() {
    // Get or create username
    username = localStorage.getItem('chat_username');
    if (!username) {
        username = generateUsername();
        localStorage.setItem('chat_username', username);
    }
    
    console.log('Chat username:', username);
}

// ===================================
// Setup Chat Input
// ===================================
function setupChatInput() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    // Send on Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Send on button click
    sendBtn.addEventListener('click', () => {
        sendMessage();
    });
}

// ===================================
// Setup Emoji Picker
// ===================================
function setupEmojiPicker() {
    const emojiBtn = document.getElementById('emojiBtn');
    const emojiPicker = document.getElementById('emojiPicker');
    const messageInput = document.getElementById('messageInput');
    
    // Toggle emoji picker
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
            emojiPicker.style.display = 'none';
        }
    });
    
    // Insert emoji on click
    const emojiItems = document.querySelectorAll('.emoji-item');
    emojiItems.forEach(item => {
        item.addEventListener('click', () => {
            messageInput.value += item.textContent;
            messageInput.focus();
            emojiPicker.style.display = 'none';
        });
    });
}

// ===================================
// Send Message
// ===================================
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    const ws = window.sharedUtils.ws();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        addSystemMessage('⚠️ Not connected. Trying to reconnect...');
        window.sharedUtils.initializeWebSocket();
        return;
    }
    
    // Send message
    ws.send(JSON.stringify({
        type: 'message',
        message: message,
        username: username
    }));
    
    // Clear input
    messageInput.value = '';
}

// ===================================
// Add Message to Chat
// ===================================
function addMessage(data) {
    const chatMessages = document.getElementById('chatMessages');
    const isOwnMessage = data.username === username;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isOwnMessage ? 'own-message' : ''}`;
    
    const time = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${getAvatar(data.username)}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-username">${data.username}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${escapeHtml(data.message)}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Remove welcome banner if exists
    const welcomeBanner = chatMessages.querySelector('.welcome-banner');
    if (welcomeBanner) {
        welcomeBanner.remove();
    }
    
    // Scroll to bottom with smooth animation
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

// ===================================
// Add System Message
// ===================================
function addSystemMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = message;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

// ===================================
// Add Command Response
// ===================================
function addCommandMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'command-message';
    messageDiv.innerHTML = message;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

// ===================================
// Clear Chat
// ===================================
function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="welcome-banner">
            <div class="welcome-icon">💬</div>
            <h3>Chat cleared</h3>
            <p>Start a new conversation</p>
        </div>
    `;
}

// ===================================
// Utility Functions
// ===================================
function generateUsername() {
    const adjectives = ['Swift', 'Cyber', 'Thunder', 'Shadow', 'Neon', 'Quantum', 'Turbo', 'Ultra', 'Mega', 'Hyper'];
    const nouns = ['Wolf', 'Dragon', 'Phoenix', 'Tiger', 'Falcon', 'Ninja', 'Warrior', 'Knight', 'Ranger', 'Hunter'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return adj + noun;
}

function getAvatar(username) {
    // Generate consistent avatar emoji based on username
    const emojis = ['😀', '😎', '🤖', '👽', '🦊', '🐺', '🦁', '🐯', '🐉', '🦅', '🚀', '⭐', '💎', '🔥', '⚡'];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return emojis[hash % emojis.length];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
