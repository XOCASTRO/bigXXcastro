import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ matric: string }> }) {
  try {
    const { matric } = await params;
    const matric_number = decodeURIComponent(matric);
    const rows = await query(
      'SELECT * FROM doctor_notes WHERE matric_number = ? ORDER BY note_date DESC',
      [matric_number]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ matric: string }> }) {
  try {
    const { matric } = await params;
    const matric_number = decodeURIComponent(matric);
    const body = await request.json();
    const { doctor_name, note_date, note_content, follow_up_required } = body;

    const result: any = await query(
      `INSERT INTO doctor_notes (matric_number, doctor_name, note_date, note_content, follow_up_required)
       VALUES (?, ?, ?, ?, ?)`,
      [
        matric_number,
        doctor_name || null,
        note_date || null,
        note_content || null,
        follow_up_required ? 1 : 0
      ]
    );

    const rows: any = await query('SELECT * FROM doctor_notes WHERE id = ?', [result.insertId]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
