import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env.local');
}

const sql = postgres(DATABASE_URL, {
  ssl: 'require', // Supabase requires SSL
});

export default sql;
