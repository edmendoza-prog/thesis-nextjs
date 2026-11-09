import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export const LEGACY_SESSION_COOKIE = 'lms_session';
export const STUDENT_SESSION_COOKIE = 'lms_student_session';
export const TEACHER_SESSION_COOKIE = 'lms_teacher_session';

export const NO_STORE_HEADERS: Record<string, string> = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
  Vary: 'Cookie',
};

const getJwtSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || 'super-secret-fallback-key-do-not-use-in-prod'
  );

export type AuthenticatedUser = {
  id: number;
  role: string;
};

async function verifyToken(token: string | undefined): Promise<AuthenticatedUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const id = Number(payload.sub);
    const role = String(payload.role || '');
    if (!Number.isInteger(id) || id <= 0 || !role) {
      return null;
    }
    return { id, role };
  } catch {
    return null;
  }
}

export async function getCurrentUser(
  expectedRole?: 'student' | 'teacher'
): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();

    if (expectedRole === 'student') {
      const studentUser = await verifyToken(cookieStore.get(STUDENT_SESSION_COOKIE)?.value);
      if (studentUser && studentUser.role === 'student') {
        return studentUser;
      }

      const legacyUser = await verifyToken(cookieStore.get(LEGACY_SESSION_COOKIE)?.value);
      if (legacyUser && legacyUser.role === 'student') {
        return legacyUser;
      }

      return null;
    }

    if (expectedRole === 'teacher') {
      const teacherUser = await verifyToken(cookieStore.get(TEACHER_SESSION_COOKIE)?.value);
      if (teacherUser && (teacherUser.role === 'teacher' || teacherUser.role === 'admin')) {
        return teacherUser;
      }

      const legacyUser = await verifyToken(cookieStore.get(LEGACY_SESSION_COOKIE)?.value);
      if (legacyUser && (legacyUser.role === 'teacher' || legacyUser.role === 'admin')) {
        return legacyUser;
      }

      return null;
    }

    // No specific role requested: check legacy first, then student, then teacher
    const legacyUser = await verifyToken(cookieStore.get(LEGACY_SESSION_COOKIE)?.value);
    if (legacyUser) return legacyUser;

    const studentUser = await verifyToken(cookieStore.get(STUDENT_SESSION_COOKIE)?.value);
    if (studentUser) return studentUser;

    const teacherUser = await verifyToken(cookieStore.get(TEACHER_SESSION_COOKIE)?.value);
    if (teacherUser) return teacherUser;

    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUserId(expectedRole?: 'student' | 'teacher'): Promise<number> {
  const user = await getCurrentUser(expectedRole);
  return user?.id || 0;
}
