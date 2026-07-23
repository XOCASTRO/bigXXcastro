import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'clinic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(request: NextRequest) {
  const matric = request.nextUrl.searchParams.get('matric_number');

  // No matric_number given -> return the full list, as before
  if (!matric) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT * FROM student_files');
      connection.release();
      return NextResponse.json(rows);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }
  }

  // matric_number given -> return the full aggregated record (same shape as
  // /api/medical-records/[matric]), passed safely as a query param so slashes
  // in the matric number (e.g. m.24/nd/csit/14904) can't be mistaken for path
  // separators by the router.
  const matric_number = matric.trim();

  try {
    const connection = await pool.getConnection();

    const [studentRows]: any = await connection.execute(
      'SELECT * FROM student_files WHERE matric_number = ?',
      [matric_number]
    );

    if (studentRows.length === 0) {
      connection.release();
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = studentRows[0];

    const [allergies] = await connection.execute(
      'SELECT * FROM allergies WHERE matric_number = ? ORDER BY date_recorded DESC',
      [matric_number]
    );
    const [treatments] = await connection.execute(
      'SELECT * FROM treatment_history WHERE matric_number = ? ORDER BY visit_date DESC',
      [matric_number]
    );
    const [prescriptions] = await connection.execute(
      'SELECT * FROM prescription_history WHERE matric_number = ? ORDER BY prescription_date DESC',
      [matric_number]
    );
    const [notes] = await connection.execute(
      'SELECT * FROM doctor_notes WHERE matric_number = ? ORDER BY note_date DESC',
      [matric_number]
    );
    const [visits] = await connection.execute(
      'SELECT * FROM clinic_visits WHERE matric_number = ? ORDER BY visit_date DESC',
      [matric_number]
    );

    connection.release();

    return NextResponse.json({
      student_file: student,
      allergies,
      treatment_history: treatments,
      prescriptions,
      doctor_notes: notes,
      clinic_visits: visits,
    });
  } catch (error) {
    console.error('Error fetching medical record:', error);
    return NextResponse.json({ error: 'Failed to fetch record' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    } = body;

    const connection = await pool.getConnection();
    const [result]: any = await connection.execute(
      `INSERT INTO student_files 
       (matric_number, student_name, level, date_of_birth, phone, email, address, parent_contact, emergency_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [matric_number, student_name, level, date_of_birth, phone, email, address, parent_contact, emergency_contact]
    );
    connection.release();

    return NextResponse.json({ id: result.insertId, matric_number }, { status: 201 });
  } catch (error) {
    console.error('Error creating medical record:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { matric_number, ...updates } = body;

    const connection = await pool.getConnection();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await connection.execute(
      `UPDATE student_files SET ${fields}, date_updated = NOW() WHERE matric_number = ?`,
      [...values, matric_number]
    );

    const [rows]: any = await connection.execute('SELECT * FROM student_files WHERE matric_number = ?', [matric_number]);
    connection.release();

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating medical record:', error);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const matric = request.nextUrl.searchParams.get('matric_number');
    const connection = await pool.getConnection();

    await connection.execute('DELETE FROM student_files WHERE matric_number = ?', [matric]);
    connection.release();

    return NextResponse.json({ message: 'Record deleted' }, { status: 204 });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
