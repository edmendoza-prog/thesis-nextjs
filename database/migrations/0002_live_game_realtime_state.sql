-- Persist live-game state so teacher and student clients can synchronize.
ALTER TABLE live_games
  ADD COLUMN session_name VARCHAR(255) NULL,
  ADD COLUMN participants_json JSON NULL,
  ADD COLUMN selected_student VARCHAR(255) NULL,
  ADD COLUMN wheel_rotation INT NOT NULL DEFAULT 0,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
