import pool from '@/lib/db';

export type BadgeCategory =
  | 'Reading & Lessons'
  | 'Attendance & Habits'
  | 'Submission Timing'
  | 'Study Habits'
  | 'Academic Excellence'
  | 'Milestones & Mastery';

export type BadgeRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface BadgeDefinition {
  id: number;
  slug: string;
  name: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  exp: number;
  icon: string;
  description: string;
  requirementText: string;
}

export interface StudentBadgeStatus extends BadgeDefinition {
  unlocked: boolean;
  earnedAt: string | null;
  progressCurrent: number;
  progressTarget: number;
  progressPercent: number;
  progressLabel: string;
}

export interface StudentExpSummary {
  totalExp: number;
  badgeExp: number;
  lessonExp: number;
  assessmentExp: number;
  attendanceExp: number;
  maxPossibleBadgeExp: number;
  level: number;
  levelTitle: string;
  currentLevelExp: number;
  nextLevelExp: number;
  expToNextLevel: number;
  levelProgressPercent: number;
  unlockedCount: number;
  totalBadgesCount: number;
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 1,
    slug: 'first-reader',
    name: 'First Reader',
    category: 'Reading & Lessons',
    rarity: 'Common',
    exp: 50,
    icon: '/badges/01-first-reader.png',
    description: 'Read and complete your very first classroom lesson.',
    requirementText: 'Read 1 lesson',
  },
  {
    id: 2,
    slug: 'bookworm-masipag-mag-aral',
    name: 'Bookworm (Masipag Mag-aral)',
    category: 'Reading & Lessons',
    rarity: 'Uncommon',
    exp: 150,
    icon: '/badges/02-bookworm-masipag-mag-aral.png',
    description: 'Show dedication to reading by completing 5 classroom lessons.',
    requirementText: 'Read 5 lessons',
  },
  {
    id: 3,
    slug: 'speed-reader',
    name: 'Speed Reader',
    category: 'Reading & Lessons',
    rarity: 'Uncommon',
    exp: 100,
    icon: '/badges/03-speed-reader.png',
    description: 'Read 2 or more lessons within a single day.',
    requirementText: 'Read 2 lessons in 1 day',
  },
  {
    id: 4,
    slug: 'master-scholar',
    name: 'Master Scholar',
    category: 'Reading & Lessons',
    rarity: 'Epic',
    exp: 250,
    icon: '/badges/04-master-scholar.png',
    description: 'Master your study materials by reading 10 lessons or 100% of lessons in a class.',
    requirementText: 'Read 10 lessons (or 100% of a class)',
  },
  {
    id: 5,
    slug: 'early-bird',
    name: 'Early Bird',
    category: 'Attendance & Habits',
    rarity: 'Common',
    exp: 75,
    icon: '/badges/05-early-bird.png',
    description: 'Record your first present class attendance or start learning early.',
    requirementText: '1 present attendance or early activity',
  },
  {
    id: 6,
    slug: 'attendance-champion',
    name: 'Attendance Champion',
    category: 'Attendance & Habits',
    rarity: 'Rare',
    exp: 200,
    icon: '/badges/06-attendance-champion.png',
    description: 'Maintain outstanding attendance with 5 or more present class days.',
    requirementText: '5 present attendance days',
  },
  {
    id: 7,
    slug: 'punctual-student',
    name: 'Punctual Student',
    category: 'Attendance & Habits',
    rarity: 'Uncommon',
    exp: 125,
    icon: '/badges/07-punctual-student.png',
    description: 'Submit 3 assignments on time or attend 3+ classes with zero tardiness.',
    requirementText: '3 on-time submissions or punctual days',
  },
  {
    id: 8,
    slug: 'daily-habit',
    name: 'Daily Habit',
    category: 'Attendance & Habits',
    rarity: 'Uncommon',
    exp: 150,
    icon: '/badges/08-daily-habit.png',
    description: 'Build a consistent study habit by learning across 3 or more active days.',
    requirementText: '3 active study days',
  },
  {
    id: 9,
    slug: 'ahead-of-time-mabilis-kumilos',
    name: 'Ahead of Time (Mabilis Kumilos)',
    category: 'Submission Timing',
    rarity: 'Uncommon',
    exp: 125,
    icon: '/badges/09-ahead-of-time-mabilis-kumilos.png',
    description: 'Submit a homework or assessment at least 24 hours before the due date.',
    requirementText: 'Submit 24+ hours before deadline',
  },
  {
    id: 10,
    slug: 'buzzer-beater-huling-hirit',
    name: 'Buzzer Beater (Huling Hirit)',
    category: 'Submission Timing',
    rarity: 'Uncommon',
    exp: 100,
    icon: '/badges/10-buzzer-beater-huling-hirit.png',
    description: 'Beat the clock by submitting an activity within 24 hours before its deadline.',
    requirementText: 'Submit within 24h before deadline',
  },
  {
    id: 11,
    slug: 'night-owl-puyat-scholar',
    name: 'Night Owl (Puyat Scholar)',
    category: 'Study Habits',
    rarity: 'Uncommon',
    exp: 100,
    icon: '/badges/11-night-owl-puyat-scholar.png',
    description: 'Burn the midnight oil by studying or submitting work between 8:00 PM and 5:00 AM.',
    requirementText: 'Study between 8 PM – 5 AM',
  },
  {
    id: 12,
    slug: 'early-sunshine',
    name: 'Early Sunshine',
    category: 'Study Habits',
    rarity: 'Uncommon',
    exp: 100,
    icon: '/badges/12-early-sunshine.png',
    description: 'Greet the morning sun by reading a lesson or submitting work between 5:00 AM and 9:00 AM.',
    requirementText: 'Study between 5 AM – 9 AM',
  },
  {
    id: 13,
    slug: 'zero-backlogs',
    name: 'Zero Backlogs',
    category: 'Study Habits',
    rarity: 'Rare',
    exp: 200,
    icon: '/badges/13-zero-backlogs.png',
    description: 'Complete all assigned homework in your enrolled classes with zero pending tasks left!',
    requirementText: 'Complete all assigned homework (0 pending)',
  },
  {
    id: 14,
    slug: 'perfect-score-bida-ka',
    name: 'Perfect Score (Bida Ka!)',
    category: 'Academic Excellence',
    rarity: 'Rare',
    exp: 250,
    icon: '/badges/14-perfect-score-bida-ka.png',
    description: 'Achieve a flawless 100% score on any quiz, homework, or exam.',
    requirementText: 'Score 100% on 1 assessment',
  },
  {
    id: 15,
    slug: 'sharp-mind',
    name: 'Sharp Mind',
    category: 'Academic Excellence',
    rarity: 'Uncommon',
    exp: 125,
    icon: '/badges/15-sharp-mind.png',
    description: 'Demonstrate sharp comprehension by scoring 85% or higher on an assessment.',
    requirementText: 'Score 85%+ on 1 assessment',
  },
  {
    id: 16,
    slug: 'speed-demon',
    name: 'Speed Demon',
    category: 'Academic Excellence',
    rarity: 'Rare',
    exp: 150,
    icon: '/badges/16-speed-demon.png',
    description: 'Power through and complete 2 or more assessments in a single day.',
    requirementText: 'Complete 2 assessments in 1 day',
  },
  {
    id: 17,
    slug: 'comeback-kid',
    name: 'Comeback Kid',
    category: 'Academic Excellence',
    rarity: 'Rare',
    exp: 150,
    icon: '/badges/17-comeback-kid.png',
    description: 'Bounce back stronger by scoring higher on a newer assessment than a previous one.',
    requirementText: 'Improve score on a subsequent assessment',
  },
  {
    id: 18,
    slug: 'first-submission',
    name: 'First Submission',
    category: 'Milestones & Mastery',
    rarity: 'Common',
    exp: 50,
    icon: '/badges/18-first-submission.png',
    description: 'Complete and submit your very first homework or quiz activity.',
    requirementText: 'Complete 1 assessment',
  },
  {
    id: 19,
    slug: 'novice-learner',
    name: 'Novice Learner',
    category: 'Milestones & Mastery',
    rarity: 'Common',
    exp: 100,
    icon: '/badges/19-novice-learner.png',
    description: 'Take your first steps by completing at least 2 learning actions (lessons or assessments).',
    requirementText: 'Complete 2 learning activities',
  },
  {
    id: 20,
    slug: 'rising-star',
    name: 'Rising Star',
    category: 'Milestones & Mastery',
    rarity: 'Uncommon',
    exp: 150,
    icon: '/badges/20-rising-star.png',
    description: 'Shine bright in class by completing at least 3 assessments.',
    requirementText: 'Complete 3 assessments',
  },
  {
    id: 21,
    slug: 'honor-roll-alamat',
    name: 'Honor Roll (Alamat)',
    category: 'Academic Excellence',
    rarity: 'Epic',
    exp: 300,
    icon: '/badges/21-honor-roll-alamat.png',
    description: 'Maintain an average score of 90% or higher across at least 2 completed assessments.',
    requirementText: '90%+ average across 2+ assessments',
  },
  {
    id: 22,
    slug: 'badge-collector',
    name: 'Badge Collector',
    category: 'Milestones & Mastery',
    rarity: 'Rare',
    exp: 200,
    icon: '/badges/22-badge-collector.png',
    description: 'Unlock at least 5 achievement badges on your student profile.',
    requirementText: 'Unlock 5 badges',
  },
  {
    id: 23,
    slug: 'straight-a-s-with-honors',
    name: "Straight A's (With Honors)",
    category: 'Academic Excellence',
    rarity: 'Epic',
    exp: 350,
    icon: '/badges/23-straight-a-s-with-honors.png',
    description: 'Achieve excellence by scoring 90% or higher on at least 3 assessments.',
    requirementText: 'Score 90%+ on 3 assessments',
  },
  {
    id: 24,
    slug: 'perseverance-tiyaga',
    name: 'Perseverance (Tiyaga)',
    category: 'Milestones & Mastery',
    rarity: 'Rare',
    exp: 200,
    icon: '/badges/24-perseverance-tiyaga.png',
    description: 'Show true grit and perseverance by completing 5 or more assessments.',
    requirementText: 'Complete 5 assessments',
  },
  {
    id: 25,
    slug: 'grand-slam',
    name: 'Grand Slam',
    category: 'Academic Excellence',
    rarity: 'Legendary',
    exp: 400,
    icon: '/badges/25-grand-slam.png',
    description: 'Achieve a Grand Slam with 3 perfect 100% scores on assessments!',
    requirementText: 'Score 100% on 3 assessments',
  },
  {
    id: 26,
    slug: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    category: 'Reading & Lessons',
    rarity: 'Common',
    exp: 100,
    icon: '/badges/26-knowledge-seeker.png',
    description: 'Expand your horizons by reading at least 3 classroom lessons.',
    requirementText: 'Read 3 lessons',
  },
  {
    id: 27,
    slug: 'all-rounder',
    name: 'All-Rounder',
    category: 'Milestones & Mastery',
    rarity: 'Legendary',
    exp: 300,
    icon: '/badges/27-all-rounder.png',
    description: 'Excel across all areas: read lessons, complete assessments, and participate in class!',
    requirementText: 'Read lesson + submit assessment + class participation',
  },
];

