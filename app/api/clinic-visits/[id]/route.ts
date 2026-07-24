import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const rows: any = await query('SELECT * FROM clinic_visits WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Clinic visit not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching clinic visit:', error);
    return NextResponse.json({ error: 'Failed to fetch clinic visit' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { visit_type, visit_date, reason_for_visit, doctor_name, status } = body;

    await query(
      'UPDATE clinic_visits SET visit_type = ?, visit_date = ?, reason_for_visit = ?, doctor_name = ?, status = ? WHERE id = ?',
      [visit_type, visit_date, reason_for_visit, doctor_name, status, id]
    );

    const rows: any = await query('SELECT * FROM clinic_visits WHERE id = ?', [id]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating clinic visit:', error);
    return NextResponse.json({ error: 'Failed to update clinic visit' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await query('DELETE FROM clinic_visits WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Clinic visit deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting clinic visit:', error);
    return NextResponse.json({ error: 'Failed to delete clinic visit' }, { status: 500 });
  }
}
