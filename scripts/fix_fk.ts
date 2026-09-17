import pool from '../lib/db';

async function run() {

  async function dropForeignKey(tableName: string, columnName: string) {
    const [rows] = await pool.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = ? 
      AND COLUMN_NAME = ? 
      AND REFERENCED_TABLE_NAME IS NOT NULL
      AND TABLE_SCHEMA = DATABASE()
    `, [tableName, columnName]);

    const constraintName = (rows as any[])[0]?.CONSTRAINT_NAME;
    if (constraintName) {
      console.log(`Dropping foreign key ${constraintName} from ${tableName}`);
      await pool.query(`ALTER TABLE ${tableName} DROP FOREIGN KEY ${constraintName}`);
    }
  }

  try {
    // 1. Fix class_recordings
    await dropForeignKey('class_recordings', 'teacher_id');
    try { await pool.query('ALTER TABLE class_recordings DROP COLUMN teacher_id'); } catch (e) {}
    try { await pool.query('ALTER TABLE class_recordings CHANGE new_teacher_id teacher_id INT NOT NULL'); } catch (e) {}
    try { await pool.query('ALTER TABLE class_recordings ADD FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE'); } catch (e) {}
    console.log('Fixed class_recordings');

    // 2. Fix live_games
    try { await pool.query('ALTER TABLE live_games ADD COLUMN new_teacher_id INT'); } catch (e) {}
    await pool.query('UPDATE live_games lg JOIN teachers t ON lg.teacher_id = t.id SET lg.new_teacher_id = t.user_id');
    await dropForeignKey('live_games', 'teacher_id');
    try { await pool.query('ALTER TABLE live_games DROP COLUMN teacher_id'); } catch (e) {}
    try { await pool.query('ALTER TABLE live_games CHANGE new_teacher_id teacher_id INT NOT NULL'); } catch (e) {}
    try { await pool.query('ALTER TABLE live_games ADD FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE'); } catch (e) {}
    console.log('Fixed live_games');

    // 4. Drop old tables
    await pool.query('DROP TABLE IF EXISTS students');
    await pool.query('DROP TABLE IF EXISTS teachers');
    console.log('Dropped students and teachers tables');
    
    // Mark migration 0008 as done
    await pool.query('INSERT IGNORE INTO schema_migrations (version) VALUES (?)', ['0008_consolidate_users.sql']);

    console.log('Migration fixed and completed successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

run();
