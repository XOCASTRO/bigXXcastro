import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { validateMatricNumber } from '@/lib/matric-validator'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'clinic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// GET request to validate matric number
export async function GET(request: NextRequest) {
  try {
    const matric = request.nextUrl.searchParams.get('matric_number')

    if (!matric) {
      return NextResponse.json({ error: 'Matric number is required' }, { status: 400 })
    }

    const validation = await validateMatricNumber(matric)
    return NextResponse.json(validation)
  } catch (error) {
    console.error('Error validating matric:', error)
    return NextResponse.json({ valid: false, error: 'Validation error' }, { status: 500 })
  }
}

// POST request to create new medical record
export async function POST(request: NextRequest) {
  let connection: any = null
  try {
    const body = await request.json()

    // Get authenticated user from session/token
    // For now, using a simple header approach (in production, use proper JWT/session)
    const staffIdHeader = request.headers.get('x-staff-id')
    const permissionHeader = request.headers.get('x-can-create-records')

    if (!staffIdHeader) {
      return NextResponse.json({ error: 'Unauthorized: Not authenticated' }, { status: 401 })
    }

    if (permissionHeader !== 'true') {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to create medical records' },
        { status: 403 }
      )
    }

    const {
      matric_number,
      student_name,
      level,
      date_of_birth,
      phone,
      email,
      address,
      parent_contact,
      emergency_contact,
    } = body

    // Validate required fields
    if (!matric_number || !student_name || !level || !date_of_birth) {
      return NextResponse.json(
        { error: 'Missing required fields: matric_number, student_name, level, date_of_birth' },
        { status: 400 }
      )
    }

    // Validate matric number format and uniqueness
    const validation = await validateMatricNumber(matric_number)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Validate date
    const dobDate = new Date(date_of_birth)
    if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
      return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 })
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    connection = await pool.getConnection()

    try {
      // First check if matric_number already exists
      const [existingRecords] = await connection.execute(
        'SELECT matric_number FROM student_files WHERE matric_number = ?',
        [matric_number.trim()]
      )

      if (Array.isArray(existingRecords) && existingRecords.length > 0) {
        connection.release()
        return NextResponse.json({ error: 'Matric number already exists' }, { status: 409 })
      }

      // Verify staff member exists before inserting
      const staffId = parseInt(staffIdHeader)
      const [staffCheck] = await connection.execute(
        'SELECT staff_id FROM staff_users WHERE staff_id = ?',
        [staffId]
      )

      console.log('[v0] Staff verification - ID:', staffId, 'Found:', Array.isArray(staffCheck) && staffCheck.length > 0)

      if (!Array.isArray(staffCheck) || staffCheck.length === 0) {
        console.log('[v0] Staff member not found. Inserting with created_by_staff_id = NULL')
      }

      const [result] = await connection.execute(
        `INSERT INTO student_files 
         (matric_number, student_name, level, date_of_birth, phone, email, address, parent_contact, emergency_contact, created_by_staff_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          matric_number.trim(),
          student_name.trim(),
          level,
          date_of_birth,
          phone || null,
          email || null,
          address || null,
          parent_contact || null,
          emergency_contact || null,
          (Array.isArray(staffCheck) && staffCheck.length > 0) ? staffId : null,
        ]
      )

      console.log('[v0] Medical record inserted:', {
        matric_number: matric_number.trim(),
        insertId: result.insertId,
        affectedRows: result.affectedRows,
      })

      // Verify the record was inserted
      const [verifyRecords] = await connection.execute(
        'SELECT * FROM student_files WHERE matric_number = ?',
        [matric_number.trim()]
      )

      console.log('[v0] Verification query result:', verifyRecords.length > 0 ? 'FOUND' : 'NOT FOUND')

      connection.release()

      return NextResponse.json(
        {
          success: true,
          message: 'Medical record created successfully',
          matric_number: matric_number.trim(),
          student_name,
        },
        { status: 201 }
      )
    } catch (dbError: any) {
      if (connection) {
        connection.release()
      }

      console.error('[v0] Database error when creating medical record:', {
        code: dbError.code,
        message: dbError.message,
        sqlMessage: dbError.sqlMessage,
        sql: dbError.sql,
      })

      if (dbError.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'Matric number already exists' }, { status: 409 })
      }

      if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
        return NextResponse.json(
          { error: 'Invalid staff ID - staff member does not exist' },
          { status: 400 }
        )
      }

      if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        return NextResponse.json(
          { error: 'Database schema error - invalid column. Please ensure database is properly initialized.' },
          { status: 500 }
        )
      }

      if (dbError.code === 'ER_NO_REFERENCED_ROW') {
        return NextResponse.json(
          { error: 'Foreign key constraint error - invalid staff ID' },
          { status: 400 }
        )
      }

      throw dbError
    }
  } catch (error: any) {
    if (connection) {
      try {
        connection.release()
      } catch (e) {
        console.error('[v0] Error releasing connection:', e)
      }
    }

    console.error('[v0] Error creating medical record:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    })

    // Return detailed error for debugging
    const errorMessage =
      error.message && error.message.includes('ECONNREFUSED')
        ? 'Database connection failed. Please ensure MySQL is running and .env variables are correct.'
        : error.message || 'Failed to create medical record'

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
