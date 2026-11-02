export type BadgeId =
  | 'first-reader'
  | 'bookworm-masipag-mag-aral'
  | 'speed-reader'
  | 'master-scholar'
  | 'early-bird'
  | 'attendance-champion'
  | 'punctual-student'
  | 'daily-habit'
  | 'ahead-of-time-mabilis-kumilos'
  | 'buzzer-beater-huling-hirit'
  | 'night-owl-puyat-scholar'
  | 'early-sunshine'
  | 'zero-backlogs'
  | 'perfect-score-bida-ka'
  | 'sharp-mind'
  | 'speed-demon'
  | 'comeback-kid'
  | 'first-submission'
  | 'novice-learner'
  | 'rising-star'
  | 'honor-roll-alamat'
  | 'badge-collector'
  | 'straight-a-s-with-honors'
  | 'perseverance-tiyaga'
  | 'grand-slam'
  | 'knowledge-seeker'
  | 'all-rounder'
  | number
  | string;

export type BadgeData = {
  id: string;
  numericId: number;
  name: string;
  description: string;
  image: string;
  xp: number;
};

export const BADGES: BadgeData[] = [
  {
    id: 'first-reader',
    numericId: 1,
    name: 'First Reader',
    description: 'Read and complete your very first classroom lesson.',
    image: '/badges/01-first-reader.png',
    xp: 50,
  },
  {
    id: 'bookworm-masipag-mag-aral',
    numericId: 2,
    name: 'Bookworm (Masipag Mag-aral)',
    description: 'Show dedication to reading by completing 5 classroom lessons.',
    image: '/badges/02-bookworm-masipag-mag-aral.png',
    xp: 150,
  },
  {
    id: 'speed-reader',
    numericId: 3,
    name: 'Speed Reader',
    description: 'Read 2 or more lessons within a single day.',
    image: '/badges/03-speed-reader.png',
    xp: 100,
  },
  {
    id: 'master-scholar',
    numericId: 4,
    name: 'Master Scholar',
    description: 'Master your study materials by reading 10 lessons or 100% of lessons in a class.',
    image: '/badges/04-master-scholar.png',
    xp: 250,
  },
  {
    id: 'early-bird',
    numericId: 5,
    name: 'Early Bird',
    description: 'Record your first present class attendance or start learning early.',
    image: '/badges/05-early-bird.png',
    xp: 75,
  },
  {
    id: 'attendance-champion',
    numericId: 6,
    name: 'Attendance Champion',
    description: 'Maintain outstanding attendance with 5 or more present class days.',
    image: '/badges/06-attendance-champion.png',
    xp: 200,
  },
  {
    id: 'punctual-student',
    numericId: 7,
    name: 'Punctual Student',
    description: 'Submit 3 assignments on time or attend 3+ classes with zero tardiness.',
    image: '/badges/07-punctual-student.png',
    xp: 125,
  },
  {
    id: 'daily-habit',
    numericId: 8,
    name: 'Daily Habit',
    description: 'Build a consistent study habit by learning across 3 or more active days.',
    image: '/badges/08-daily-habit.png',
    xp: 150,
  },
  {
    id: 'ahead-of-time-mabilis-kumilos',
    numericId: 9,
    name: 'Ahead of Time (Mabilis Kumilos)',
    description: 'Submit a homework or assessment at least 24 hours before the due date.',
    image: '/badges/09-ahead-of-time-mabilis-kumilos.png',
    xp: 125,
  },
  {
    id: 'buzzer-beater-huling-hirit',
    numericId: 10,
    name: 'Buzzer Beater (Huling Hirit)',
    description: 'Beat the clock by submitting an activity within 24 hours before its deadline.',
    image: '/badges/10-buzzer-beater-huling-hirit.png',
    xp: 100,
  },
  {
    id: 'night-owl-puyat-scholar',
    numericId: 11,
    name: 'Night Owl (Puyat Scholar)',
    description: 'Burn the midnight oil by studying or submitting work between 8:00 PM and 5:00 AM.',
    image: '/badges/11-night-owl-puyat-scholar.png',
    xp: 100,
  },
  {
    id: 'early-sunshine',
    numericId: 12,
    name: 'Early Sunshine',
    description: 'Greet the morning sun by reading a lesson or submitting work between 5:00 AM and 9:00 AM.',
    image: '/badges/12-early-sunshine.png',
    xp: 100,
  },
  {
    id: 'zero-backlogs',
    numericId: 13,
    name: 'Zero Backlogs',
    description: 'Complete all assigned homework in your enrolled classes with zero pending tasks left!',
    image: '/badges/13-zero-backlogs.png',
    xp: 200,
  },
  {
    id: 'perfect-score-bida-ka',
    numericId: 14,
    name: 'Perfect Score (Bida Ka!)',
    description: 'Achieve a flawless 100% score on any quiz, homework, or exam.',
    image: '/badges/14-perfect-score-bida-ka.png',
    xp: 250,
  },
  {
    id: 'sharp-mind',
    numericId: 15,
    name: 'Sharp Mind',
    description: 'Demonstrate sharp comprehension by scoring 85% or higher on an assessment.',
    image: '/badges/15-sharp-mind.png',
    xp: 125,
  },
  {
    id: 'speed-demon',
    numericId: 16,
    name: 'Speed Demon',
    description: 'Power through and complete 2 or more assessments in a single day.',
    image: '/badges/16-speed-demon.png',
    xp: 150,
  },
  {
    id: 'comeback-kid',
    numericId: 17,
    name: 'Comeback Kid',
    description: 'Bounce back stronger by scoring higher on a newer assessment than a previous one.',
    image: '/badges/17-comeback-kid.png',
    xp: 150,
  },
  {
    id: 'first-submission',
    numericId: 18,
    name: 'First Submission',
    description: 'Complete and submit your very first homework or quiz activity.',
    image: '/badges/18-first-submission.png',
    xp: 50,
  },
  {
    id: 'novice-learner',
    numericId: 19,
    name: 'Novice Learner',
    description: 'Take your first steps by completing at least 2 learning actions (lessons or assessments).',
    image: '/badges/19-novice-learner.png',
    xp: 100,
  },
  {
    id: 'rising-star',
    numericId: 20,
    name: 'Rising Star',
    description: 'Shine bright in class by completing at least 3 assessments.',
    image: '/badges/20-rising-star.png',
    xp: 150,
  },
  {
    id: 'honor-roll-alamat',
    numericId: 21,
    name: 'Honor Roll (Alamat)',
    description: 'Maintain an average score of 90% or higher across at least 2 completed assessments.',
    image: '/badges/21-honor-roll-alamat.png',
    xp: 300,
  },
  {
    id: 'badge-collector',
    numericId: 22,
    name: 'Badge Collector',
    description: 'Unlock at least 5 achievement badges on your student profile.',
    image: '/badges/22-badge-collector.png',
    xp: 200,
  },
  {
    id: 'straight-a-s-with-honors',
    numericId: 23,
    name: "Straight A's (With Honors)",
    description: 'Achieve excellence by scoring 90% or higher on at least 3 assessments.',
    image: '/badges/23-straight-a-s-with-honors.png',
    xp: 350,
  },
  {
    id: 'perseverance-tiyaga',
    numericId: 24,
    name: 'Perseverance (Tiyaga)',
    description: 'Show true grit and perseverance by completing 5 or more assessments.',
    image: '/badges/24-perseverance-tiyaga.png',
    xp: 200,
  },
  {
    id: 'grand-slam',
    numericId: 25,
    name: 'Grand Slam',
    description: 'Achieve a Grand Slam with 3 perfect 100% scores on assessments!',
    image: '/badges/25-grand-slam.png',
    xp: 400,
  },
  {
    id: 'knowledge-seeker',
    numericId: 26,
    name: 'Knowledge Seeker',
    description: 'Expand your horizons by reading at least 3 classroom lessons.',
    image: '/badges/26-knowledge-seeker.png',
    xp: 100,
  },
  {
    id: 'all-rounder',
    numericId: 27,
    name: 'All-Rounder',
    description: 'Excel across all areas: read lessons, complete assessments, and participate in class!',
    image: '/badges/27-all-rounder.png',
    xp: 300,
  },
];

export function getBadge(badgeId: BadgeId): BadgeData {
  if (typeof badgeId === 'number') {
    const byNum = BADGES.find((b) => b.numericId === badgeId);
    if (byNum) return byNum;
  }

  const normalized = String(badgeId ?? '')
    .trim()
    .toLowerCase()
    .replace(/^\d+-/, '')
    .replace(/\.png$/, '');

  const found =
    BADGES.find(
      (b) =>
        b.id.toLowerCase() === normalized ||
        String(b.numericId) === normalized ||
        b.name.toLowerCase() === normalized ||
        b.image.toLowerCase().includes(normalized)
    ) || BADGES[0];

  return found;
}

