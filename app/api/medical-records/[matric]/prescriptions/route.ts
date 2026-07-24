import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ matric: string }> }) {
  try {
    const { matric } = await params;
    const matric_number = decodeURIComponent(matric);
    const rows = await query(
      'SELECT * FROM prescription_history WHERE matric_number = ? ORDER BY prescription_date DESC',
      [matric_number]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ matric: string }> }) {
  try {
    const { matric } = await params;
    const matric_number = decodeURIComponent(matric);
    const body = await request.json();
    const { prescription_date, medication, dosage, frequency, duration, doctor_name, notes, status } = body;

    const result: any = await query(
      `INSERT INTO prescription_history (matric_number, prescription_date, medication, dosage, frequency, duration, doctor_name, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [matric_number, prescription_date, medication, dosage, frequency, duration, doctor_name, notes, status || 'active']
    );

    const rows: any = await query('SELECT * FROM prescription_history WHERE id = ?', [result.insertId]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
  }
}
