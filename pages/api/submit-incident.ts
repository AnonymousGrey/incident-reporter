import type { NextApiRequest, NextApiResponse } from 'next'
import { saveIncident, getIncidentsCount } from '../../lib/supabase'

type ResponseData = {
  success: boolean
  message?: string
  error?: string
  totalIncidents?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { incidentType, latitude, longitude } = req.body

    console.log('📝 Attempting to submit incident data...')
    console.log('Type:', incidentType)
    console.log('Location:', latitude, longitude)

    // Validate required fields
    if (!incidentType || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: incidentType, latitude, longitude',
      })
    }

    // Save to Supabase
    console.log('💾 Saving to Supabase...')
    const result = await saveIncident({
      type: incidentType,
      latitude,
      longitude,
      language: 'en',
      description: undefined,
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to save incident')
    }

    const totalCount = await getIncidentsCount()

    console.log('✅ Incident saved successfully!')
    console.log('Total incidents in database:', totalCount)

    return res.status(200).json({
      success: true,
      message: 'Incident reported successfully!',
      totalIncidents: totalCount,
    })
  } catch (error) {
    console.error('❌ Error submitting incident:', error)

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit incident',
    })
  }
}
