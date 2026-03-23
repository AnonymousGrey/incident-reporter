import type { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'

interface IncidentData {
  incidentType: string
  latitude: number
  longitude: number
  timestamp: string
}

interface ApiResponse {
  success: boolean
  message: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { incidentType, latitude, longitude } = req.body

    if (!incidentType || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: incidentType, latitude, longitude',
      })
    }

    const timestamp = new Date().toISOString()

    // Append to Google Sheet
    await appendToGoogleSheet({
      incidentType,
      latitude,
      longitude,
      timestamp,
    })

    res.status(200).json({
      success: true,
      message: 'Incident reported successfully',
    })
  } catch (error) {
    console.error('Error submitting incident:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit incident',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

async function appendToGoogleSheet(data: IncidentData) {
  const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID
  
  if (!sheetId) {
    throw new Error('Google Sheet ID not configured')
  }

  try {
    // Using simple HTTP request to Google Sheets API
    // This requires the sheet to be publicly viewable and shared with service account
    
    // Alternative 1: If using service account credentials
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          type: 'service_account',
          project_id: process.env.GOOGLE_PROJECT_ID,
          private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          client_id: process.env.GOOGLE_CLIENT_ID,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })

      const sheets = google.sheets({ version: 'v4', auth })

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Sheet1!A:D',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              data.timestamp,
              data.incidentType,
              data.latitude,
              data.longitude,
            ],
          ],
        },
      })
    } else {
      // Alternative 2: Using Google Sheets API fetch (requires API key and public sheet)
      const apiKey = process.env.GOOGLE_SHEETS_API_KEY
      if (!apiKey) {
        throw new Error('Google API credentials not configured')
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:D:append?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [
              [
                data.timestamp,
                data.incidentType,
                data.latitude,
                data.longitude,
              ],
            ],
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.statusText}`)
      }
    }
  } catch (error) {
    console.error('Error appending to Google Sheet:', error)
    throw error
  }
}
