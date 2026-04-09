import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not defined.");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function seed() {
  try {
    console.log('--- Initializing database ---');
    
    // Create Table
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gender TEXT,
        role TEXT,
        parent_id TEXT REFERENCES members(id),
        spouse_id TEXT REFERENCES members(id),
        highlight BOOLEAN DEFAULT FALSE,
        highlight_desc TEXT,
        born TEXT,
        death TEXT,
        is_alive BOOLEAN DEFAULT TRUE,
        bi_danh TEXT,
        dia_chi TEXT
      );
    `;
    console.log('Members table created/exists.');

    // Read local data
    const familyDataPath = path.join(process.cwd(), 'src/data/family.json');
    const overridesPath = path.join(process.cwd(), 'src/data/overrides.json');

    if (!fs.existsSync(familyDataPath)) {
      console.log('family.json not found. Skipping seeding.');
      return;
    }

    const family = JSON.parse(fs.readFileSync(familyDataPath, 'utf8'));
    let overrides = {};
    if (fs.existsSync(overridesPath)) {
      overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
    }

    console.log(`Found ${family.length} members in family.json.`);

    // First insert all members without parent/spouse relations to avoid FK issues
    for (const member of family) {
      const override = overrides[member.id] || {};
      const merged = { ...member, ...override };

      await sql`
        INSERT INTO members (id, name, gender, role, highlight, highlight_desc, born, death, is_alive, bi_danh, dia_chi)
        VALUES (
          ${merged.id}, 
          ${merged.name}, 
          ${merged.gender || null}, 
          ${merged.role || null}, 
          ${merged.highlight || false}, 
          ${merged.highlightDesc || null}, 
          ${merged.born || null}, 
          ${merged.death || null},
          ${merged.isAlive !== undefined ? merged.isAlive : true},
          ${merged.alias || merged.bi_danh || null},
          ${merged.address || merged.dia_chi || null}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          gender = EXCLUDED.gender,
          role = EXCLUDED.role,
          highlight = EXCLUDED.highlight,
          highlight_desc = EXCLUDED.highlight_desc,
          born = EXCLUDED.born,
          death = EXCLUDED.death,
          is_alive = EXCLUDED.is_alive,
          bi_danh = EXCLUDED.bi_danh,
          dia_chi = EXCLUDED.dia_chi
      `;
    }

    // Then update relations
    console.log('Updating parent/spouse relations...');
    for (const member of family) {
      if (member.parentId || member.spouseId) {
        await sql`
          UPDATE members SET
            parent_id = ${member.parentId || null},
            spouse_id = ${member.spouseId || null}
          WHERE id = ${member.id}
        `;
      }
    }

    console.log('--- Database seeding complete! ---');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    process.exit();
  }
}

seed();
