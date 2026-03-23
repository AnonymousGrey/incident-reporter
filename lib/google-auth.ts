/**
 * Google Authentication Helper
 * Uses native Node.js crypto for JWT signing - simple and direct
 */

import { createSign } from 'crypto'

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer)
  if (
    cachedToken &&
    cachedToken.expiresAt > Date.now() + 5 * 60 * 1000
  ) {
    console.log('📦 Using cached access token')
    return cachedToken.token
  }

  try {
    console.log('🔐 Creating JWT and getting Google access token...')

    const projectId = process.env.GOOGLE_PROJECT_ID
    const privateKeyId = process.env.GOOGLE_PRIVATE_KEY_ID
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL

    if (!privateKey || !clientEmail) {
      throw new Error('Missing Google credentials: check GOOGLE_PRIVATE_KEY and GOOGLE_SERVICE_ACCOUNT_EMAIL')
    }

    // Create JWT
    const now = Math.floor(Date.now() / 1000)
    const jwtHeader = {
      alg: 'RS256',
      typ: 'JWT',
      kid: privateKeyId,
    }
    const jwtPayload = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }

    // Encode header and payload
    const b64Header = Buffer.from(JSON.stringify(jwtHeader)).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    const b64Payload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

    const signInput = `${b64Header}.${b64Payload}`

    // Sign
    const signer = createSign('RSA-SHA256')
    signer.update(signInput)
    const b64Signature = signer.sign(privateKey, 'base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

    const jwt = `${signInput}.${b64Signature}`
    console.log('✅ JWT created')

    // Exchange for access token
    console.log('🔄 Exchanging with Google...')
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }).toString(),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('❌ Google error:', errText)
      throw new Error(errText)
    }

    const data = (await response.json()) as any
    if (!data.access_token) throw new Error('No access_token in response')

    console.log('✅ Access token obtained')

    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    }

    return data.access_token
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('❌ Auth failed:', msg)
    throw error
  }
}
