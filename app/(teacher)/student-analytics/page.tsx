'use client';

import Link from 'next/link';

const stats = [
  {
    label: 'Total Points',
    value: '850',
    icon: 'star',
    badgeClasses: 'bg-[#fce7f3] text-[#ec4899]',
    accent: 'text-[#111827]',
  },
  {
    label: 'Avg Accuracy',
    value: '89%',
    icon: 'trend',
    badgeClasses: 'bg-[#dcfce7] text-[#22c55e]',
    accent: 'text-[#111827]',
  },
  {
    label: 'Games Completed',
    value: '93',
    icon: 'target',
    badgeClasses: 'bg-[#dbeafe] text-[#3b82f6]',
    accent: 'text-[#111827]',
  },
  {
    label: 'Time Spent',
    value: '38h',
    icon: 'clock',
    badgeClasses: 'bg-[#ffedd5] text-[#f97316]',
    accent: 'text-[#111827]',
  },
];

const subjects = [
  {
    name: 'Math',
    icon: '📐',
    subtitle: '18 activities • 4h',
    value: 92,
    track: 'bg-[#e5e7eb]',
    fill: 'bg-gradient-to-r from-[#22c55e] to-[#4ade80]',
    badge: 'bg-[#dcfce7] text-[#16a34a]',
  },
  {
    name: 'English',
    icon: '📗',
    subtitle: '15 activities • 3h',
    value: 88,
    track: 'bg-[#e5e7eb]',
    fill: 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]',
    badge: 'bg-[#dbeafe] text-[#2563eb]',
  },
  {
    name: 'Science',
    icon: '🔬',
    subtitle: '12 activities • 2h',
    value: 76,
    track: 'bg-[#e5e7eb]',
    fill: 'bg-gradient-to-r from-[#f97316] to-[#fb7185]',
    badge: 'bg-[#ffedd5] text-[#ea580c]',
  },
  {
    name: 'Logic',
    icon: '🧩',
    subtitle: '10 activities • 2h',
    value: 94,
    track: 'bg-[#e5e7eb]',
    fill: 'bg-gradient-to-r from-[#22c55e] to-[#34d399]',
    badge: 'bg-[#dcfce7] text-[#16a34a]',
  },
];

const badges = [
  { name: 'Math Master', earned: true, date: 'Earned May 24, 2026', icon: '🏆', classes: 'border-[#fbbf24] bg-[#fef3c7] text-[#92400e]' },
  { name: 'Speed Demon', earned: true, date: 'Earned May 18, 2026', icon: '🏆', classes: 'border-[#fbbf24] bg-[#fef3c7] text-[#92400e]' },
  { name: 'Perfect Score', earned: true, date: 'Earned May 10, 2026', icon: '🏆', classes: 'border-[#fbbf24] bg-[#fef3c7] text-[#92400e]' },
  { name: 'Weekly Champion', earned: false, date: 'Not earned yet', icon: '🔒', classes: 'border-[#d1d5db] bg-[#f3f4f6] text-[#6b7280]' },
];

const activities = [
  { name: 'Quiz Adventure - Math', date: 'May 6, 2026 at 2:30 PM', score: 96, color: 'text-[#16a34a]' },
  { name: 'Reading Sprint - English', date: 'May 5, 2026 at 1:15 PM', score: 88, color: 'text-[#2563eb]' },
  { name: 'Lab Challenge - Science', date: 'May 4, 2026 at 11:45 AM', score: 82, color: 'text-[#2563eb]' },
  { name: 'Puzzle Rush - Logic', date: 'May 3, 2026 at 9:10 AM', score: 94, color: 'text-[#16a34a]' },
];

