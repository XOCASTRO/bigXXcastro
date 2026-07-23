import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'clinic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Simple JWT-like token generator (in production, use proper JWT library)
function generateToken(staffId: number, email: string): string {
  const payload = {
    staffId,
    email,
    timestamp: Date.now(),
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// Demo users for testing (works without database)
const DEMO_USERS = [
  { email: 'admin@pticlinic.com', password: 'admin123', id: 1, name: 'System Administrator', role: 'ADMIN' },
  { email: 'doctor@pticlinic.com', password: 'doctor123', id: 2, name: 'Dr. John Smith', role: 'DOCTOR' },
  { email: 'nurse@pticlinic.com', password: 'nurse123', id: 3, name: 'Jane Nurse', role: 'NURSE' },
  { email: 'staff@pticlinic.com', password: 'staff123', id: 4, name: 'Staff Member', role: 'STAFF' },
  { email: 'viewer@pticlinic.com', password: 'viewer123', id: 5, name: 'Viewer Only', role: 'VIEWER' },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // First, try database authentication (skip if no connection possible)
    let dbConnected = false
    try {
      const connection = await pool.getConnection()
      dbConnected = true

      try {
        // Find staff user by email
        const [rows] = await connection.execute(
          'SELECT staff_id, full_name, email, password_hash, role, can_create_records, can_create_staff, can_edit_records, can_delete_records, is_active FROM staff_users WHERE email = ?',
          [email.toLowerCase()]
        )

        if (rows.length > 0) {
          const staff: any = rows[0]

          // Check if account is active
          if (!staff.is_active) {
            connection.release()
            return NextResponse.json({ error: 'Account is inactive' }, { status: 401 })
          }

          // Verify password using bcrypt
          const isPasswordValid = await bcrypt.compare(password, staff.password_hash)
          if (!isPasswordValid) {
            connection.release()
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
          }

          // Generate token
          const token = generateToken(staff.staff_id, staff.email)

          connection.release()

          // Prepare response
          const response = {
            success: true,
            token,
            user: {
              id: staff.staff_id,
              email: staff.email,
              full_name: staff.full_name,
              role: staff.role,
              can_create_records: !!staff.can_create_records,
              can_create_staff: !!staff.can_create_staff,
              can_edit_records: !!staff.can_edit_records,
              can_delete_records: !!staff.can_delete_records,
            },
          }

          return NextResponse.json(response, { status: 200 })
        }

        connection.release()
      } catch (dbError) {
        try {
          connection.release()
        } catch {}
        // Fall through to demo auth if database query fails
      }
    } catch (poolError) {
      // Database connection not available - will use demo auth
      dbConnected = false
    }

    // Fallback: Demo authentication for testing without database
    const demoUser = DEMO_USERS.find(
      (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    )

    if (!demoUser) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Generate token for demo user
    const token = generateToken(demoUser.id, demoUser.email)

    const response = {
      success: true,
      token,
      user: {
        id: demoUser.id,
        email: demoUser.email,
        full_name: demoUser.name,
        role: demoUser.role,
        can_create_records: demoUser.role !== 'VIEWER',
        can_create_staff: demoUser.role === 'ADMIN',
        can_edit_records: demoUser.role !== 'VIEWER',
        can_delete_records: demoUser.role === 'ADMIN',
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
