-- Migration: Add life_span column to users table for student life span / behavior management
-- Default value is 100 (range: 0 - 100)

ALTER TABLE users ADD COLUMN IF NOT EXISTS life_span INT DEFAULT 100;
