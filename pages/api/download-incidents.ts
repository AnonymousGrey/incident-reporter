/**
 * Download Incidents API Route
 * Exports incident data as CSV from Supabase
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getAllIncidents } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const format = req.query.format || 'csv'

    // Get all incidents from Supabase
    const incidents = await getAllIncidents()

    if (format === 'json') {
      // Return as JSON
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', 'attachment; filename="incidents.json"')
      return res.status(200).json(incidents)
    }

    // Convert to CSV
    const csv = convertToCSV(incidents)

    // Return as CSV file
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="incidents.csv"')
    return res.status(200).send(csv)
  } catch (error) {
    console.error('❌ Error downloading incidents:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to download incidents',
    })
  }
}

function convertToCSV(incidents: any[]): string {
  if (incidents.length === 0) {
    return 'id,type,latitude,longitude,language,timestamp,description\n'
  }

  const headers = Object.keys(incidents[0])
  const csv = [headers.join(',')]

  for (const incident of incidents) {
    const row = headers.map((header) => {
      const value = incident[header]
      // Quote string values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    })
    csv.push(row.join(','))
  }

  return csv.join('\n')
}
