import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const rows: any = await query('SELECT * FROM doctor_notes WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Doctor note not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching doctor note:', error);
    return NextResponse.json({ error: 'Failed to fetch doctor note' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { doctor_name, note_date, note_content, follow_up_required } = body;

    await query(
      'UPDATE doctor_notes SET doctor_name = ?, note_date = ?, note_content = ?, follow_up_required = ? WHERE id = ?',
      [doctor_name || null, note_date || null, note_content || null, follow_up_required ? 1 : 0, id]
    );

    const rows: any = await query('SELECT * FROM doctor_notes WHERE id = ?', [id]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating doctor note:', error);
    return NextResponse.json({ error: 'Failed to update doctor note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    await query('DELETE FROM doctor_notes WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Doctor note deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting doctor note:', error);
    return NextResponse.json({ error: 'Failed to delete doctor note' }, { status: 500 });
  }
}
