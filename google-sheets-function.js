/**
 * Google Apps Script function for Google Sheets
 * Converts Google Drive URLs to proxy URLs with proper file extensions
 * 
 * Usage in Google Sheets:
 * =DRIVE_PROXY_URL(A1) // where A1 contains a Drive URL
 * =DRIVE_PROXY_URL("https://drive.google.com/file/d/FILE_ID/view")
 */

function DRIVE_PROXY_URL(driveUrl) {
  // Your proxy base URL (update this to your deployed URL)
  const PROXY_BASE_URL = "https://notion-drive-proxy.roston-yoo.workers.dev";
  
  // Handle empty or invalid input
  if (!driveUrl || driveUrl === "") {
    return "";
  }
  
  try {
    // Extract file ID from various Google Drive URL formats
    let fileId = extractFileId(driveUrl);
    
    if (!fileId) {
      return "Error: Invalid Google Drive URL";
    }
    
    // Get file metadata to determine the correct extension
    const fileMetadata = getFileMetadata(fileId);
    
    if (!fileMetadata) {
      return "Error: Could not access file";
    }
    
    // Determine file extension from MIME type
    const extension = getExtensionFromMimeType(fileMetadata.mimeType);
    
    // Return the proxy URL with proper extension
    return `${PROXY_BASE_URL}/img/${fileId}.${extension}`;
    
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

/**
 * Extract file ID from Google Drive URL
 */
function extractFileId(url) {
  const patterns = [
    // https://drive.google.com/file/d/FILE_ID/view
    /\/file\/d\/([a-zA-Z0-9-_]+)\//,
    // https://drive.google.com/open?id=FILE_ID
    /[?&]id=([a-zA-Z0-9-_]+)/,
    // https://drive.google.com/u/0/drive-viewer/FILE_ID
    /\/drive-viewer\/([a-zA-Z0-9-_]+)/,
    // Direct file ID
    /^([a-zA-Z0-9-_]+)$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Get file metadata from Google Drive API
 */
function getFileMetadata(fileId) {
  try {
    // This requires the Drive API to be enabled
    const file = Drive.Files.get(fileId, {
      fields: 'mimeType,name'
    });
    
    return {
      mimeType: file.mimeType,
      name: file.name
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return null;
  }
}

/**
 * Convert MIME type to file extension
 */
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

/**
 * Alternative function that works without Drive API access
 * Uses a predefined mapping of your gallery files
 */
function DRIVE_PROXY_URL_SIMPLE(driveUrl) {
  const PROXY_BASE_URL = "https://notion-drive-proxy.roston-yoo.workers.dev";
  
  // Handle empty or invalid input
  if (!driveUrl || driveUrl === "") {
    return "";
  }
  try {
    const fileId = extractFileId(driveUrl);
    
    if (!fileId) {
      return "Error: Invalid Google Drive URL";
    }
    
    const extension = fileMapping[fileId] || 'jpg';
    return `${PROXY_BASE_URL}/img/${fileId}.${extension}`;
    
  } catch (error) {
    return `Error: ${error.message}`;
  }
}
