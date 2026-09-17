-- Migration: 0010_student_notification_reads.sql
-- Description: Track read notifications per student for teacher & class scoped updates

CREATE TABLE IF NOT EXISTS student_notification_reads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  notification_key VARCHAR(191) NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_student_notification (student_id, notification_key),
  INDEX idx_student_read (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
