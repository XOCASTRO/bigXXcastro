import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ matric: string }> }) {
  try {
    const { matric } = await params;
    const matric_number = decodeURIComponent(matric);
    const rows = await query(
      'SELECT * FROM clinic_visits WHERE matric_number = ? ORDER BY visit_date DESC',
      [matric_number]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching clinic visits:', error);
    return NextResponse.json({ error: 'Failed to fetch clinic visits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ matric: string }> }) {
  try {
    const { matric } = await params;
    const matric_number = decodeURIComponent(matric);
    const body = await request.json();
    const { visit_type, visit_date, reason_for_visit, doctor_name, status } = body;

    const result: any = await query(
      `INSERT INTO clinic_visits (matric_number, visit_type, visit_date, reason_for_visit, doctor_name, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        matric_number,
        visit_type || null,
        visit_date || null,
        reason_for_visit || null,
        doctor_name || null,
        status || 'completed'
      ]
    );

    const rows: any = await query('SELECT * FROM clinic_visits WHERE id = ?', [result.insertId]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating clinic visit:', error);
    return NextResponse.json({ error: 'Failed to create clinic visit' }, { status: 500 });
  }
}
