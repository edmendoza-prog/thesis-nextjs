-- Migration 0006: Multi-Teacher Student Isolation & Single Active Enrollment Constraint

-- 1. Ensure active_student_guard virtual column exists to enforce single active enrollment per student
ALTER TABLE student_enrollments
  ADD COLUMN IF NOT EXISTS active_student_guard INT GENERATED ALWAYS AS (IF(status = 'active', student_id, NULL)) VIRTUAL;

-- 2. Add unique constraint on active_student_guard so MySQL/MariaDB prevents duplicate active enrollments
ALTER TABLE student_enrollments
  ADD UNIQUE INDEX IF NOT EXISTS uq_active_student_guard (active_student_guard);

-- 3. Ensure teacher_id index exists on classes
ALTER TABLE classes
  ADD INDEX IF NOT EXISTS idx_classes_teacher_id (teacher_id);
