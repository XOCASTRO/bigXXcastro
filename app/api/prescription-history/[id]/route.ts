import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const rows: any = await query('SELECT * FROM prescription_history WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    return NextResponse.json({ error: 'Failed to fetch prescription' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { medication, dosage, frequency, duration, prescription_date, doctor_name, status, notes } = body;

    await query(
      'UPDATE prescription_history SET medication = ?, dosage = ?, frequency = ?, duration = ?, prescription_date = ?, doctor_name = ?, status = ?, notes = ? WHERE id = ?',
      [medication || null, dosage || null, frequency || null, duration || null, prescription_date || null, doctor_name || null, status || null, notes || null, id]
    );

    const rows: any = await query('SELECT * FROM prescription_history WHERE id = ?', [id]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating prescription:', error);
    return NextResponse.json({ error: 'Failed to update prescription' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    await query('DELETE FROM prescription_history WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Prescription deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    return NextResponse.json({ error: 'Failed to delete prescription' }, { status: 500 });
  }
}
