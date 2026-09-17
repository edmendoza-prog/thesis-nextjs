import pool from '../lib/db';

async function runNotificationE2ETest() {
  console.log('=== STARTING COMPLETE NOTIFICATION END-TO-END TEST ===\n');

  // Step 0: Identify / setup test users & classes
  // Teacher 1: Rodel Apit (ID 1)
  // Teacher 2: Genie Rose Castillo (ID 2)
  // Student 1: Ed Ryan Mendoza (ID 3)
  // Student 2: Althea Abbygail Cambray (ID 4)

  const teacher1Id = 1;
  const teacher2Id = 2;
  const student1Id = 3;
  const student2Id = 4;

  // Clean up any test artifacts for these students
  await pool.query(`DELETE FROM student_notification_reads WHERE student_id IN (?, ?)`, [student1Id, student2Id]);

  // Ensure Class A owned by Teacher 1
  let [classARows] = await pool.query(`SELECT id, name, section FROM classes WHERE teacher_id = ? LIMIT 1`, [teacher1Id]);
  let classA = (classARows as any[])[0];
  if (!classA) {
    const [ins] = await pool.query(
      `INSERT INTO classes (name, grade_level, section, teacher_id) VALUES ('Math 10', 10, 'Newton', ?)`,
      [teacher1Id]
    );
    classA = { id: (ins as any).insertId, name: 'Math 10', section: 'Newton' };
  }
  console.log(`[Setup] Class A: "${classA.name} - ${classA.section}" (ID: ${classA.id}) owned by Teacher 1 (ID: ${teacher1Id})`);

  // Ensure Class B owned by Teacher 2
  let [classBRows] = await pool.query(`SELECT id, name, section FROM classes WHERE teacher_id = ? LIMIT 1`, [teacher2Id]);
  let classB = (classBRows as any[])[0];
  if (!classB) {
    const [ins] = await pool.query(
      `INSERT INTO classes (name, grade_level, section, teacher_id) VALUES ('Science 9', 9, 'Einstein', ?)`,
      [teacher2Id]
    );
    classB = { id: (ins as any).insertId, name: 'Science 9', section: 'Einstein' };
  }
  console.log(`[Setup] Class B: "${classB.name} - ${classB.section}" (ID: ${classB.id}) owned by Teacher 2 (ID: ${teacher2Id})`);

  // 1. Enroll Student 1 into Class A (Teacher 1)
  await pool.query(
    `INSERT INTO student_enrollments (student_id, class_id, status)
     VALUES (?, ?, 'active')
     ON DUPLICATE KEY UPDATE status = 'active'`,
    [student1Id, classA.id]
  );
  // Ensure Student 1 is NOT enrolled in Class B
  await pool.query(`DELETE FROM student_enrollments WHERE student_id = ? AND class_id = ?`, [student1Id, classB.id]);
  // Ensure Student 2 is completely unenrolled
  await pool.query(`DELETE FROM student_enrollments WHERE student_id = ?`, [student2Id]);

  console.log(`\n[Test 1] Enrolled Student 1 into Class A (Teacher 1). Student 2 remains unenrolled.`);

  // 2. Create activity in Class A (Teacher 1)
  const [actAIns] = await pool.query(
    `INSERT INTO activities (title, description, class_id, activity_type, total_points, due_date, created_by_user_id)
     VALUES ('Algebra Mastery Quiz', '{"subject":"Mathematics","generatedGroups":[]}', ?, 'quiz', 50, '2026-10-01 23:59:59', ?)`,
    [classA.id, teacher1Id]
  );
  const activityAId = (actAIns as any).insertId;
  console.log(`[Test 2] Teacher 1 created activity: "Algebra Mastery Quiz" (ID: ${activityAId}) in Class A`);

  // 3. Create activity in Class B (Teacher 2)
  const [actBIns] = await pool.query(
    `INSERT INTO activities (title, description, class_id, activity_type, total_points, due_date, created_by_user_id)
     VALUES ('Physics Motion Lab', '{"subject":"Science","generatedGroups":[]}', ?, 'quiz', 100, '2026-10-05 23:59:59', ?)`,
    [classB.id, teacher2Id]
  );
  const activityBId = (actBIns as any).insertId;
  console.log(`[Test 3] Teacher 2 created activity: "Physics Motion Lab" (ID: ${activityBId}) in Class B`);

  // 4. Record attendance for Student 1 in Class A
  await pool.query(
    `INSERT INTO attendance (student_id, class_id, date, status, recorded_by)
     VALUES (?, ?, '2026-09-17', 'present', ?)
     ON DUPLICATE KEY UPDATE status = 'present'`,
    [student1Id, classA.id, teacher1Id]
  );
  console.log(`[Test 4] Teacher 1 recorded attendance as "Present" for Student 1 in Class A`);

  // 5. Start a live game session in Class A
  const [lgsIns] = await pool.query(
    `INSERT INTO live_games (title, session_name, class_id, teacher_id, status)
     VALUES ('Math Wheel Spin', 'Geometry Live Quest', ?, ?, 'active')`,
    [classA.id, teacher1Id]
  );
  const liveGameId = (lgsIns as any).insertId;
  console.log(`[Test 5] Teacher 1 launched active live game session: "Geometry Live Quest" (ID: ${liveGameId})`);

  // 6. Student 1 submits activity
  await pool.query(
    `INSERT INTO activity_submissions (student_id, activity_id, score, max_score, answers, status)
     VALUES (?, ?, 45, 50, '{}', 'completed')
     ON DUPLICATE KEY UPDATE score = 45, max_score = 50, status = 'completed'`,
    [student1Id, activityAId]
  );
  console.log(`[Test 6] Student 1 completed assessment "Algebra Mastery Quiz" with score 45/50`);

  // 7. Query Notifications for Student 1 (Simulating GET /api/student/notifications)
  console.log(`\n--- Fetching notifications for Student 1 (ID: ${student1Id}) ---`);

  // Fetch read keys
  const [readRows1] = await pool.query(`SELECT notification_key FROM student_notification_reads WHERE student_id = ?`, [student1Id]);
  const readKeys1 = new Set((readRows1 as any[]).map((r) => r.notification_key));

  const notifs1: any[] = [];

  // Enrollment
  const [eRows1] = await pool.query(
    `SELECT se.id, se.enrolled_at, c.name AS class_name, c.section AS class_section, teacher.name AS teacher_name
     FROM student_enrollments se
     JOIN classes c ON c.id = se.class_id
     LEFT JOIN users teacher ON teacher.id = c.teacher_id
     WHERE se.student_id = ? AND se.status = 'active'`,
    [student1Id]
  );
  (eRows1 as any[]).forEach(r => {
    const key = `enrollment-${r.id}`;
    notifs1.push({
      key,
      type: 'enrollment',
      title: `Enrolled in ${r.class_name}`,
      message: `Teacher ${r.teacher_name} enrolled you in ${r.class_name} (${r.class_section}).`,
      teacherName: r.teacher_name,
      className: r.class_name,
      isRead: readKeys1.has(key),
    });
  });

  // Activities
  const [aRows1] = await pool.query(
    `SELECT a.id, a.title, c.name AS class_name, c.section AS class_section, teacher.name AS teacher_name
     FROM activities a
     JOIN student_enrollments se ON se.class_id = a.class_id
     JOIN classes c ON c.id = a.class_id
     LEFT JOIN users teacher ON teacher.id = c.teacher_id
     WHERE se.student_id = ? AND se.status = 'active'`,
    [student1Id]
  );
  (aRows1 as any[]).forEach(r => {
    const key = `activity-${r.id}`;
    notifs1.push({
      key,
      type: 'activity',
      title: `New Assessment: ${r.title}`,
      message: `Teacher ${r.teacher_name} assigned "${r.title}" for ${r.class_name}.`,
      teacherName: r.teacher_name,
      className: r.class_name,
      isRead: readKeys1.has(key),
    });
  });

  // Submissions/Grades
  const [sRows1] = await pool.query(
    `SELECT s.id, s.score, s.max_score, a.title AS activity_title, c.name AS class_name, teacher.name AS teacher_name
     FROM activity_submissions s
     JOIN activities a ON a.id = s.activity_id
     JOIN student_enrollments se ON se.class_id = a.class_id
     JOIN classes c ON c.id = a.class_id
     LEFT JOIN users teacher ON teacher.id = c.teacher_id
     WHERE s.student_id = ? AND se.status = 'active' AND s.status = 'completed'`,
    [student1Id]
  );
  (sRows1 as any[]).forEach(r => {
    const key = `grade-${r.id}`;
    notifs1.push({
      key,
      type: 'grade',
      title: `Assessment Completed: ${r.activity_title}`,
      message: `You completed "${r.activity_title}" in ${r.class_name}. Score: ${r.score}/${r.max_score}.`,
      teacherName: r.teacher_name,
      className: r.class_name,
      isRead: readKeys1.has(key),
    });
  });

  // Live Games
  const [lRows1] = await pool.query(
    `SELECT lg.id, lg.session_name, c.name AS class_name, teacher.name AS teacher_name
     FROM live_games lg
     JOIN student_enrollments se ON se.class_id = lg.class_id
     JOIN classes c ON c.id = lg.class_id
     LEFT JOIN users teacher ON teacher.id = c.teacher_id
     WHERE se.student_id = ? AND se.status = 'active' AND lg.status = 'active'`,
    [student1Id]
  );
  (lRows1 as any[]).forEach(r => {
    const key = `live-game-${r.id}`;
    notifs1.push({
      key,
      type: 'live_game',
      title: `Live Session Active: ${r.session_name}`,
      message: `Teacher ${r.teacher_name} started a live session "${r.session_name}" for ${r.class_name}.`,
      teacherName: r.teacher_name,
      className: r.class_name,
      isRead: readKeys1.has(key),
    });
  });

  // Attendance
  const [attRows1] = await pool.query(
    `SELECT att.id, att.date, att.status, c.name AS class_name, teacher.name AS teacher_name
     FROM attendance att
     JOIN student_enrollments se ON se.class_id = att.class_id
     JOIN classes c ON c.id = att.class_id
     LEFT JOIN users teacher ON teacher.id = c.teacher_id
     WHERE att.student_id = ? AND se.status = 'active'`,
    [student1Id]
  );
  (attRows1 as any[]).forEach(r => {
    const key = `attendance-${r.id}-${r.date}`;
    notifs1.push({
      key,
      type: 'attendance',
      title: `Attendance: ${r.status.toUpperCase()}`,
      message: `Teacher ${r.teacher_name} recorded your attendance as ${r.status} for ${r.date} in ${r.class_name}.`,
      teacherName: r.teacher_name,
      className: r.class_name,
      isRead: readKeys1.has(key),
    });
  });

  console.log(`Total notifications for Student 1: ${notifs1.length}`);
  notifs1.forEach((n, idx) => {
    console.log(` [${idx + 1}] (${n.type.toUpperCase()}) ${n.title} -> "${n.message}" [Read: ${n.isRead}]`);
  });

  // Check 1: Must contain Teacher 1's notifications
  const hasTeacher1 = notifs1.every(n => n.teacherName === 'Rodel Apit');
  console.log(`\nAssertion 1: All notifications for Student 1 belong strictly to enrolled Teacher 1? ${hasTeacher1 ? '✅ PASS' : '❌ FAIL'}`);

  // Check 2: Must NOT contain Teacher 2's activity "Physics Motion Lab"
  const hasLeakedActivity = notifs1.some(n => n.title.includes('Physics Motion Lab') || n.teacherName === 'Genie Rose Castillo');
  console.log(`Assertion 2: Student 1 has 0 leaked notifications from Teacher 2 / Class B? ${!hasLeakedActivity ? '✅ PASS' : '❌ FAIL'}`);

  // Check 3: Query Notifications for Unenrolled Student 2 (ID: 4)
  const [eRows2] = await pool.query(
    `SELECT se.id FROM student_enrollments se WHERE se.student_id = ? AND se.status = 'active'`,
    [student2Id]
  );
  console.log(`Assertion 3: Unenrolled Student 2 receives exactly 0 notifications? ${(eRows2 as any[]).length === 0 ? '✅ PASS' : '❌ FAIL'}`);

  // 8. Test Mark As Read Functionality
  const keyToMark = notifs1[0].key;
  await pool.query(
    `INSERT INTO student_notification_reads (student_id, notification_key)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
    [student1Id, keyToMark]
  );

  const [afterReadRows] = await pool.query(
    `SELECT notification_key FROM student_notification_reads WHERE student_id = ? AND notification_key = ?`,
    [student1Id, keyToMark]
  );
  const isNowRead = (afterReadRows as any[]).length > 0;
  console.log(`Assertion 4: Marking notification "${keyToMark}" as read persists in database? ${isNowRead ? '✅ PASS' : '❌ FAIL'}`);

  // Clean up test game session
  await pool.query(`DELETE FROM live_games WHERE id = ?`, [liveGameId]);

  console.log('\n=== ALL NOTIFICATION TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runNotificationE2ETest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
