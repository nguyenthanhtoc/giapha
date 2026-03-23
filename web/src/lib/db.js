import postgres from 'postgres';

let sql;

if (process.env.DATABASE_URL) {
  sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
  });
} else {
  // During build or if missing, we use a proxy that only throws when called
  sql = (...args) => {
    if (args.length > 0 && Array.isArray(args[0])) { // Template literal usage
        throw new Error('DATABASE_URL is not defined. Ensure it is set in environment variables.');
    }
    return sql; // Allow chaining if used as a function
  };
}

export default sql;
