-- Migration Template
-- Copy this file and rename it with the next number (e.g., 0001_your_feature_name.sql)
-- 
-- Naming convention: 0001_description_of_change.sql
-- Example: 0001_add_profile_pictures.sql
--          0002_add_notifications_table.sql

-- ============================================
-- Migration: [Your Feature Name]
-- Date: [YYYY-MM-DD]
-- Description: [What does this migration do?]
-- ============================================

-- Make sure we're using the correct database
USE thesis_db;

-- Example: Add a new column to existing table
-- ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) AFTER name;

-- Example: Create a new table
-- CREATE TABLE IF NOT EXISTS notifications (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   user_id INT NOT NULL,
--   message TEXT NOT NULL,
--   is_read BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--   INDEX idx_user_id (user_id)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example: Add an index
-- CREATE INDEX idx_email ON users(email);

-- Example: Insert default data
-- INSERT INTO badges (name, description, icon) VALUES
-- ('New Badge', 'Description here', '🎯');

-- INSTRUCTIONS:
-- 1. Replace this template with your actual SQL
-- 2. Test your SQL in phpMyAdmin first
-- 3. Save this file with a proper name
-- 4. Follow the migration guide in README.md
