-- Migration 0016: Lessons and Lesson Reads for Go Learning LMS
-- Supports uploading files (PDF, slides, video, doc), notes, visibility, and student read tracking

CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL DEFAULT 'lesson-material.pdf',
  file_type ENUM('pdf', 'slides', 'video', 'doc') NOT NULL DEFAULT 'pdf',
  file_url TEXT NULL,
  pages_or_duration VARCHAR(100) NOT NULL DEFAULT '10 pages',
  notes TEXT NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  created_by_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lessons_class_id (class_id),
  INDEX idx_lessons_visible (is_visible),
  CONSTRAINT fk_lessons_class FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lesson_reads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  student_id INT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_lesson_student (lesson_id, student_id),
  INDEX idx_lesson_reads_student (student_id),
  INDEX idx_lesson_reads_lesson (lesson_id),
  CONSTRAINT fk_lesson_reads_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_reads_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
