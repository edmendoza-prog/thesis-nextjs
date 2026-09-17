import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = Number(searchParams.get('classId') ?? searchParams.get('sectionId') ?? '0');
    const date = searchParams.get('date');

    if (!classId || !date) {
      return NextResponse.json({ error: 'Missing classId or date' }, { status: 400 });
    }

    const [classRows] = await pool.query(
      'SELECT id, name, section FROM classes WHERE id = ? LIMIT 1',
      [classId]
    );

    if ((classRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const [studentRows] = await pool.query(
      `SELECT u.id, u.name, u.email
      FROM student_enrollments se
      JOIN users u ON u.id = se.student_id
       WHERE se.class_id = ? AND se.status = 'active'
       ORDER BY u.name ASC`,
      [classId]
    );

    const [attendanceRows] = await pool.query(
      `SELECT student_id, status
       FROM attendance
       WHERE class_id = ? AND date = ?`,
      [classId, date]
    );

    const attendanceMap: Record<number, string> = {};
    (attendanceRows as any[]).forEach((row) => {
      attendanceMap[Number(row.student_id)] = row.status;
    });

    return NextResponse.json({
      students: (studentRows as any[]).map((row) => ({
        id: Number(row.id),
        name: row.name,
        email: row.email,
        studentId: row.email,
      })),
      attendance: attendanceMap,
    });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json({ error: 'Failed to load attendance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { action, classId, sectionId, date, attendance } = body;

    if (action === 'save') {
      const resolvedClassId = Number(classId ?? sectionId ?? 0);
      if (!resolvedClassId || !date || !Array.isArray(attendance)) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const [classRows] = await pool.query('SELECT id FROM classes WHERE id = ? LIMIT 1', [resolvedClassId]);
      if ((classRows as any[]).length === 0) {
        return NextResponse.json({ error: 'Selected class does not exist' }, { status: 400 });
      }

      for (const record of attendance) {
        const studentId = Number(record?.student_id ?? 0);
        const status = String(record?.status ?? '').trim();
        if (!studentId || !['present', 'absent', 'late', 'excused'].includes(status)) {
          continue;
        }

        await pool.query(
          `INSERT INTO attendance (class_id, student_id, date, status)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
          [resolvedClassId, studentId, date, status]
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}

