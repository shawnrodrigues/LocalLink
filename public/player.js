// ===================================
// Player Page JavaScript
// Video playback functionality
// ===================================

let currentVideo = null;

document.addEventListener('DOMContentLoaded', () => {
    setupMediaPlayer();
    loadVideoList();
    checkURLParams();
});

// Listen for file updates
window.addEventListener('fileUpdate', () => {
    loadVideoList();
});

// ===================================
// Check URL Parameters
// ===================================
function checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const fileParam = urlParams.get('file');
    
    if (fileParam) {
        playVideo(fileParam);
    }
}

// ===================================
// Setup Media Player
// ===================================
function setupMediaPlayer() {
    const mediaPlayer = document.getElementById('mediaPlayer');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const mediaInfo = document.getElementById('mediaInfo');
    const mediaTime = document.getElementById('mediaTime');
    const mediaQuality = document.getElementById('mediaQuality');
    
    // Fullscreen button
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const container = document.getElementById('mediaPlayerContainer');
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                container.requestFullscreen();
            }
        });
    }
    
    // Time update
    if (mediaPlayer) {
        mediaPlayer.addEventListener('loadedmetadata', () => {
            const duration = formatTime(mediaPlayer.duration);
            mediaTime.textContent = `00:00 / ${duration}`;
            
            // Display video quality
            const width = mediaPlayer.videoWidth;
            const height = mediaPlayer.videoHeight;
            mediaQuality.textContent = `${width}x${height}`;
        });
        
        mediaPlayer.addEventListener('timeupdate', () => {
            const current = formatTime(mediaPlayer.currentTime);
            const duration = formatTime(mediaPlayer.duration);
            mediaTime.textContent = `${current} / ${duration}`;
        });
        
        mediaPlayer.addEventListener('play', () => {
            mediaInfo.style.display = 'flex';
        });
    }
}

// ===================================
// Load Available Videos
// ===================================
async function loadVideoList() {
    try {
        const response = await fetch(`${window.sharedUtils.API_URL}/api/files`);
        const files = await response.json();
        
        const videos = files.filter(file => window.sharedUtils.isVideoFile(file.filename));
        const videoList = document.getElementById('videoList');
        
        if (videos.length === 0) {
            videoList.innerHTML = '<p class="empty-state">No videos uploaded yet. <a href="files.html">Upload videos</a></p>';
            return;
        }
        
        videoList.innerHTML = videos.map(video => `
            <div class="video-item ${currentVideo === video.filename ? 'playing' : ''}" 
                 onclick="playVideo('${video.filename}')">
                <div class="video-thumbnail">
                    🎬
                </div>
                <div class="video-details">
                    <div class="video-title">${video.originalName}</div>
                    <div class="video-info">
                        ${window.sharedUtils.formatFileSize(video.size)} • 
                        ${window.sharedUtils.formatDate(video.uploadedAt)}
                    </div>
                </div>
                ${currentVideo === video.filename ? '<div class="playing-badge">▶ Playing</div>' : ''}
            </div>
        `).join('');
    } catch (err) {
        console.error('Failed to load videos:', err);
    }
}

// ===================================
// Play Video
// ===================================
function playVideo(filename) {
    const mediaPlayer = document.getElementById('mediaPlayer');
    const mediaPlaceholder = document.getElementById('mediaPlaceholder');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    
    // Get original name from video list
    fetch(`${window.sharedUtils.API_URL}/api/files`)
        .then(res => res.json())
        .then(files => {
            const file = files.find(f => f.filename === filename);
            if (file) {
                nowPlayingTitle.textContent = file.originalName;
            }
        });
    
    currentVideo = filename;
    
    // Update URL without reload
    const newURL = `${window.location.pathname}?file=${encodeURIComponent(filename)}`;
    window.history.pushState({}, '', newURL);
    
    // Set video source
    mediaPlayer.src = `${window.sharedUtils.API_URL}/api/download/${filename}`;
    mediaPlayer.style.display = 'block';
    mediaPlaceholder.style.display = 'none';
    
    // Play video
    mediaPlayer.load();
    mediaPlayer.play().catch(err => {
        console.error('Playback error:', err);
        alert('Failed to play video. Check if your browser supports this format.');
    });
    
    // Update video list highlighting
    loadVideoList();
}

// ===================================
// Utility Functions
// ===================================
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}
