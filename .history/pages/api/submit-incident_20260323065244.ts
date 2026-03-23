import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../lib/google-auth'

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
    // Get access token (works with service account credentials)
    const accessToken = await getAccessToken()

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:D:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [
            [
              data.timestamp,
              data.incidentType,
              `${data.latitude.toFixed(6)}`,
              `${data.longitude.toFixed(6)}`,
            ],
          ],
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Google Sheets API Error:', error)
      throw new Error(`Google Sheets API error: ${response.statusText}`)
    }

    console.log('Incident data appended to Google Sheet successfully')
  } catch (error) {
    console.error('Error appending to Google Sheet:', error)
    throw error
  }
}
