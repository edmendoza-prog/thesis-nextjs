import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function formatUploadDate(dateValue?: string | Date | null) {
  if (!dateValue) return 'Recently';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = Number(searchParams.get('id') || 0);

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    // 1. Fetch requested lesson
    let rawLesson: any = null;
    try {
      const [lessonRows] = await pool.query(
        `SELECT 
          l.id,
          l.class_id,
          l.title,
          l.file_name,
          l.file_type,
          l.file_url,
          l.pages_or_duration,
          l.notes,
          l.bg_image,
          l.created_at,
          c.name AS class_name,
          c.section AS section_name,
          c.grade_level,
          u.name AS teacher_name,
          IF(lr.id IS NOT NULL, 1, 0) AS is_read
        FROM lessons l
        JOIN classes c ON c.id = l.class_id
        LEFT JOIN users u ON u.id = c.teacher_id
        LEFT JOIN lesson_reads lr ON lr.lesson_id = l.id AND lr.student_id = ?
        WHERE l.id = ?
        LIMIT 1`,
        [user.id, lessonId]
      );
      const rows = lessonRows as any[];
      if (rows.length > 0) rawLesson = rows[0];
    } catch {
      const [lessonRows] = await pool.query(
        `SELECT 
          l.id,
          l.class_id,
          l.title,
          l.file_name,
          l.file_type,
          l.file_url,
          l.pages_or_duration,
          l.notes,
          l.created_at,
          c.name AS class_name,
          c.section AS section_name,
          c.grade_level,
          u.name AS teacher_name,
          IF(lr.id IS NOT NULL, 1, 0) AS is_read
        FROM lessons l
        JOIN classes c ON c.id = l.class_id
        LEFT JOIN users u ON u.id = c.teacher_id
        LEFT JOIN lesson_reads lr ON lr.lesson_id = l.id AND lr.student_id = ?
        WHERE l.id = ?
        LIMIT 1`,
        [user.id, lessonId]
      );
      const rows = lessonRows as any[];
      if (rows.length > 0) rawLesson = rows[0];
    }

    if (!rawLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const classId = rawLesson.class_id;

    // 2. Fetch sibling lessons in the same class
    let siblingRows: any[] = [];
    try {
      const [rows] = await pool.query(
        `SELECT 
          l.id,
          l.class_id,
          l.title,
          l.file_name,
          l.file_type,
          l.file_url,
          l.pages_or_duration,
          l.notes,
          l.bg_image,
          l.created_at,
          IF(lr.id IS NOT NULL, 1, 0) AS is_read
        FROM lessons l
        LEFT JOIN lesson_reads lr ON lr.lesson_id = l.id AND lr.student_id = ?
        WHERE l.class_id = ? AND l.is_visible = 1
        ORDER BY l.created_at ASC, l.id ASC`,
        [user.id, classId]
      );
      siblingRows = rows as any[];
    } catch {
      const [rows] = await pool.query(
        `SELECT 
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
        WHERE l.class_id = ? AND l.is_visible = 1
        ORDER BY l.created_at ASC, l.id ASC`,
        [user.id, classId]
      );
      siblingRows = rows as any[];
    }

    const siblings = siblingRows.map((s) => ({
      id: s.id,
      classId: s.class_id,
      title: s.title,
      fileName: s.file_name || 'lesson-material.pdf',
      fileType: s.file_type || 'pdf',
      fileUrl: s.file_url || '',
      pagesOrDuration: s.pages_or_duration || '10 pages',
      notes: s.notes || '',
      bgImage: s.bg_image || '/images/lesson_upload_bg.jpg',
      uploadDate: formatUploadDate(s.created_at),
      createdAt: s.created_at,
      isRead: Boolean(s.is_read),
    }));

    return NextResponse.json({
      lesson: {
        id: rawLesson.id,
        classId: rawLesson.class_id,
        className: rawLesson.class_name,
        sectionName: rawLesson.section_name || 'General Section',
        gradeLevel: rawLesson.grade_level,
        teacherName: rawLesson.teacher_name || 'Teacher',
        title: rawLesson.title,
        fileName: rawLesson.file_name || 'lesson-material.pdf',
        fileType: rawLesson.file_type || 'pdf',
        fileUrl: rawLesson.file_url || '',
        pagesOrDuration: rawLesson.pages_or_duration || '10 pages',
        notes: rawLesson.notes || '',
        bgImage: rawLesson.bg_image || '/images/lesson_upload_bg.jpg',
        uploadDate: formatUploadDate(rawLesson.created_at),
        createdAt: rawLesson.created_at,
        isRead: Boolean(rawLesson.is_read),
      },
      classLessons: siblings,
    });
  } catch (error: any) {
    console.error('Lesson detail fetch error:', error);
    return NextResponse.json({ error: error.message || 'Unable to fetch lesson detail' }, { status: 500 });
  }
}
