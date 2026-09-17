import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export type StudentNotification = {
  key: string;
  type: 'enrollment' | 'activity' | 'grade' | 'live_game' | 'attendance';
  title: string;
  message: string;
  className: string;
  classSection: string;
  teacherName: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
};

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 1. Fetch read notification keys for this student
    const [readRows] = await pool.query(
      `SELECT notification_key FROM student_notification_reads WHERE student_id = ?`,
      [userId]
    );
    const readKeys = new Set((readRows as any[]).map((r) => r.notification_key));

    const notifications: StudentNotification[] = [];

    // 2. Class Enrollment Notifications (Teacher enrolled student into class)
    const [enrollmentRows] = await pool.query(
      `SELECT 
        se.id,
        se.enrolled_at,
        c.id AS class_id,
        c.name AS class_name,
        c.section AS class_section,
        COALESCE(enrolled_teacher.name, teacher.name, 'Teacher') AS teacher_name
      FROM student_enrollments se
      JOIN classes c ON c.id = se.class_id
      LEFT JOIN users teacher ON teacher.id = c.teacher_id
      LEFT JOIN users enrolled_teacher ON enrolled_teacher.id = se.enrolled_by
      WHERE se.student_id = ? AND se.status = 'active'`,
      [userId]
    );

    (enrollmentRows as any[]).forEach((row) => {
      const key = `enrollment-${row.id}`;
      notifications.push({
        key,
        type: 'enrollment',
        title: `Enrolled in ${row.class_name}`,
        message: `Teacher ${row.teacher_name} enrolled you in ${row.class_name} (${row.class_section}).`,
        className: row.class_name,
        classSection: row.class_section,
        teacherName: row.teacher_name,
        createdAt: new Date(row.enrolled_at).toISOString(),
        isRead: readKeys.has(key),
        link: '/student-dashboard',
      });
    });

    // 3. New Activity / Assessment Notifications (Posted by teacher for enrolled class)
    const [activityRows] = await pool.query(
      `SELECT 
        a.id,
        a.title,
        a.activity_type,
        a.due_date,
        a.created_at,
        c.id AS class_id,
        c.name AS class_name,
        c.section AS class_section,
        COALESCE(teacher.name, 'Teacher') AS teacher_name
      FROM activities a
      JOIN student_enrollments se ON se.class_id = a.class_id
      JOIN classes c ON c.id = a.class_id
      LEFT JOIN users teacher ON teacher.id = c.teacher_id
      WHERE se.student_id = ? AND se.status = 'active'`,
      [userId]
    );

    (activityRows as any[]).forEach((row) => {
      const key = `activity-${row.id}`;
      const dueStr = row.due_date ? new Date(row.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
      notifications.push({
        key,
        type: 'activity',
        title: `New Assessment: ${row.title}`,
        message: `Teacher ${row.teacher_name} assigned "${row.title}" for ${row.class_name}${dueStr ? ` (Due ${dueStr})` : ''}.`,
        className: row.class_name,
        classSection: row.class_section,
        teacherName: row.teacher_name,
        createdAt: new Date(row.created_at).toISOString(),
        isRead: readKeys.has(key),
        link: `/student-dashboard?tab=Assessment&activityId=${row.id}`,
        metadata: { activityId: row.id },
      });
    });

    // 4. Graded Assessment Submissions
    const [submissionRows] = await pool.query(
      `SELECT 
        s.id,
        s.score,
        s.max_score,
        s.submitted_at,
        a.id AS activity_id,
        a.title AS activity_title,
        c.name AS class_name,
        c.section AS class_section,
        COALESCE(teacher.name, 'Teacher') AS teacher_name
      FROM activity_submissions s
      JOIN activities a ON a.id = s.activity_id
      JOIN student_enrollments se ON se.class_id = a.class_id
      JOIN classes c ON c.id = a.class_id
      LEFT JOIN users teacher ON teacher.id = c.teacher_id
      WHERE s.student_id = ? AND se.status = 'active' AND s.status = 'completed'`,
      [userId]
    );

    (submissionRows as any[]).forEach((row) => {
      const key = `grade-${row.id}`;
      const score = Number(row.score ?? 0);
      const maxScore = Number(row.max_score || 100);
      const pct = Math.round((score / maxScore) * 100);
      notifications.push({
        key,
        type: 'grade',
        title: `Assessment Completed: ${row.activity_title}`,
        message: `You completed "${row.activity_title}" in ${row.class_name}. Score: ${score}/${maxScore} (${pct}%).`,
        className: row.class_name,
        classSection: row.class_section,
        teacherName: row.teacher_name,
        createdAt: new Date(row.submitted_at).toISOString(),
        isRead: readKeys.has(key),
        link: `/student-dashboard?tab=Assessment&activityId=${row.activity_id}`,
        metadata: { score, maxScore, percentage: pct },
      });
    });

    // 5. Active Live Game Sessions for Enrolled Classes
    const [liveGameRows] = await pool.query(
      `SELECT 
        lg.id,
        lg.session_name,
        lg.status,
        lg.created_at,
        c.name AS class_name,
        c.section AS class_section,
        COALESCE(teacher.name, 'Teacher') AS teacher_name
      FROM live_games lg
      JOIN student_enrollments se ON se.class_id = lg.class_id
      JOIN classes c ON c.id = lg.class_id
      LEFT JOIN users teacher ON teacher.id = c.teacher_id
      WHERE se.student_id = ? AND se.status = 'active' AND lg.status = 'active'`,
      [userId]
    );

    (liveGameRows as any[]).forEach((row) => {
      const key = `live-game-${row.id}`;
      notifications.push({
        key,
        type: 'live_game',
        title: `Live Session Active: ${row.session_name}`,
        message: `Teacher ${row.teacher_name} started a live interactive session "${row.session_name}" for ${row.class_name}.`,
        className: row.class_name,
        classSection: row.class_section,
        teacherName: row.teacher_name,
        createdAt: new Date(row.created_at).toISOString(),
        isRead: readKeys.has(key),
        link: `/student-dashboard?tab=Live+Games`,
      });
    });

    // 6. Recent Attendance Records
    const [attendanceRows] = await pool.query(
      `SELECT 
        att.id,
        att.date,
        att.status,
        att.created_at,
        c.name AS class_name,
        c.section AS class_section,
        COALESCE(teacher.name, 'Teacher') AS teacher_name
      FROM attendance att
      JOIN student_enrollments se ON se.class_id = att.class_id
      JOIN classes c ON c.id = att.class_id
      LEFT JOIN users teacher ON teacher.id = c.teacher_id
      WHERE att.student_id = ? AND se.status = 'active'
      ORDER BY att.date DESC
      LIMIT 10`,
      [userId]
    );

    (attendanceRows as any[]).forEach((row) => {
      const key = `attendance-${row.id}-${row.date}`;
      const statusTitle = String(row.status || 'present').toUpperCase();
      const dateStr = new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      notifications.push({
        key,
        type: 'attendance',
        title: `Attendance: ${statusTitle}`,
        message: `Teacher ${row.teacher_name} recorded your attendance as ${statusTitle} for ${dateStr} in ${row.class_name}.`,
        className: row.class_name,
        classSection: row.class_section,
        teacherName: row.teacher_name,
        createdAt: new Date(row.created_at || row.date).toISOString(),
        isRead: readKeys.has(key),
        link: `/student-dashboard`,
      });
    });

    // Sort all events in descending chronological order
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Student notifications fetch error:', error);
    return NextResponse.json({ error: 'Unable to load notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const keys: string[] = Array.isArray(body?.keys) ? body.keys : body?.key ? [body.key] : [];

    if (keys.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Insert read notification keys
    for (const key of keys) {
      if (typeof key === 'string' && key.trim()) {
        await pool.query(
          `INSERT INTO student_notification_reads (student_id, notification_key)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
          [userId, key.trim()]
        );
      }
    }

    return NextResponse.json({ success: true, count: keys.length });
  } catch (error) {
    console.error('Student mark notifications read error:', error);
    return NextResponse.json({ error: 'Unable to update notification read status' }, { status: 500 });
  }
}
