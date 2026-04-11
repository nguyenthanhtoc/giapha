# Chạy Migration DB

## Cách chạy

Dùng package `postgres` có sẵn trong `web/node_modules`:

```bash
node --input-type=module << 'EOF'
import postgres from 'postgres';
const sql = postgres('postgresql://postgres.kowpqhvjlykpjwjxxhrf:Khoinhan%40125@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { ssl: 'require' });
// ... SQL ở đây ...
await sql.end();
EOF
```

Connection string lấy từ `web/.env.local` → `DATABASE_URL`.

## Migration đã chạy

### 2026-04-11 — Thêm sort_order
File: `docs/migration_add_sort_order.sql`

```sql
ALTER TABLE members ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT NULL;

WITH ranked AS (
  SELECT id, parent_id,
    ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY id) * 10 AS rn
  FROM members
  WHERE parent_id IS NOT NULL
)
UPDATE members m
SET sort_order = r.rn
FROM ranked r
WHERE m.id = r.id;
```
