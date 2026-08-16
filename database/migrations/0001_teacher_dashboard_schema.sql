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

INSERT INTO teachers (user_id, employee_id, department, designation)
SELECT u.id, 'T-1001', 'Elementary', 'Grade Teacher'
FROM users u
WHERE u.user_type = 'teacher' AND u.email = 'teacher@school.com'
ON DUPLICATE KEY UPDATE employee_id = VALUES(employee_id), department = VALUES(department), designation = VALUES(designation);

INSERT INTO students (user_id, student_number, guardian_name, guardian_contact)
SELECT u.id, 'S-20241', 'Guardians', '0917-000-0001'
FROM users u
WHERE u.user_type = 'student' AND u.email = 'student1@school.com'
ON DUPLICATE KEY UPDATE student_number = VALUES(student_number), guardian_name = VALUES(guardian_name), guardian_contact = VALUES(guardian_contact);

INSERT INTO students (user_id, student_number, guardian_name, guardian_contact)
SELECT u.id, 'S-20242', 'Guardians', '0917-000-0002'
FROM users u
WHERE u.user_type = 'student' AND u.email = 'student2@school.com'
ON DUPLICATE KEY UPDATE student_number = VALUES(student_number), guardian_name = VALUES(guardian_name), guardian_contact = VALUES(guardian_contact);

INSERT INTO classes (name, grade_level, section, teacher_id)
SELECT 'Grade 1 - Section A', 1, 'A', t.id
FROM teachers t
WHERE t.employee_id = 'T-1001'
ON DUPLICATE KEY UPDATE name = VALUES(name), grade_level = VALUES(grade_level), section = VALUES(section), teacher_id = VALUES(teacher_id);

INSERT INTO student_enrollments (student_id, class_id, status)
SELECT s.id, c.id, 'active'
FROM students s
JOIN classes c ON c.name = 'Grade 1 - Section A'
WHERE s.student_number IN ('S-20241', 'S-20242')
ON DUPLICATE KEY UPDATE status = VALUES(status);

INSERT INTO activities (title, description, class_id, activity_type, total_points, created_by)
SELECT 'Math Quiz 1', 'Basic arithmetic challenge', c.id, 'quiz', 100, t.user_id
FROM classes c
JOIN teachers t ON t.id = c.teacher_id
WHERE c.name = 'Grade 1 - Section A'
ON DUPLICATE KEY UPDATE description = VALUES(description), activity_type = VALUES(activity_type), total_points = VALUES(total_points), created_by = VALUES(created_by);

INSERT INTO live_games (class_id, teacher_id, title, game_type, status, start_time, end_time)
SELECT c.id, t.id, 'Science Challenge', 'quiz', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE)
FROM classes c
JOIN teachers t ON t.id = c.teacher_id
WHERE c.name = 'Grade 1 - Section A'
ON DUPLICATE KEY UPDATE title = VALUES(title), game_type = VALUES(game_type), status = VALUES(status), start_time = VALUES(start_time), end_time = VALUES(end_time);

INSERT INTO live_game_questions (game_id, question_text, option_a, option_b, option_c, option_d, correct_option, points)
SELECT lg.id, 'What planet is known as the Red Planet?', 'Earth', 'Mars', 'Venus', 'Jupiter', 'B', 10
FROM live_games lg
WHERE lg.title = 'Science Challenge'
ON DUPLICATE KEY UPDATE question_text = VALUES(question_text), option_a = VALUES(option_a), option_b = VALUES(option_b), option_c = VALUES(option_c), option_d = VALUES(option_d), correct_option = VALUES(correct_option), points = VALUES(points);

INSERT INTO class_recordings (class_id, teacher_id, title, topic, description, recorded_at)
SELECT c.id, t.id, 'Grade 1 Session Recording', 'Math Practice', 'Recorded class session for review and revision.', NOW()
FROM classes c
JOIN teachers t ON t.id = c.teacher_id
WHERE c.name = 'Grade 1 - Section A'
ON DUPLICATE KEY UPDATE title = VALUES(title), topic = VALUES(topic), description = VALUES(description), recorded_at = VALUES(recorded_at);
