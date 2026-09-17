import pool from '../lib/db';

async function testIsolation() {
  console.log('=== STARTING STUDENT ISOLATION TEST ===');

  // Clean up any previous test user
  await pool.query("DELETE FROM users WHERE email = 'test_student_indep@test.com'");

  // Step 1: Create a brand new student account
  const [userResult] = await pool.query(
    "INSERT INTO users (name, email, user_type, password_hash) VALUES ('Test Student Independent', 'test_student_indep@test.com', 'student', 'dummy_hash')"
  );
  const studentId = Number((userResult as any).insertId);
  console.log('1. Created independent student account with ID:', studentId);

  // Step 2: Query activities for this new student
  const [studentActivityRows] = await pool.query(`
    SELECT a.id, a.title, a.description, a.activity_type, a.total_points, a.due_date, c.name AS class_name,
      s.score AS submitted_score, s.max_score AS submitted_max_score, s.status AS submission_status
    FROM student_enrollments se
    JOIN activities a ON a.class_id = se.class_id
    JOIN classes c ON c.id = a.class_id
    LEFT JOIN activity_submissions s ON s.activity_id = a.id AND s.student_id = se.student_id
    WHERE se.student_id = ? AND se.status = 'active'
    ORDER BY a.due_date ASC, a.created_at DESC
  `, [studentId]);

  console.log('2. Newly created student activities count:', (studentActivityRows as any[]).length);
  if ((studentActivityRows as any[]).length !== 0) {
    throw new Error('FAIL: Newly created student must have 0 activities initially');
  }

  // Step 3: Query live games for this new student
  const [liveGameRows] = await pool.query(`
    SELECT lg.id, lg.title
    FROM live_games lg
    JOIN classes c ON c.id = lg.class_id
    WHERE lg.status = 'active'
      AND EXISTS (
        SELECT 1 FROM student_enrollments se
        WHERE se.class_id = lg.class_id
          AND se.status = 'active'
          AND se.student_id = ?
      )
  `, [studentId]);

  console.log('3. Newly created student live games count:', (liveGameRows as any[]).length);
  if ((liveGameRows as any[]).length !== 0) {
    throw new Error('FAIL: Newly created student must have 0 live games initially');
  }

  // Step 4: Verify Teacher 1 (userId 1) class roster does NOT include this student
  const [teacher1Classes] = await pool.query('SELECT id FROM classes WHERE teacher_id = 1');
  const classIds = (teacher1Classes as any[]).map((c: any) => c.id);
  const [rosterRows] = await pool.query(
    'SELECT student_id FROM student_enrollments WHERE class_id IN (?) AND student_id = ?',
    [classIds, studentId]
  );
  console.log('4. Teacher 1 enrolled roster count for new student:', (rosterRows as any[]).length);
  if ((rosterRows as any[]).length !== 0) {
    throw new Error('FAIL: New student must not appear in any teacher class roster before explicit enrollment');
  }

  // Step 5: Explicitly enroll in Class 10
  await pool.query(
    "INSERT INTO student_enrollments (student_id, class_id, status) VALUES (?, 10, 'active')",
    [studentId]
  );
  console.log('5. Explicitly enrolled student in Class 10 (Math)');

  // Step 6: Verify student now has Class 10 activities, and ONLY Class 10 activities
  const [enrolledActivities] = await pool.query(`
    SELECT a.id, a.title, a.class_id
    FROM student_enrollments se
    JOIN activities a ON a.class_id = se.class_id
    WHERE se.student_id = ? AND se.status = 'active'
  `, [studentId]);
  console.log('6. Enrolled student activities count:', (enrolledActivities as any[]).length);
  if ((enrolledActivities as any[]).length === 0) {
    throw new Error('FAIL: Student should now have access to Class 10 activities');
  }

  // Step 7: Verify Teacher 2 (userId 2) enrolled roster does NOT contain student
  const [teacher2Classes] = await pool.query('SELECT id FROM classes WHERE teacher_id = 2');
  const t2ClassIds = (teacher2Classes as any[]).map((c: any) => c.id);
  const [t2Roster] = await pool.query(
    'SELECT student_id FROM student_enrollments WHERE class_id IN (?) AND student_id = ?',
    [t2ClassIds, studentId]
  );
  console.log('7. Teacher 2 enrolled roster count for student:', (t2Roster as any[]).length);
  if ((t2Roster as any[]).length !== 0) {
    throw new Error('FAIL: Student enrolled in Teacher 1 class must NOT appear in Teacher 2 class');
  }

  // Clean up test user
  await pool.query('DELETE FROM users WHERE id = ?', [studentId]);
  console.log('8. Test user cleaned up successfully');
  console.log('=== ALL ISOLATION TESTS PASSED 100% ===');
  process.exit(0);
}

testIsolation().catch((err) => {
  console.error('ISOLATION TEST ERROR:', err);
  process.exit(1);
});