const LEVEL_THRESHOLDS = [
  { level: 1, minExp: 0, title: 'Novice Explorer' },
  { level: 2, minExp: 150, title: 'Curious Reader' },
  { level: 3, minExp: 350, title: 'Diligent Learner' },
  { level: 4, minExp: 650, title: 'Rising Scholar' },
  { level: 5, minExp: 1000, title: 'Sharp Achiever' },
  { level: 6, minExp: 1450, title: 'Honor vanguard' },
  { level: 7, minExp: 2000, title: 'Star Academic' },
  { level: 8, minExp: 2650, title: 'Master Scholar' },
  { level: 9, minExp: 3400, title: 'Grand Champion' },
  { level: 10, minExp: 4250, title: 'Legendary Alamat' },
];

export function calculateLevelFromExp(totalExp: number) {
  let current = LEVEL_THRESHOLDS[0];
  let next = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalExp >= LEVEL_THRESHOLDS[i].minExp) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] || {
        level: current.level + 1,
        minExp: current.minExp + 1000,
        title: 'Mythic Alamat',
      };
    } else {
      break;
    }
  }

  const expIntoLevel = Math.max(0, totalExp - current.minExp);
  const expNeededForLevel = Math.max(1, next.minExp - current.minExp);
  const levelProgressPercent = Math.min(100, Math.round((expIntoLevel / expNeededForLevel) * 100));

  return {
    level: current.level,
    levelTitle: current.title,
    currentLevelExp: expIntoLevel,
    nextLevelExp: expNeededForLevel,
    expToNextLevel: Math.max(0, next.minExp - totalExp),
    levelProgressPercent,
  };
}

