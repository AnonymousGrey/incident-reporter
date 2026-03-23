/**
 * Database Utility
 * Uses SQLite to store incident reports
 */

import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'incidents.db')
let db: Database.Database | null = null

// Initialize database
export function initializeDatabase() {
  if (db) return db

  db = new Database(dbPath)

  // Create incidents table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      language TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      description TEXT
    )
  `)

  console.log('✅ Database initialized at:', dbPath)
  return db
}

// Get database connection
export function getDatabase(): Database.Database {
  if (!db) {
    initializeDatabase()
  }
  return db!
}

// Save incident to database
export function saveIncident(data: {
  type: string
  latitude: number
  longitude: number
  language: string
  description?: string
}): { success: boolean; id?: number; error?: string } {
  try {
    const database = getDatabase()

    const stmt = database.prepare(`
      INSERT INTO incidents (type, latitude, longitude, language, description)
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      data.type,
      data.latitude,
      data.longitude,
      data.language,
      data.description || null
    )

    console.log('✅ Incident saved to database with ID:', result.lastInsertRowid)

    return {
      success: true,
      id: result.lastInsertRowid as number,
    }
  } catch (error) {
    console.error('❌ Error saving incident:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Get all incidents
export function getAllIncidents(): any[] {
  try {
    const database = getDatabase()
    const stmt = database.prepare('SELECT * FROM incidents ORDER BY timestamp DESC')
    return stmt.all()
  } catch (error) {
    console.error('❌ Error fetching incidents:', error)
    return []
  }
}

// Get incidents count
export function getIncidentsCount(): number {
  try {
    const database = getDatabase()
    const result = database.prepare('SELECT COUNT(*) as count FROM incidents').get() as any
    return result.count
  } catch (error) {
    console.error('❌ Error counting incidents:', error)
    return 0
  }
}

// Close database
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
