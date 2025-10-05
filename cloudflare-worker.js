// Cloudflare Worker version
import jwt from '@tsndr/cloudflare-worker-jwt'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  
  // Handle /img/{fileId} requests
  if (pathParts[1] === 'img' && pathParts[2]) {
    const fileId = pathParts[2]
    return await proxyDriveFile(fileId, request)
  }
  
  // Health check
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Root endpoint
  if (url.pathname === '/') {
    return new Response(JSON.stringify({
      service: 'Google Drive Proxy (Cloudflare Worker)',
      usage: 'GET /img/{FILE_ID}',
      example: `${url.protocol}//${url.host}/img/1ABC123DEF456GHI789JKL`
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response('Not Found', { status: 404 })
}

async function proxyDriveFile(fileId, request) {
  try {
    // Get Google Drive access token
    const token = await getAccessToken()
    
    // Get file metadata
    const metadataResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType,size,modifiedTime`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!metadataResponse.ok) {
      if (metadataResponse.status === 404) {
        return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 })
      }
      if (metadataResponse.status === 403) {
        return new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 })
      }
      return new Response(JSON.stringify({ error: 'Failed to fetch file metadata' }), { status: 500 })
    }
    
    const metadata = await metadataResponse.json()
    const { name, mimeType, size, modifiedTime } = metadata
    
    // Determine content type
    const contentType = mimeType.startsWith('image/') ? mimeType : getMimeType(name)
    
    // Get file content
    const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!fileResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch file content' }), { status: 500 })
    }
    
    // Create response with proper headers
    const response = new Response(fileResponse.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': size,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': `"${fileId}-${modifiedTime}"`,
        'Last-Modified': new Date(modifiedTime).toUTCString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Range'
      }
    })
    
    return response
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

async function getAccessToken() {
  // Get service account credentials from JSON environment variable
  console.log('SERVICE_ACCOUNT_JSON exists:', typeof SERVICE_ACCOUNT_JSON !== 'undefined')

  if (typeof SERVICE_ACCOUNT_JSON === 'undefined') {
    throw new Error('SERVICE_ACCOUNT_JSON environment variable not set')
  }

  const serviceAccount = SERVICE_ACCOUNT_JSON
  console.log('Service account email:', serviceAccount.client_email)

  // Get service account credentials from JSON environment variable
  const serviceAccountEmail = serviceAccount.client_email
  const privateKey = serviceAccount.private_key
  const projectId = serviceAccount.project_id
  
  // Create JWT payload
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }
  
  // Sign JWT with private key
  const assertion = await jwt.sign(payload, privateKey, { algorithm: 'RS256' })
  
  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: assertion
    })
  })
  
  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
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
  }
  return mimeTypes[ext] || 'application/octet-stream'
}


