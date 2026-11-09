import { scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { SignJWT } from 'jose';
import {
  LEGACY_SESSION_COOKIE,
  STUDENT_SESSION_COOKIE,
  TEACHER_SESSION_COOKIE,
  NO_STORE_HEADERS,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

const scrypt = promisify(scryptCallback);

async function verifyPassword(password: string, storedHash: string) {
  const [salt, encodedKey] = storedHash.split(':');
  if (!salt || !encodedKey) return false;
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const expectedKey = Buffer.from(encodedKey, 'hex');
  return expectedKey.length === derivedKey.length && timingSafeEqual(expectedKey, derivedKey);
}

const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-fallback-key-do-not-use-in-prod');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');
    const role = body?.role === 'teacher' ? 'teacher' : 'student';
    const [rows] = await pool.query(
      'SELECT id, name, email, user_type, password_hash FROM users WHERE email = ? AND user_type = ? LIMIT 1',
      [email, role],
    );
    const user = (rows as any[])[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await new SignJWT({ role: user.user_type })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(String(user.id))
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecret());

    const response = NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.user_type } },
      { headers: NO_STORE_HEADERS }
    );
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    };
    response.cookies.set(LEGACY_SESSION_COOKIE, token, cookieOptions);
    if (user.user_type === 'student') {
      response.cookies.set(STUDENT_SESSION_COOKIE, token, cookieOptions);
    } else if (user.user_type === 'teacher' || user.user_type === 'admin') {
      response.cookies.set(TEACHER_SESSION_COOKIE, token, cookieOptions);
    }
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Unable to log in' }, { status: 500 });
  }
}