import pool from '../lib/db';

async function verify() {
  console.log('--- Verifying student_enrollments structure ---');
  const [cols] = await pool.query('DESCRIBE student_enrollments');
  console.table(cols);

  console.log('\n--- Checking rows in student_enrollments with teacher details ---');
  const [rows] = await pool.query(`
    SELECT 
      se.id, 
      se.student_id, 
      u_stud.name AS student_name,
      se.class_id, 
      c.name AS class_name,
      c.section AS class_section,
      se.enrolled_by,
      u_teacher.name AS enrolled_by_teacher_name,
      se.status,
      se.enrolled_at
    FROM student_enrollments se
    JOIN users u_stud ON u_stud.id = se.student_id
    JOIN classes c ON c.id = se.class_id
    LEFT JOIN users u_teacher ON u_teacher.id = se.enrolled_by
  `);
  console.table(rows);
  
  process.exit(0);
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
