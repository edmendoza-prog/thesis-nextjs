import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    let teacherName = 'Teacher';
    try {
      const [userRows] = await pool.query(
        'SELECT name FROM users WHERE id = ? LIMIT 1',
        [userId]
      );
      if ((userRows as any[]).length > 0 && (userRows as any[])[0].name) {
        teacherName = (userRows as any[])[0].name;
      }
    } catch (e) {
      console.error('Error fetching teacher name:', e);
    }

    let totalStudents = 0;
    let totalActivities = 0;
    let completedActivities = 0;
    let averageScore = 0;
    let recentRows: any[] = [];
    let upcomingRows: any[] = [];

    // Query teacher's own classes
    const [classRows] = await pool.query(
      'SELECT id FROM classes WHERE teacher_id = ?',
      [userId]
    );
    const classIds = (classRows as any[]).map((r) => Number(r.id));

    if (classIds.length > 0) {
      const classPlaceholders = classIds.map(() => '?').join(',');

      const [studentRows] = await pool.query(
        `SELECT COUNT(DISTINCT student_id) AS total FROM student_enrollments WHERE class_id IN (${classPlaceholders}) AND status = "active"`,
        classIds
      );
      totalStudents = Number((studentRows as any[])[0]?.total ?? 0);

      try {
        const [activityRows] = await pool.query(
          `SELECT COUNT(*) AS total FROM activities WHERE class_id IN (${classPlaceholders}) OR created_by_user_id = ?`,
          [...classIds, userId]
        );
        totalActivities = Number((activityRows as any[])[0]?.total ?? 0);
      } catch {
        totalActivities = 0;
      }

      try {
        const [gradeRows] = await pool.query(
          `SELECT COUNT(*) AS total FROM activity_submissions s JOIN activities a ON a.id = s.activity_id WHERE a.class_id IN (${classPlaceholders})`,
          classIds
        );
        completedActivities = Number((gradeRows as any[])[0]?.total ?? 0);
      } catch {
        completedActivities = 0;
      }

      try {
        const [averageRows] = await pool.query(
          `SELECT COALESCE(ROUND(AVG((s.score / s.max_score) * 100), 1), 0) AS value FROM activity_submissions s JOIN activities a ON a.id = s.activity_id WHERE a.class_id IN (${classPlaceholders})`,
          classIds
        );
        averageScore = Number((averageRows as any[])[0]?.value ?? 0);
      } catch {
        averageScore = 0;
      }

      const [rows] = await pool.query(`
        SELECT u.id AS student_id,
          u.name AS student_name,
          u.student_number,
          u.avatar_seed,
          a.title AS activity_title,
          ROUND((s.score / s.max_score) * 100, 2) AS percentage,
          s.submitted_at AS time_graded
        FROM activity_submissions s
        JOIN users u ON u.id = s.student_id
        JOIN activities a ON a.id = s.activity_id
        WHERE a.class_id IN (${classPlaceholders})
        ORDER BY s.submitted_at DESC
        LIMIT 4
      `, classIds);
      recentRows = rows as any[];

      try {
        const [upRows] = await pool.query(`
          SELECT a.id, a.title, c.name AS grade_name, DATE_FORMAT(a.due_date, '%b %e') AS due_date,
            'SCHEDULED' AS status,
            'bg-accent-500 text-white' AS statusColor
          FROM activities a
          LEFT JOIN classes c ON c.id = a.class_id
          WHERE a.class_id IN (${classPlaceholders}) AND a.due_date IS NOT NULL
          ORDER BY a.due_date ASC
          LIMIT 3
        `, classIds);
        upcomingRows = upRows as any[];
      } catch {
        upcomingRows = [];
      }
    }

    const stats = [
      {
        label: 'Total Students',
        value: String(totalStudents),
        delta: '+0',
        iconColor: 'bg-accent-100',
        iconTextColor: 'text-accent-600',
        icon: 'users',
      },
      {
        label: 'Active Activities',
        value: String(totalActivities),
        delta: '+0',
        iconColor: 'bg-secondary-100',
        iconTextColor: 'text-secondary-600',
        icon: 'activity',
      },
      {
        label: 'Completed Activities',
        value: String(completedActivities),
        delta: '+0',
        iconColor: 'bg-accent-100',
        iconTextColor: 'text-accent-600',
        icon: 'check-circle',
      },
      {
        label: 'Average Class Score',
        value: `${averageScore}%`,
        delta: '+0%',
        iconColor: 'bg-secondary-100',
        iconTextColor: 'text-secondary-600',
        icon: 'chart',
      },
    ];

    const recentActivity = (recentRows as any[]).map((row, index) => ({
      name: row.student_name || `Student ${index + 1}`,
      initials: (row.student_name || 'S').split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase(),
      avatarSeed: row.avatar_seed || row.student_number || String(row.student_id || '') || row.student_name || 'Student',
      color: index % 2 === 0 ? 'bg-secondary-200' : 'bg-primary-200',
      action: row.activity_title ? `Completed ${row.activity_title}` : 'Recent classroom activity',
      score: row.percentage != null ? `${row.percentage}%` : '',
      time: row.time_graded ? new Date(row.time_graded).toLocaleString() : 'Recently',
    }));

    const notifications = [
      {
        title: totalStudents > 0 ? `${totalStudents} student${totalStudents === 1 ? '' : 's'} currently enrolled` : 'No students enrolled yet',
        time: 'Now',
        borderColor: 'border-l-blue-500',
        bgColor: 'bg-blue-50',
      },
      {
        title: totalActivities > 0 ? `${totalActivities} activity${totalActivities === 1 ? '' : 'ies'} available` : 'No activities created yet',
        time: 'Today',
        borderColor: 'border-l-orange-500',
        bgColor: 'bg-orange-50',
      },
      {
        title: averageScore > 0 ? `Class average is ${averageScore}%` : 'No grade data yet',
        time: 'Today',
        borderColor: 'border-l-green-500',
        bgColor: 'bg-green-50',
      },
    ];

    const upcomingActivities = (upcomingRows as any[]).map((row) => ({
      title: row.title,
      grade: row.grade_name || 'Class',
      dueDate: row.due_date ? `Due: ${row.due_date}` : 'No due date',
      status: row.status || 'SCHEDULED',
      statusColor: row.statusColor || 'bg-accent-500 text-white',
    }));

    return NextResponse.json({
      teacherName,
      stats,
      recentActivity,
      notifications,
      upcomingActivities,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