type DbBadgeRow = { id: number | string; name: string; icon: string };
type DbLessonReadRow = { lesson_id: number | string; read_at?: string | Date | null; class_id?: number | string | null };
type DbEnrolledClassRow = { class_id: number | string };
type DbLessonCountRow = { class_id: number | string; total: number | string };
type DbActivityRow = { id: number | string; class_id: number | string; title?: string; total_points?: number | string; due_date?: string | Date | null };
type DbSubmissionRow = {
  activity_id: number | string;
  score: number | string | null;
  max_score?: number | string | null;
  status?: string | null;
  submitted_at?: string | Date | null;
  due_date?: string | Date | null;
  total_points?: number | string | null;
};
type DbAttendanceRow = { status?: string | null; date?: string | Date | null; created_at?: string | Date | null };
type DbLiveGameRow = { game_id: number | string; result_status?: string | null; created_at?: string | Date | null };
type DbStoredBadgeRow = { badge_id: number | string; earned_at?: string | Date | null };

let catalogSeeded = false;

async function ensureBadgesSeededInDb() {
  if (catalogSeeded) return;
  try {
    const [existingRows] = await pool.query('SELECT id, name, icon FROM badges');
    const existingById = new Map<number, DbBadgeRow>();
    (existingRows as DbBadgeRow[]).forEach((row) => existingById.set(Number(row.id), row));

    for (const badge of BADGE_CATALOG) {
      const existing = existingById.get(badge.id);
      const criteriaJson = JSON.stringify({
        slug: badge.slug,
        category: badge.category,
        rarity: badge.rarity,
        exp: badge.exp,
        requirementText: badge.requirementText,
      });

      if (!existing) {
        await pool.query(
          `INSERT INTO badges (id, name, description, icon, criteria)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             icon = EXCLUDED.icon,
             criteria = EXCLUDED.criteria`,
          [badge.id, badge.name, badge.description, badge.icon, criteriaJson]
        );
      } else if (existing.icon !== badge.icon || existing.name !== badge.name) {
        await pool.query(
          `UPDATE badges SET name = ?, description = ?, icon = ?, criteria = ? WHERE id = ?`,
          [badge.name, badge.description, badge.icon, criteriaJson, badge.id]
        );
      }
    }
    catalogSeeded = true;
  } catch (err) {
    console.warn('Non-fatal badge catalog sync warning:', err);
  }
}

