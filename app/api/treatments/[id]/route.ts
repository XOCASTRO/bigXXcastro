import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const rows: any = await query('SELECT * FROM treatment_history WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching treatment:', error);
    return NextResponse.json({ error: 'Failed to fetch treatment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { diagnosis, treatment, visit_date, doctor_name, follow_up_required } = body;

    await query(
      'UPDATE treatment_history SET diagnosis = ?, treatment = ?, visit_date = ?, doctor_name = ?, follow_up_required = ? WHERE id = ?',
      [diagnosis, treatment, visit_date, doctor_name, follow_up_required ? 1 : 0, id]
    );

    const rows: any = await query('SELECT * FROM treatment_history WHERE id = ?', [id]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating treatment:', error);
    return NextResponse.json({ error: 'Failed to update treatment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    await query('DELETE FROM treatment_history WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Treatment deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting treatment:', error);
    return NextResponse.json({ error: 'Failed to delete treatment' }, { status: 500 });
  }
}
