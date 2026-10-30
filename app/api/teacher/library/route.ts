import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function formatSectionDisplayName(name: string, section: string): string {
  const cleanName = (name || '').trim();
  const cleanSec = (section || '').trim();
  
  if (!cleanSec) return cleanName || 'General Section';
  if (cleanName.toLowerCase().includes(cleanSec.toLowerCase())) return cleanName;
  if (!cleanName) return cleanSec;
  return `${cleanName} - ${cleanSec}`;
}

function parseActivityStatus(description: string | null, deletedAt: string | null): 'Published' | 'Draft' | 'Archived' {
  if (deletedAt) return 'Archived';
  if (!description) return 'Published';

  try {
    const parsed = JSON.parse(description);
    if (parsed.status === 'Draft' || parsed.status === 'draft') return 'Draft';
    if (parsed.status === 'Archived' || parsed.status === 'archived') return 'Archived';
    if (parsed.status === 'Published' || parsed.status === 'published') return 'Published';
  } catch {
    if (description.toLowerCase().includes('draft')) return 'Draft';
    if (description.toLowerCase().includes('archive')) return 'Archived';
  }

  return 'Published';
}

function formatActivityType(type: string): string {
  const clean = (type || 'quiz').toLowerCase();
  if (clean === 'quiz') return 'Quiz';
  if (clean === 'exam') return 'Exam';
  if (clean === 'assignment') return 'Assignment';
  if (clean === 'game') return 'Game';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function formatDate(dateString: string | Date | null): string {
  if (!dateString) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(dateString);
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    // Fetch all classes/sections created by or assigned to this teacher
    const [classRows] = await pool.query(`
      SELECT 
        c.id, 
        c.name, 
        c.section, 
        c.grade_level,
        COUNT(DISTINCT se.student_id) AS student_count,
        COUNT(DISTINCT a.id) AS activity_count,
        COUNT(DISTINCT l.id) AS lesson_count
      FROM classes c
      LEFT JOIN student_enrollments se ON se.class_id = c.id AND se.status = 'active'
      LEFT JOIN activities a ON a.class_id = c.id AND a.deleted_at IS NULL
      LEFT JOIN lessons l ON l.class_id = c.id
      WHERE c.teacher_id = ?
      GROUP BY c.id, c.name, c.section, c.grade_level
      ORDER BY c.grade_level ASC, c.name ASC, c.section ASC
    `, [userId]);

    const sections = (classRows as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      section: row.section,
      displayName: formatSectionDisplayName(row.name, row.section),
      gradeLevel: Number(row.grade_level || 0),
      studentCount: Number(row.student_count || 0),
      activityCount: Number(row.activity_count || 0),
      lessonCount: Number(row.lesson_count || 0),
    }));

    let activities: any[] = [];
    let lessons: any[] = [];

    if (sections.length > 0) {
      const classIds = sections.map((s) => s.id);
      const placeholders = classIds.map(() => '?').join(',');

      // Fetch all activities (homework/quizzes) with submission counts
      const [actRows] = await pool.query(`
        SELECT 
          a.id,
          a.title,
          a.description,
          a.class_id,
          a.activity_type,
          a.total_points,
          a.due_date,
          a.created_at,
          a.updated_at,
          a.deleted_at,
          c.name AS class_name,
          c.section AS class_section,
          COUNT(DISTINCT s.student_id) AS submitted_count
        FROM activities a
        JOIN classes c ON c.id = a.class_id
        LEFT JOIN activity_submissions s ON s.activity_id = a.id AND s.status = 'completed'
        WHERE (a.class_id IN (${placeholders}) OR a.created_by_user_id = ?) AND a.deleted_at IS NULL
        GROUP BY a.id
        ORDER BY a.created_at DESC
      `, [...classIds, userId]);

      activities = (actRows as any[]).map((act) => {
        let questionCount = 0;
        let questions: any[] = [];
        if (act.description) {
          try {
            const parsed = JSON.parse(act.description);
            if (Array.isArray(parsed.questions)) {
              questionCount = parsed.questions.length;
              questions = parsed.questions;
            } else if (Array.isArray(parsed.generatedGroups)) {
              questions = parsed.generatedGroups;
              questionCount = parsed.generatedGroups.reduce((acc: number, g: any) => {
                return acc + (Array.isArray(g.questions) ? g.questions.length : 1);
              }, 0);
            }
          } catch {}
        }

        const currentSection = sections.find((s) => s.id === act.class_id);
        const totalStudents = currentSection?.studentCount || 0;

        return {
          id: act.id,
          title: act.title,
          description: act.description,
          classId: act.class_id,
          sectionName: formatSectionDisplayName(act.class_name, act.class_section),
          type: formatActivityType(act.activity_type),
          rawType: act.activity_type,
          totalPoints: act.total_points || 20,
          questionCount: questionCount || 4,
          questions,
          submittedCount: Number(act.submitted_count || 0),
          totalStudents,
          submissionProgress: `${Number(act.submitted_count || 0)} / ${totalStudents} submitted`,
          dueDate: act.due_date ? formatDate(act.due_date) : 'No due date',
          dueDateRaw: act.due_date,
          dateCreated: formatDate(act.created_at),
          createdAtRaw: act.created_at,
          status: parseActivityStatus(act.description, act.deleted_at),
        };
      });

      // Fetch all lessons
      let lessonRows: any[] = [];
      try {
        const [rows] = await pool.query(`
          SELECT 
            l.id,
            l.class_id,
            l.title,
            l.file_name,
            l.file_type,
            l.file_url,
            l.pages_or_duration,
            l.notes,
            l.bg_image,
            l.is_visible,
            l.created_at,
            c.name AS class_name,
            c.section AS class_section,
            COUNT(DISTINCT lr.student_id) AS read_count
          FROM lessons l
          JOIN classes c ON c.id = l.class_id
          LEFT JOIN lesson_reads lr ON lr.lesson_id = l.id
          WHERE l.class_id IN (${placeholders}) OR l.created_by_user_id = ?
          GROUP BY l.id
          ORDER BY l.created_at DESC
        `, [...classIds, userId]);
        lessonRows = rows as any[];
      } catch (colErr) {
        // Fallback if bg_image column is missing before alter
        const [rows] = await pool.query(`
          SELECT 
            l.id,
            l.class_id,
            l.title,
            l.file_name,
            l.file_type,
            l.file_url,
            l.pages_or_duration,
            l.notes,
            l.is_visible,
            l.created_at,
            c.name AS class_name,
            c.section AS class_section,
            COUNT(DISTINCT lr.student_id) AS read_count
          FROM lessons l
          JOIN classes c ON c.id = l.class_id
          LEFT JOIN lesson_reads lr ON lr.lesson_id = l.id
          WHERE l.class_id IN (${placeholders}) OR l.created_by_user_id = ?
          GROUP BY l.id
          ORDER BY l.created_at DESC
        `, [...classIds, userId]);
        lessonRows = rows as any[];
      }

      lessons = lessonRows.map((l) => ({
        id: l.id,
        classId: l.class_id,
        sectionName: formatSectionDisplayName(l.class_name, l.class_section),
        title: l.title,
        fileName: l.file_name || 'lesson-material.pdf',
        fileType: l.file_type || 'pdf',
        fileUrl: l.file_url || '',
        pagesOrDuration: l.pages_or_duration || '10 pages',
        notes: l.notes || '',
        bgImage: l.bg_image || '/images/lesson_upload_bg.jpg',
        isVisible: Boolean(l.is_visible),
        readCount: Number(l.read_count || 0),
        uploadDate: formatDate(l.created_at),
        createdAt: l.created_at,
      }));
    }

    return NextResponse.json({
      sections,
      activities,
      lessons,
    });
  } catch (error: any) {
    console.error('Library GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch library data' },
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

    const contentType = request.headers.get('content-type') || '';
    let action = 'create_section';
    let body: any = {};
    let uploadedFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      action = String(formData.get('action') || 'create_lesson');
      uploadedFile = formData.get('file') as File | null;
      body = {
        action,
        classId: formData.get('classId'),
        title: formData.get('title'),
        fileName: formData.get('fileName'),
        fileType: formData.get('fileType'),
        fileUrl: formData.get('fileUrl'),
        pagesOrDuration: formData.get('pagesOrDuration'),
        notes: formData.get('notes'),
        content: formData.get('content'),
        bgImage: formData.get('bgImage') || formData.get('bg_image'),
        bgFile: formData.get('bgFile') as File | null,
        isVisible: formData.get('isVisible') === 'true' || formData.get('isVisible') === '1',
      };
    } else {
      body = await request.json();
      action = body?.action || 'create_section';
    }

    // Ensure lessons table has bg_image column
    try {
      await pool.query('ALTER TABLE lessons ADD COLUMN IF NOT EXISTS bg_image TEXT NULL');
    } catch {
      // Column may already exist
    }

    // 1. Create section
    if (action === 'create_section') {
      const name = String(body?.name ?? '').trim();
      const sectionName = String(body?.section ?? '').trim();
      const gradeLevel = Number(body?.gradeLevel ?? 1);

      if (!name) {
        return NextResponse.json({ error: 'Class/Grade name is required' }, { status: 400 });
      }

      const [result] = await pool.query(
        'INSERT INTO classes (name, grade_level, section, teacher_id) VALUES (?, ?, ?, ?)',
        [name, gradeLevel, sectionName || 'Section A', userId]
      );
      const insertId = (result as any).insertId;

      return NextResponse.json({
        message: 'Section created successfully',
        section: {
          id: insertId,
          name,
          section: sectionName || 'Section A',
          displayName: formatSectionDisplayName(name, sectionName || 'Section A'),
          gradeLevel,
          studentCount: 0,
          activityCount: 0,
          lessonCount: 0,
        },
      }, { status: 201 });
    }

    // 2. Delete section
    if (action === 'delete_section') {
      const id = Number(body?.id ?? 0);
      if (!id) {
        return NextResponse.json({ error: 'Section id is required' }, { status: 400 });
      }

      await pool.query('DELETE FROM classes WHERE id = ? AND teacher_id = ?', [id, userId]);
      return NextResponse.json({ message: 'Section deleted successfully' });
    }

    // 3. Create Lesson
    if (action === 'create_lesson') {
      const classId = Number(body?.classId ?? 0);
      const title = String(body?.title ?? '').trim();
      let fileName = String(body?.fileName ?? 'lesson-file.pdf').trim();
      let fileType = String(body?.fileType ?? 'pdf').toLowerCase();
      let fileUrl = String(body?.fileUrl ?? '');
      let pagesOrDuration = String(body?.pagesOrDuration ?? '10 pages').trim();
      const notes = String(body?.notes ?? body?.content ?? '').trim();
      let bgImage = String(body?.bgImage ?? body?.bg_image ?? '/images/lesson_upload_bg.jpg').trim();
      const isVisible = body?.isVisible !== undefined ? (body.isVisible ? 1 : 0) : 1;

      // Check if custom bg file was uploaded
      const bgFile = body?.bgFile as File | null;
      if (bgFile && typeof bgFile !== 'string' && bgFile.size > 0) {
        try {
          const bgBytes = await bgFile.arrayBuffer();
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'lesson_bg');
          await fs.promises.mkdir(uploadDir, { recursive: true });

          const cleanBgName = bgFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const safeBgName = `bg-${Date.now()}-${cleanBgName}`;
          const bgFilePath = path.join(uploadDir, safeBgName);
          await fs.promises.writeFile(bgFilePath, Buffer.from(bgBytes));
          bgImage = `/uploads/lesson_bg/${safeBgName}`;
        } catch (bgErr) {
          console.error('Failed to save uploaded background image:', bgErr);
        }
      }

      if (!classId || !title) {
        return NextResponse.json({ error: 'Section and lesson title are required' }, { status: 400 });
      }

      // If a real file was uploaded via FormData, save it to public/uploads/lessons/
      if (uploadedFile && typeof uploadedFile !== 'string' && uploadedFile.size > 0) {
        try {
          const bytes = await uploadedFile.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'lessons');
          await fs.promises.mkdir(uploadDir, { recursive: true });

          const cleanName = uploadedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const safeName = `${Date.now()}-${cleanName}`;
          const filePath = path.join(uploadDir, safeName);
          await fs.promises.writeFile(filePath, buffer);

          fileUrl = `/uploads/lessons/${safeName}`;
          fileName = uploadedFile.name;

          // Auto detect file type if default
          const ext = uploadedFile.name.split('.').pop()?.toLowerCase();
          if (ext === 'pdf') fileType = 'pdf';
          else if (['ppt', 'pptx', 'key'].includes(ext || '')) fileType = 'slides';
          else if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '')) fileType = 'video';
          else if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext || '')) fileType = 'doc';
        } catch (fileErr) {
          console.error('Failed to save uploaded file:', fileErr);
        }
      } else if (!fileUrl && (body?.content || notes)) {
        // If manual text/notes provided without physical file, generate a downloadable text file
        try {
          const textContent = String(body?.content || notes || '');
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'lessons');
          await fs.promises.mkdir(uploadDir, { recursive: true });

          const safeTitle = (title || 'lesson-notes').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const safeName = `${Date.now()}-${safeTitle}.txt`;
          const filePath = path.join(uploadDir, safeName);
          await fs.promises.writeFile(filePath, Buffer.from(textContent, 'utf-8'));

          fileUrl = `/uploads/lessons/${safeName}`;
          if (!fileName || fileName === 'lesson-file.pdf' || fileName === 'lesson-notes.pdf') {
            fileName = `${safeTitle}.txt`;
          }
        } catch (textErr) {
          console.error('Failed to save manual text file:', textErr);
        }
      }

      let insertId: number;
      try {
        const [result] = await pool.query(
          `INSERT INTO lessons (class_id, title, file_name, file_type, file_url, pages_or_duration, notes, bg_image, is_visible, created_by_user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [classId, title, fileName, fileType, fileUrl, pagesOrDuration, notes, bgImage, isVisible, userId]
        );
        insertId = (result as any).insertId;
      } catch (insertErr) {
        // Fallback without bg_image if column doesn't exist
        const [result] = await pool.query(
          `INSERT INTO lessons (class_id, title, file_name, file_type, file_url, pages_or_duration, notes, is_visible, created_by_user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [classId, title, fileName, fileType, fileUrl, pagesOrDuration, notes, isVisible, userId]
        );
        insertId = (result as any).insertId;
      }

      return NextResponse.json({
        message: 'Lesson uploaded successfully',
        lesson: {
          id: insertId,
          classId,
          title,
          fileName,
          fileType,
          fileUrl,
          pagesOrDuration,
          notes,
          bgImage,
          isVisible: Boolean(isVisible),
          readCount: 0,
          uploadDate: formatDate(new Date()),
        },
      }, { status: 201 });
    }

    // 4. Toggle Lesson Visibility
    if (action === 'toggle_lesson_visibility') {
      const id = Number(body?.id ?? 0);
      const isVisible = body?.isVisible ? 1 : 0;

      if (!id) {
        return NextResponse.json({ error: 'Lesson id is required' }, { status: 400 });
      }

      await pool.query('UPDATE lessons SET is_visible = ? WHERE id = ?', [isVisible, id]);
      return NextResponse.json({ message: 'Lesson visibility updated', isVisible: Boolean(isVisible) });
    }

    // 5. Delete Lesson
    if (action === 'delete_lesson') {
      const id = Number(body?.id ?? 0);
      if (!id) {
        return NextResponse.json({ error: 'Lesson id is required' }, { status: 400 });
      }

      await pool.query('DELETE FROM lessons WHERE id = ?', [id]);
      return NextResponse.json({ message: 'Lesson deleted successfully' });
    }

    // 6. Create Homework
    if (action === 'create_homework') {
      const classId = Number(body?.classId ?? 0);
      const title = String(body?.title ?? '').trim();
      const dueDate = body?.dueDate ? new Date(body.dueDate) : null;
      const totalPoints = Number(body?.totalPoints ?? 20);
      const questions = Array.isArray(body?.questions) ? body.questions : [];

      if (!classId || !title) {
        return NextResponse.json({ error: 'Section and homework title are required' }, { status: 400 });
      }

      const descriptionPayload = JSON.stringify({
        subject: 'Homework',
        status: 'Published',
        questions,
      });

      const [result] = await pool.query(
        `INSERT INTO activities (title, description, class_id, activity_type, total_points, due_date, created_by_user_id)
         VALUES (?, ?, ?, 'assignment', ?, ?, ?)`,
        [title, descriptionPayload, classId, totalPoints, dueDate, userId]
      );

      const insertId = (result as any).insertId;

      return NextResponse.json({
        message: 'Homework assigned successfully',
        homework: {
          id: insertId,
          title,
          classId,
          totalPoints,
          dueDate: dueDate ? formatDate(dueDate) : 'No due date',
          questionCount: questions.length,
          questions,
          submittedCount: 0,
        },
      }, { status: 201 });
    }

    // 7. Delete Activity / Homework
    if (action === 'delete_activity' || action === 'delete_homework') {
      const id = Number(body?.id ?? 0);
      if (!id) {
        return NextResponse.json({ error: 'Activity id is required' }, { status: 400 });
      }

      await pool.query('DELETE FROM activities WHERE id = ?', [id]);
      return NextResponse.json({ message: 'Homework deleted successfully' });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Library POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process library action' },
      { status: 500 }
    );
  }
}
