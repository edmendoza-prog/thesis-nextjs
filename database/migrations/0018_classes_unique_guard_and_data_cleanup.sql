-- Migration 0018: Add Unique Constraint to Classes and Data Hygiene
-- 1. Prevent duplicate classes from being created under the same teacher
ALTER TABLE classes 
  ADD CONSTRAINT uq_teacher_class_section UNIQUE (teacher_id, grade_level, section);

-- 2. Normalize empty string employee_id to NULL
UPDATE users 
  SET employee_id = NULL 
  WHERE employee_id = '';