export async function getStudentBadgesAndExp(studentId: number): Promise<{
  badges: StudentBadgeStatus[];
  expSummary: StudentExpSummary;
  newlyUnlocked: StudentBadgeStatus[];
}> {
  await ensureBadgesSeededInDb();

  // 1. Fetch lesson reads for student
  let lessonReads: DbLessonReadRow[] = [];
  try {
    const [lessonReadRows] = await pool.query(
      `SELECT lr.lesson_id, lr.read_at, l.class_id
       FROM lesson_reads lr
       LEFT JOIN lessons l ON l.id = lr.lesson_id
       WHERE lr.student_id = ?
       ORDER BY lr.read_at ASC`,
      [studentId]
    );
    lessonReads = lessonReadRows as DbLessonReadRow[];
  } catch (err) {
    console.warn('Badges lesson_reads query warning:', err);
  }

  // 2. Fetch enrolled classes and total visible lessons per class + total assigned activities
  let classIds: number[] = [];
  try {
    const [enrolledClassesRows] = await pool.query(
      `SELECT se.class_id
       FROM student_enrollments se
       WHERE se.student_id = ? AND se.status = 'active'`,
      [studentId]
    );
    classIds = (enrolledClassesRows as DbEnrolledClassRow[]).map((r) => Number(r.class_id));
  } catch (err) {
    console.warn('Badges student_enrollments query warning:', err);
  }

  const totalLessonsByClass: Record<number, number> = {};
  let allAssignedActivities: DbActivityRow[] = [];

  if (classIds.length > 0) {
    const placeholders = classIds.map(() => '?').join(',');
    try {
      const [classLessonCounts] = await pool.query(
        `SELECT class_id, COUNT(*) AS total
         FROM lessons
         WHERE class_id IN (${placeholders}) AND is_visible = 1
         GROUP BY class_id`,
        classIds
      );
      (classLessonCounts as DbLessonCountRow[]).forEach((row) => {
        totalLessonsByClass[Number(row.class_id)] = Number(row.total);
      });
    } catch (err) {
      console.warn('Badges lessons count query warning:', err);
    }

    try {
      const [actRows] = await pool.query(
        `SELECT id, class_id, title, total_points, due_date
         FROM activities
         WHERE class_id IN (${placeholders}) AND deleted_at IS NULL`,
        classIds
      );
      allAssignedActivities = actRows as DbActivityRow[];
    } catch (err) {
      console.warn('Badges activities query warning:', err);
    }
  }

  // 3. Fetch student submissions
  let submissions: DbSubmissionRow[] = [];
  try {
    const [submissionRows] = await pool.query(
      `SELECT s.activity_id, s.score, s.max_score, s.status, s.submitted_at, a.due_date, a.total_points
       FROM activity_submissions s
       LEFT JOIN activities a ON a.id = s.activity_id
       WHERE s.student_id = ?
       ORDER BY s.submitted_at ASC`,
      [studentId]
    );
    submissions = (submissionRows as DbSubmissionRow[]).filter(
      (s) => s.status === 'completed' || s.score !== null
    );
  } catch (err) {
    console.warn('Badges activity_submissions query warning:', err);
  }

  // 4. Fetch attendance records
  let attendanceList: DbAttendanceRow[] = [];
  try {
    const [attendanceRows] = await pool.query(
      `SELECT status, date, created_at
       FROM attendance
       WHERE student_id = ?`,
      [studentId]
    );
    attendanceList = attendanceRows as DbAttendanceRow[];
  } catch (err) {
    console.warn('Badges attendance query warning:', err);
  }

  // 5. Fetch live game participation
  let liveGamesList: DbLiveGameRow[] = [];
  try {
    const [liveGameRows] = await pool.query(
      `SELECT game_id, result_status
       FROM live_game_results
       WHERE student_id = ?`,
      [studentId]
    );
    liveGamesList = liveGameRows as DbLiveGameRow[];
  } catch (err) {
    console.warn('Badges live_game_results query warning:', err);
  }

  // 6. Fetch already stored student_badges
  const storedBadgesMap = new Map<number, string>();
  try {
    const [storedBadgeRows] = await pool.query(
      `SELECT badge_id, earned_at
       FROM student_badges
       WHERE student_id = ?`,
      [studentId]
    );
    (storedBadgeRows as DbStoredBadgeRow[]).forEach((row) => {
      storedBadgesMap.set(
        Number(row.badge_id),
        row.earned_at ? new Date(row.earned_at).toISOString() : new Date().toISOString()
      );
    });
  } catch (err) {
    console.warn('Badges student_badges query warning:', err);
  }

  // --- Compute Metrics ---
  const readLessonsCount = lessonReads.length;

  // Max lessons read in a single calendar day
  const lessonsByDay: Record<string, number> = {};
  const activeDaysSet = new Set<string>();
  let hasMorningActivity = false; // 5 AM - 8:59 AM
  let hasNightActivity = false; // 8 PM - 4:59 AM

  const checkTimestampTimeOfDay = (ts: string | Date | null | undefined) => {
    if (!ts) return;
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return;
    const dayKey = d.toISOString().slice(0, 10);
    activeDaysSet.add(dayKey);
    const hr = d.getHours();
    if (hr >= 5 && hr < 9) hasMorningActivity = true;
    if (hr >= 20 || hr < 5) hasNightActivity = true;
  };

  const readLessonsByClass: Record<number, number> = {};
  lessonReads.forEach((lr) => {
    if (lr.read_at) {
      const d = new Date(lr.read_at);
      if (!Number.isNaN(d.getTime())) {
        const dayKey = d.toISOString().slice(0, 10);
        lessonsByDay[dayKey] = (lessonsByDay[dayKey] || 0) + 1;
      }
      checkTimestampTimeOfDay(lr.read_at);
    }
    if (lr.class_id) {
      const cid = Number(lr.class_id);
      readLessonsByClass[cid] = (readLessonsByClass[cid] || 0) + 1;
    }
  });

  const maxLessonsInSingleDay = Object.values(lessonsByDay).reduce((m, v) => Math.max(m, v), 0);

  let hasCompletedAllLessonsInAClass = false;
  for (const [cidStr, totalCount] of Object.entries(totalLessonsByClass)) {
    const cid = Number(cidStr);
    if (totalCount > 0 && (readLessonsByClass[cid] || 0) >= totalCount) {
      hasCompletedAllLessonsInAClass = true;
      break;
    }
  }

  // Attendance metrics
  const presentCount = attendanceList.filter(
    (a) => String(a.status).toLowerCase() === 'present'
  ).length;
  const lateCount = attendanceList.filter(
    (a) => String(a.status).toLowerCase() === 'late'
  ).length;
  attendanceList.forEach((a) => {
    if (a.date) activeDaysSet.add(String(a.date).slice(0, 10));
  });

  // Submissions metrics
  const completedHwCount = submissions.length;
  const submissionsByDay: Record<string, number> = {};
  let onTimeSubmissionsCount = 0;
  let early24hSubmissionsCount = 0;
  let buzzerBeaterSubmissionsCount = 0;
  let perfectScoresCount = 0;
  let highScores85Count = 0;
  let highScores90Count = 0;
  const percentageScoresChronological: number[] = [];

  submissions.forEach((sub) => {
    const score = Number(sub.score ?? 0);
    const maxScore = Math.max(1, Number(sub.max_score || sub.total_points || 100));
    const pct = Math.min(100, Math.round((score / maxScore) * 100));
    percentageScoresChronological.push(pct);

    if (pct >= 100 || score >= maxScore) perfectScoresCount++;
    if (pct >= 85) highScores85Count++;
    if (pct >= 90) highScores90Count++;

    if (sub.submitted_at) {
      const subDate = new Date(sub.submitted_at);
      if (!Number.isNaN(subDate.getTime())) {
        const dayKey = subDate.toISOString().slice(0, 10);
        submissionsByDay[dayKey] = (submissionsByDay[dayKey] || 0) + 1;
        checkTimestampTimeOfDay(sub.submitted_at);

        if (sub.due_date) {
          const dueDate = new Date(sub.due_date);
          if (!Number.isNaN(dueDate.getTime())) {
            const diffHours = (dueDate.getTime() - subDate.getTime()) / (1000 * 60 * 60);
            if (diffHours >= 0) {
              onTimeSubmissionsCount++;
              if (diffHours >= 24) {
                early24hSubmissionsCount++;
              } else if (diffHours > 0 && diffHours <= 24) {
                buzzerBeaterSubmissionsCount++;
              }
            }
          } else {
            onTimeSubmissionsCount++;
          }
        } else {
          onTimeSubmissionsCount++;
        }
      }
    }
  });

  const maxSubmissionsInSingleDay = Object.values(submissionsByDay).reduce(
    (m, v) => Math.max(m, v),
    0
  );

  // Check Comeback Kid (any score higher than an earlier score)
  let hasImprovedScore = false;
  for (let i = 1; i < percentageScoresChronological.length; i++) {
    if (percentageScoresChronological[i] > percentageScoresChronological[i - 1]) {
      hasImprovedScore = true;
      break;
    }
  }

  // Average score across submissions
  const avgScore =
    percentageScoresChronological.length > 0
      ? Math.round(
        percentageScoresChronological.reduce((a, b) => a + b, 0) /
        percentageScoresChronological.length
      )
      : 0;

  // Pending homework check for Zero Backlogs
  const submittedActivityIds = new Set(submissions.map((s) => Number(s.activity_id)));
  const totalAssignedHw = allAssignedActivities.length;
  const completedAssignedHw = allAssignedActivities.filter((a) =>
    submittedActivityIds.has(Number(a.id))
  ).length;
  const pendingAssignedHw = Math.max(0, totalAssignedHw - completedAssignedHw);

  const activeDaysCount = activeDaysSet.size;
  const liveGamesCount = liveGamesList.length;

  // Helper to build progress object for each badge
  const evaluateSingleBadge = (
    badge: BadgeDefinition,
    currentUnlockedCount: number
  ): {
    unlocked: boolean;
    progressCurrent: number;
    progressTarget: number;
    progressLabel: string;
  } => {
    switch (badge.id) {
      case 1: // First Reader
        return {
          unlocked: readLessonsCount >= 1,
          progressCurrent: Math.min(1, readLessonsCount),
          progressTarget: 1,
          progressLabel: `${Math.min(1, readLessonsCount)} / 1 lesson read`,
        };
      case 2: // Bookworm
        return {
          unlocked: readLessonsCount >= 5,
          progressCurrent: Math.min(5, readLessonsCount),
          progressTarget: 5,
          progressLabel: `${Math.min(5, readLessonsCount)} / 5 lessons read`,
        };
      case 3: // Speed Reader
        return {
          unlocked: maxLessonsInSingleDay >= 2,
          progressCurrent: Math.min(2, maxLessonsInSingleDay),
          progressTarget: 2,
          progressLabel: `${Math.min(2, maxLessonsInSingleDay)} / 2 lessons in a day`,
        };
      case 4: // Master Scholar
        return {
          unlocked: readLessonsCount >= 10 || hasCompletedAllLessonsInAClass,
          progressCurrent: hasCompletedAllLessonsInAClass ? 10 : Math.min(10, readLessonsCount),
          progressTarget: 10,
          progressLabel: hasCompletedAllLessonsInAClass
            ? '100% class lessons read'
            : `${Math.min(10, readLessonsCount)} / 10 lessons read`,
        };
      case 5: { // Early Bird
        const cur = presentCount >= 1 || hasMorningActivity ? 1 : 0;
        return {
          unlocked: cur >= 1,
          progressCurrent: cur,
          progressTarget: 1,
          progressLabel: `${cur} / 1 early attendance or morning study`,
        };
      }
      case 6: // Attendance Champion
        return {
          unlocked: presentCount >= 5,
          progressCurrent: Math.min(5, presentCount),
          progressTarget: 5,
          progressLabel: `${Math.min(5, presentCount)} / 5 present days`,
        };
      case 7: { // Punctual Student
        const punctualProgress = Math.max(
          lateCount === 0 ? presentCount : 0,
          onTimeSubmissionsCount
        );
        return {
          unlocked: punctualProgress >= 3,
          progressCurrent: Math.min(3, punctualProgress),
          progressTarget: 3,
          progressLabel: `${Math.min(3, punctualProgress)} / 3 on-time tasks or days`,
        };
      }
      case 8: // Daily Habit
        return {
          unlocked: activeDaysCount >= 3,
          progressCurrent: Math.min(3, activeDaysCount),
          progressTarget: 3,
          progressLabel: `${Math.min(3, activeDaysCount)} / 3 active study days`,
        };
      case 9: // Ahead of Time
        return {
          unlocked: early24hSubmissionsCount >= 1,
          progressCurrent: Math.min(1, early24hSubmissionsCount),
          progressTarget: 1,
          progressLabel: `${Math.min(1, early24hSubmissionsCount)} / 1 early submission (24h+)`,
        };
      case 10: // Buzzer Beater
        return {
          unlocked: buzzerBeaterSubmissionsCount >= 1,
          progressCurrent: Math.min(1, buzzerBeaterSubmissionsCount),
          progressTarget: 1,
          progressLabel: `${Math.min(1, buzzerBeaterSubmissionsCount)} / 1 last-24h submission`,
        };
      case 11: // Night Owl
        return {
          unlocked: hasNightActivity,
          progressCurrent: hasNightActivity ? 1 : 0,
          progressTarget: 1,
          progressLabel: hasNightActivity ? 'Completed night study' : '0 / 1 night study (8 PM–5 AM)',
        };
      case 12: // Early Sunshine
        return {
          unlocked: hasMorningActivity,
          progressCurrent: hasMorningActivity ? 1 : 0,
          progressTarget: 1,
          progressLabel: hasMorningActivity
            ? 'Completed morning study'
            : '0 / 1 morning study (5 AM–9 AM)',
        };
      case 13: { // Zero Backlogs
        const isZeroBacklog = totalAssignedHw >= 1 && pendingAssignedHw === 0;
        const target = Math.max(1, totalAssignedHw);
        return {
          unlocked: isZeroBacklog,
          progressCurrent: isZeroBacklog ? target : completedAssignedHw,
          progressTarget: target,
          progressLabel:
            totalAssignedHw === 0
              ? '0 / 1 assigned homework'
              : `${completedAssignedHw} / ${totalAssignedHw} class homework done`,
        };
      }
      case 14: // Perfect Score (Bida Ka!)
        return {
          unlocked: perfectScoresCount >= 1,
          progressCurrent: Math.min(1, perfectScoresCount),
          progressTarget: 1,
          progressLabel: `${Math.min(1, perfectScoresCount)} / 1 perfect 100% score`,
        };
      case 15: // Sharp Mind
        return {
          unlocked: highScores85Count >= 1,
          progressCurrent: Math.min(1, highScores85Count),
          progressTarget: 1,
          progressLabel: `${Math.min(1, highScores85Count)} / 1 score of 85%+`,
        };
      case 16: // Speed Demon
        return {
          unlocked: maxSubmissionsInSingleDay >= 2,
          progressCurrent: Math.min(2, maxSubmissionsInSingleDay),
          progressTarget: 2,
          progressLabel: `${Math.min(2, maxSubmissionsInSingleDay)} / 2 assessments in a day`,
        };
      case 17: // Comeback Kid
        return {
          unlocked: hasImprovedScore,
          progressCurrent: hasImprovedScore ? 1 : 0,
          progressTarget: 1,
          progressLabel: hasImprovedScore
            ? 'Score improved!'
            : 'Improve score on next assessment',
        };
      case 18: // First Submission
        return {
          unlocked: completedHwCount >= 1,
          progressCurrent: Math.min(1, completedHwCount),
          progressTarget: 1,
          progressLabel: `${Math.min(1, completedHwCount)} / 1 assessment submitted`,
        };
      case 19: { // Novice Learner
        const totalActions = readLessonsCount + completedHwCount;
        return {
          unlocked: totalActions >= 2,
          progressCurrent: Math.min(2, totalActions),
          progressTarget: 2,
          progressLabel: `${Math.min(2, totalActions)} / 2 learning activities`,
        };
      }
      case 20: // Rising Star
        return {
          unlocked: completedHwCount >= 3,
          progressCurrent: Math.min(3, completedHwCount),
          progressTarget: 3,
          progressLabel: `${Math.min(3, completedHwCount)} / 3 assessments completed`,
        };
      case 21: { // Honor Roll (Alamat)
        const unlocked = completedHwCount >= 2 && avgScore >= 90;
        return {
          unlocked,
          progressCurrent: unlocked ? 2 : Math.min(2, completedHwCount),
          progressTarget: 2,
          progressLabel:
            completedHwCount < 2
              ? `${completedHwCount} / 2 assessments (90%+ avg needed)`
              : `Current avg: ${avgScore}% (90% needed)`,
        };
      }
      case 22: // Badge Collector
        return {
          unlocked: currentUnlockedCount >= 5,
          progressCurrent: Math.min(5, currentUnlockedCount),
          progressTarget: 5,
          progressLabel: `${Math.min(5, currentUnlockedCount)} / 5 badges unlocked`,
        };
      case 23: // Straight A's (With Honors)
        return {
          unlocked: highScores90Count >= 3,
          progressCurrent: Math.min(3, highScores90Count),
          progressTarget: 3,
          progressLabel: `${Math.min(3, highScores90Count)} / 3 scores of 90%+`,
        };
      case 24: // Perseverance (Tiyaga)
        return {
          unlocked: completedHwCount >= 5,
          progressCurrent: Math.min(5, completedHwCount),
          progressTarget: 5,
          progressLabel: `${Math.min(5, completedHwCount)} / 5 assessments completed`,
        };
      case 25: // Grand Slam
        return {
          unlocked: perfectScoresCount >= 3,
          progressCurrent: Math.min(3, perfectScoresCount),
          progressTarget: 3,
          progressLabel: `${Math.min(3, perfectScoresCount)} / 3 perfect 100% scores`,
        };
      case 26: // Knowledge Seeker
        return {
          unlocked: readLessonsCount >= 3,
          progressCurrent: Math.min(3, readLessonsCount),
          progressTarget: 3,
          progressLabel: `${Math.min(3, readLessonsCount)} / 3 lessons read`,
        };
      case 27: { // All-Rounder
        const hasLesson = readLessonsCount >= 1 ? 1 : 0;
        const hasHw = completedHwCount >= 1 ? 1 : 0;
        const hasParticipation =
          liveGamesCount >= 1 || presentCount >= 1 || currentUnlockedCount >= 8 ? 1 : 0;
        const sumParts = hasLesson + hasHw + hasParticipation;
        return {
          unlocked: sumParts >= 3,
          progressCurrent: sumParts,
          progressTarget: 3,
          progressLabel: `${sumParts} / 3 areas (Lessons, Assessments, Class Activity)`,
        };
      }
      default:
        return {
          unlocked: false,
          progressCurrent: 0,
          progressTarget: 1,
          progressLabel: '0 / 1',
        };
    }
  };

  // Pass 1: Evaluate all badges except #22 (Badge Collector) and #27 (All-Rounder)
  let baseUnlockedCount = 0;
  for (const badge of BADGE_CATALOG) {
    if (badge.id === 22 || badge.id === 27) continue;
    const res = evaluateSingleBadge(badge, 0);
    if (res.unlocked || storedBadgesMap.has(badge.id)) {
      baseUnlockedCount++;
    }
  }

  // Pass 2: Evaluate all 27 badges with accurate baseUnlockedCount
  const newlyUnlocked: StudentBadgeStatus[] = [];
  const finalBadges: StudentBadgeStatus[] = [];

  for (const badge of BADGE_CATALOG) {
    const evalResult = evaluateSingleBadge(badge, baseUnlockedCount);
    const wasAlreadyStored = storedBadgesMap.has(badge.id);
    const isUnlocked = evalResult.unlocked || wasAlreadyStored;
    const nowIso = new Date().toISOString();
    const earnedAt = wasAlreadyStored
      ? storedBadgesMap.get(badge.id)!
      : isUnlocked
        ? nowIso
        : null;

    const progressPercent = isUnlocked
      ? 100
      : Math.min(
        99,
        Math.round(
          (evalResult.progressCurrent / Math.max(1, evalResult.progressTarget)) * 100
        )
      );

    const statusObj: StudentBadgeStatus = {
      ...badge,
      unlocked: isUnlocked,
      earnedAt,
      progressCurrent: isUnlocked ? evalResult.progressTarget : evalResult.progressCurrent,
      progressTarget: evalResult.progressTarget,
      progressPercent,
      progressLabel: isUnlocked ? 'Completed!' : evalResult.progressLabel,
    };

    if (isUnlocked && !wasAlreadyStored) {
      newlyUnlocked.push(statusObj);
      try {
        await pool.query(
          `INSERT INTO student_badges (student_id, badge_id)
           VALUES (?, ?)
           ON CONFLICT (student_id, badge_id) DO NOTHING`,
          [studentId, badge.id]
        );
      } catch (err) {
        console.warn(`Could not persist student_badge ${badge.id}:`, err);
      }
    }

    finalBadges.push(statusObj);
  }

  // Calculate EXP breakdown
  const badgeExp = finalBadges
    .filter((b) => b.unlocked)
    .reduce((sum, b) => sum + b.exp, 0);

  const maxPossibleBadgeExp = BADGE_CATALOG.reduce((sum, b) => sum + b.exp, 0);

  // +20 EXP per lesson read
  const lessonExp = readLessonsCount * 20;

  // +25 EXP per completed assessment + up to 50 EXP based on percentage score
  const assessmentExp = percentageScoresChronological.reduce(
    (sum, pct) => sum + 25 + Math.round((pct / 100) * 50),
    0
  );

  // +15 EXP per present attendance + 20 EXP per live game joined
  const attendanceExp = presentCount * 15 + liveGamesCount * 20;

  const totalExp = badgeExp + lessonExp + assessmentExp + attendanceExp;
  const levelInfo = calculateLevelFromExp(totalExp);
  const unlockedCount = finalBadges.filter((b) => b.unlocked).length;

  return {
    badges: finalBadges,
    expSummary: {
      totalExp,
      badgeExp,
      lessonExp,
      assessmentExp,
      attendanceExp,
      maxPossibleBadgeExp,
      ...levelInfo,
      unlockedCount,
      totalBadgesCount: BADGE_CATALOG.length,
    },
    newlyUnlocked,
  };
}
