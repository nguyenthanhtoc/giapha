import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const data = await sql`
      SELECT 
        id, 
        name, 
        gender, 
        role, 
        parent_id AS "parentId", 
        spouse_id AS "spouseId", 
        highlight, 
        highlight_desc AS "highlightDesc", 
        born, 
        death
      FROM members
      ORDER BY id ASC;
    `;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Database Error:', err);
    return NextResponse.json({ error: 'Lỗi truy xuất dữ liệu gia phả' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json(); // Expected: { [id]: { name: "...", born: "..." } }
    
    // The current frontend sends { id: { name, born } }
    const entries = Object.entries(body);
    if (entries.length === 0) return NextResponse.json({ error: 'No data' }, { status: 400 });

    const [id, updateData] = entries[0];

    const result = await sql`
      UPDATE members
      SET 
        name = ${updateData.name},
        born = ${updateData.born}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
  } catch (err) {
    console.error('Update Error:', err);
    return NextResponse.json({ error: 'Lỗi khi cập nhật dữ liệu' }, { status: 500 });
  }
}
