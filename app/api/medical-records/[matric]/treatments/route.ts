import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ matric: string }> }) {
  try {
    const { matric } = await params;
    const matric_number = decodeURIComponent(matric);
    const rows = await query(
      'SELECT * FROM treatment_history WHERE matric_number = ? ORDER BY visit_date DESC',
      [matric_number]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    return NextResponse.json({ error: 'Failed to fetch treatments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ matric: string }> }) {
  try {
    const { matric } = await params;
    const matric_number = decodeURIComponent(matric);
    const body = await request.json();
    const { visit_date, diagnosis, treatment, doctor_name, notes, follow_up_required, follow_up_date } = body;

    const result: any = await query(
      `INSERT INTO treatment_history (matric_number, visit_date, diagnosis, treatment, doctor_name, notes, follow_up_required, follow_up_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [matric_number, visit_date, diagnosis, treatment, doctor_name, notes, follow_up_required || false, follow_up_date || null]
    );

    const rows: any = await query('SELECT * FROM treatment_history WHERE id = ?', [result.insertId]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating treatment record:', error);
    return NextResponse.json({ error: 'Failed to create treatment' }, { status: 500 });
  }
}
