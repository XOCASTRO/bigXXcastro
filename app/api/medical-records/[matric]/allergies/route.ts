import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ matric: string }> }) {
  try {
    const { matric } = await params;
    const matric_number = decodeURIComponent(matric);
    const rows = await query(
      'SELECT * FROM allergies WHERE matric_number = ? ORDER BY date_recorded DESC',
      [matric_number]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching allergies:', error);
    return NextResponse.json({ error: 'Failed to fetch allergies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ matric: string }> }) {
  try {
    const { matric } = await params;
    const matric_number = decodeURIComponent(matric);
    const body = await request.json();
    const { allergen, severity, notes } = body;

    const result: any = await query(
      `INSERT INTO allergies (matric_number, allergen, severity, notes)
       VALUES (?, ?, ?, ?)`,
      [matric_number, allergen, severity, notes]
    );

    const rows: any = await query('SELECT * FROM allergies WHERE id = ?', [result.insertId]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating allergy:', error);
    return NextResponse.json({ error: 'Failed to create allergy' }, { status: 500 });
  }
}
