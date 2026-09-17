import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function flattenQuestionGroups(groups: any[] = []) {
  const flattened: any[] = [];

  if (!Array.isArray(groups)) {
    return flattened;
  }

  groups.forEach((group) => {
    if (!group || typeof group !== 'object') return;

    if (Array.isArray(group.questions)) {
      flattened.push(...group.questions);
      return;
    }

    if (Array.isArray(group.options) || group.prompt || group.explanation) {
      flattened.push(group);
    }
  });

  return flattened;
}

function parseActivityDescription(description?: string | null) {
  const raw = String(description ?? '').trim();
  if (!raw) return { subject: 'Class Activity', generatedGroups: [] };

  if (raw.startsWith('{') || raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const groups = Array.isArray(parsed.generatedGroups)
          ? parsed.generatedGroups
          : Array.isArray(parsed.questions)
            ? parsed.questions
            : [];

        return {
          subject: String(parsed.subject ?? 'Class Activity').trim() || 'Class Activity',
          generatedGroups: flattenQuestionGroups(groups),
        };
      }
    } catch {
      // Fall through to plain text parsing below.
    }
  }

  const [subject] = raw.split(' • ');
  return {
    subject: subject?.trim() || 'Class Activity',
    generatedGroups: [],
  };
}

// Security: Strip out 'correct' and 'explanation' fields so students cannot cheat
function sanitizeQuestionsForClient(questions: any[] = []) {
  return questions.map((question) => {
    const q = { ...question };
    if (q.explanation) delete q.explanation;
    if (Array.isArray(q.options)) {
      q.options = q.options.map((opt: any) => {
        const o = { ...opt };
        delete o.correct;
        return o;
      });
    }
    return q;
  });
}

function getAssignmentPalette(index: number) {
  const palettes = [
    { color: 'bg-cyan-500', tint: 'bg-cyan-50', text: 'text-cyan-700' },
    { color: 'bg-lime-500', tint: 'bg-lime-50', text: 'text-lime-700' },
    { color: 'bg-rose-500', tint: 'bg-rose-50', text: 'text-rose-700' },
    { color: 'bg-violet-500', tint: 'bg-violet-50', text: 'text-violet-700' },
    { color: 'bg-amber-500', tint: 'bg-amber-50', text: 'text-amber-700' },
  ];

  return palettes[index % palettes.length];
}

function parseSubject(description?: string | null) {
  const raw = String(description ?? '').trim();
  if (!raw) return 'Class Activity';

  const [subject] = raw.split(' • ');
  return subject.trim() || 'Class Activity';
}

