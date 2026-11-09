import { NextResponse } from 'next/server';
import {
  LEGACY_SESSION_COOKIE,
  STUDENT_SESSION_COOKIE,
  TEACHER_SESSION_COOKIE,
  NO_STORE_HEADERS,
  getCurrentUser,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let requestedRole: 'student' | 'teacher' | null = null;
  try {
    const body = await request.json();
    if (body?.role === 'student' || body?.role === 'teacher') {
      requestedRole = body.role;
    }
  } catch {
    // Empty body is valid; clear all session cookies
  }

  const response = NextResponse.json(
    { success: true },
    { status: 200, headers: NO_STORE_HEADERS }
  );

  const expiredCookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  if (requestedRole === 'student') {
    response.cookies.set(STUDENT_SESSION_COOKIE, '', expiredCookieOptions);
    const legacyUser = await getCurrentUser();
    if (!legacyUser || legacyUser.role === 'student') {
      response.cookies.set(LEGACY_SESSION_COOKIE, '', expiredCookieOptions);
    }
  } else if (requestedRole === 'teacher') {
    response.cookies.set(TEACHER_SESSION_COOKIE, '', expiredCookieOptions);
    const legacyUser = await getCurrentUser();
    if (!legacyUser || legacyUser.role === 'teacher' || legacyUser.role === 'admin') {
      response.cookies.set(LEGACY_SESSION_COOKIE, '', expiredCookieOptions);
    }
  } else {
    response.cookies.set(LEGACY_SESSION_COOKIE, '', expiredCookieOptions);
    response.cookies.set(STUDENT_SESSION_COOKIE, '', expiredCookieOptions);
    response.cookies.set(TEACHER_SESSION_COOKIE, '', expiredCookieOptions);
  }

  return response;
}

