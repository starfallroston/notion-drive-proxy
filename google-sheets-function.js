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
  const PROXY_BASE_URL = "https://25af0734acab.ngrok-free.app";
  
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
  const PROXY_BASE_URL = "https://25af0734acab.ngrok-free.app";
  
  // Handle empty or invalid input
  if (!driveUrl || driveUrl === "") {
    return "";
  }
  
  // Your gallery file mapping (update this with your actual files)
  const fileMapping = {
    '10b8wSlUMxB3RO8QsENPovck0RV1g2GYi': 'jpg',
    '1fhGNA8hayI-nMwvvLo-dPIZwLuTy9TJd': 'jpg',
    '14Ce7Z_h4sMJ6KNopwzU1YsIxAGTQdOvV': 'jpg',
    '1wsyrRZRuo-osq1UpsILKReAp0PCxnpyL': 'jpg',
    '143HjfA_xRZyTs2DBgPHMaR9--zvlXLk6': 'png',
    '1CMRpuOdJEB1oVO0XJKxKqqdx0XR53fgg': 'png',
    '16rPnroJLj6k7TW81AD8_-Ip26Cw8duuA': 'png',
    '1d4mUZuk7za6UFY00oJ16IncK6I0vEezM': 'png',
    '1RaPcMNzerRNO6ztoTabPJ5WI2OS9dvS9': 'png',
    '1gnJw1vwPLV-0mDRy3DYEkWSU3c86zDde': 'png',
    '1Y7WodMOyYkKT0DleWJfuL66r--MJ7PW0': 'png',
    '1CMAEQcUF1LJyh7ysPDo19lM9H35388gX': 'png',
    '1c8_A4esfkY4a2UErr7mr0gdA1bqeN0NC': 'png',
    '1n2-FXzb9NVYeMQPx8vUFbzFqj74Pr1DE': 'png',
    '1mccxCoWTcyWJpjCb72BYSxi2Xo8LaKg_': 'png',
    '1inM4X4eieoRm57Ww4i3uR40wfOfAiGLL': 'png',
    '1BtQP0B0DxA54MeElRxI1YzPKksbtGxZr': 'jpg',
    '1VobO0Ff0bhf8iz-LKbfS4ThJ2Ww3DEqd': 'jpg',
    '1YtDAr-wKsAzjdDdLA5NfBVGq7xiXPmOj': 'jpg',
    '1sgU34QEvALwAPmdcBmySvsYDDb22XZDY': 'jpg',
    '11g6Hayq0m5WZRtIVKlgGbpagvokW8-p1': 'jpg',
    '1P3nFbjb6345muoqvVhMS-ECY8a9n3m8Z': 'jpg',
    '1WjXFUTlRDy_eBS-Z4XFWl0-EGUvLsB0q': 'jpg',
    '1aUO06ENxTuk8-F_Yzh_f2gxCDmq7CcLR': 'jpg',
    '1D-eYHyWXgP1roye5EfK01usFXzrqF_Uc': 'jpg'
  };
  
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
