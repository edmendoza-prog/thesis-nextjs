import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const scrypt = promisify(scryptCallback);

type RegistrationRole = 'student' | 'teacher';

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return scrypt(password, salt, 64).then((derivedKey) => {
    return `${salt}:${(derivedKey as Buffer).toString('hex')}`;
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const fullName = String(body.fullName ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const role = body.role === 'teacher' ? 'teacher' : body.role === 'student' ? 'student' : null;

    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ error: 'Full name, email, password, and role are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [existingRows] = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
      if ((existingRows as Array<{ id: number }>).length > 0) {
        await connection.rollback();
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const passwordHash = await hashPassword(password);
      const [userResult] = await connection.query(
        'INSERT INTO users (email, name, user_type, password_hash) VALUES (?, ?, ?, ?)',
        [email, fullName, role, passwordHash]
      );
      const userId = Number((userResult as { insertId: number }).insertId);

      await connection.commit();

      return NextResponse.json({ success: true, user: { id: userId, name: fullName, email, role } }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Unable to create account. Check that the database migrations are up to date.' }, { status: 500 });
  }
}