# Google Drive Proxy for Notion

A tiny HTTP proxy that serves Google Drive images with Notion-compatible URLs and headers.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Google Service Account:**
   - Create service account in Google Cloud Console
   - Download JSON key as `service-account-key.json`
   - Share your Drive folder with the service account email

3. **Start server:**
   ```bash
   npm start
   ```

4. **Generate Notion URLs:**
   ```bash
   node generate-notion-urls.js
   ```

## 📋 Usage

**Local URLs:**
- `http://localhost:3000/img/{FILE_ID}.{EXT}`

**Public URLs (with ngrok):**
- `https://your-domain.ngrok-free.app/img/{FILE_ID}.{EXT}`

**Example:**
- `https://25af0734acab.ngrok-free.app/img/10b8wSlUMxB3RO8QsENPovck0RV1g2GYi.jpg`

## 🎯 Notion Integration

1. Copy any image URL from `generate-notion-urls.js` output
2. Paste into Notion's Files & media field
3. Image previews immediately!

## ✅ Features

- ✅ Notion-compatible URLs with proper extensions
- ✅ Proper image/* Content-Type headers
- ✅ 1-year cache headers for performance
- ✅ CORS support for web usage
- ✅ Range request support
- ✅ Error handling

## 📁 Files

- `server.js` - Main Express server
- `cloudflare-worker.js` - Cloudflare Worker version
- `generate-notion-urls.js` - Generate Notion-compatible URLs
- `gallery-files.json` - Your image file list
- `service-account-key.json` - Google auth (keep secure!)

## 🌐 Deployment

Deploy to any Node.js hosting service:
- Vercel, Render, Railway, Heroku
- Add environment variable: `GOOGLE_APPLICATION_CREDENTIALS`
- Paste your service account JSON content