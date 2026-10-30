import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { SignJWT } from 'jose';

const scrypt = promisify(scryptCallback);

type RegistrationRole = 'student' | 'teacher';

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return scrypt(password, salt, 64).then((derivedKey) => {
    return `${salt}:${(derivedKey as Buffer).toString('hex')}`;
  });
}

const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-fallback-key-do-not-use-in-prod');

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const fullName = String(body.fullName ?? '').trim();
    let email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const role = body.role === 'teacher' ? 'teacher' : body.role === 'student' ? 'student' : null;
    const avatarSeed = body.avatarSeed ? String(body.avatarSeed).trim() : null;
    const guardianName = body.guardianName ? String(body.guardianName).trim() : null;
    const rawStudentNumber = body.studentNumber ? String(body.studentNumber).trim() : null;
    const employeeId = body.employeeId ? String(body.employeeId).trim() : null;
    const department = body.department ? String(body.department).trim() : null;
    const designation = body.designation ? String(body.designation).trim() : null;

    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ error: 'Display name, username/email, password, and role are required' }, { status: 400 });
    }

    // If student enters a simple username (no @), append @student.golearning.edu for standard email format
    if (role === 'student' && !email.includes('@')) {
      email = `${email.replace(/[^a-z0-9._-]/g, '')}@student.golearning.edu`;
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
        return NextResponse.json({ error: 'An account with this username or email already exists. Try another one!' }, { status: 409 });
      }

      // Ensure student_number is unique (users.student_number has a UNIQUE constraint)
      let studentNumber: string | null = rawStudentNumber;
      if (role === 'student') {
        const gradeMatch = rawStudentNumber?.match(/^grade\s*(\d+)$/i);
        const prefix = gradeMatch ? `G${gradeMatch[1]}` : rawStudentNumber || 'STU';
        const isGenericGrade = Boolean(gradeMatch) || !rawStudentNumber;

        let needsUniqueId = isGenericGrade;
        if (!needsUniqueId && studentNumber) {
          const [dupStudentRows] = await connection.query(
            'SELECT id FROM users WHERE student_number = ? LIMIT 1',
            [studentNumber]
          );
          if ((dupStudentRows as Array<{ id: number }>).length > 0) {
            needsUniqueId = true;
          }
        }

        if (needsUniqueId) {
          const suffix = `${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
          studentNumber = `${prefix}-${suffix}`;
        }
      }

      const passwordHash = await hashPassword(password);
      const [userResult] = await connection.query(
        `INSERT INTO users (email, name, user_type, password_hash, avatar_seed, guardian_name, student_number, employee_id, department, designation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [email, fullName, role, passwordHash, avatarSeed, guardianName, studentNumber, employeeId, department, designation]
      );
      const userId = Number((userResult as { insertId: number }).insertId);

      await connection.commit();

      // Issue active session cookie for instant seamless sign-in
      const token = await new SignJWT({ role })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(String(userId))
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getJwtSecret());

      const response = NextResponse.json(
        {
          success: true,
          user: {
            id: userId,
            name: fullName,
            email,
            role,
            avatarSeed: avatarSeed || String(userId),
          },
        },
        { status: 201 }
      );

      response.cookies.set('lms_session', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Unable to create account. Please check your details and try again.' }, { status: 500 });
  }
}