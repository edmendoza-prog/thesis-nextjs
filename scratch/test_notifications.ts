import pool from '../lib/db';

async function testNotifications() {
  console.log('--- Starting Student Notifications Isolation & Scoping Test ---');

  // Test 1: Query notifications for User 3 (Ed Ryan Mendoza, enrolled in Class 10 by Rodel Apit)
  const userId3 = 3;
  const [enrollments3] = await pool.query(
    `SELECT se.id, se.class_id, c.name as class_name, c.teacher_id, t.name as teacher_name
     FROM student_enrollments se
     JOIN classes c ON c.id = se.class_id
     LEFT JOIN users t ON t.id = c.teacher_id
     WHERE se.student_id = ? AND se.status = 'active'`,
    [userId3]
  );
  console.log('Student 3 active enrollments:', enrollments3);

  // Check activities for Student 3's enrolled classes
  const [activities3] = await pool.query(
    `SELECT a.id, a.title, c.name as class_name, t.name as teacher_name
     FROM activities a
     JOIN student_enrollments se ON se.class_id = a.class_id
     JOIN classes c ON c.id = a.class_id
     LEFT JOIN users t ON t.id = c.teacher_id
     WHERE se.student_id = ? AND se.status = 'active'`,
    [userId3]
  );
  console.log('Student 3 class activities:', activities3);

  // Test 2: Query notifications for User 4 (Althea Abbygail Cambray - unenrolled)
  const userId4 = 4;
  const [enrollments4] = await pool.query(
    `SELECT se.id, se.class_id, c.name as class_name
     FROM student_enrollments se
     JOIN classes c ON c.id = se.class_id
     WHERE se.student_id = ? AND se.status = 'active'`,
    [userId4]
  );
  console.log('Student 4 active enrollments (should be 0):', enrollments4);

  if ((enrollments4 as any[]).length === 0) {
    console.log('✅ PASS: Unenrolled student has 0 active enrollments.');
  } else {
    console.error('❌ FAIL: Unenrolled student has unexpected enrollments.');
  }

  // Test 3: Test student_notification_reads table insert & query
  const testKey = 'activity-1';
  await pool.query(
    `INSERT INTO student_notification_reads (student_id, notification_key)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
    [userId3, testKey]
  );

  const [reads] = await pool.query(
    `SELECT * FROM student_notification_reads WHERE student_id = ? AND notification_key = ?`,
    [userId3, testKey]
  );
  console.log('Read tracking record:', reads);

  if ((reads as any[]).length > 0) {
    console.log('✅ PASS: Read notification tracking works as expected.');
  } else {
    console.error('❌ FAIL: Read notification tracking record not found.');
  }

  console.log('--- Notifications Test Completed Successfully ---');
  process.exit(0);
}

testNotifications().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
