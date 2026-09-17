-- Persist student assessment submissions and live-game participation/results.
CREATE TABLE IF NOT EXISTS activity_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  activity_id INT NOT NULL,
  score DECIMAL(7,2) NOT NULL DEFAULT 0,
  max_score DECIMAL(7,2) NOT NULL DEFAULT 0,
  answers JSON NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_activity_submission (student_id, activity_id),
  INDEX idx_submission_activity (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS live_game_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  student_id INT NOT NULL,
  score DECIMAL(7,2) NOT NULL DEFAULT 0,
  result_status ENUM('joined', 'completed', 'selected') NOT NULL DEFAULT 'joined',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (game_id) REFERENCES live_games(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_live_game_student (game_id, student_id),
  INDEX idx_live_result_game (game_id),
  INDEX idx_live_result_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;