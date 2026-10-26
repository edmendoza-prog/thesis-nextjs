import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function formatDueDate(dateValue?: string | Date | null) {
  if (!dateValue) return 'No due date';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatUploadDate(dateValue?: string | Date | null) {
  if (!dateValue) return 'Recently';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 1. Fetch student info
    const [userRows] = await pool.query(
      `SELECT id, name, student_number, avatar_seed, COALESCE(life_span, 100) AS life_span FROM users WHERE id = ? AND user_type = 'student' LIMIT 1`,
      [userId]
    );
    const studentUser = (userRows as any[])[0];

    // 2. Fetch all classes student is enrolled in
    const [classRows] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.section,
        c.grade_level,
        u.name AS teacher_name
      FROM student_enrollments se
      JOIN classes c ON c.id = se.class_id
      LEFT JOIN users u ON u.id = c.teacher_id
      WHERE se.student_id = ? AND se.status = 'active'
      ORDER BY c.grade_level ASC, c.name ASC
    `, [userId]);

    const enrolledClasses = classRows as any[];
    if (enrolledClasses.length === 0) {
      return NextResponse.json({
        student: {
          id: userId,
          name: studentUser?.name || 'Student',
          avatarSeed: studentUser?.avatar_seed || studentUser?.student_number || String(userId) || 'Student',
          lifeSpan: Math.max(0, Math.min(100, Number(studentUser?.life_span ?? 100))),
          hearts: Number(studentUser?.life_span ?? 100) <= 5
            ? Math.max(1, Number(studentUser?.life_span || 5))
            : Math.max(1, Math.min(5, Math.round(Number(studentUser?.life_span ?? 100) / 20))),
        },
        classes: [],
      });
    }

    const classIds = enrolledClasses.map((c) => c.id);
    const placeholders = classIds.map(() => '?').join(',');

    // 3. Fetch lessons for these classes (only visible ones)
    const [lessonRows] = await pool.query(`
      SELECT 
        l.id,
        l.class_id,
        l.title,
        l.file_name,
        l.file_type,
        l.file_url,
        l.pages_or_duration,
        l.notes,
        l.created_at,
        IF(lr.id IS NOT NULL, 1, 0) AS is_read
      FROM lessons l
      LEFT JOIN lesson_reads lr ON lr.lesson_id = l.id AND lr.student_id = ?
      WHERE l.class_id IN (${placeholders}) AND l.is_visible = 1
      ORDER BY l.created_at DESC
    `, [userId, ...classIds]);

    // 4. Fetch homework / activities for these classes
    const [homeworkRows] = await pool.query(`
      SELECT 
        a.id,
        a.class_id,
        a.title,
        a.description,
        a.activity_type,
        a.total_points,
        a.due_date,
        a.created_at,
        s.score AS submitted_score,
        s.max_score AS submitted_max_score,
        s.status AS submission_status,
        s.submitted_at
      FROM activities a
      LEFT JOIN activity_submissions s ON s.activity_id = a.id AND s.student_id = ?
      WHERE a.class_id IN (${placeholders}) AND a.deleted_at IS NULL
      ORDER BY a.due_date ASC, a.created_at DESC
    `, [userId, ...classIds]);

    const lessonsByClass: Record<number, any[]> = {};
    const homeworkByClass: Record<number, any[]> = {};

    classIds.forEach((id) => {
      lessonsByClass[id] = [];
      homeworkByClass[id] = [];
    });

    (lessonRows as any[]).forEach((l) => {
      lessonsByClass[l.class_id]?.push({
        id: l.id,
        classId: l.class_id,
        title: l.title,
        fileName: l.file_name || 'lesson-material.pdf',
        fileType: l.file_type || 'pdf',
        fileUrl: l.file_url || '',
        pagesOrDuration: l.pages_or_duration || '10 pages',
        notes: l.notes || '',
        uploadDate: formatUploadDate(l.created_at),
        createdAt: l.created_at,
        isRead: Boolean(l.is_read),
      });
    });

    const now = new Date();

    (homeworkRows as any[]).forEach((hw) => {
      const isCompleted = hw.submission_status === 'completed' || (hw.submitted_score !== null && hw.submitted_score !== undefined);
      let isOverdue = false;
      if (!isCompleted && hw.due_date) {
        const dueDate = new Date(hw.due_date);
        if (!Number.isNaN(dueDate.getTime()) && dueDate < now) {
          isOverdue = true;
        }
      }

      let status: 'To do' | 'Overdue' | 'Submitted' | 'Graded' = 'To do';
      if (isCompleted) {
        status = hw.submitted_score !== null && hw.submitted_score !== undefined ? 'Graded' : 'Submitted';
      } else if (isOverdue) {
        status = 'Overdue';
      }

      // Parse question count if stored in description JSON
      let questionCount = 5;
      if (hw.description) {
        try {
          const parsed = JSON.parse(hw.description);
          if (Array.isArray(parsed.questions)) questionCount = parsed.questions.length;
          else if (Array.isArray(parsed.generatedGroups)) {
            const count = parsed.generatedGroups.reduce((acc: number, g: any) => {
              return acc + (Array.isArray(g.questions) ? g.questions.length : 1);
            }, 0);
            if (count > 0) questionCount = count;
          }
        } catch { }
      }

      homeworkByClass[hw.class_id]?.push({
        id: hw.id,
        classId: hw.class_id,
        title: hw.title || 'Untitled Homework',
        dueDate: formatDueDate(hw.due_date),
        dueDateRaw: hw.due_date,
        totalPoints: hw.total_points || 20,
        questionCount,
        status,
        score: hw.submitted_score == null ? null : Number(hw.submitted_score),
        maxScore: hw.submitted_max_score == null ? Number(hw.total_points || 20) : Number(hw.submitted_max_score),
        completed: isCompleted,
      });
    });

    const formattedClasses = enrolledClasses.map((cls) => {
      const classLessons = lessonsByClass[cls.id] || [];
      const classHomework = homeworkByClass[cls.id] || [];

      const totalLessons = classLessons.length;
      const readLessons = classLessons.filter((l) => l.isRead).length;
      const lessonProgress = totalLessons > 0 ? Math.round((readLessons / totalLessons) * 100) : 0;

      const pendingHomework = classHomework.filter((h) => h.status === 'To do' || h.status === 'Overdue');
      const pendingCount = pendingHomework.length;
      const badge = pendingCount > 0 ? `${pendingCount} homework to do` : 'All caught up';

      return {
        id: cls.id,
        name: cls.name,
        section: cls.section || 'General Section',
        gradeLevel: cls.grade_level,
        teacherName: cls.teacher_name || 'Teacher',
        totalLessons,
        readLessons,
        lessonProgress,
        pendingHomeworkCount: pendingCount,
        totalHomeworkCount: classHomework.length,
        badge,
        lessons: classLessons,
        homework: classHomework,
      };
    });

    return NextResponse.json({
      student: {
        id: userId,
        name: studentUser?.name || 'Student',
        avatarSeed: studentUser?.avatar_seed || studentUser?.student_number || String(userId) || 'Student',
        lifeSpan: Math.max(0, Math.min(100, Number(studentUser?.life_span ?? 100))),
        hearts: Number(studentUser?.life_span ?? 100) <= 5
          ? Math.max(1, Number(studentUser?.life_span || 5))
          : Math.max(1, Math.min(5, Math.round(Number(studentUser?.life_span ?? 100) / 20))),
      },
      classes: formattedClasses,
    });
  } catch (error: any) {
    console.error('Student classes fetch error:', error);
    return NextResponse.json({ error: 'Unable to load student classes' }, { status: 500 });
  }
}
