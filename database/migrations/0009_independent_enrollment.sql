-- Migration 0009: Independent Student Enrollment Isolation
-- Drops restrictive single-guard index to allow independent multi-class/course enrollments per student

ALTER TABLE student_enrollments
  DROP INDEX IF EXISTS uq_active_student_guard;

ALTER TABLE student_enrollments
  DROP COLUMN IF EXISTS active_student_guard;
