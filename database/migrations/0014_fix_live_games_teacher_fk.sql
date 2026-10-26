-- Migration 0014: Fix live_games foreign key to reference users table instead of dropped teachers table

SET FOREIGN_KEY_CHECKS = 0;

-- Try dropping any legacy foreign keys on live_games that reference teachers
ALTER TABLE live_games DROP FOREIGN KEY IF EXISTS live_games_ibfk_2;
ALTER TABLE live_games DROP FOREIGN KEY IF EXISTS fk_live_games_teacher;

-- Point teacher_id to users(id)
ALTER TABLE live_games 
  ADD CONSTRAINT fk_live_games_teacher 
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
