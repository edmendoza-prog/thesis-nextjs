-- Migration 0007: Security and Schema Cleanup

-- 1. Authentication and Security Enhancements for Users
ALTER TABLE users 
  ADD COLUMN deleted_at TIMESTAMP NULL,
  ADD COLUMN password_reset_token VARCHAR(255) NULL,
  ADD COLUMN reset_token_expires DATETIME NULL,
  ADD COLUMN last_login_at DATETIME NULL,
  ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
  MODIFY COLUMN user_type ENUM('teacher', 'student', 'admin') NOT NULL;

-- 2. Soft Deletes for core entities to prevent data loss on cascading deletes
ALTER TABLE classes 
  ADD COLUMN deleted_at TIMESTAMP NULL;

ALTER TABLE activities 
  ADD COLUMN deleted_at TIMESTAMP NULL;

-- 3. Audit Logs Table to track sensitive changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_value JSON NULL,
  new_value JSON NULL,
  changed_by INT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_table_record (table_name, record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Merge `grades` into `activity_submissions` to eliminate redundancy
ALTER TABLE activity_submissions
  ADD COLUMN feedback TEXT NULL,
  ADD COLUMN graded_by INT NULL,
  ADD COLUMN graded_at TIMESTAMP NULL,
  ADD CONSTRAINT fk_activity_submissions_graded_by FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL;

DROP TABLE IF EXISTS grades;

-- 5. Remove duplicate participant tracking in live_games
ALTER TABLE live_games 
  DROP COLUMN participants_json;
