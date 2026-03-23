import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../lib/google-auth'

interface TestResponse {
  success: boolean
  message: string
  details?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  try {
    console.log('🧪 Testing Google Sheets credentials...')

    // Check environment variables
    const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL

    if (!sheetId) {
      return res.status(400).json({
        success: false,
        message: 'Missing NEXT_PUBLIC_GOOGLE_SHEET_ID',
      })
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Missing GOOGLE_SERVICE_ACCOUNT_EMAIL',
      })
    }

    console.log('✅ Environment variables found')
    console.log('Sheet ID:', sheetId)
    console.log('Service Account Email:', email)

    // Try to get access token
    const accessToken = await getAccessToken()
    console.log('✅ Access token generated successfully')

    // Try to read the sheet metadata
    const metadataResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!metadataResponse.ok) {
      const error = await metadataResponse.json()
      console.error('❌ Cannot access Google Sheet:', error)

      if (metadataResponse.status === 403) {
        return res.status(403).json({
          success: false,
          message: '🔒 Permission Denied',
          details: `The Google Sheet is not shared with the service account: ${email}. Please share it with Editor access.`,
          error: JSON.stringify(error),
        })
      }

      return res.status(metadataResponse.status).json({
        success: false,
        message: 'Cannot access Google Sheet',
        error: JSON.stringify(error),
      })
    }

    const sheetData = await metadataResponse.json()
    console.log('✅ Successfully connected to Google Sheet')

    return res.status(200).json({
      success: true,
      message: '✅ All systems go! Google Sheets is properly configured.',
      details: `Connected to sheet: "${sheetData.properties.title}" | Sheet ID: ${sheetId} | Service Account: ${email}`,
    })
  } catch (error) {
    console.error('❌ Test failed:', error)
    return res.status(500).json({
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
