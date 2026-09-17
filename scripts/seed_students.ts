import pool from '../lib/db';

async function main() {
  const students = [
    { name: 'Maria Santos', email: 'maria@example.com', sn: '2026-0001' },
    { name: 'Juan Dela Cruz', email: 'juan@example.com', sn: '2026-0002' },
    { name: 'Sophia Reyes', email: 'sophia@example.com', sn: '2026-0003' },
  ];

  for (const s of students) {
    await pool.query(
      'INSERT IGNORE INTO users (name, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
      [s.name, s.email, '$2b$10$abcdefghijklmnopqrstuu', 'student']
    );
    const [u] = await pool.query('SELECT id FROM users WHERE email = ?', [s.email]);
    const uid = (u as any[])[0].id;
    await pool.query('INSERT IGNORE INTO students (user_id, student_number) VALUES (?, ?)', [uid, s.sn]);

    const [classRows] = await pool.query('SELECT id FROM classes');
    for (const row of classRows as any[]) {
      await pool.query(
        'INSERT IGNORE INTO student_enrollments (student_id, class_id, status) VALUES (?, ?, "active")',
        [uid, row.id]
      );
    }
  }
  console.log('Sample students enrolled successfully');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
