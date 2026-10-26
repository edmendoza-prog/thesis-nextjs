-- Migration 0015: Add avatar_seed to users table for profile customization

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS avatar_seed VARCHAR(100) NULL AFTER bio;
