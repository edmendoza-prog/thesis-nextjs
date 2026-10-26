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
        (SELECT GROUP_CONCAT(u.name SEPARATOR '|||') FROM live_game_results lgr JOIN users u ON u.id = lgr.student_id WHERE lgr.game_id = lg.id) AS participants_str, lg.selected_student, lg.wheel_rotation
      FROM live_games lg
      JOIN classes c ON c.id = lg.class_id
      WHERE lg.status = 'active' AND lg.teacher_id = ?
      ORDER BY lg.created_at DESC
    `, [userId]);

    return NextResponse.json({
      sessions: (rows as DbRow[]).map((game) => ({
        id: Number(game.id), title: String(game.title || 'Live Game'),
        sessionName: String(game.session_name || game.title || 'Live Game'),
        grade: `Grade ${game.grade_level || 1}`, section: `Section ${game.section || 'A'}`,
        status: 'Live',
        participants: typeof game.participants_str === 'string' && game.participants_str.length > 0
          ? game.participants_str.split('|||')
          : [],
        selectedStudent: game.selected_student || undefined, wheelRotation: Number(game.wheel_rotation || 0),
      }))
    });
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
    const gradeLevel = Number(String(body.grade || '').replace(/\D/g, '')) || 1;
    const section = String(body.section || '').replace(/^Section\s+/i, '').trim() || 'A';

    if (!body.title && !body.sessionName) {
      return NextResponse.json({ error: 'Game title or session name is required' }, { status: 400 });
    }

    const title = String(body.title || 'Live Game').trim();
    const sessionName = String(body.sessionName || title).trim();

    // 1. Resolve or create classId
    let classId = requestedClassId;
    if (classId) {
      const [classRows] = await pool.query('SELECT id FROM classes WHERE id = ? LIMIT 1', [classId]);
      classId = Number((classRows as DbRow[])[0]?.id || 0);
    }

    if (!classId) {
      const [classRows] = await pool.query(
        'SELECT id FROM classes WHERE grade_level = ? AND section = ? AND teacher_id = ? LIMIT 1',
        [gradeLevel, section, userId]
      );
      classId = Number((classRows as DbRow[])[0]?.id || 0);
    }

    if (!classId) {
      const [classRows] = await pool.query(
        'SELECT id FROM classes WHERE teacher_id = ? ORDER BY id ASC LIMIT 1',
        [userId]
      );
      classId = Number((classRows as DbRow[])[0]?.id || 0);
    }

    if (!classId) {
      const [createRes] = await pool.query(
        'INSERT INTO classes (name, grade_level, section, teacher_id) VALUES (?, ?, ?, ?)',
        [`Grade ${gradeLevel}`, gradeLevel, section.startsWith('Section') ? section : `Section ${section}`, userId]
      );
      classId = Number((createRes as InsertResult).insertId || 0);
    }

    // 2. Resolve teacher reference (in case teachers table exists with FK)
    try {
      await pool.query('INSERT IGNORE INTO teachers (user_id) VALUES (?)', [userId]);
    } catch {
      // Ignore if table does not exist
    }

    let teacherRefId = userId;
    try {
      const [tRows] = await pool.query('SELECT id FROM teachers WHERE user_id = ? LIMIT 1', [userId]);
      if ((tRows as DbRow[])[0]?.id) {
        teacherRefId = Number((tRows as DbRow[])[0].id);
      }
    } catch {
      teacherRefId = userId;
    }

    // 3. Insert live_games
    let gameId = 0;
    try {
      const [result] = await pool.query(
        'INSERT INTO live_games (class_id, teacher_id, title, session_name, game_type, status) VALUES (?, ?, ?, ?, ?, \'active\')',
        [classId, userId, title, sessionName, body.gameType || 'challenge']
      );
      gameId = Number((result as InsertResult).insertId || 0);
    } catch (insertErr: any) {
      if (insertErr?.code === 'ER_NO_REFERENCED_ROW_2' || insertErr?.message?.includes('foreign key constraint fails')) {
        // Auto-heal legacy foreign key pointing to dropped teachers table
        try {
          await pool.query('SET FOREIGN_KEY_CHECKS = 0');
          try { await pool.query('ALTER TABLE live_games DROP FOREIGN KEY live_games_ibfk_2'); } catch { }
          try { await pool.query('ALTER TABLE live_games DROP FOREIGN KEY fk_live_games_teacher'); } catch { }
          try {
            await pool.query('ALTER TABLE live_games ADD CONSTRAINT fk_live_games_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE');
          } catch { }
          await pool.query('SET FOREIGN_KEY_CHECKS = 1');

          const [result] = await pool.query(
            'INSERT INTO live_games (class_id, teacher_id, title, session_name, game_type, status) VALUES (?, ?, ?, ?, ?, \'active\')',
            [classId, userId, title, sessionName, body.gameType || 'challenge']
          );
          gameId = Number((result as InsertResult).insertId || 0);
        } catch (repairErr) {
          console.error('Failed to insert after repairing FK:', repairErr);
          throw insertErr;
        }
      } else {
        throw insertErr;
      }
    }

    // 4. Optionally record activity
    try {
      await pool.query(
        'INSERT INTO activities (title, description, class_id, activity_type, total_points, due_date, created_by_user_id) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?)',
        [title, `Live game • ${sessionName}`, classId, 'game', 100, userId],
      );
    } catch (actErr) {
      console.warn('Could not insert activity for live game:', actErr);
    }

    // 5. Insert participants into live_game_results if available
    if (gameId && Array.isArray(body.participants) && body.participants.length > 0) {
      for (const participant of body.participants) {
        try {
          const [studentRows] = await pool.query(
            `SELECT u.id FROM users u
             JOIN student_enrollments se ON se.student_id = u.id
             WHERE se.class_id = ? AND se.status = 'active' AND u.name = ?
             LIMIT 1`,
            [classId, participant],
          );
          let studentId = Number((studentRows as DbRow[])[0]?.id || 0);
          if (!studentId) {
            const [userByName] = await pool.query(
              `SELECT id FROM users WHERE user_type = 'student' AND name = ? LIMIT 1`,
              [participant]
            );
            studentId = Number((userByName as DbRow[])[0]?.id || 0);
          }
          if (studentId) {
            await pool.query(
              `INSERT INTO live_game_results (game_id, student_id, result_status)
               VALUES (?, ?, 'joined')
               ON DUPLICATE KEY UPDATE result_status = VALUES(result_status)`,
              [gameId, studentId],
            );
          }
        } catch (pErr) {
          console.warn(`Could not attach participant ${participant}:`, pErr);
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

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authenticated or unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id') ?? 0);
    const clearAll = searchParams.get('all') === 'true' || !id;

    if (id && !clearAll) {
      await pool.query('DELETE FROM live_games WHERE id = ? AND teacher_id = ?', [id, userId]);
      return NextResponse.json({ success: true, message: 'Live game session deleted successfully' });
    }

    await pool.query('DELETE FROM live_games WHERE teacher_id = ?', [userId]);
    return NextResponse.json({ success: true, message: 'All live games cleared successfully' });
  } catch (error) {
    console.error('Error clearing live games:', error);
    return NextResponse.json({ error: 'Failed to clear live games' }, { status: 500 });
  }
}

