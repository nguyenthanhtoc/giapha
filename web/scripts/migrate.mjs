import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not defined in .env.local");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function migrate() {
  try {
    console.log('--- Migrating database: Adding missing columns ---');
    
    // Add columns one by one to avoid stopping if some exist (though in this case they likely all don't)
    // We use DO blocks or separate statements
    
    console.log('Adding is_alive...');
    await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS is_alive BOOLEAN DEFAULT TRUE;`.catch(e => console.log('is_alive likely exists or error:', e.message));
    
    console.log('Adding bi_danh...');
    await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS bi_danh TEXT;`.catch(e => console.log('bi_danh likely exists or error:', e.message));
    
    console.log('Adding dia_chi...');
    await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS dia_chi TEXT;`.catch(e => console.log('dia_chi likely exists or error:', e.message));

    console.log('--- Migration complete! ---');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
