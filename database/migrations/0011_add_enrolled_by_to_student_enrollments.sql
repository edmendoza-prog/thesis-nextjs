-- Migration: 0011_add_enrolled_by_to_student_enrollments.sql
-- Description: Add enrolled_by column to student_enrollments table to track the teacher who enrolled the student

ALTER TABLE student_enrollments
ADD COLUMN enrolled_by INT NULL AFTER class_id,
ADD CONSTRAINT fk_enrollments_enrolled_by 
  FOREIGN KEY (enrolled_by) REFERENCES users(id) ON DELETE SET NULL,
ADD INDEX idx_enrolled_by (enrolled_by);

-- Backfill existing records with the teacher_id of the class
UPDATE student_enrollments se
JOIN classes c ON c.id = se.class_id
SET se.enrolled_by = c.teacher_id
WHERE se.enrolled_by IS NULL;
