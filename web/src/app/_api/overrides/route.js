import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const OVERRIDES_PATH = path.join(process.cwd(), 'src/data/overrides.json');

export async function GET() {
  try {
    if (!fs.existsSync(OVERRIDES_PATH)) {
      return NextResponse.json({});
    }
    const file = fs.readFileSync(OVERRIDES_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(file));
  } catch (e) {
    return NextResponse.json({ error: 'Không thể đọc file overrides' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json(); // { id: { name: "...", born: "..." } }
    
    let existing = {};
    if (fs.existsSync(OVERRIDES_PATH)) {
      try {
        existing = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf-8'));
      } catch (e) {
        existing = {};
      }
    }
    
    // Chỉ cập nhật ID cụ thể
    const updated = { ...existing, ...body };
    fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(updated, null, 2));

    return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
