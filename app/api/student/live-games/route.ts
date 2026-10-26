import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

type DbRow = Record<string, unknown>;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ games: [], error: 'Not authenticated' }, { status: 401 });
    }

    const [rows] = await pool.query(`
      SELECT lg.id, lg.title, lg.session_name, lg.game_type, lg.selected_student, lg.wheel_rotation,
        c.name AS class_name, c.grade_level, c.section, COALESCE(tu.name, 'Teacher') AS teacher_name,
        (SELECT GROUP_CONCAT(u.name SEPARATOR '|||') FROM live_game_results lgr JOIN users u ON u.id = lgr.student_id WHERE lgr.game_id = lg.id) AS participants_str
      FROM live_games lg
      JOIN classes c ON c.id = lg.class_id
      LEFT JOIN users tu ON tu.id = lg.teacher_id
      WHERE lg.status = 'active'
        AND (
          EXISTS (
            SELECT 1 FROM student_enrollments se
            WHERE se.class_id = lg.class_id
              AND se.student_id = ?
          )
          OR EXISTS (
            SELECT 1 FROM live_game_results lgr
            WHERE lgr.game_id = lg.id
              AND lgr.student_id = ?
          )
          OR NOT EXISTS (
            SELECT 1 FROM student_enrollments se2
            WHERE se2.student_id = ?
          )
        )
      ORDER BY lg.created_at DESC
    `, [userId, userId, userId]);

    return NextResponse.json({
      games: (rows as DbRow[]).map((game) => ({
        id: game.id,
        title: game.title,
        sessionName: game.session_name || game.title,
        gameType: game.game_type,
        className:
          game.class_name ||
          `Grade ${game.grade_level}, Section ${game.section}`,
        grade: `Grade ${game.grade_level}`,
        section: `Section ${game.section}`,
        teacherName: game.teacher_name,
        status: "LIVE",
        selectedStudent: game.selected_student || null,
        rotation: Number(game.wheel_rotation || 0),
        participants:
          typeof game.participants_str === "string" && game.participants_str.length > 0
            ? game.participants_str.split("|||")
            : [],
      })),
    });
  } catch (error) {
    console.error("Student live games fetch error:", error);
    return NextResponse.json(
      { games: [], error: "Unable to load live games" },
      { status: 200 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const gameId = Number(body?.gameId ?? 0);
    if (!gameId) return NextResponse.json({ error: 'Game id is required' }, { status: 400 });

    await pool.query(
      `INSERT INTO live_game_results (game_id, student_id, result_status)
       VALUES (?, ?, 'joined')
       ON DUPLICATE KEY UPDATE result_status = 'joined'`,
      [gameId, userId],
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Student live game participation error:', error);
    return NextResponse.json({ error: 'Unable to save game participation' }, { status: 500 });
  }
}

