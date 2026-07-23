import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'clinic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

/**
 * POST /api/staff/setup
 * Seeds the database with default staff members for testing
 */
export async function POST(request: NextRequest) {
  let connection: any = null

  try {
    connection = await pool.getConnection()

    // Check if staff already exists
    const [existingStaff] = await connection.execute('SELECT COUNT(*) as count FROM staff_users')
    const staffCount = (existingStaff as any[])[0]?.count || 0

    if (staffCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Database already has ${staffCount} staff members. Skipping seed.`,
          staffCount,
        },
        { status: 200 }
      )
    }

    // Insert default staff members
    const staffMembers = [
      {
        email: 'admin@clinic.com',
        full_name: 'Dr. Admin User',
        password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        role: 'ADMIN',
        can_create_records: true,
        can_create_staff: true,
        can_edit_records: true,
        can_delete_records: true,
        department: 'Administration',
      },
      {
        email: 'doctor@clinic.com',
        full_name: 'Dr. John Doe',
        password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz123457',
        role: 'DOCTOR',
        can_create_records: true,
        can_create_staff: false,
        can_edit_records: true,
        can_delete_records: false,
        department: 'General Medicine',
      },
      {
        email: 'nurse@clinic.com',
        full_name: 'Nurse Mary Smith',
        password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz123458',
        role: 'NURSE',
        can_create_records: true,
        can_create_staff: false,
        can_edit_records: true,
        can_delete_records: false,
        department: 'Nursing',
      },
    ]

    for (const staff of staffMembers) {
      await connection.execute(
        `INSERT INTO staff_users 
         (email, full_name, password_hash, role, can_create_records, can_create_staff, can_edit_records, can_delete_records, department)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          staff.email,
          staff.full_name,
          staff.password_hash,
          staff.role,
          staff.can_create_records,
          staff.can_create_staff,
          staff.can_edit_records,
          staff.can_delete_records,
          staff.department,
        ]
      )
    }

    console.log('[v0] Successfully seeded 3 staff members')

    // Get the created staff
    const [createdStaff] = await connection.execute(
      'SELECT staff_id, email, full_name, role, department FROM staff_users'
    )

    connection.release()

    return NextResponse.json(
      {
        success: true,
        message: 'Staff members created successfully',
        staff: createdStaff,
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (connection) {
      connection.release()
    }

    console.error('[v0] Error seeding staff:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed staff members',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/staff/setup
 * Get list of available staff members who can create records
 */
export async function GET(request: NextRequest) {
  let connection: any = null

  try {
    connection = await pool.getConnection()

    const [staff] = await connection.execute(
      `SELECT staff_id, email, full_name, role, department, can_create_records 
       FROM staff_users 
       WHERE is_active = TRUE 
       ORDER BY full_name`
    )

    connection.release()

    return NextResponse.json({
      success: true,
      staff: staff || [],
    })
  } catch (error: any) {
    if (connection) {
      connection.release()
    }

    console.error('[v0] Error fetching staff:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch staff members',
      },
      { status: 500 }
    )
  }
}
