# 🚀 LocalLink

[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://nodejs.org/)
[![Security](https://img.shields.io/badge/Security-Hardened-brightgreen.svg)](SECURITY.md)

**Share files, stream media, and chat in real-time on your local network. Perfect for homes, small offices, and private networks.**

---

## ✨ What's New - GitHub Release

### 🔐 Security Enhancements
- ✅ **Filename Sanitization** - Prevents directory traversal attacks
- ✅ **Path Validation** - Ensures files stay within uploads directory
- ✅ **Security Headers** - X-Content-Type-Options, X-Frame-Options, CSP
- ✅ **Environment Configuration** - Secure secrets management with .env
- ✅ **Rate Limiting & Helmet** - Protection against common web vulnerabilities

### 🎨 New Multi-Page Interface
- ✅ **Clean Navigation** - Separate pages for Files, Player, and Chat
- ✅ **Homepage Dashboard** - Beautiful landing page with quick access cards
- ✅ **Modular JavaScript** - Shared utilities for better performance
- ✅ **Responsive Design** - Optimized for all devices

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Quick Start](#-quick-start)
3. [Installation](#-installation)
4. [Usage](#-usage)
5. [Project Structure](#-project-structure)
6. [Configuration](#-configuration)
7. [Security](#-security)
8. [License](#-license)

---

## 🎯 Features

### 📁 **File Sharing**
- Upload files up to **10GB** per file
- Drag-and-drop or browse upload
- Real-time progress tracking
- Download files instantly
- Organize and manage all uploads in one place

### 🎬 **Media Player**
- Stream videos directly in-browser
- Support for MP4, WebM, OGG, MOV, AVI, MKV
- **HTTP range requests** for smooth seeking
- Optimized for **Android TV** and smart TVs
- Fullscreen mode with playback controls

### 💬 **Real-time Chat**
- Instant messaging across all connected devices
- Auto-generated fun usernames (e.g., "CyberDragon", "ThunderWolf")
- **Discord-style commands**: `/help`, `/online`, `/clear`, `/time`, `/ping`
- Emoji reactions and quick responses
- System notifications for connection events

### 🌓 **Dual Theme**
- **Dark Mode** (default) - Futuristic cyan/purple gradients
- **Light Mode** - Clean minimalist design
- Smooth transitions with rotation animation
- Persists across sessions

### 🔒 **Security**
- Designed for **trusted local networks only**
- Filename sanitization prevents injection attacks
- Path traversal protection
- Security headers (helmet.js)
- Environment-based configuration
- See [SECURITY.md](SECURITY.md) for full details

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/local-network-hub.git
cd local-network-hub

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment
cp .env.example .env

# 4. Start the server
npm start

# 5. Open in browser
# http://localhost:3308
```

**Access from other devices on your network:**
```
http://[YOUR-LOCAL-IP]:3308
```

---

## 📖 Usage

### Homepage
Navigate to `http://localhost:3308` to see the dashboard with quick access to all features.

### File Sharing (`/files.html`)
1. **Upload Files:** Drag & drop or click to browse
2. **Download Files:** Click the Download button
3. **Play Videos:** Click Play to open in media player
4. **Delete Files:** Click the red trash icon

### Media Player (`/player.html`)
1. **Play Videos:** Select from available videos list
2. **Playback Controls:** Use native browser controls
3. **Fullscreen:** Click fullscreen button for immersive viewing
4. **Android TV:** Optimized for TV remote control navigation

### Real-time Chat (`/chat.html`)
1. **Send Messages:** Type and press Enter or click Send
2. **Emoji Reactions:** Click 😊 button for quick emojis
3. **Commands:** Type `/help` to see all available commands

---

## 📂 Project Structure

```
local-network-hub/
├── server.js                 # Express server with WebSocket
├── package.json              # Dependencies and scripts
├── .env.example              # Environment template
├── .gitignore                # Git exclusions
├── README.md                 # This file
├── SECURITY.md               # Security guidelines
├── LICENSE                   # MIT License
├── public/                   # Frontend files
│   ├── index.html           # Homepage dashboard
│   ├── files.html           # File management
│   ├── player.html          # Media player
│   ├── chat.html            # Real-time chat
│   ├── styles.css           # Styles and themes
│   ├── shared.js            # Common utilities
│   ├── files.js             # File logic
│   ├── player.js            # Player logic
│   └── chat.js              # Chat logic
└── uploads/                  # File storage (auto-created)
```

---

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```env
PORT=3308                      # Server port
MAX_FILE_SIZE=10737418240      # 10GB in bytes
UPLOADS_DIR=./uploads          # Upload directory
```

### Firewall Configuration

**Windows:** Allow port 3308 in Windows Defender Firewall  
**macOS:** System Preferences → Security & Privacy → Firewall  
**Linux:** `sudo ufw allow 3308/tcp`

---

## 🔒 Security

### ⚠️ Important Security Notes

- **Local Networks Only** - Designed for trusted local networks
- **No Authentication** - Anyone on your network can access it
- **HTTPS Not Enabled** - Data transmitted over HTTP (not encrypted)

### Security Features

✅ Filename sanitization  
✅ Path traversal protection  
✅ Security headers (helmet.js)  
✅ Environment-based configuration  
✅ Rate limiting support  

**For detailed security information, see [SECURITY.md](SECURITY.md)**

---

## 🐛 Troubleshooting

**Can't connect from other devices?**
- Check firewall settings (port 3308)
- Verify all devices on same network
- Use IP address instead of hostname

**Upload fails?**
- Check available disk space
- Try smaller files first

**Chat not working?**
- Check WebSocket connection indicator
- Refresh the page
- Check browser console (F12)

**Videos won't play?**
- Convert to MP4 for best compatibility
- Try different browser (Chrome/Edge recommended)

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 💡 Tips

- Keep server running on dedicated computer for 24/7 access
- Use descriptive filenames for organization
- Regularly backup important files
- Use chat to coordinate with other network users

---

**Made with ❤️ for local networks. Star ⭐ this repo if you find it useful!**
