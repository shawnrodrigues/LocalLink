// ===================================
// Files Page JavaScript
// File upload, download, delete
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    loadFiles();
    setupFileUpload();
});

// Listen for file updates from WebSocket
window.addEventListener('fileUpdate', () => {
    loadFiles();
});

// ===================================
// Load Files List
// ===================================
async function loadFiles() {
    try {
        const response = await fetch(`${window.sharedUtils.API_URL}/api/files`);
        const files = await response.json();
        
        const filesList = document.getElementById('filesList');
        
        if (files.length === 0) {
            filesList.innerHTML = '<p class="empty-state">No files uploaded yet</p>';
            return;
        }
        
        filesList.innerHTML = files.map(file => {
            const isVideo = window.sharedUtils.isVideoFile(file.filename);
            
            return `
                <div class="file-item ${isVideo ? 'video-file' : ''}" data-filename="${file.filename}">
                    <div class="file-icon">
                        ${isVideo ? '🎬' : '📄'}
                    </div>
                    <div class="file-info">
                        <div class="file-name">${file.originalName}</div>
                        <div class="file-meta">
                            ${window.sharedUtils.formatFileSize(file.size)} • 
                            ${window.sharedUtils.formatDate(file.uploadedAt)}
                        </div>
                    </div>
                    <div class="file-actions">
                        ${isVideo ? `
                            <a href="player.html?file=${encodeURIComponent(file.filename)}" class="btn btn-play">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="5 3 19 12 5 21 5 3" fill="none"/>
                                </svg>
                                Play
                            </a>
                        ` : ''}
                        <button class="btn btn-download" onclick="downloadFile('${file.filename}', '${file.originalName}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none"/>
                                <polyline points="7 10 12 15 17 10" fill="none"/>
                                <line x1="12" y1="15" x2="12" y2="3" fill="none"/>
                            </svg>
                            Download
                        </button>
                        <button class="btn btn-delete" onclick="deleteFile('${file.filename}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="3 6 5 6 21 6" fill="none"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to load files:', err);
    }
}

// ===================================
// File Upload
// ===================================
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Click to browse
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            uploadFiles(files);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            uploadFiles(files);
        }
    });
}

async function uploadFiles(files) {
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        progressContainer.style.display = 'block';
        progressText.textContent = `Uploading ${file.name}...`;
        
        try {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    progressFill.style.width = percentComplete + '%';
                    progressText.textContent = `Uploading ${file.name} (${Math.round(percentComplete)}%)`;
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    console.log('Upload complete');
                    loadFiles();
                } else {
                    alert('Upload failed: ' + xhr.statusText);
                }
                progressContainer.style.display = 'none';
                progressFill.style.width = '0%';
            });
            
            xhr.addEventListener('error', () => {
                alert('Upload failed');
                progressContainer.style.display = 'none';
                progressFill.style.width = '0%';
            });
            
            xhr.open('POST', `${window.sharedUtils.API_URL}/api/upload`);
            xhr.send(formData);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Upload failed: ' + err.message);
            progressContainer.style.display = 'none';
        }
    }
}

// ===================================
// File Download
// ===================================
function downloadFile(filename, originalName) {
    const link = document.createElement('a');
    link.href = `${window.sharedUtils.API_URL}/api/download/${filename}`;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===================================
// File Delete
// ===================================
async function deleteFile(filename) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    try {
        const response = await fetch(`${window.sharedUtils.API_URL}/api/files/${filename}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadFiles();
        } else {
            alert('Failed to delete file');
        }
    } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete file');
    }
}
