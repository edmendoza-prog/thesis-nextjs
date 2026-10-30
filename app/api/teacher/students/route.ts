import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function ensureLifeSpanColumn() {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS life_span INT DEFAULT 100`);
  } catch (err) {
    // Column already exists
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }

    await ensureLifeSpanColumn();

    const { searchParams } = new URL(request.url);
    const sectionId = Number(searchParams.get('sectionId') ?? '0');

    // 1. Total student accounts created / registered
    const [totalRegisteredRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM users WHERE user_type = 'student'`
    );
    const totalRegistered = Number((totalRegisteredRows as any[])[0]?.total ?? 0);

    // 2. Enrolled students count
    let totalEnrolled = 0;
    if (sectionId > 0) {
      const [secEnrolledRows] = await pool.query(
        `SELECT COUNT(DISTINCT student_id) AS total 
         FROM student_enrollments 
         WHERE class_id = ? AND status = 'active'`,
        [sectionId]
      );
      totalEnrolled = Number((secEnrolledRows as any[])[0]?.total ?? 0);
    } else {
      const [totalEnrolledRows] = await pool.query(
        `SELECT COUNT(DISTINCT se.student_id) AS total 
         FROM student_enrollments se 
         JOIN users u ON u.id = se.student_id 
         WHERE u.user_type = 'student' AND se.status = 'active'`
      );
      totalEnrolled = Number((totalEnrolledRows as any[])[0]?.total ?? 0);
    }

    // Helper to calculate stars (1..5)
    const toStars = (lifeSpanVal: any): number => {
      if (lifeSpanVal === null || lifeSpanVal === undefined) return 5;
      const num = Number(lifeSpanVal);
      if (num <= 5) return Math.max(1, Math.min(5, Math.round(num)));
      return Math.max(1, Math.min(5, Math.round(num / 20)));
    };

    // 3. Average Stars
    let averageLifeSpan = 100;
    let averageStars = 5.0;
    if (sectionId > 0) {
      const [avgRows] = await pool.query(
        `SELECT COALESCE(ROUND(AVG(COALESCE(u.life_span, 100)), 1), 100) AS avg_life_span 
         FROM users u
         JOIN student_enrollments se ON se.student_id = u.id AND se.status = 'active'
         WHERE se.class_id = ? AND u.user_type = 'student'`,
        [sectionId]
      );
      const rawAvg = Number((avgRows as any[])[0]?.avg_life_span ?? 100);
      averageLifeSpan = rawAvg;
      averageStars = rawAvg <= 5 ? Math.round(rawAvg * 10) / 10 : Math.round((rawAvg / 20) * 10) / 10;
    } else {
      const [avgLifeSpanRows] = await pool.query(
        `SELECT COALESCE(ROUND(AVG(COALESCE(life_span, 100)), 1), 100) AS avg_life_span 
         FROM users WHERE user_type = 'student'`
      );
      const rawAvg = Number((avgLifeSpanRows as any[])[0]?.avg_life_span ?? 100);
      averageLifeSpan = rawAvg;
      averageStars = rawAvg <= 5 ? Math.round(rawAvg * 10) / 10 : Math.round((rawAvg / 20) * 10) / 10;
    }

    // 4. Fetch students
    let studentRows: any[] = [];
    if (sectionId > 0) {
      const [rows] = await pool.query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.student_number,
          u.avatar_seed,
          u.created_at,
          COALESCE(u.life_span, 100) AS life_span,
          GROUP_CONCAT(DISTINCT CONCAT(c.name, ' - ', c.section) SEPARATOR ', ') AS enrolled_classes,
          COUNT(DISTINCT se.class_id) AS enrolled_classes_count,
          MAX(CASE WHEN se.class_id = ? THEN 1 ELSE 0 END) AS is_enrolled_here
        FROM users u
        LEFT JOIN student_enrollments se ON se.student_id = u.id AND se.status = 'active'
        LEFT JOIN classes c ON c.id = se.class_id
        WHERE u.user_type = 'student'
        GROUP BY u.id
        HAVING is_enrolled_here = 1
        ORDER BY u.name ASC
      `, [sectionId]);
      studentRows = rows as any[];
    } else {
      const [rows] = await pool.query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.student_number,
          u.avatar_seed,
          u.created_at,
          COALESCE(u.life_span, 100) AS life_span,
          GROUP_CONCAT(DISTINCT CONCAT(c.name, ' - ', c.section) SEPARATOR ', ') AS enrolled_classes,
          COUNT(DISTINCT se.class_id) AS enrolled_classes_count
        FROM users u
        LEFT JOIN student_enrollments se ON se.student_id = u.id AND se.status = 'active'
        LEFT JOIN classes c ON c.id = se.class_id
        WHERE u.user_type = 'student'
        GROUP BY u.id
        ORDER BY u.name ASC
      `);
      studentRows = rows as any[];
    }

    const students = studentRows.map((row) => {
      const starsVal = toStars(row.life_span);
      return {
        id: Number(row.id),
        name: String(row.name || 'Unnamed Student'),
        email: String(row.email || ''),
        studentNumber: row.student_number ? String(row.student_number) : null,
        avatarSeed: row.avatar_seed || row.student_number || String(row.id) || 'Student',
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        stars: starsVal,
        lifeSpan: starsVal * 20,
        enrolledClasses: row.enrolled_classes ? String(row.enrolled_classes) : 'Not enrolled in any class',
        enrolledClassesCount: Number(row.enrolled_classes_count ?? 0),
      };
    });

    return NextResponse.json({
      stats: {
        totalRegistered,
        totalEnrolled,
        notEnrolled: Math.max(0, totalRegistered - totalEnrolled),
        averageLifeSpan,
        averageStars: Math.max(1, Math.min(5, averageStars)),
      },
      students,
    });
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    return NextResponse.json({ error: 'Failed to load students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }

    await ensureLifeSpanColumn();

    const body = await request.json();
    const studentId = Number(body.studentId);
    if (!studentId || isNaN(studentId)) {
      return NextResponse.json({ error: 'Valid student ID is required' }, { status: 400 });
    }

    // Fetch current student record
    const [userRows] = await pool.query(
      `SELECT id, name, COALESCE(life_span, 100) AS life_span 
       FROM users WHERE id = ? AND user_type = 'student' LIMIT 1`,
      [studentId]
    );
    const student = (userRows as any[])[0];
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const currentStars = Number(student.life_span) <= 5
      ? Number(student.life_span)
      : Math.max(1, Math.min(5, Math.round(Number(student.life_span) / 20)));

    let newStars: number;
    if (typeof body.stars === 'number') {
      newStars = body.stars;
    } else if (typeof body.delta === 'number') {
      newStars = currentStars + body.delta;
    } else if (typeof body.lifeSpan === 'number') {
      newStars = body.lifeSpan <= 5 ? body.lifeSpan : Math.round(body.lifeSpan / 20);
    } else {
      return NextResponse.json({ error: 'Provide stars or delta value' }, { status: 400 });
    }

    // Clamp between 1 and 5
    newStars = Math.max(1, Math.min(5, Math.round(newStars)));

    await pool.query(
      `UPDATE users SET life_span = ? WHERE id = ?`,
      [newStars * 20, studentId]
    );

    return NextResponse.json({
      success: true,
      studentId,
      studentName: student.name,
      stars: newStars,
      lifeSpan: newStars * 20,
      message: `Updated stars to ${newStars} ⭐ for ${student.name}`,
    });
  } catch (error) {
    console.error('Error updating student stars:', error);
    return NextResponse.json({ error: 'Failed to update stars' }, { status: 500 });
  }
}
