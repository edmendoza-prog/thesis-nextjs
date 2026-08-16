import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params;

  try {
    const body = await request.json();
    const action = body?.action;

    if (section === 'grades') {
      if (action === 'delete') {
        const id = Number(body?.id ?? 0);
        if (!id) {
          return NextResponse.json({ error: 'Grade id is required' }, { status: 400 });
        }

        await pool.query('DELETE FROM classes WHERE id = ?', [id]);
        return NextResponse.json({ message: 'Grade deleted successfully' });
      }

      const name = String(body?.name ?? '').trim();
      const sectionName = String(body?.section ?? '').trim();

      if (!name || !sectionName) {
        return NextResponse.json({ error: 'Grade name and section are required' }, { status: 400 });
      }

      const [result] = await pool.query(
        'INSERT INTO classes (name, grade_level, section, teacher_id) VALUES (?, 0, ?, 1)',
        [name, sectionName]
      );

      const classId = (result as any).insertId;

      return NextResponse.json({
        message: 'Grade created successfully',
        grade: {
          id: classId,
          name,
          section: sectionName,
          students: 0,
          activities: 0,
        },
      }, { status: 201 });
    }

    if (section === 'attendance') {
      const classId = Number(body?.classId ?? 0);
      const date = String(body?.date ?? '').trim();
      const attendanceList = Array.isArray(body?.attendance) ? body.attendance : [];

      if (!classId || !date || attendanceList.length === 0) {
        return NextResponse.json({ error: 'Class, date, and attendance records are required' }, { status: 400 });
      }

      for (const record of attendanceList) {
        const studentId = Number(record?.student_id ?? 0);
        const status = String(record?.status ?? '').trim();
        if (!studentId || !status) continue;

        await pool.query(
          `INSERT INTO attendance (student_id, class_id, date, status)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
          [studentId, classId, date, status]
        );
      }

      return NextResponse.json({ message: 'Attendance saved successfully' });
    }

    if (section === 'enrollment') {
      const classId = Number(body?.classId ?? 0);
      const enrolledIds = Array.isArray(body?.enrolledIds)
        ? (body.enrolledIds as Array<number | string>).map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0)
        : [];

      if (!classId) {
        return NextResponse.json({ error: 'Class id is required' }, { status: 400 });
      }

      const [existingRows] = await pool.query(
        'SELECT student_id FROM student_enrollments WHERE class_id = ?',
        [classId]
      );

      const existingIds = new Set<number>((existingRows as any[]).map((row) => Number(row.student_id)));
      const finalIds = new Set<number>(enrolledIds);

      for (const studentId of [...existingIds]) {
        if (!finalIds.has(studentId)) {
          await pool.query('DELETE FROM student_enrollments WHERE class_id = ? AND student_id = ?', [classId, studentId]);
        }
      }

      for (const studentId of [...finalIds]) {
        if (!existingIds.has(studentId)) {
          await pool.query(
            'INSERT INTO student_enrollments (student_id, class_id, status) VALUES (?, ?, "active") ON DUPLICATE KEY UPDATE status = VALUES(status)',
            [studentId, classId]
          );
        }
      }

      return NextResponse.json({ message: 'Enrollment saved successfully' });
    }

    if (section === 'create-activity') {
      const title = String(body?.title ?? '').trim();
      const classId = Number(body?.class_id ?? 0);
      const subject = String(body?.subject ?? 'General').trim();
      const activityType = String(body?.activity_type ?? 'quiz').trim();
      const visibility = String(body?.visibility ?? 'section').trim();
      const totalPoints = Number(body?.points ?? 100);
      const badge = String(body?.badge ?? '').trim();

      if (!title || !classId) {
        return NextResponse.json({ error: 'Activity title and class are required' }, { status: 400 });
      }

      const [result] = await pool.query(
        'INSERT INTO activities (title, description, class_id, activity_type, total_points, due_date, created_by) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), 1)',
        [title, `${subject}${visibility ? ` • ${visibility}` : ''}${badge ? ` • ${badge}` : ''}`, classId, activityType, totalPoints]
      );

      return NextResponse.json({
        message: 'Activity created successfully',
        activity: { id: (result as any).insertId, title },
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported POST action for this teacher section' }, { status: 405 });
  } catch (error: any) {
    console.error('Teacher POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create teacher data' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params;
  const { searchParams } = new URL(request.url);
  const classId = Number(searchParams.get('classId') ?? '1');
  const selectedDate = searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

  try {
    if (section === 'dashboard') {
      const [studentRows] = await pool.query('SELECT COUNT(*) AS total FROM students');
      const [activityRows] = await pool.query('SELECT COUNT(*) AS total FROM activities');
      const [gradeRows] = await pool.query('SELECT COUNT(*) AS total FROM grades');
      const [averageRows] = await pool.query('SELECT COALESCE(ROUND(AVG(percentage), 1), 0) AS value FROM grades');

      const [recentRows] = await pool.query(`
        SELECT 
          u.name AS student_name,
          a.title AS activity_title,
          g.percentage,
          g.graded_at AS time_graded
        FROM grades g
        LEFT JOIN students s ON s.id = g.student_id
        LEFT JOIN users u ON u.id = s.user_id
        LEFT JOIN activities a ON a.id = g.activity_id
        ORDER BY g.graded_at DESC
        LIMIT 4
      `);

      const [notificationRows] = await pool.query(`
        SELECT 'Students completed activities today' AS title,
          '1 hour ago' AS time,
          'border-l-[#16a34a]' AS borderColor,
          'bg-accent-50/50' AS bgColor
        UNION ALL
        SELECT 'Low performance alert for Grade 3', '2 hours ago', 'border-l-[#ea580c]', 'bg-[#fed7aa]/30'
        UNION ALL
        SELECT 'New badge unlocked by 8 students', '3 hours ago', 'border-l-accent-500', 'bg-accent-50/50'
      `);

      const [upcomingRows] = await pool.query(`
        SELECT a.id, a.title, c.name AS grade_name, DATE_FORMAT(a.due_date, '%b %e') AS due_date,
          'SCHEDULED' AS status,
          'bg-accent-500 text-white' AS statusColor
        FROM activities a
        LEFT JOIN classes c ON c.id = a.class_id
        WHERE a.due_date IS NOT NULL
        ORDER BY a.due_date ASC
        LIMIT 3
      `);

      const totalStudents = Number((studentRows as any[])[0]?.total ?? 0);
      const totalActivities = Number((activityRows as any[])[0]?.total ?? 0);
      const completedActivities = Number((gradeRows as any[])[0]?.total ?? 0);
      const averageScore = Number((averageRows as any[])[0]?.value ?? 0);

      return NextResponse.json({
        stats: [
          { label: 'Total Students', value: String(totalStudents), delta: '+12', icon: 'users', iconColor: 'bg-accent-100', iconTextColor: 'text-accent-600' },
          { label: 'Active Activities', value: String(totalActivities), delta: '+3', icon: 'activity', iconColor: 'bg-secondary-100', iconTextColor: 'text-secondary-600' },
          { label: 'Completed Activities', value: String(completedActivities), delta: '+28', icon: 'check-circle', iconColor: 'bg-accent-100', iconTextColor: 'text-accent-600' },
          { label: 'Average Class Score', value: `${averageScore}%`, delta: '+5%', icon: 'chart', iconColor: 'bg-secondary-100', iconTextColor: 'text-secondary-600' },
        ],
        recentActivity: (recentRows as any[]).map((row, index) => ({
          name: row.student_name || `Student ${index + 1}`,
          initials: (row.student_name || 'S').split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase(),
          color: index % 2 === 0 ? 'bg-secondary-200' : 'bg-primary-200',
          action: row.activity_title ? `Completed ${row.activity_title}` : 'Recent classroom activity',
          score: row.percentage != null ? `${row.percentage}%` : '',
          time: row.time_graded ? new Date(row.time_graded).toLocaleString() : 'Recently',
        })),
        notifications: (notificationRows as any[]).map((row) => ({
          title: row.title,
          time: row.time,
          borderColor: row.borderColor,
          bgColor: row.bgColor,
        })),
        upcomingActivities: (upcomingRows as any[]).map((row) => ({
          title: row.title,
          grade: row.grade_name || 'Class',
          dueDate: row.due_date ? `Due: ${row.due_date}` : 'No due date',
          status: row.status || 'SCHEDULED',
          statusColor: row.statusColor || 'bg-accent-500 text-white',
        })),
      });
    }

    if (section === 'grades') {
      const [rows] = await pool.query(`
        SELECT c.id, c.name, c.section,
          COUNT(DISTINCT se.student_id) AS student_count,
          COUNT(DISTINCT a.id) AS activity_count
        FROM classes c
        LEFT JOIN student_enrollments se ON se.class_id = c.id AND se.status = 'active'
        LEFT JOIN activities a ON a.class_id = c.id
        GROUP BY c.id, c.name, c.section
        ORDER BY c.id ASC
      `);

      return NextResponse.json({
        grades: (rows as any[]).map((row) => ({
          id: row.id,
          name: `${row.name} - ${row.section}`,
          section: row.section,
          students: Number(row.student_count ?? 0),
          activities: Number(row.activity_count ?? 0),
        })),
      });
    }

    if (section === 'attendance') {
      const [studentRows] = await pool.query(`
        SELECT s.id, u.name AS name,
          u.email
        FROM student_enrollments se
        JOIN students s ON s.id = se.student_id
        JOIN users u ON u.id = s.user_id
        WHERE se.class_id = ? AND se.status = 'active'
        ORDER BY u.name
      `, [classId]);

      const [attendanceRows] = await pool.query(`
        SELECT student_id, status
        FROM attendance
        WHERE class_id = ? AND date = ?
      `, [classId, selectedDate]);

      const attendanceMap: Record<number, string> = {};
      (attendanceRows as any[]).forEach((row) => {
        attendanceMap[row.student_id] = row.status;
      });

      const attendanceValues = Object.values(attendanceMap);
      const present = attendanceValues.filter((status) => status === 'present').length;
      const absent = attendanceValues.filter((status) => status === 'absent').length;
      const late = attendanceValues.filter((status) => status === 'late').length;
      const excused = attendanceValues.filter((status) => status === 'excused').length;
      const total = (studentRows as any[]).length || 1;
      const rate = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

      return NextResponse.json({
        students: (studentRows as any[]).map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
        })),
        attendance: attendanceMap,
        stats: {
          total: (studentRows as any[]).length,
          present,
          absent,
          late,
          excused,
          rate,
        },
      });
    }

    if (section === 'enrollment') {
      const [enrolledRows] = await pool.query(`
        SELECT s.id, u.name AS name, u.email
        FROM student_enrollments se
        JOIN students s ON s.id = se.student_id
        JOIN users u ON u.id = s.user_id
        WHERE se.class_id = ? AND se.status = 'active'
        ORDER BY u.name
      `, [classId]);

      const [availableRows] = await pool.query(`
        SELECT s.id, u.name AS name, u.email
        FROM students s
        JOIN users u ON u.id = s.user_id
        WHERE s.id NOT IN (
          SELECT student_id FROM student_enrollments WHERE class_id = ? AND status = 'active'
        )
        ORDER BY u.name
      `, [classId]);

      return NextResponse.json({
        enrolled: (enrolledRows as any[]).map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          emoji: '🎓',
        })),
        available: (availableRows as any[]).map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          emoji: '🎓',
        })),
      });
    }

    if (section === 'activity-recorder-grading') {
      const [rows] = await pool.query(`
        SELECT s.id,
          u.name AS name,
          COALESCE(SUM(CASE WHEN a.activity_type = 'quiz' THEN g.score ELSE 0 END), 0) AS quiz1,
          COALESCE(SUM(CASE WHEN a.activity_type = 'assignment' THEN g.score ELSE 0 END), 0) AS quiz2,
          COALESCE(SUM(CASE WHEN a.activity_type = 'assignment' THEN g.score ELSE 0 END), 0) AS activity,
          COALESCE(SUM(CASE WHEN a.activity_type = 'exam' THEN g.score ELSE 0 END), 0) AS exam
        FROM students s
        JOIN users u ON u.id = s.user_id
        LEFT JOIN grades g ON g.student_id = s.id
        LEFT JOIN activities a ON a.id = g.activity_id
        GROUP BY s.id, u.name
        ORDER BY u.name
      `);

      return NextResponse.json({
        students: (rows as any[]).map((row) => ({
          id: row.id,
          name: row.name,
          emoji: '🎓',
          quiz1: Number(row.quiz1 ?? 0),
          quiz2: Number(row.quiz2 ?? 0),
          activity: Number(row.activity ?? 0),
          exam: Number(row.exam ?? 0),
        })),
      });
    }

    if (section === 'create-activity') {
      const [rows] = await pool.query('SELECT id, name FROM classes ORDER BY id ASC');
      return NextResponse.json({
        classes: (rows as any[]).map((row) => ({ id: row.id, name: row.name })),
      });
    }

    return NextResponse.json({ error: 'Unknown teacher section' }, { status: 404 });
  } catch (error: any) {
    console.error('Teacher API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load teacher data' },
      { status: 500 }
    );
  }
}
