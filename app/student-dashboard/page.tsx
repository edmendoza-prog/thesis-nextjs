'use client';

import { useRouter } from 'next/navigation';

const student = {
  name: 'Ava',
  level: 7,
  stars: 0,
  coins: 0,
  progress: 0,
};

const navItems = [
  { id: 'classes', label: 'My Classes', icon: 'book', accent: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'badges', label: 'Badges', icon: 'medal', accent: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy', accent: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'progress', label: 'Progress', icon: 'trend', accent: 'text-green-600', bg: 'bg-green-50' },
] as const;

const games = [
  {
    title: 'Quiz Adventure',
    emoji: '🌍',
    gradient: 'from-sky-500 to-cyan-500',
    subject: 'Math',
    subjectClass: 'bg-sky-100 text-sky-700',
    difficulty: 'Easy',
    difficultyClass: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'Match Master',
    emoji: '🎯',
    gradient: 'from-emerald-500 to-green-600',
    subject: 'English',
    subjectClass: 'bg-blue-100 text-blue-700',
    difficulty: 'Medium',
    difficultyClass: 'bg-yellow-100 text-yellow-700',
  },
  {
    title: 'Speed Challenge',
    emoji: '⚡',
    gradient: 'from-amber-500 to-orange-500',
    subject: 'Math',
    subjectClass: 'bg-sky-100 text-sky-700',
    difficulty: 'Medium',
    difficultyClass: 'bg-yellow-100 text-yellow-700',
  },
  {
    title: 'Puzzle Solver',
    emoji: '🧩',
    gradient: 'from-violet-500 to-pink-500',
    subject: 'Logic',
    subjectClass: 'bg-violet-100 text-violet-700',
    difficulty: 'Easy',
    difficultyClass: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'Picture Quiz',
    emoji: '🏞️',
    gradient: 'from-rose-500 to-red-400',
    subject: 'Science',
    subjectClass: 'bg-amber-100 text-amber-700',
    difficulty: 'Easy',
    difficultyClass: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'Treasure Hunt',
    emoji: '🗝️',
    gradient: 'from-yellow-400 to-orange-500',
    subject: 'Mixed',
    subjectClass: 'bg-gray-100 text-gray-700',
    difficulty: 'Medium',
    difficultyClass: 'bg-yellow-100 text-yellow-700',
  },
] as const;

function Icon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  switch (type) {
    case 'star':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" className={className}>
          <path d="m12 2.75 2.58 5.23 5.76.84-4.17 4.07 1 5.75L12 0 6.83 18.74l1-5.75-4.17-4.07 5.76-.84L12 2.75Z" />
        </svg>
      );
    case 'coin':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v10" />
          <path d="M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2-1.1 2-2.5 2-2.5.9-2.5 2 .9 2 2.5 2 2.5-.9 2.5-2" />
        </svg>
      );
    case 'logout':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
      );
    case 'medal':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M8 3h8v4a4 4 0 0 1-8 0V3Z" />
          <path d="M8 7H4a2 2 0 0 0-2 2v.5A4.5 4.5 0 0 0 6.5 14H8" />
          <path d="M16 7h4a2 2 0 0 1 2 2v.5A4.5 4.5 0 0 1 17.5 14H16" />
          <circle cx="12" cy="17" r="4" />
        </svg>
      );
    case 'trophy':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" />
          <path d="M7 4H4a2 2 0 0 0-2 2v1a5 5 0 0 0 5 5" />
          <path d="M17 4h3a2 2 0 0 1 2 2v1a5 5 0 0 1-5 5" />
        </svg>
      );
    case 'trend':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 17l6-6 4 4L21 5" />
          <path d="M14 5h7v7" />
        </svg>
      );
    default:
      return null;
  }
}

export default function StudentDashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#c084fc_0%,#a855f7_35%,#ec4899_100%)] px-4 py-6 md:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[20px] bg-white/95 p-4 shadow-[0_24px_70px_rgba(109,40,217,0.18)] backdrop-blur-sm md:p-5">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 via-pink-300 to-rose-400 text-3xl shadow-md">
                🐼
              </div>

              <div>
                <p className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Hi, {student.name}! 👋
                </p>
                <p className="text-base font-bold text-violet-600">Level {student.level}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:justify-end">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-sm font-bold text-white shadow-md">
                <Icon type="star" className="h-4 w-4" />
                <span>{student.stars}</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1.5 text-sm font-bold text-white shadow-md">
                <Icon type="coin" className="h-4 w-4" />
                <span>{student.coins}</span>
              </div>

              <button
                type="button"
                onClick={() => router.push('/login')}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                <Icon type="logout" className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700">
              <span>Level Progress</span>
              <span className="text-violet-600">{student.progress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-500"
                style={{ width: `${student.progress}%` }}
              />
            </div>
          </div>
        </div>

        <nav className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`group rounded-[14px] bg-white p-4 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
                <Icon type={item.icon} className={`h-6 w-6 ${item.accent}`} />
              </div>
              <span className={`text-sm font-semibold ${item.accent}`}>{item.label}</span>
            </a>
          ))}
        </nav>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-white md:text-3xl">
            <span>🎮</span>
            <span>Choose Your Game!</span>
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => (
              <article key={game.title} className="overflow-hidden rounded-[20px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.15)]">
                <div className={`flex h-[150px] items-center justify-center bg-linear-to-br ${game.gradient} text-6xl shadow-inner`}>
                  <span aria-hidden="true">{game.emoji}</span>
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold text-slate-900">{game.title}</h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${game.subjectClass}`}>
                      {game.subject}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${game.difficultyClass}`}>
                      {game.difficulty}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`Launching ${game.title}!`) }
                    className="mt-4 w-full rounded-full bg-linear-to-r from-violet-600 to-pink-500 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
                  >
                    Play Now! 🎯
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