function Icon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  switch (type) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M9 20v-7h6v7" />
        </svg>
      );
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20v-12" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="m12 2.75 2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 0 6.7 18.06l1.01-5.9L3.42 9l5.93-.86L12 2.75Z" />
        </svg>
      );
    case 'trend':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 16 10 10l4 4 6-8" />
          <path d="M20 6h-6v6" />
        </svg>
      );
    case 'target':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'medal':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M8 3h8v7a4 4 0 1 1-8 0V3Z" />
          <path d="M10 19h4v2h-4v-2Z" />
          <path d="M7 10H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h1" />
          <path d="M17 10h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-1" />
        </svg>
      );
    case 'file':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" />
          <path d="M14 2v5h5" />
          <path d="M8 13h8M8 17h8" />
        </svg>
      );
    case 'lock':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      );
    case 'trophy':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M8 4h8v2a4 4 0 0 1-8 0V4Z" />
          <path d="M6 4H3v2a4 4 0 0 0 4 4" />
          <path d="M18 4h3v2a4 4 0 0 1-4 4" />
          <path d="M12 12v5" />
          <path d="M9 20h6" />
          <path d="M8 16h8" />
        </svg>
      );
    default:
      return null;
  }
}

export default function StudentAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#38bdf8_0%,#3b82f6_38%,#818cf8_100%)] px-3 py-6 sm:px-5 lg:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="mb-6 flex items-center gap-3 text-white">
          <Link
            href="/dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1f2937] shadow-[0_10px_20px_rgba(48,67,139,0.18)] transition-transform hover:-translate-y-0.5"
            aria-label="Back to dashboard"
          >
            <Icon type="home" className="h-5 w-5 text-[#1f2937]" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl shadow-inner shadow-white/20 backdrop-blur-sm">
              📊
            </div>
            <div>
              <h1 className="text-[2.2rem] font-extrabold leading-none tracking-tight text-white sm:text-[2.6rem]">Student Analytics</h1>
              <p className="mt-1 text-sm text-sky-100 sm:text-base">Sarah Johnson • Grade 3 - Morning</p>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${stat.badgeClasses}`}>
                <Icon type={stat.icon} className="h-5 w-5" />
              </div>
              <div className={`text-[2.2rem] font-extrabold leading-none ${stat.accent}`}>{stat.value}</div>
              <div className="mt-2 text-sm font-medium text-[#6b7280]">{stat.label}</div>
            </div>
          ))}
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
          <div className="rounded-[22px] bg-white p-5 shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ede9fe] text-[#7c3aed]">
                <Icon type="trend" className="h-4 w-4" />
              </div>
              <h2 className="text-[1.8rem] font-extrabold text-[#1f2937]">Subject Performance</h2>
            </div>

            <div className="space-y-5">
              {subjects.map((subject) => (
                <div key={subject.name}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${subject.badge}`}>
                        {subject.icon}
                      </div>
                      <div>
                        <div className="text-base font-extrabold text-[#111827]">{subject.name}</div>
                        <div className="text-xs text-[#6b7280]">{subject.subtitle}</div>
                      </div>
                    </div>
                    <div className="text-[2rem] font-extrabold text-[#7c3aed]">{subject.value}%</div>
                  </div>

                  <div className={`h-2.5 w-full overflow-hidden rounded-full ${subject.track}`}>
                    <div
                      className={`h-full rounded-full ${subject.fill}`}
                      style={{ width: `${subject.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] bg-white p-5 shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3c7] text-[#d97706]">
                <Icon type="medal" className="h-4 w-4" />
              </div>
              <h2 className="text-[1.8rem] font-extrabold text-[#1f2937]">Earned Badges</h2>
            </div>

            <div className="space-y-3">
              {badges.map((badge) => (
                <div
                  key={badge.name}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${badge.classes}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/60 text-xl">
                    {badge.earned ? '🏆' : '🔒'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-[#111827]">{badge.name}</div>
                    <div className="text-[11px] text-[#6b7280]">
                      {badge.earned ? badge.date : 'Not earned yet'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[22px] bg-white p-5 shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e0f2fe] text-[#0284c7]">
              <Icon type="file" className="h-4 w-4" />
            </div>
            <h2 className="text-[1.8rem] font-extrabold text-[#1f2937]">Recent Activities</h2>
          </div>

          <div className="space-y-3">
            {activities.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-4 rounded-xl bg-[#f3f4f6] px-4 py-3">
                <div>
                  <div className="text-base font-extrabold text-[#111827]">{item.name}</div>
                  <div className="text-xs text-[#6b7280]">{item.date}</div>
                </div>
                <div className={`text-lg font-extrabold ${item.color}`}>{item.score}%</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
