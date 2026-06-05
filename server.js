const express = require('express');
const multer = require('multer');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const http = require('http');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3308;

// Security: Sanitize filename to prevent directory traversal and injection
function sanitizeFilename(filename) {
    // Remove any path separators and parent directory references
    return filename.replace(/[/\\]/g, '_').replace(/\.\./g, '_');
}

// Security middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads with increased size limit
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitized = sanitizeFilename(file.originalname);
        cb(null, uniqueSuffix + '-' + sanitized);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 * 1024 // 10GB limit
    }
});

// Get list of uploaded files
app.get('/api/files', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read files' });
        }
        
        const fileList = files.map(filename => {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);
            return {
                name: filename.split('-').slice(2).join('-') || filename,
                originalName: filename.split('-').slice(2).join('-') || filename,
                filename: filename,
                size: stats.size,
                uploadedAt: stats.mtime
            };
        });
        
        res.json(fileList);
    });
});

// Upload file endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
    });
    
    // Broadcast to all WebSocket clients
    broadcastFileUpdate();
});

// Download file endpoint with video streaming support
app.get('/api/download/:filename', (req, res) => {
    const filename = sanitizeFilename(req.params.filename);
    const filePath = path.join(uploadsDir, filename);
    
    // Security: Verify the resolved path is still within uploads directory
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    // Check if it's a video file
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
    const isVideo = videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    
    // If range request (video streaming)
    if (range && isVideo) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': getContentType(filename),
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        // Regular download
        const originalName = filename.split('-').slice(2).join('-') || filename;
        res.download(filePath, originalName);
    }
});

// Helper function to get content type
function getContentType(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    const types = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'video/ogg',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        'm4v': 'video/x-m4v'
    };
    return types[ext] || 'application/octet-stream';
}

// Delete file endpoint
app.delete('/api/files/:filename', (req, res) => {
    const filename = sanitizeFilename(req.params.filename);
    const filePath = path.join(uploadsDir, filename);
    
    // Security: Verify the resolved path is still within uploads directory
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to delete file' });
        }
        res.json({ message: 'File deleted successfully' });
        broadcastFileUpdate();
    });
});

// Bulk delete endpoint
app.delete('/api/files/bulk-delete', (req, res) => {
    const { filenames } = req.body;
    
    if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
        return res.status(400).json({ error: 'No files specified for deletion' });
    }
    
    let deletedCount = 0;
    let errors = [];
    
    filenames.forEach(filename => {
        const filePath = path.join(uploadsDir, filename);
        
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                deletedCount++;
            } catch (err) {
                errors.push({ filename, error: 'Unable to delete file' });
            }
        } else {
            errors.push({ filename, error: 'File not found' });
        }
    });
    
    if (deletedCount > 0) {
        broadcastFileUpdate();
    }
    
    res.json({
        message: `Deleted ${deletedCount} file(s)`,
        deleted: deletedCount,
        errors: errors
    });
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for real-time chat
const wss = new WebSocket.Server({ 
    server,
    clientTracking: true,
    perMessageDeflate: false
});

const clients = new Set();

wss.on('connection', (ws, req) => {
    clients.add(ws);
    
    // Only log if there are few connections (to avoid spam)
    if (clients.size <= 5) {
        console.log(`✓ Client connected (Total: ${clients.size})`);
    }
    
    // Send connection confirmation
    ws.send(JSON.stringify({
        type: 'system',
        message: 'Connected to chat server',
        timestamp: new Date().toISOString()
    }));
    
    // Set up ping/pong to keep connection alive
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // Handle slash commands
            if (data.message && data.message.startsWith('/')) {
                handleCommand(ws, data, clients);
                return;
            }
            
            // Broadcast message to all clients
            const broadcastData = {
                type: data.type || 'message',
                message: data.message,
                username: data.username || 'Anonymous',
                timestamp: new Date().toISOString()
            };
            
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(broadcastData));
                }
            });
        } catch (err) {
            console.error('Error parsing message:', err);
        }
    });
    
    ws.on('close', () => {
        clients.delete(ws);
        // Only log disconnects if few clients
        if (clients.size <= 5) {
            console.log(`Client disconnected (Total: ${clients.size})`);
        }
    });
    
    ws.on('error', (error) => {
        clients.delete(ws);
        // Silently handle common errors
        if (error.code !== 'ECONNRESET') {
            console.error('WebSocket error:', error.message);
        }
    });
});

// Ping clients every 30 seconds to keep connections alive
const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(pingInterval);
});

function handleCommand(ws, data, clients) {
    const command = data.message.toLowerCase().split(' ')[0];
    const args = data.message.split(' ').slice(1);
    
    switch (command) {
        case '/help':
            ws.send(JSON.stringify({
                type: 'command',
                message: '**Available Commands:**\n' +
                        '`/help` - Show this help message\n' +
                        '`/online` - Show number of connected users\n' +
                        '`/clear` - Clear your chat history\n' +
                        '`/time` - Show current server time\n' +
                        '`/ping` - Check your connection',
                timestamp: new Date().toISOString()
            }));
            break;
            
        case '/online':
            ws.send(JSON.stringify({
                type: 'command',
                message: `🟢 **${clients.size}** ${clients.size === 1 ? 'user' : 'users'} currently online`,
                timestamp: new Date().toISOString()
            }));
            break;
            
        case '/clear':
            ws.send(JSON.stringify({
                type: 'clear',
                message: 'Chat cleared',
                timestamp: new Date().toISOString()
            }));
            break;
            
        case '/time':
            ws.send(JSON.stringify({
                type: 'command',
                message: `🕐 Server time: **${new Date().toLocaleString()}**`,
                timestamp: new Date().toISOString()
            }));
            break;
            
        case '/ping':
            ws.send(JSON.stringify({
                type: 'command',
                message: '🏓 Pong! Connection is active.',
                timestamp: new Date().toISOString()
            }));
            break;
            
        default:
            ws.send(JSON.stringify({
                type: 'command',
                message: `❌ Unknown command: **${command}**. Type **/help** for available commands.`,
                timestamp: new Date().toISOString()
            }));
    }
}

function broadcastFileUpdate() {
    const message = JSON.stringify({
        type: 'file_update',
        message: 'File list updated',
        timestamp: new Date().toISOString()
    });
    
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Error handling
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close other instances or change the port.`);
        process.exit(1);
    } else {
        console.error('Server error:', error);
    }
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        wss.close(() => {
            console.log('WebSocket server closed');
            process.exit(0);
        });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Access from other devices: http://[YOUR_LOCAL_IP]:${PORT}`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
});
