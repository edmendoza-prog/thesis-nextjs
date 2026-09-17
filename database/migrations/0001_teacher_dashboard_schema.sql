-- Teacher Dashboard Schema Extension
-- Adds tables for enrollment, attendance, activities, grades, class recordings, and live games

CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  employee_id VARCHAR(50) NULL,
  department VARCHAR(100) NULL,
  designation VARCHAR(100) NULL,
  bio TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  student_number VARCHAR(50) NULL UNIQUE,
  guardian_name VARCHAR(150) NULL,
  guardian_contact VARCHAR(50) NULL,
  birth_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS class_recordings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NULL,
  description TEXT NULL,
  recording_url VARCHAR(255) NULL,
  duration_minutes INT NULL,
  recorded_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS live_games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  game_type ENUM('quiz', 'challenge', 'race', 'team') NOT NULL,
  status ENUM('draft', 'active', 'finished') NOT NULL DEFAULT 'draft',
  start_time DATETIME NULL,
  end_time DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS live_game_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NULL,
  option_b VARCHAR(255) NULL,
  option_c VARCHAR(255) NULL,
  option_d VARCHAR(255) NULL,
  correct_option ENUM('A', 'B', 'C', 'D') NULL,
  points INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES live_games(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS live_game_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  student_id INT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  rank INT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME NULL,
  UNIQUE KEY unique_player_game (game_id, student_id),
  FOREIGN KEY (game_id) REFERENCES live_games(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes (teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student ON student_enrollments (student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_class ON student_enrollments (class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance (class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance (student_id, date);
CREATE INDEX IF NOT EXISTS idx_activities_class ON activities (class_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades (student_id);
CREATE INDEX IF NOT EXISTS idx_grades_activity ON grades (activity_id);
CREATE INDEX IF NOT EXISTS idx_recordings_class ON class_recordings (class_id);
CREATE INDEX IF NOT EXISTS idx_live_games_class ON live_games (class_id);
CREATE INDEX IF NOT EXISTS idx_live_game_players_game ON live_game_players (game_id);

-- No seed data is included. Teacher and student records are created through application flows.
