/**
 * Supabase Client
 * Connects to cloud database for incident reports
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Save incident to Supabase (keeps only the latest one)
export async function saveIncident(data: {
  type: string
  latitude: number
  longitude: number
  language: string
  description?: string
}): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    console.log('💾 Saving incident to Supabase...')

    // Step 1: Delete all old records
    console.log('🗑️  Deleting old incidents...')
    const { error: deleteError } = await supabase
      .from('incidents')
      .delete()
      .neq('id', -1) // This deletes all records (workaround since we can't use .gt(0))

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.warn('⚠️  Warning deleting old incidents:', deleteError)
    }

    // Step 2: Insert new record
    const { data: result, error } = await supabase
      .from('incidents')
      .insert([
        {
          type: data.type,
          latitude: data.latitude,
          longitude: data.longitude,
          language: data.language,
          description: data.description || null,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('❌ Error saving to Supabase:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    console.log('✅ Incident saved successfully! ID:', result?.[0]?.id)
    return {
      success: true,
      id: result?.[0]?.id,
    }
  } catch (error) {
    console.error('❌ Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Get all incidents from Supabase
export async function getAllIncidents(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('❌ Error fetching incidents:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('❌ Error:', error)
    return []
  }
}

// Get incidents count
export async function getIncidentsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Error counting incidents:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('❌ Error:', error)
    return 0
  }
}
