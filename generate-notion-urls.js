const fs = require('fs');

// Read gallery files
const galleryFiles = JSON.parse(fs.readFileSync('gallery-files.json', 'utf8'));

// MIME type to extension mapping
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

function getExtensionFromMimeType(mimeType) {
  return mimeToExt[mimeType] || 'jpg';
}

const baseUrl = 'https://notion-drive-proxy.roston-yoo.workers.dev';

console.log('🎯 NOTION-COMPATIBLE IMAGE URLs');
console.log('================================');
console.log('');

// Filter only image files
const imageFiles = galleryFiles.filter(file => 
  file.mimeType.startsWith('image/') && 
  file.id !== '10alVaC7awv4p7aM3OE0vBJYdZdyT2_JZEK9jK_47I43jmM2tnN-U3gvA'
);

imageFiles.forEach((file, index) => {
  const extension = getExtensionFromMimeType(file.mimeType);
  const notionUrl = `${baseUrl}/img/${file.id}.${extension}`;
  
  console.log(`${index + 1}. ${file.name}`);
  console.log(`   Notion URL: ${notionUrl}`);
  console.log(`   Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Type: ${file.mimeType}`);
  console.log('');
});

console.log('📋 COPY & PASTE FOR NOTION:');
console.log('===========================');
console.log('');

imageFiles.slice(0, 5).forEach((file, index) => {
  const extension = getExtensionFromMimeType(file.mimeType);
  const notionUrl = `${baseUrl}/img/${file.id}.${extension}`;
  console.log(`${notionUrl}`);
});

console.log('');
console.log('✅ These URLs now end with proper file extensions!');
console.log('✅ Perfect for Notion Files & media fields!');
console.log('✅ Images will show previews immediately!');

