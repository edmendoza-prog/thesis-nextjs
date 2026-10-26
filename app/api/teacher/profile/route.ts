import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

type TeacherProfile = {
  id?: number;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  designation: string;
  bio: string;
  avatarSeed?: string;
};

const emptyProfile: TeacherProfile = {
  name: '',
  email: '',
  employeeId: '',
  department: '',
  designation: '',
  bio: '',
  avatarSeed: '',
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const [rows] = await pool.query(`
      SELECT u.id AS user_id, u.name, u.email, u.employee_id, u.department, u.designation, u.bio, u.avatar_seed
      FROM users u
      WHERE u.id = ? AND u.user_type = 'teacher'
      LIMIT 1
    `, [userId]);

    const teacher = (rows as any[])[0];
    if (!teacher) {
      return NextResponse.json({ profile: emptyProfile });
    }

    const defaultSeed = teacher.avatar_seed || teacher.employee_id || String(teacher.user_id) || 'Teacher';

    return NextResponse.json({
      profile: {
        id: teacher.user_id,
        name: teacher.name ?? '',
        email: teacher.email ?? '',
        employeeId: teacher.employee_id ?? '',
        department: teacher.department ?? '',
        designation: teacher.designation ?? '',
        bio: teacher.bio ?? '',
        avatarSeed: defaultSeed,
      } satisfies TeacherProfile,
    });
  } catch (error) {
    console.error('Teacher profile fetch error:', error);
    return NextResponse.json({ error: 'Unable to load teacher profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const body = await request.json() as Partial<TeacherProfile>;
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();

    if (!name || !email) return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });

    const avatarSeed = body.avatarSeed !== undefined ? String(body.avatarSeed ?? '').trim() : null;

    await pool.query(
      `UPDATE users 
       SET name = ?, email = ?, employee_id = ?, department = ?, designation = ?, bio = ?,
           avatar_seed = COALESCE(?, avatar_seed)
       WHERE id = ?`,
      [
        name,
        email,
        String(body.employeeId ?? '').trim(),
        String(body.department ?? '').trim(),
        String(body.designation ?? '').trim(),
        String(body.bio ?? '').trim(),
        avatarSeed || null,
        userId
      ]
    );

    return NextResponse.json({ success: true, avatarSeed });
  } catch (error) {
    console.error('Teacher profile save error:', error);
    return NextResponse.json({ error: 'Unable to save teacher profile' }, { status: 500 });
  }
}