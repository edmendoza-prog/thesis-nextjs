import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser, getCurrentUserId } from '@/lib/auth';
import { getStudentBadgesAndExp, BADGE_CATALOG, calculateLevelFromExp } from '@/lib/badges';

export const dynamic = 'force-dynamic';

type StudentProfile = {
  id?: number;
  name: string;
  email: string;
  studentNumber: string;
  guardianName: string;
  guardianContact: string;
  birthDate: string;
  avatarSeed?: string;
};

const emptyProfile: StudentProfile = {
  name: '',
  email: '',
  studentNumber: '',
  guardianName: '',
  guardianContact: '',
  birthDate: '',
  avatarSeed: '',
};

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ profile: emptyProfile, error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedStudentId = searchParams.get('studentId')?.trim();

    let querySql = `
      SELECT u.id AS user_id, u.name, u.email, u.student_number,
        u.guardian_name, u.guardian_contact, u.birth_date, u.avatar_seed,
        COALESCE(u.life_span, 100) AS life_span
      FROM users u
      WHERE u.id = ? AND u.user_type = 'student'
      LIMIT 1
    `;
    let queryParams: (string | number)[] = [user.id];

    if (requestedStudentId) {
      const numericId = Number(requestedStudentId);
      if (Number.isInteger(numericId) && numericId > 0) {
        querySql = `
          SELECT u.id AS user_id, u.name, u.email, u.student_number,
            u.guardian_name, u.guardian_contact, u.birth_date, u.avatar_seed,
            COALESCE(u.life_span, 100) AS life_span
          FROM users u
          WHERE (u.id = ? OR u.student_number = ?) AND u.user_type = 'student'
          LIMIT 1
        `;
        queryParams = [numericId, requestedStudentId];
      } else {
        querySql = `
          SELECT u.id AS user_id, u.name, u.email, u.student_number,
            u.guardian_name, u.guardian_contact, u.birth_date, u.avatar_seed,
            COALESCE(u.life_span, 100) AS life_span
          FROM users u
          WHERE (u.student_number = ? OR u.email = ?) AND u.user_type = 'student'
          LIMIT 1
        `;
        queryParams = [requestedStudentId, requestedStudentId];
      }
    }

    const [rows] = await pool.query(querySql, queryParams);
    const student = (rows as any[])[0];

    if (!student) {
      return NextResponse.json({ profile: emptyProfile });
    }

    const defaultSeed = student.avatar_seed || student.student_number || String(student.user_id) || 'Student';

    let badgesData = null;
    try {
      badgesData = await getStudentBadgesAndExp(Number(student.user_id));
    } catch (badgeErr) {
      console.warn('Badges evaluation fallback:', badgeErr);
    }

    const fallbackBadges = BADGE_CATALOG.map((b) => ({
      ...b,
      unlocked: false,
      earnedAt: null,
      progressCurrent: 0,
      progressTarget: 1,
      progressPercent: 0,
      progressLabel: b.requirementText,
    }));

    const fallbackExp = {
      totalExp: 0,
      badgeExp: 0,
      lessonExp: 0,
      assessmentExp: 0,
      attendanceExp: 0,
      maxPossibleBadgeExp: BADGE_CATALOG.reduce((sum, b) => sum + b.exp, 0),
      ...calculateLevelFromExp(0),
      unlockedCount: 0,
      totalBadgesCount: BADGE_CATALOG.length,
    };

    return NextResponse.json({
      profile: {
        id: student.user_id,
        name: student.name ?? '',
        email: student.email ?? '',
        studentNumber: student.student_number ?? '',
        guardianName: student.guardian_name ?? '',
        guardianContact: student.guardian_contact ?? '',
        birthDate: student.birth_date ? new Date(student.birth_date).toISOString().slice(0, 10) : '',
        avatarSeed: defaultSeed,
        lifeSpan: Math.max(0, Math.min(100, Number(student.life_span ?? 100))),
        hearts: Number(student.life_span ?? 100) <= 5
          ? Math.max(1, Number(student.life_span || 5))
          : Math.max(1, Math.min(5, Math.round(Number(student.life_span ?? 100) / 20))),
        stars: Number(student.life_span ?? 100) <= 5
          ? Math.max(1, Number(student.life_span || 5))
          : Math.max(1, Math.min(5, Math.round(Number(student.life_span ?? 100) / 20))),
      },
      badges: badgesData?.badges || fallbackBadges,
      expSummary: badgesData?.expSummary || fallbackExp,
      newlyUnlockedBadges: badgesData?.newlyUnlocked || [],
    });
  } catch (error) {
    console.error('Student profile fetch error:', error);
    return NextResponse.json({ profile: emptyProfile, error: 'Unable to load student profile' }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json() as Partial<StudentProfile>;
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    if (!name || !email) return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });

    const avatarSeed = body.avatarSeed !== undefined ? String(body.avatarSeed ?? '').trim() : null;

    await pool.query(
      `UPDATE users 
       SET name = ?, email = ?, student_number = ?, guardian_name = ?, guardian_contact = ?, birth_date = ?,
           avatar_seed = COALESCE(?, avatar_seed)
       WHERE id = ?`,
      [
        name,
        email,
        String(body.studentNumber ?? '').trim() || null,
        String(body.guardianName ?? '').trim() || null,
        String(body.guardianContact ?? '').trim() || null,
        String(body.birthDate ?? '').trim() || null,
        avatarSeed || null,
        userId
      ]
    );

    return NextResponse.json({ success: true, avatarSeed });
  } catch (error) {
    console.error('Student profile save error:', error);
    return NextResponse.json({ error: 'Unable to save student profile' }, { status: 500 });
  }
}