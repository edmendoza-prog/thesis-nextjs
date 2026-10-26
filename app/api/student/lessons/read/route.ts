import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const lessonId = Number(body?.lessonId ?? 0);
    const markAsRead = body?.isRead !== undefined ? Boolean(body.isRead) : true;

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    if (markAsRead) {
      await pool.query(
        `INSERT INTO lesson_reads (lesson_id, student_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
        [lessonId, userId]
      );
    } else {
      await pool.query(
        `DELETE FROM lesson_reads WHERE lesson_id = ? AND student_id = ?`,
        [lessonId, userId]
      );
    }

    return NextResponse.json({
      success: true,
      lessonId,
      isRead: markAsRead,
    });
  } catch (error: any) {
    console.error('Lesson read status update error:', error);
    return NextResponse.json({ error: error.message || 'Unable to update lesson read status' }, { status: 500 });
  }
}
