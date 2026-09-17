import pool from '../lib/db';

async function run() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM student_enrollments LIKE 'enrolled_by'");
    if ((cols as any[]).length === 0) {
      await pool.query(`
        ALTER TABLE student_enrollments 
        ADD COLUMN enrolled_by INT NULL AFTER class_id,
        ADD CONSTRAINT fk_enrollments_enrolled_by 
          FOREIGN KEY (enrolled_by) REFERENCES users(id) ON DELETE SET NULL,
        ADD INDEX idx_enrolled_by (enrolled_by)
      `);
      console.log('✅ Added enrolled_by column and FK constraint');
    } else {
      console.log('ℹ️ enrolled_by column already exists');
    }

    await pool.query(`
      UPDATE student_enrollments se 
      JOIN classes c ON c.id = se.class_id 
      SET se.enrolled_by = c.teacher_id 
      WHERE se.enrolled_by IS NULL
    `);
    console.log('✅ Backfilled enrolled_by data from classes');

    const [rows] = await pool.query('SELECT id, student_id, class_id, enrolled_by, enrolled_at, status FROM student_enrollments');
    console.log('Current student_enrollments table state:');
    console.table(rows);
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    process.exit(0);
  }
}

run();
