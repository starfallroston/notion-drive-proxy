const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});

const drive = google.drive({ version: 'v3', auth });

// MIME type mapping for common image formats
const mimeTypes = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',
  'ico': 'image/x-icon'
};

// Get MIME type from file extension
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase().slice(1);
  return mimeTypes[ext] || 'application/octet-stream';
}

// Helper function to get file extension from MIME type
function getExtensionFromMimeType(mimeType) {
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/x-icon': 'ico'
  };
  return mimeToExt[mimeType] || 'jpg';
}

// Main proxy endpoint - support both /img/fileId and /img/fileId.ext
app.get('/img/:fileId', async (req, res) => {
  let { fileId } = req.params;
  
  // Remove file extension if present (for backward compatibility)
  if (fileId.includes('.')) {
    fileId = fileId.split('.')[0];
  }
  
  try {
    // Get file metadata
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'name, mimeType, size, modifiedTime'
    });

    const { name, mimeType, size, modifiedTime } = fileMetadata.data;
    
    // Determine content type
    const contentType = mimeType.startsWith('image/') ? mimeType : getMimeType(name);
    
    // Set headers for Notion compatibility
    res.set({
      'Content-Type': contentType,
      'Content-Length': size,
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
      'ETag': `"${fileId}-${modifiedTime}"`,
      'Last-Modified': new Date(modifiedTime).toUTCString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Range'
    });

    // Handle range requests for partial content
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      const chunkSize = (end - start) + 1;
      
      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunkSize
      });
    }

    // Stream file content
    const fileStream = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    });

    // Handle range requests
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      
      fileStream.data.on('data', (chunk) => {
        const chunkStart = 0;
        const chunkEnd = chunk.length - 1;
        
        if (chunkStart <= end && chunkEnd >= start) {
          const actualStart = Math.max(chunkStart, start);
          const actualEnd = Math.min(chunkEnd, end);
          const slice = chunk.slice(actualStart - chunkStart, actualEnd - chunkStart + 1);
          res.write(slice);
        }
      });
      
      fileStream.data.on('end', () => res.end());
    } else {
      fileStream.data.pipe(res);
    }

    fileStream.data.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file' });
      }
    });

  } catch (error) {
    console.error('Error fetching file:', error);
    
    if (error.code === 404) {
      res.status(404).json({ error: 'File not found' });
    } else if (error.code === 403) {
      res.status(403).json({ error: 'Access denied' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Redirect endpoint for proper file extension URLs
app.get('/img/:fileId/redirect', async (req, res) => {
  const { fileId } = req.params;
  
  try {
    // Get file metadata
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'name, mimeType'
    });

    const { name, mimeType } = fileMetadata.data;
    const extension = getExtensionFromMimeType(mimeType);
    const properUrl = `${req.protocol}://${req.get('host')}/img/${fileId}.${extension}`;
    
    res.redirect(301, properUrl);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint with usage info
app.get('/', (req, res) => {
  res.json({
    service: 'Google Drive Proxy',
    usage: 'GET /img/{FILE_ID}.{EXT}',
    example: `${req.protocol}://${req.get('host')}/img/1ABC123DEF456GHI789JKL.jpg`,
    endpoints: {
      '/img/:fileId': 'Proxy Google Drive file (backward compatible)',
      '/img/:fileId.ext': 'Proxy Google Drive file with proper extension',
      '/img/:fileId/redirect': 'Redirect to proper extension URL',
      '/health': 'Health check'
    },
    notionCompatible: true
  });
});

app.listen(PORT, () => {
  console.log(`Google Drive proxy running on port ${PORT}`);
  console.log(`Usage: GET /img/{FILE_ID}`);
  console.log(`Example: http://localhost:${PORT}/img/1ABC123DEF456GHI789JKL`);
});
