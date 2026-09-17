import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

type DbRow = Record<string, unknown>;
type InsertResult = { insertId?: number };

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ sessions: [], error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;


    const [rows] = await pool.query(`
      SELECT lg.id, lg.title, lg.session_name, c.grade_level, c.section, lg.status,
        (SELECT JSON_ARRAYAGG(u.name) FROM live_game_results lgr JOIN users u ON u.id = lgr.student_id WHERE lgr.game_id = lg.id) AS participants_json, lg.selected_student, lg.wheel_rotation
      FROM live_games lg
      JOIN classes c ON c.id = lg.class_id
      WHERE lg.status = 'active' AND lg.teacher_id = ?
      ORDER BY lg.created_at DESC
    `, [userId]);

    return NextResponse.json({ sessions: (rows as DbRow[]).map((game) => ({
      id: Number(game.id), title: String(game.title || 'Live Game'),
      sessionName: String(game.session_name || game.title || 'Live Game'),
      grade: `Grade ${game.grade_level || 1}`, section: `Section ${game.section || 'A'}`,
      status: 'Live',
      participants: typeof game.participants_json === 'string' ? JSON.parse(game.participants_json) : (game.participants_json || []),
      selectedStudent: game.selected_student || undefined, wheelRotation: Number(game.wheel_rotation || 0),
    })) });
  } catch (error) {
    console.error('Teacher live games fetch error:', error);
    return NextResponse.json({ sessions: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const body = await request.json() as { title?: string; sessionName?: string; classId?: number; grade?: string; section?: string; gameType?: string; participants?: string[] };
    const requestedClassId = Number(body.classId ?? 0);
    const gradeLevel = Number(String(body.grade || '').replace(/\D/g, ''));
    const section = String(body.section || '').replace(/^Section\s+/i, '').trim();
    if ((!requestedClassId && ![1, 2, 3].includes(gradeLevel)) || (!requestedClassId && !section) || !body.title || !body.sessionName) return NextResponse.json({ error: 'Game, session name, grade, and section are required' }, { status: 400 });



    const [classRows] = requestedClassId
      ? await pool.query('SELECT id FROM classes WHERE id = ? LIMIT 1', [requestedClassId])
      : await pool.query('SELECT id FROM classes WHERE grade_level = ? AND section = ? AND teacher_id = ? LIMIT 1', [gradeLevel, section, userId]);
    const classId = Number((classRows as DbRow[])[0]?.id || 0);

    if (!classId) return NextResponse.json({ error: 'Matching class record not found' }, { status: 400 });

    const [result] = await pool.query('INSERT INTO live_games (class_id, teacher_id, title, session_name, game_type, status) VALUES (?, ?, ?, ?, ?, \'active\')', [classId, userId, body.title, body.sessionName, body.gameType || 'challenge']);
    const gameId = Number((result as InsertResult).insertId || 0);
    await pool.query(
      'INSERT INTO activities (title, description, class_id, activity_type, total_points, due_date, created_by_user_id) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?)',
      [body.title, `Live game • ${body.sessionName}`, classId, 'game', 100, userId],
    );
    if (gameId && Array.isArray(body.participants)) {
      for (const participant of body.participants) {
        const [studentRows] = await pool.query(
          `SELECT u.id FROM users u
           JOIN student_enrollments se ON se.student_id = u.id
           WHERE se.class_id = ? AND se.status = 'active' AND u.name = ?
           LIMIT 1`,
          [classId, participant],
        );
        const studentId = Number((studentRows as DbRow[])[0]?.id || 0);
        if (studentId) {
          await pool.query(
            `INSERT INTO live_game_results (game_id, student_id, result_status)
             VALUES (?, ?, 'joined')
             ON DUPLICATE KEY UPDATE result_status = VALUES(result_status)`,
            [gameId, studentId],
          );
        }
      }
    }
    return NextResponse.json({ id: gameId });
  } catch (error) {
    console.error('Teacher live game create error:', error);
    return NextResponse.json({ error: 'Unable to create live game' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const body = await request.json() as { id?: number; selectedStudent?: string; wheelRotation?: number; status?: string };
    if (!body.id) return NextResponse.json({ error: 'Session id is required' }, { status: 400 });
    const updates: string[] = [];
    const values: (string | number)[] = [];
    if (body.selectedStudent !== undefined) { updates.push('selected_student = ?'); values.push(body.selectedStudent); }
    if (body.wheelRotation !== undefined) { updates.push('wheel_rotation = ?'); values.push(body.wheelRotation); }
    if (body.status) { updates.push('status = ?'); values.push(body.status); }
    if (updates.length) { values.push(body.id); await pool.query(`UPDATE live_games SET ${updates.join(', ')} WHERE id = ?`, values); }
    if (body.selectedStudent !== undefined) {
      await pool.query(
        `UPDATE live_game_results lgr
         JOIN live_games lg ON lg.id = lgr.game_id
         JOIN users u ON u.id = lgr.student_id
         SET lgr.result_status = CASE WHEN u.name = ? THEN 'selected' ELSE 'joined' END
         WHERE lgr.game_id = ?`,
        [body.selectedStudent, body.id],
      );
    }
    if (body.status === 'finished') {
      const [gameRows] = await pool.query(
        'SELECT class_id, title, selected_student FROM live_games WHERE id = ? LIMIT 1',
        [body.id],
      );
      const game = (gameRows as DbRow[])[0];
      if (game) {
        const [activityRows] = await pool.query(
          'SELECT id, total_points FROM activities WHERE class_id = ? AND title = ? ORDER BY id DESC LIMIT 1',
          [game.class_id, game.title],
        );
        const activity = (activityRows as DbRow[])[0];
        const selectedStudent = String(game.selected_student || body.selectedStudent || '').trim();
        if (activity && selectedStudent) {
          const [studentRows] = await pool.query(
            'SELECT id FROM users WHERE user_type = "student" AND name = ? LIMIT 1',
            [selectedStudent],
          );
          const studentId = Number((studentRows as DbRow[])[0]?.id || 0);
          if (studentId) {
            const maxScore = Number(activity.total_points || 100);
            await pool.query(
              `UPDATE live_game_results SET score = ?, result_status = 'completed', completed_at = CURRENT_TIMESTAMP
               WHERE game_id = ? AND student_id = ?`,
              [maxScore, body.id, studentId],
            );
            await pool.query(
              `INSERT INTO activity_submissions (student_id, activity_id, score, max_score, graded_by, status, submitted_at)
               VALUES (?, ?, ?, ?, ?, 'completed', CURRENT_TIMESTAMP)
               ON DUPLICATE KEY UPDATE score = VALUES(score), max_score = VALUES(max_score), graded_by = VALUES(graded_by), updated_at = CURRENT_TIMESTAMP`,
              [studentId, activity.id, maxScore, maxScore, userId],
            );
          }
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Teacher live game update error:', error);
    return NextResponse.json({ error: 'Unable to update live game' }, { status: 500 });
  }
}

