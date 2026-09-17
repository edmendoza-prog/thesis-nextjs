import pool from '../lib/db';

async function testApiOutput() {
  const userId = 3;

  const [studentActivityRows] = await pool.query(`
    SELECT a.id, a.title, a.description, a.activity_type, a.total_points, a.due_date, c.name AS class_name,
      s.score AS submitted_score, s.max_score AS submitted_max_score, s.status AS submission_status
    FROM student_enrollments se
    JOIN activities a ON a.class_id = se.class_id
    JOIN classes c ON c.id = a.class_id
    LEFT JOIN activity_submissions s ON s.activity_id = a.id AND s.student_id = se.student_id
    WHERE se.student_id = ? AND se.status = 'active'
    ORDER BY a.due_date ASC, a.created_at DESC
  `, [userId]);

  const rows = studentActivityRows as any[];

  const activities = rows.map((activity, index) => {
    const isCompleted = activity.submission_status === 'completed';

    return {
      id: activity.id,
      studentId: userId,
      title: activity.title || 'Untitled Activity',
      progress: isCompleted ? 100 : 0,
      score: activity.submitted_score == null ? null : Number(activity.submitted_score),
      maxScore: activity.submitted_max_score == null ? null : Number(activity.submitted_max_score),
      completed: isCompleted,
    };
  });

  console.log('API JSON OUTPUT FOR STUDENT 3:', JSON.stringify(activities, null, 2));
  process.exit(0);
}

testApiOutput().catch(console.error);
