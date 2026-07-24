import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const rows: any = await query('SELECT * FROM allergies WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Allergy not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching allergy:', error);
    return NextResponse.json({ error: 'Failed to fetch allergy' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { allergen, severity, notes } = body;

    await query(
      'UPDATE allergies SET allergen = ?, severity = ?, notes = ? WHERE id = ?',
      [allergen || null, severity || null, notes || null, id]
    );

    const rows: any = await query('SELECT * FROM allergies WHERE id = ?', [id]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating allergy:', error);
    return NextResponse.json({ error: 'Failed to update allergy' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    await query('DELETE FROM allergies WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Allergy deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting allergy:', error);
    return NextResponse.json({ error: 'Failed to delete allergy' }, { status: 500 });
  }
}