function formatDueDate(dateValue?: string | Date | null) {
  if (!dateValue) return 'No due date';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'No due date';

  return `Due ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;
}

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activityId = Number(searchParams.get('activityId') ?? '0');

    if (activityId > 0) {
      const [rows] = await pool.query(`
        SELECT a.id, a.title, a.description, a.activity_type, a.total_points, a.due_date, c.name AS class_name,
          s.score AS submitted_score, s.max_score AS submitted_max_score, s.status AS submission_status,
          s.answers AS submitted_answers
        FROM activities a
        JOIN classes c ON c.id = a.class_id
        LEFT JOIN activity_submissions s
          ON s.activity_id = a.id
          AND s.student_id = ?
        WHERE a.id = ?
        LIMIT 1
      `, [userId, activityId]);

      const activity = (rows as any[])[0];
      if (!activity) {
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }

      const parsed = parseActivityDescription(activity.description);
      const isCompleted = activity.submission_status === 'completed';
      let submittedAnswers: Record<string, string> = {};
      if (activity.submitted_answers) {
        try {
          submittedAnswers = typeof activity.submitted_answers === 'string'
            ? JSON.parse(activity.submitted_answers)
            : activity.submitted_answers;
        } catch {}
      }

      return NextResponse.json({
        activity: {
          id: activity.id,
          title: activity.title || 'Untitled Activity',
          subject: parsed.subject,
          due: formatDueDate(activity.due_date),
          questions: isCompleted ? parsed.generatedGroups : sanitizeQuestionsForClient(parsed.generatedGroups),
          completed: isCompleted,
          answers: submittedAnswers,
          score: activity.submitted_score == null ? null : Number(activity.submitted_score),
          maxScore: activity.submitted_max_score == null ? Number(activity.total_points ?? 0) : Number(activity.submitted_max_score),
        },
      });
    }

    const [studentActivityRows] = await pool.query(`
      SELECT a.id, a.title, a.description, a.activity_type, a.total_points, a.due_date, c.name AS class_name,
        s.score AS submitted_score, s.max_score AS submitted_max_score, s.status AS submission_status
      FROM student_enrollments se
      JOIN activities a ON a.class_id = se.class_id
      JOIN classes c ON c.id = a.class_id
      LEFT JOIN activity_submissions s ON s.activity_id = a.id AND s.student_id = se.student_id
      WHERE se.student_id = ? AND se.status = 'active'
      ORDER BY a.due_date ASC, a.created_at DESC
    `, [userId]);

    const rows = studentActivityRows as any[];

    const activities = rows.map((activity, index) => {
      const palette = getAssignmentPalette(index);
      const parsed = parseActivityDescription(activity.description);
      const isCompleted = activity.submission_status === 'completed';

      return {
        id: activity.id,
        studentId: userId,
        subject: parsed.subject || parseSubject(activity.description),
        title: activity.title || 'Untitled Activity',
        due: formatDueDate(activity.due_date),
        progress: isCompleted ? 100 : 0,
        color: palette.color,
        tint: palette.tint,
        text: palette.text,
        questions: sanitizeQuestionsForClient(parsed.generatedGroups),
        score: activity.submitted_score == null ? null : Number(activity.submitted_score),
        maxScore: activity.submitted_max_score == null ? null : Number(activity.submitted_max_score),
        completed: isCompleted,
      };
    });

    const [userRows] = await pool.query(
      `SELECT id, name FROM users WHERE id = ? AND user_type = 'student' LIMIT 1`,
      [userId]
    );
    const studentUser = (userRows as any[])[0];

    return NextResponse.json({
      student: {
        id: userId,
        name: studentUser?.name || 'Student',
      },
      activities,
    });
  } catch (error) {
    console.error('Student activities fetch error:', error);
    return NextResponse.json({ error: 'Unable to load student activities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const activityId = Number(body?.activityId ?? 0);
    const answers = body?.answers && typeof body.answers === 'object' ? body.answers : {};

    if (!activityId) {
      return NextResponse.json({ error: 'Activity id is required' }, { status: 400 });
    }

    const [activityRows] = await pool.query(
      `SELECT a.id, a.total_points, a.description, a.class_id
       FROM activities a
       WHERE a.id = ?
       LIMIT 1`,
      [activityId],
    );
    const activity = (activityRows as any[])[0];
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const parsed = parseActivityDescription(activity.description);
    const rawGroups = parsed.generatedGroups;
    const questions: any[] = [];

    if (Array.isArray(rawGroups)) {
      rawGroups.forEach((group: any, gIdx: number) => {
        const groupQs = Array.isArray(group?.questions) ? group.questions : [group];
        groupQs.forEach((q: any, qIdx: number) => {
          if (!q || typeof q !== 'object') return;
          const qId = String(q.id ?? `question-${gIdx}-${qIdx}`);
          const options = Array.isArray(q.options)
            ? q.options.map((opt: any, oIdx: number) => ({
                id: String(opt?.id ?? String.fromCharCode(65 + oIdx)),
                text: String(opt?.text ?? opt?.value ?? ''),
                correct: Boolean(opt?.correct),
              }))
            : [];
          questions.push({ ...q, id: qId, options });
        });
      });
    }

    if (questions.length > 0 && Object.keys(answers).length < questions.length) {
      return NextResponse.json({ error: 'Answer every question before submitting' }, { status: 400 });
    }

    const answerValues = Object.values(answers) as string[];
    const correctAnswers = questions.reduce((total, question) => {
      const questionId = String(question?.id ?? '');
      const correctOption = question.options.find((option: any) => option?.correct);
      const studentAnswer = answers[questionId];
      return total + (correctOption && String(studentAnswer) === String(correctOption.id) ? 1 : 0);
    }, 0);

    const maxScore = Number(activity.total_points ?? 0);
    const score = questions.length > 0
      ? Number(((correctAnswers / questions.length) * maxScore).toFixed(2))
      : 0;

    await pool.query(
      `INSERT INTO activity_submissions (student_id, activity_id, score, max_score, answers, status)
       VALUES (?, ?, ?, ?, ?, 'completed')
       ON DUPLICATE KEY UPDATE score = VALUES(score), max_score = VALUES(max_score), answers = VALUES(answers), status = 'completed', submitted_at = CURRENT_TIMESTAMP`,
      [userId, activityId, score, maxScore, JSON.stringify(answers)],
    );

    return NextResponse.json({ score, maxScore, answered: answerValues.length, correct: correctAnswers });
  } catch (error) {
    console.error('Student activity submission error:', error);
    return NextResponse.json({ error: 'Unable to save assessment result' }, { status: 500 });
  }
}


