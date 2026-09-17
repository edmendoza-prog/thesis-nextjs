import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');



    const [rows] = await pool.query(`
      SELECT c.id,
             c.name,
             c.section,
             COUNT(DISTINCT se.student_id) AS student_count,
             COUNT(DISTINCT a.id) AS activity_count
      FROM classes c
      LEFT JOIN student_enrollments se
        ON se.class_id = c.id AND se.status = 'active'
      LEFT JOIN activities a
        ON a.class_id = c.id
      WHERE c.teacher_id = ? AND c.deleted_at IS NULL
      GROUP BY c.id, c.name, c.section
      ORDER BY c.id ASC
    `, [userId]);

    const [studentRows] = await pool.query(`
      SELECT se.class_id, u.id, u.name, COALESCE(u.student_number, u.email) AS student_number
      FROM student_enrollments se
      JOIN classes c ON c.id = se.class_id
      JOIN users u ON u.id = se.student_id
      WHERE se.status = 'active' AND c.teacher_id = ?
      ORDER BY u.name ASC
    `, [userId]);

    const [availableStudentRows] = await pool.query(`
      SELECT u.id, u.name, u.email
      FROM users u
      WHERE u.user_type = 'student'
        AND u.id NOT IN (
          SELECT student_id FROM student_enrollments se
          JOIN classes c ON c.id = se.class_id
          WHERE c.teacher_id = ? AND se.status = 'active'
        )
      ORDER BY u.name ASC
    `, [userId]);

    const [attendanceRows] = await pool.query(`
      SELECT a.class_id, a.student_id, DATE_FORMAT(a.date, '%Y-%m-%d') AS date, a.status
      FROM attendance a
      JOIN classes c ON c.id = a.class_id
      WHERE c.teacher_id = ?
      ORDER BY a.date DESC
    `, [userId]);

    const [scoreRows] = await pool.query(`
      SELECT a.class_id, a.id AS activity_id, a.title, a.total_points, a.due_date, s.student_id, s.score, s.max_score, ROUND((s.score / s.max_score) * 100, 1) AS percentage
      FROM activity_submissions s
      JOIN activities a ON a.id = s.activity_id
      JOIN classes c ON c.id = a.class_id
      WHERE c.teacher_id = ? AND a.deleted_at IS NULL
      ORDER BY a.due_date ASC, a.created_at ASC
    `, [userId]);

    const [activityRows] = await pool.query(`
      SELECT a.id, a.class_id, a.title, a.total_points, a.due_date
      FROM activities a
      JOIN classes c ON c.id = a.class_id
      WHERE c.teacher_id = ? AND a.deleted_at IS NULL
      ORDER BY a.due_date ASC, a.created_at ASC
    `, [userId]);

    const activitiesByClass = new Map<number, any[]>();
    (activityRows as any[]).forEach((activity) => {
      const activities = activitiesByClass.get(Number(activity.class_id)) ?? [];
      activities.push({ id: Number(activity.id), title: activity.title, maxScore: Number(activity.total_points ?? 100), dueDate: activity.due_date });
      activitiesByClass.set(Number(activity.class_id), activities);
    });
    const studentsByClass = new Map<number, any[]>();
    (studentRows as any[]).forEach((student) => {
      const list = studentsByClass.get(Number(student.class_id)) ?? [];
      list.push(student);
      studentsByClass.set(Number(student.class_id), list);
    });
    const attendanceByStudent = new Map<string, any>();
    (attendanceRows as any[]).forEach((row) => {
      const dateStr = String(row.date ?? '').slice(0, 10);
      attendanceByStudent.set(`${row.class_id}:${row.student_id}:${dateStr}`, row);
    });
    const scoreByStudent = new Map<string, number>();
    const scoreCounts = new Map<string, number>();
    const assessmentsByStudent = new Map<string, any[]>();
    (scoreRows as any[]).forEach((row) => {
      const studentKey = `${row.class_id}:${row.student_id}`;
      const percentage = Number(row.percentage ?? 0);
      const assessments = assessmentsByStudent.get(studentKey) ?? [];
      assessments.push({ id: Number(row.activity_id), title: row.title, score: row.score == null ? undefined : Number(row.score), maxScore: Number(row.max_score ?? row.total_points ?? 100), percentage });
      assessmentsByStudent.set(studentKey, assessments);
      scoreByStudent.set(studentKey, (scoreByStudent.get(studentKey) ?? 0) + percentage);
      scoreCounts.set(studentKey, (scoreCounts.get(studentKey) ?? 0) + 1);
    });
    scoreByStudent.forEach((total, studentKey) => scoreByStudent.set(studentKey, Number((total / (scoreCounts.get(studentKey) ?? 1)).toFixed(1))));
    let dates: string[] = [];
    if (startDateParam && endDateParam) {
      const [sy, sm, sd] = startDateParam.split('-').map(Number);
      const [ey, em, ed] = endDateParam.split('-').map(Number);
      if (sy && sm && sd && ey && em && ed) {
        const cur = new Date(sy, sm - 1, sd, 12, 0, 0);
        const end = new Date(ey, em - 1, ed, 12, 0, 0);
        const maxDays = 31;
        let count = 0;
        while (cur <= end && count < maxDays) {
          const y = cur.getFullYear();
          const m = String(cur.getMonth() + 1).padStart(2, '0');
          const d = String(cur.getDate()).padStart(2, '0');
          dates.push(`${y}-${m}-${d}`);
          cur.setDate(cur.getDate() + 1);
          count++;
        }
      }
    }

    if (dates.length === 0) {
      const today = new Date();
      dates = Array.from({ length: 7 }, (_, index) => {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - index), 12, 0, 0);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      });
    }

    return NextResponse.json({
      grades: (rows as any[]).map((row) => {
        const sectionName = String(row.section ?? '').trim() || 'Main Section';
        const classStudents = studentsByClass.get(Number(row.id)) ?? [];
        return {
          id: Number(row.id),
          name: String(row.name),
          section: row.section ?? '',
          students: Number(row.student_count ?? 0),
          activities: Number(row.activity_count ?? 0),
          sections: [{
            id: Number(row.id),
            name: sectionName,
            activities: activitiesByClass.get(Number(row.id)) ?? [],
            studentList: classStudents.map((student) => {
              const percentage = scoreByStudent.get(`${row.id}:${student.id}`) ?? 0;
              return {
                id: String(student.student_number),
                userId: Number(student.id),
                name: student.name,
                percentage,
                status: percentage >= 90 ? 'Excellent' : percentage >= 75 ? 'Good' : 'Needs Improvement',
                attendance: dates.map((date) => {
                  const record = attendanceByStudent.get(`${row.id}:${student.id}:${date}`);
                  const status = record?.status ? String(record.status) : 'unmarked';
                  return {
                    date,
                    status,
                    attended: status === 'present' || status === 'late',
                  };
                }),
                assessments: assessmentsByStudent.get(`${row.id}:${student.id}`) ?? [],
              };
            }),
          }],
        };
      }),
      dates,
      availableStudents: (availableStudentRows as any[]).map((student) => ({
        id: String(student.id),
        userId: Number(student.id),
        name: student.name,
        percentage: 0,
        status: 'Needs Improvement',
        attendance: [],
        assessments: [],
      })),
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const body = await request.json();

    if (body?.action === 'save-score') {
      const studentId = Number(body.studentId ?? 0);
      const activityId = Number(body.activityId ?? 0);
      const score = Number(body.score ?? 0);
      const maxScore = Number(body.maxScore ?? 100);
      if (!studentId || !activityId || !Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0 || score < 0 || score > maxScore) {
        return NextResponse.json({ error: 'Valid student, activity, score, and maximum score are required' }, { status: 400 });
      }

      await pool.query(
        `INSERT INTO activity_submissions (student_id, activity_id, score, max_score, graded_by, status, submitted_at)
         VALUES (?, ?, ?, ?, ?, 'completed', CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE score = VALUES(score), max_score = VALUES(max_score), graded_by = VALUES(graded_by), updated_at = CURRENT_TIMESTAMP`,
        [studentId, activityId, score, maxScore, userId],
      );

      return NextResponse.json({ success: true, score, maxScore, percentage: Number(((score / maxScore) * 100).toFixed(1)) });
    }

    if (body?.action === 'save-attendance') {
      const classId = Number(body.classId ?? 0);
      const studentId = Number(body.studentId ?? 0);
      const date = String(body.date ?? '').slice(0, 10);
      const validStatuses = ['present', 'absent', 'late', 'excused'];
      const status = body.status;

      if (!classId || !studentId || !date) {
        return NextResponse.json({ error: 'Class ID, student ID, and valid date are required' }, { status: 400 });
      }

      if (status === 'unmarked' || status === 'clear' || !status) {
        await pool.query('DELETE FROM attendance WHERE class_id = ? AND student_id = ? AND date = ?', [classId, studentId, date]);
        return NextResponse.json({ success: true, classId, studentId, date, status: 'unmarked' });
      }

      if (validStatuses.includes(status)) {
        await pool.query(
          `INSERT INTO attendance (class_id, student_id, date, status)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
          [classId, studentId, date, status]
        );
        return NextResponse.json({ success: true, classId, studentId, date, status });
      }

      return NextResponse.json({ error: 'Invalid attendance status' }, { status: 400 });
    }

    if (body?.action === 'remove-student' || body?.action === 'delete-student') {
      const classId = Number(body.classId ?? body.id ?? 0);
      const studentId = Number(body.studentId ?? body.userId ?? 0);

      if (!classId || !studentId) {
        return NextResponse.json({ error: 'Class ID and student ID are required' }, { status: 400 });
      }

      // Check if studentId is a users.id, or lookup by student_number/email
      let targetStudentId = studentId;
      const [userCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [studentId]);
      if (!(userCheck as any[])[0]) {
        const [userByNum] = await pool.query(`
          SELECT u.id FROM users u
          WHERE u.student_number = ? OR u.email = ?
          LIMIT 1
        `, [String(body.studentId), String(body.studentId)]);
        if ((userByNum as any[])[0]) {
          targetStudentId = Number((userByNum as any[])[0].id);
        }
      }

      await pool.query(
        'DELETE FROM student_enrollments WHERE class_id = ? AND student_id = ?',
        [classId, targetStudentId]
      );

      return NextResponse.json({ success: true, message: 'Student removed successfully' });
    }

    if (body?.action === 'edit-class' || body?.action === 'update-class') {
      const classId = Number(body.id ?? 0);
      const name = String(body.name ?? '').trim();
      if (!classId || !name) {
        return NextResponse.json({ error: 'Class ID and valid name are required' }, { status: 400 });
      }
      await pool.query(
        'UPDATE classes SET name = ? WHERE id = ? AND teacher_id = ?',
        [name, classId, userId]
      );
      return NextResponse.json({ success: true, message: 'Class updated successfully' });
    }

    if (body?.action === 'edit-section' || body?.action === 'update-section') {
      const classId = Number(body.id ?? 0);
      const section = String(body.section ?? '').trim();
      if (!classId || !section) {
        return NextResponse.json({ error: 'Class ID and valid section name are required' }, { status: 400 });
      }
      await pool.query(
        'UPDATE classes SET section = ? WHERE id = ? AND teacher_id = ?',
        [section, classId, userId]
      );
      return NextResponse.json({ success: true, message: 'Section updated successfully' });
    }

    if (body?.action === 'add-section') {
      const className = String(body.name ?? body.className ?? '').trim();
      const classId = Number(body.classId ?? body.id ?? 0);
      const section = String(body.section ?? '').trim();
      if (!section) {
        return NextResponse.json({ error: 'Section name is required' }, { status: 400 });
      }

      let targetName = className;
      let targetGradeLevel = 0;

      if (!targetName && classId) {
        const [existingClass] = await pool.query(
          'SELECT name, grade_level FROM classes WHERE id = ? AND teacher_id = ? LIMIT 1',
          [classId, userId]
        );
        const baseClass = (existingClass as any[])[0];
        if (baseClass) {
          targetName = baseClass.name;
          targetGradeLevel = baseClass.grade_level ?? 0;
        }
      }

      if (targetName && !targetGradeLevel) {
        const [existingByName] = await pool.query(
          'SELECT grade_level FROM classes WHERE name = ? AND teacher_id = ? LIMIT 1',
          [targetName, userId]
        );
        if ((existingByName as any[])[0]) {
          targetGradeLevel = (existingByName as any[])[0].grade_level ?? 1;
        } else {
          const match = targetName.match(/(\d+)/);
          targetGradeLevel = match ? parseInt(match[1], 10) : 1;
        }
      }

      if (!targetName) {
        return NextResponse.json({ error: 'Class name or valid class ID is required' }, { status: 400 });
      }

      const [insertResult] = await pool.query(
        'INSERT INTO classes (name, grade_level, section, teacher_id) VALUES (?, ?, ?, ?)',
        [targetName, targetGradeLevel, section, userId]
      );
      return NextResponse.json({
        success: true,
        grade: {
          id: (insertResult as any).insertId,
          name: targetName,
          section,
          students: 0,
          activities: 0,
        },
      });
    }

    if (body?.action === 'update-class-name') {
      const oldName = String(body.oldName ?? '').trim();
      const newName = String(body.name ?? '').trim();
      if (!oldName || !newName) {
        return NextResponse.json({ error: 'Old and new class names are required' }, { status: 400 });
      }
      await pool.query(
        'UPDATE classes SET name = ? WHERE name = ? AND teacher_id = ?',
        [newName, oldName, userId]
      );
      return NextResponse.json({ success: true, message: 'Class name updated successfully' });
    }

    if (body?.action === 'delete-class-group') {
      const className = String(body.name ?? '').trim();
      if (!className) {
        return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
      }
      await pool.query(
        'DELETE FROM classes WHERE name = ? AND teacher_id = ?',
        [className, userId]
      );
      return NextResponse.json({ success: true, message: 'Class group deleted successfully' });
    }

    if (body?.action === 'delete-class' || body?.action === 'delete') {
      const classId = Number(body.id ?? 0);
      if (!classId) {
        return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
      }
      await pool.query(
        'DELETE FROM classes WHERE id = ? AND teacher_id = ?',
        [classId, userId]
      );
      return NextResponse.json({ success: true, message: 'Class deleted successfully' });
    }

    const { name, section } = body ?? {};

    if (!name || !section) {
      return NextResponse.json(
        { error: 'Grade name and section are required' },
        { status: 400 }
      );
    }

    const classNameStr = String(name).trim();
    let sectionStr = String(section).trim() || 'Section A';
    const match = classNameStr.match(/(\d+)/);
    const gradeLevel = match ? parseInt(match[1], 10) : 1;

    // Check if section name already exists for this class name
    const [existingSections] = await pool.query(
      'SELECT section FROM classes WHERE name = ? AND teacher_id = ?',
      [classNameStr, userId]
    );
    const usedSections = new Set((existingSections as any[]).map((r) => String(r.section)));
    if (usedSections.has(sectionStr)) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let i = 0; i < letters.length; i++) {
        const candidate = `Section ${letters[i]}`;
        if (!usedSections.has(candidate)) {
          sectionStr = candidate;
          break;
        }
      }
    }

    const [result] = await pool.query(
      'INSERT INTO classes (name, grade_level, section, teacher_id) VALUES (?, ?, ?, ?)',
      [classNameStr, gradeLevel, sectionStr, userId]
    );

    return NextResponse.json({
      success: true,
      grade: {
        id: (result as any).insertId,
        name: String(name).trim(),
        section: String(section).trim(),
        students: 0,
        activities: 0,
      },
      message: 'Grade created successfully',
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id') ?? 0);
    if (!id) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }
    await pool.query('DELETE FROM classes WHERE id = ? AND teacher_id = ?', [id, userId]);
    return NextResponse.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}

