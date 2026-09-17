import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

async function insertClassWithFallback(name: string, sectionName: string, teacherId: number) {
  try {
    const [result] = await pool.query(
      'INSERT INTO classes (name, grade_level, section, teacher_id) VALUES (?, ?, ?, ?)',
      [name, 0, sectionName, teacherId]
    );
    return result;
  } catch {
    const [result] = await pool.query(
      'INSERT INTO classes (name, grade_level, section, teacher_user_id) VALUES (?, ?, ?, ?)',
      [name, 0, sectionName, teacherId]
    );
    return result;
  }
}

async function saveAttendanceWithFallback(classId: number, studentId: number, date: string, status: string) {
  await pool.query(
    `INSERT INTO attendance (student_id, class_id, date, status)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
    [studentId, classId, date, status]
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params;

  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;

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

      const result = await insertClassWithFallback(name, sectionName, userId);
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

        await saveAttendanceWithFallback(classId, studentId, date, status);
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

      const [classRows] = await pool.query('SELECT id FROM classes WHERE id = ? AND teacher_id = ? LIMIT 1', [classId, userId]);
      if ((classRows as any[]).length === 0) {
        return NextResponse.json({ error: 'Selected class does not exist or unauthorized.' }, { status: 400 });
      }

      const uniqueStudentIds = [...new Set(enrolledIds)];

      for (const studentId of uniqueStudentIds) {
        const [studentRows] = await pool.query(
          'SELECT id FROM users WHERE id = ? AND user_type = "student" LIMIT 1',
          [studentId]
        );

        if ((studentRows as any[]).length === 0) {
          return NextResponse.json({ error: `Student ${studentId} is not a valid student account.` }, { status: 400 });
        }
      }

      const [existingRows] = await pool.query(
        'SELECT student_id FROM student_enrollments WHERE class_id = ?',
        [classId]
      );

      const existingIds = new Set<number>((existingRows as any[]).map((row) => Number(row.student_id)));
      const finalIds = new Set<number>(uniqueStudentIds);

      for (const studentId of [...existingIds]) {
        if (!finalIds.has(studentId)) {
          await pool.query('DELETE FROM student_enrollments WHERE class_id = ? AND student_id = ?', [classId, studentId]);
        }
      }

      for (const studentId of [...finalIds]) {
        if (!existingIds.has(studentId)) {
          await pool.query(
            'INSERT INTO student_enrollments (student_id, class_id, enrolled_by, status) VALUES (?, ?, ?, "active") ON DUPLICATE KEY UPDATE enrolled_by = VALUES(enrolled_by), status = "active"',
            [studentId, classId, userId]
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
      const generatedQuestions = Array.isArray(body?.generated_questions)
        ? body.generated_questions
        : Array.isArray(body?.generatedGroups)
          ? body.generatedGroups
          : [];

      if (!title || !classId) {
        return NextResponse.json({ error: 'Activity title and class are required' }, { status: 400 });
      }

      const [classRows] = await pool.query('SELECT id FROM classes WHERE id = ? LIMIT 1', [classId]);
      if ((classRows as any[]).length === 0) {
        return NextResponse.json({ error: 'Selected class does not exist in the database.' }, { status: 400 });
      }

      const descriptionPayload = {
        subject,
        visibility,
        badge,
        activityType,
        generatedGroups: generatedQuestions,
      };

      const descriptionText = generatedQuestions.length > 0
        ? JSON.stringify(descriptionPayload)
        : `${subject}${visibility ? ` • ${visibility}` : ''}${badge ? ` • ${badge}` : ''}`;

      const [result] = await pool.query(
        'INSERT INTO activities (title, description, class_id, activity_type, total_points, due_date, created_by_user_id) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?)',
        [title, descriptionText, classId, activityType, totalPoints, userId]
      );

      return NextResponse.json({
        message: 'Activity created successfully',
        activity: { id: (result as any).insertId, title, generatedGroups: generatedQuestions },
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
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;



    if (section === 'dashboard') {
      const [classRows] = await pool.query('SELECT id FROM classes WHERE teacher_id = ?', [userId]);
      const classIds = (classRows as any[]).map((r) => Number(r.id));

      let totalStudents = 0;
      let totalActivities = 0;
      let completedActivities = 0;
      let averageScore = 0;
      let recentRows: any[] = [];
      let upcomingRows: any[] = [];

      if (classIds.length > 0) {
        const placeholders = classIds.map(() => '?').join(',');
        const [studentRows] = await pool.query(`SELECT COUNT(DISTINCT student_id) AS total FROM student_enrollments WHERE class_id IN (${placeholders}) AND status = 'active'`, classIds);
        const [activityRows] = await pool.query(`SELECT COUNT(*) AS total FROM activities WHERE class_id IN (${placeholders}) OR created_by_user_id = ?`, [...classIds, userId]);
        const [gradeRows] = await pool.query(`SELECT COUNT(*) AS total FROM activity_submissions s JOIN activities a ON a.id = s.activity_id WHERE a.class_id IN (${placeholders})`, classIds);
        const [averageRows] = await pool.query(`SELECT COALESCE(ROUND(AVG((s.score / s.max_score) * 100), 1), 0) AS value FROM activity_submissions s JOIN activities a ON a.id = s.activity_id WHERE a.class_id IN (${placeholders})`, classIds);

        const [rRows] = await pool.query(`
          SELECT 
            u.name AS student_name,
            a.title AS activity_title,
            ROUND((s.score / s.max_score) * 100, 2) AS percentage,
            s.submitted_at AS time_graded
          FROM activity_submissions s
          LEFT JOIN users u ON u.id = s.student_id
          LEFT JOIN activities a ON a.id = s.activity_id
          WHERE a.class_id IN (${placeholders})
          ORDER BY s.submitted_at DESC
          LIMIT 4
        `, classIds);
        recentRows = rRows as any[];

        const [upRows] = await pool.query(`
          SELECT a.id, a.title, c.name AS grade_name, DATE_FORMAT(a.due_date, '%b %e') AS due_date,
            'SCHEDULED' AS status,
            'bg-accent-500 text-white' AS statusColor
          FROM activities a
          LEFT JOIN classes c ON c.id = a.class_id
          WHERE a.class_id IN (${placeholders}) AND a.due_date IS NOT NULL
          ORDER BY a.due_date ASC
          LIMIT 3
        `, classIds);
        upcomingRows = upRows as any[];

        totalStudents = Number((studentRows as any[])[0]?.total ?? 0);
        totalActivities = Number((activityRows as any[])[0]?.total ?? 0);
        completedActivities = Number((gradeRows as any[])[0]?.total ?? 0);
        averageScore = Number((averageRows as any[])[0]?.value ?? 0);
      }

      return NextResponse.json({
        stats: [
          { label: 'Total Students', value: String(totalStudents), delta: '+0', icon: 'users', iconColor: 'bg-accent-100', iconTextColor: 'text-accent-600' },
          { label: 'Active Activities', value: String(totalActivities), delta: '+0', icon: 'activity', iconColor: 'bg-secondary-100', iconTextColor: 'text-secondary-600' },
          { label: 'Completed Activities', value: String(completedActivities), delta: '+0', icon: 'check-circle', iconColor: 'bg-accent-100', iconTextColor: 'text-accent-600' },
          { label: 'Average Class Score', value: `${averageScore}%`, delta: '+0%', icon: 'chart', iconColor: 'bg-secondary-100', iconTextColor: 'text-secondary-600' },
        ],
        recentActivity: (recentRows as any[]).map((row, index) => ({
          name: row.student_name || `Student ${index + 1}`,
          initials: (row.student_name || 'S').split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase(),
          color: index % 2 === 0 ? 'bg-secondary-200' : 'bg-primary-200',
          action: row.activity_title ? `Completed ${row.activity_title}` : 'Recent classroom activity',
          score: row.percentage != null ? `${row.percentage}%` : '',
          time: row.time_graded ? new Date(row.time_graded).toLocaleString() : 'Recently',
        })),
        notifications: [
          {
            title: totalStudents > 0 ? `${totalStudents} student${totalStudents === 1 ? '' : 's'} enrolled` : 'No students enrolled yet',
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
        ],
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
        WHERE c.teacher_id = ?
        GROUP BY c.id, c.name, c.section
        ORDER BY c.id ASC
      `, [userId]);

      return NextResponse.json({
        grades: (rows as any[]).map((row) => ({
          id: row.id,
          name: String(row.name),
          section: row.section,
          students: Number(row.student_count ?? 0),
          activities: Number(row.activity_count ?? 0),
          sections: [],
        })),
      });
    }

    if (section === 'attendance') {
      const [studentRows] = await pool.query(`
        SELECT u.id, u.name AS name, u.email
        FROM student_enrollments se
        JOIN users u ON u.id = se.student_id
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
      const [classRows] = await pool.query('SELECT id FROM classes WHERE id = ? AND teacher_id = ? LIMIT 1', [classId, userId]);
      if ((classRows as any[]).length === 0) {
        return NextResponse.json({ enrolled: [], available: [] });
      }

      const [enrolledRows] = await pool.query(`
        SELECT u.id, u.name AS name, u.email
        FROM student_enrollments se
        JOIN users u ON u.id = se.student_id
        WHERE se.class_id = ? AND se.status = 'active'
        ORDER BY u.name
      `, [classId]);

      const [availableRows] = await pool.query(`
        SELECT u.id, u.name AS name, u.email
        FROM users u
        WHERE u.user_type = 'student'
          AND u.id NOT IN (
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
      const [classRows] = await pool.query('SELECT id FROM classes WHERE teacher_id = ?', [userId]);
      const classIds = (classRows as any[]).map((r) => Number(r.id));

      if (classIds.length === 0) {
        return NextResponse.json({ students: [] });
      }

      const placeholders = classIds.map(() => '?').join(',');

      const [rows] = await pool.query(`
        SELECT u.id,
          u.name AS name,
          COALESCE(SUM(CASE WHEN a.activity_type = 'quiz' THEN s.score ELSE 0 END), 0) AS quiz1,
          COALESCE(SUM(CASE WHEN a.activity_type = 'assignment' THEN s.score ELSE 0 END), 0) AS quiz2,
          COALESCE(SUM(CASE WHEN a.activity_type = 'assignment' THEN s.score ELSE 0 END), 0) AS activity,
          COALESCE(SUM(CASE WHEN a.activity_type = 'exam' THEN s.score ELSE 0 END), 0) AS exam
        FROM users u
        JOIN student_enrollments se ON se.student_id = u.id AND se.class_id IN (${placeholders}) AND se.status = 'active'
        LEFT JOIN activity_submissions s ON s.student_id = u.id
        LEFT JOIN activities a ON a.id = s.activity_id AND a.class_id IN (${placeholders})
        WHERE u.user_type = 'student'
        GROUP BY u.id, u.name
        ORDER BY u.name
      `, [...classIds, ...classIds]);

      return NextResponse.json({
        students: (rows as any[]).map((row) => ({
          id: Number(row.id),
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
      const [rows] = await pool.query(
        'SELECT id, name FROM classes WHERE teacher_id = ? ORDER BY id ASC',
        [userId]
      );
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

