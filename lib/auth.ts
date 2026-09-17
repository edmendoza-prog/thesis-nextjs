import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-fallback-key-do-not-use-in-prod');

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lms_session')?.value;
    
    if (!token) return null;

    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      id: Number(payload.sub),
      role: String(payload.role)
    };
  } catch (error) {
    return null;
  }
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user?.id || 0;
}