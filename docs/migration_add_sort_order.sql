-- Migration: Add sort_order column to members table
-- Run this in Supabase SQL Editor

ALTER TABLE members ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT NULL;

-- Optional: initialize sort_order for existing siblings based on current id order
-- This ensures existing data gets consistent ordering.
-- You can skip this if you want to set order manually via the Admin UI.
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
