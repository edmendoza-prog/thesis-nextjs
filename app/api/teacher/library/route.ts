import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

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
        COUNT(DISTINCT a.id) AS activity_count
      FROM classes c
      LEFT JOIN student_enrollments se ON se.class_id = c.id AND se.status = 'active'
      LEFT JOIN activities a ON a.class_id = c.id AND a.deleted_at IS NULL
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
    }));

    // If teacher has classes, fetch all activities
    let activities: any[] = [];
    if (sections.length > 0) {
      const classIds = sections.map((s) => s.id);
      const placeholders = classIds.map(() => '?').join(',');

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
          c.section AS class_section
        FROM activities a
        JOIN classes c ON c.id = a.class_id
        WHERE a.class_id IN (${placeholders}) OR a.created_by_user_id = ?
        ORDER BY a.created_at DESC
      `, [...classIds, userId]);

      activities = (actRows as any[]).map((act) => ({
        id: act.id,
        title: act.title,
        description: act.description,
        classId: act.class_id,
        sectionName: formatSectionDisplayName(act.class_name, act.class_section),
        type: formatActivityType(act.activity_type),
        rawType: act.activity_type,
        totalPoints: act.total_points || 100,
        dueDate: act.due_date ? formatDate(act.due_date) : null,
        dateCreated: formatDate(act.created_at),
        createdAtRaw: act.created_at,
        status: parseActivityStatus(act.description, act.deleted_at),
      }));
    }

    return NextResponse.json({
      sections,
      activities,
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
    const body = await request.json();
    const action = body?.action || 'create_section';

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
        },
      }, { status: 201 });
    }

    if (action === 'delete_section') {
      const id = Number(body?.id ?? 0);
      if (!id) {
        return NextResponse.json({ error: 'Section id is required' }, { status: 400 });
      }

      await pool.query('DELETE FROM classes WHERE id = ? AND teacher_id = ?', [id, userId]);
      return NextResponse.json({ message: 'Section deleted successfully' });
    }

    if (action === 'delete_activity') {
      const id = Number(body?.id ?? 0);
      if (!id) {
        return NextResponse.json({ error: 'Activity id is required' }, { status: 400 });
      }

      await pool.query('DELETE FROM activities WHERE id = ?', [id]);
      return NextResponse.json({ message: 'Activity deleted successfully' });
    }

    if (action === 'update_activity_status') {
      const id = Number(body?.id ?? 0);
      const newStatus = String(body?.status ?? 'Published').trim();

      if (!id) {
        return NextResponse.json({ error: 'Activity id is required' }, { status: 400 });
      }

      const [rows] = await pool.query('SELECT id, description FROM activities WHERE id = ? LIMIT 1', [id]);
      if ((rows as any[]).length === 0) {
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }

      const currentDesc = (rows as any[])[0].description || '';
      let descObj: any = {};
      try {
        descObj = JSON.parse(currentDesc);
      } catch {
        descObj = { text: currentDesc };
      }
      descObj.status = newStatus;

      await pool.query('UPDATE activities SET description = ? WHERE id = ?', [JSON.stringify(descObj), id]);
      return NextResponse.json({ message: 'Status updated successfully', status: newStatus });
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
