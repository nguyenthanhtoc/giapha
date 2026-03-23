import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

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
    const body = await req.json();
    const { action, id, data } = body;

    if (action === 'create') {
      const { name, gender, parentId, spouseId, role } = data;
      const newId = `new_${Date.now()}`;
      
      const result = await sql`
        INSERT INTO members (id, name, gender, parent_id, spouse_id, role)
        VALUES (${newId}, ${name}, ${gender}, ${parentId || null}, ${spouseId || null}, ${role || null})
        RETURNING *;
      `;
      return NextResponse.json({ success: true, member: result[0] });
    }

    // Existing update logic (fallback for backward compatibility with the previous implementation)
    const entries = Object.entries(body);
    if (entries.length === 0) return NextResponse.json({ error: 'No data' }, { status: 400 });

    // Handle the old format: { [id]: { name, born } }
    let targetId = id;
    let updateData = data;
    if (!action && !id) {
        [targetId, updateData] = entries[0];
    }

    const result = await sql`
      UPDATE members
      SET 
        name = ${updateData.name},
        born = ${updateData.born}
      WHERE id = ${targetId}
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

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await sql.begin(async (sql) => {
      // Set parent_id to NULL for any children
      await sql`UPDATE members SET parent_id = NULL WHERE parent_id = ${id}`;
      // Set spouse_id to NULL for any spouses (or handles them if they were the "anchor")
      await sql`UPDATE members SET spouse_id = NULL WHERE spouse_id = ${id}`;
      // Finally delete the member
      await sql`DELETE FROM members WHERE id = ${id}`;
    });

    return NextResponse.json({ success: true, message: 'Xóa thành công!' });
  } catch (err) {
    console.error('Delete Error:', err);
    return NextResponse.json({ error: 'Lỗi khi xóa thành viên' }, { status: 500 });
  }
}
