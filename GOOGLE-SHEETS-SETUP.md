# Google Sheets Integration

## 🚀 Setup Google Apps Script Function

### Step 1: Create Google Apps Script

1. **Open Google Sheets**
2. **Create a new spreadsheet**
3. **Go to Extensions → Apps Script**
4. **Delete the default code**
5. **Paste the code from `google-sheets-function.js`**
6. **Save the project** (Ctrl+S)

### Step 2: Enable Drive API (Optional)

For the full function that auto-detects file types:

1. **In Apps Script editor, go to Services**
2. **Add Google Drive API**
3. **Use `DRIVE_PROXY_URL()` function**

### Step 3: Use the Function

**In your Google Sheet:**

**Column A**: Drive URLs
**Column B**: Proxy URLs (use this formula)

```
=DRIVE_PROXY_URL_SIMPLE(A1)
```

**Example:**
| A (Drive URL) | B (Proxy URL) |
|---------------|---------------|
| `https://drive.google.com/file/d/10b8wSlUMxB3RO8QsENPovck0RV1g2GYi/view` | `=DRIVE_PROXY_URL_SIMPLE(A1)` |
| `https://drive.google.com/file/d/143HjfA_xRZyTs2DBgPHMaR9--zvlXLk6/view` | `=DRIVE_PROXY_URL_SIMPLE(A2)` |

**Copy the formula down** to convert all URLs in column A.

## 📋 Available Functions

### 1. `DRIVE_PROXY_URL(driveUrl)`
- **Requires**: Drive API enabled
- **Features**: Auto-detects file type from Drive API
- **Use when**: You want automatic file type detection

### 2. `DRIVE_PROXY_URL_SIMPLE(driveUrl)`
- **Requires**: No API access needed
- **Features**: Uses predefined file mapping
- **Use when**: You want simple setup without API

## 🔧 Customization

### Update Proxy URL
Change this line in the script:
```javascript
const PROXY_BASE_URL = "https://25af0734acab.ngrok-free.app";
```

### Add More Files
Add to the `fileMapping` object in `DRIVE_PROXY_URL_SIMPLE`:
```javascript
'YOUR_FILE_ID': 'jpg',  // or 'png', 'gif', etc.
```

## 📝 Example Usage

**Setup your sheet like this:**

| A (Drive URL) | B (Formula) | C (Result) |
|---------------|-------------|------------|
| `https://drive.google.com/file/d/10b8wSlUMxB3RO8QsENPovck0RV1g2GYi/view` | `=DRIVE_PROXY_URL_SIMPLE(A1)` | `https://25af0734acab.ngrok-free.app/img/10b8wSlUMxB3RO8QsENPovck0RV1g2GYi.jpg` |
| `https://drive.google.com/file/d/143HjfA_xRZyTs2DBgPHMaR9--zvlXLk6/view` | `=DRIVE_PROXY_URL_SIMPLE(A2)` | `https://25af0734acab.ngrok-free.app/img/143HjfA_xRZyTs2DBgPHMaR9--zvlXLk6.png` |

**Steps:**
1. **Put Drive URLs in column A**
2. **Use formula `=DRIVE_PROXY_URL_SIMPLE(A1)` in column B**
3. **Copy formula down for all rows**
4. **Column B will show your proxy URLs**

## ✅ Benefits

- ✅ **One-click conversion** from Drive URLs to proxy URLs
- ✅ **Proper file extensions** for Notion compatibility
- ✅ **Bulk processing** of multiple URLs
- ✅ **Easy to use** in any Google Sheet

## 🎯 Use Cases

- **Content planning**: Convert Drive URLs to embeddable links
- **Bulk processing**: Convert entire lists of Drive URLs
- **Team collaboration**: Share converted URLs easily
- **Notion integration**: Prepare URLs for Notion embedding
