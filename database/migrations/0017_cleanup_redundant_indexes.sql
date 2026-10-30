-- Migration 0017: Remove Redundant and Duplicate Indexes
-- Safe optimization: Eliminates write amplification, reduces B-tree locks, and frees InnoDB buffer pool RAM.

-- 1. activities: Drop duplicate index on class_id (idx_class_id remains)
ALTER TABLE activities DROP INDEX idx_activities_class;

-- 2. attendance: Drop duplicate index on (student_id, date) (idx_student_date remains)
ALTER TABLE attendance DROP INDEX idx_attendance_student_date;

-- 3. classes: Drop duplicate index on teacher_id (idx_classes_teacher remains)
ALTER TABLE classes DROP INDEX idx_classes_teacher_id;

-- 4. lesson_reads: Drop redundant prefix index (uk_lesson_student covers lesson_id)
ALTER TABLE lesson_reads DROP INDEX idx_lesson_reads_lesson;

-- 5. live_game_results: Drop redundant prefix index (unique_live_game_student covers game_id)
ALTER TABLE live_game_results DROP INDEX idx_live_result_game;

-- 6. schema_migrations: Drop duplicate index on filename (UNIQUE filename remains)
ALTER TABLE schema_migrations DROP INDEX idx_filename;

-- 7. student_badges: Drop redundant prefix index (unique_student_badge covers student_id)
ALTER TABLE student_badges DROP INDEX idx_student_id;

-- 8. student_enrollments: Drop duplicate and prefix-redundant indexes
-- (unique_enrollment covers student_id; idx_class_id covers class_id)
ALTER TABLE student_enrollments DROP INDEX idx_student_enrollments_student;
ALTER TABLE student_enrollments DROP INDEX idx_student_id;
ALTER TABLE student_enrollments DROP INDEX idx_student_enrollments_class;

-- 9. student_notification_reads: Drop redundant prefix index (uq_student_notification covers student_id)
ALTER TABLE student_notification_reads DROP INDEX idx_student_read;

-- 10. users: Drop duplicate index on email (UNIQUE email remains)
ALTER TABLE users DROP INDEX idx_email;
