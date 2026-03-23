/**
 * View Incidents API Route
 * Returns all incident data as JSON from Supabase
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getAllIncidents, getIncidentsCount } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const incidents = await getAllIncidents()
    const count = await getIncidentsCount()

    console.log('📊 Total incidents:', count)

    return res.status(200).json({
      success: true,
      totalIncidents: count,
      data: incidents,
    })
  } catch (error) {
    console.error('❌ Error fetching incidents:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch incidents',
    })
  }
}
