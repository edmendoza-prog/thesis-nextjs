ALTER TABLE activity_submissions
  ADD COLUMN status ENUM('in_progress', 'completed') NOT NULL DEFAULT 'completed' AFTER answers;