/**
 * Google Authentication Helper
 * Handles OAuth2 token generation for Google Sheets API using service account credentials
 */

interface ServiceAccountCredentials {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
}

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer)
  if (
    cachedToken &&
    cachedToken.expiresAt > Date.now() + 5 * 60 * 1000
  ) {
    return cachedToken.token
  }

  // Build credentials from environment variables
  const credentials: ServiceAccountCredentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID || '',
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '',
    private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  }

  // Validate required fields
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error(
      'Google service account credentials not properly configured. ' +
      'Make sure GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY are set.'
    )
  }

  try {
    // Import crypto dynamically to avoid issues in some environments
    const crypto = require('crypto')

    // Create JWT
    const now = Math.floor(Date.now() / 1000)
    const expiresIn = 3600 // 1 hour

    const header = {
      alg: 'RS256',
      typ: 'JWT',
    }

    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: credentials.token_uri,
      exp: now + expiresIn,
      iat: now,
    }

    // Encode JWT
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const signatureInput = `${encodedHeader}.${encodedPayload}`

    // Sign JWT
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(signatureInput)
    const signature = sign.sign(credentials.private_key, 'base64url')

    const jwt = `${signatureInput}.${signature}`

    // Exchange JWT for access token
    const tokenResponse = await fetch(credentials.token_uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      throw new Error(`Failed to get access token: ${error}`)
    }

    const tokenData = await tokenResponse.json()

    // Cache the token
    cachedToken = {
      token: tokenData.access_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    }

    return tokenData.access_token
  } catch (error) {
    throw new Error(
      `Error getting Google access token: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}
