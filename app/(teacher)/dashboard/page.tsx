'use client';

import Link from 'next/link';

const navItems = [
  { label: 'Create Activity', icon: 'plus', active: true, gradient: 'from-[#22c55e] to-[#10b981]' },
  { label: 'Grades', icon: 'layers', gradient: 'from-[#a855f7] to-[#d946ef]', href: '/grades' },
  { label: 'Enroll Students', icon: 'users', gradient: 'from-[#3b82f6] to-[#38bdf8]', href: '/student-enrollment' },
  { label: 'Attendance', icon: 'check', gradient: 'from-[#14b8a6] to-[#22d3ee]', href: '/attendance-management' },
  { label: 'Recorder', icon: 'chart', gradient: 'from-[#f43f5e] to-[#ec4899]', href: '/activity-recorder-grading' },
  { label: 'Live Class Activities', icon: 'gamepad', gradient: 'from-[#f97316] to-[#fb923c]', href: '/live-class-activities' },
  { label: 'Student Analytics', icon: 'chart', gradient: 'from-[#38bdf8] to-[#818cf8]', href: '/student-analytics' },
];

const stats = [
  { label: 'Total Students', value: '125', delta: '+12', accent: 'text-blue-600', iconBg: 'bg-blue-100', icon: 'users' },
  { label: 'Active Activities', value: '18', delta: '+3', accent: 'text-emerald-600', iconBg: 'bg-emerald-100', icon: 'activity' },
  { label: 'Completed Activities', value: '156', delta: '+28', accent: 'text-pink-600', iconBg: 'bg-pink-100', icon: 'check' },
  { label: 'Average Class Score', value: '87%', delta: '+5%', accent: 'text-orange-600', iconBg: 'bg-orange-100', icon: 'trend' },
];

const recentActivity = [
  { name: 'Sarah', initials: 'S', color: 'bg-[#f1d4e6]', text: 'text-[#c14f9d]', action: 'Completed Quiz Adventure', score: '95%', time: '5 min ago', scoreTone: 'text-[#1f2937]' },
  { name: 'Mike', initials: 'M', color: 'bg-[#f5d3f3]', text: 'text-[#b34bb5]', action: 'Started Speed Challenge', score: '-', time: '12 min ago', scoreTone: 'text-[#6b7280]' },
  { name: 'Emma', initials: 'E', color: 'bg-[#d6f6f1]', text: 'text-[#0e8b7a]', action: 'Completed Matching Game', score: '88%', time: '20 min ago', scoreTone: 'text-[#1f2937]' },
  { name: 'Alex', initials: 'A', color: 'bg-[#f2d8e8]', text: 'text-[#8d4b8c]', action: 'Unlocked Math Master Badge', score: '-', time: '1 hour ago', scoreTone: 'text-[#6b7280]' },
];

const notifications = [
  { title: '15 students completed today\'s activities', time: '1 hour ago', tone: 'green', accent: 'bg-[#d9f5e7]', border: 'border-[#7ad0a0]' },
  { title: 'Low performance alert for Grade 3', time: '2 hours ago', tone: 'orange', accent: 'bg-[#f7e1d4]', border: 'border-[#f6a77d]' },
  { title: 'New badge unlocked by 8 students', time: '3 hours ago', tone: 'blue', accent: 'bg-[#dfeefe]', border: 'border-[#7eb9ff]' },
];

const upcomingActivities = [
  { status: 'SCHEDULED', title: 'Math Quiz - Multiplication', grade: 'Grade 3', due: 'Due: Tomorrow', tone: 'green' },
  { status: 'DRAFT', title: 'Science Adventure - Plants', grade: 'Grade 4', due: 'Due: May 8', tone: 'gray' },
  { status: 'SCHEDULED', title: 'English Puzzle - Vocabulary', grade: 'Grade 3', due: 'Due: May 10', tone: 'green' },
];

function Icon({ type }: { type: string }) {
  const common = 'h-5 w-5';

  switch (type) {
    case 'plus':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={common}><path d="M12 5v14M5 12h14" /></svg>;
    case 'layers':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></svg>;
    case 'users':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}><path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" /><circle cx="9.5" cy="7" r="3.5" /><path d="M22 19v-1a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'check':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={common}><path d="M20 6 9 17l-5-5" /></svg>;
    case 'chart':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20v-12" /></svg>;
    case 'gamepad':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}><path d="M6 14V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" /><path d="M8 11h2M9 10v2M15 11h.01M18 10v2" /><path d="M8 15h8" /></svg>;
    case 'activity':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 14h3l2-6 3 9 2-5h2" /></svg>;
    case 'trend':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}><path d="M4 16 10 10l4 4 6-8" /><path d="M20 6h-6v6" /></svg>;
    case 'bell':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>;
    case 'calendar':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>;
    case 'logout':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>;
    default:
      return null;
  }
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#7c6cf0_0%,#b464e0_52%,#ec6fc9_100%)] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full lg:sticky lg:top-6 lg:w-[240px] lg:flex-shrink-0">
            <div className="rounded-[22px] border border-white/10 bg-white/10 p-5 shadow-[0_20px_40px_rgba(91,54,145,0.18)] backdrop-blur-md">
              <div className="flex items-center gap-3 border-b border-white/20 pb-4 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5d94b] shadow-md">
                  <span className="text-xl">🏫</span>
                </div>
                <div>
                  <div className="text-[1.1rem] font-extrabold leading-none">Teacher</div>
                  <div className="text-[1.05rem] font-extrabold leading-none">Dashboard</div>
                  <div className="mt-1 text-xs text-white/80">Welcome back!</div>
                </div>
              </div>

              <nav className="mt-5 flex flex-col gap-3">
                {navItems.map((item) => {
                  const classes = [
                    'group flex w-full items-center gap-3 rounded-[14px] border border-white/0 bg-gradient-to-r px-4 py-3 text-left text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
                    item.gradient,
                    item.active ? 'ring-1 ring-white/80 ring-offset-0 ring-offset-transparent' : '',
                  ].join(' ');

                  if (item.href) {
                    return (
                      <Link key={item.label} href={item.href} className={classes}>
                        <span className="flex h-6 w-6 items-center justify-center text-white/95">
                          <Icon type={item.icon} />
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.label}
                      className={classes}
                    >
                      <span className="flex h-6 w-6 items-center justify-center text-white/95">
                        <Icon type={item.icon} />
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-5 border-t border-white/20 pt-4">
                <button className="flex w-full items-center justify-center gap-3 rounded-[14px] border border-[#f4d9de] bg-white/95 px-4 py-3 text-left text-base font-semibold text-[#e11d48] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                  <span className="flex h-5 w-5 items-center justify-center">
                    <Icon type="logout" />
                  </span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-[3rem]">Teacher Dashboard</h1>
              <p className="mt-2 text-xl text-white/85">Welcome back! Here&apos;s what&apos;s happening today</p>
            </div>

            <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[20px] bg-white/95 p-4 shadow-[0_16px_30px_rgba(82,54,123,0.12)] ring-1 ring-white/20 backdrop-blur-sm">
                  <div className="mb-5 flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${stat.iconBg} ${stat.accent}`}>
                      <Icon type={stat.icon} />
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">{stat.delta}</span>
                  </div>

                  <div className="text-[3rem] font-extrabold leading-none tracking-tight text-[#111827]">{stat.value}</div>
                  <div className="mt-3 text-lg text-[#4b5563]">{stat.label}</div>
                </div>
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
              <div className="rounded-[20px] bg-white/95 p-4 shadow-[0_16px_30px_rgba(82,54,123,0.12)] ring-1 ring-white/20 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl text-[#111827]">
                    <Icon type="activity" />
                  </span>
                  <h2 className="text-[2rem] font-extrabold text-[#111827]">Recent Student Activity</h2>
                </div>

                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.name} className="flex items-center justify-between rounded-[14px] bg-[#f5f4f5] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${activity.color} ${activity.text} text-lg font-bold`}>
                          {activity.initials}
                        </div>
                        <div>
                          <div className="text-xl font-semibold text-[#1f2937]">{activity.name}</div>
                          <div className="text-base text-[#667085]">{activity.action}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <span className={`text-base font-semibold ${activity.scoreTone}`}>{activity.score}</span>
                        <span className="text-sm text-[#6b7280]">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/student-analytics"
                  className="mt-5 block w-full rounded-[14px] bg-gradient-to-r from-[#1aa7ea] via-[#17a5ef] to-[#12d0d7] px-4 py-4 text-center text-xl font-bold text-white shadow-[0_10px_20px_rgba(33,174,234,0.25)] transition-transform hover:-translate-y-0.5"
                >
                  View Full Analytics
                </Link>
              </div>

              <div className="rounded-[20px] bg-white/95 p-4 shadow-[0_16px_30px_rgba(82,54,123,0.12)] ring-1 ring-white/20 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl text-[#111827]">
                    <Icon type="bell" />
                  </span>
                  <h2 className="text-[2rem] font-extrabold text-[#111827]">Notifications</h2>
                </div>

                <div className="space-y-4">
                  {notifications.map((item) => (
                    <div key={item.title} className={`rounded-[14px] border-l-4 ${item.border} ${item.accent} px-4 py-3`}>
                      <div className="text-base font-semibold text-[#1f2937]">{item.title}</div>
                      <div className="mt-1 text-sm text-[#6b7280]">{item.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-[20px] bg-white/95 p-5 shadow-[0_16px_30px_rgba(82,54,123,0.12)] ring-1 ring-white/20 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-[#111827]">
                    <Icon type="calendar" />
                  </span>
                  <h2 className="text-[2rem] font-extrabold text-[#111827]">Upcoming Activities</h2>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {upcomingActivities.map((item) => (
                  <div key={item.title} className="rounded-[18px] border border-[#e5e7eb] bg-[#f8f6f8] p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <span className={`rounded-full border px-2 py-1 text-[0.7rem] font-black tracking-[0.15em] ${item.tone === 'green' ? 'border-[#87d7a3] bg-[#d9f5e7] text-[#0f8f52]' : 'border-[#d5d7dc] bg-[#edf0f4] text-[#6b7280]'}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="text-[1.1rem] font-bold text-[#1f2937]">{item.title}</div>
                    <div className="mt-4 flex items-center gap-2 text-[#4b5563]">
                      <span className="text-base text-[#a855f7]">
                        <Icon type="layers" />
                      </span>
                      <span>{item.grade}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[#4b5563]">
                      <span className="text-base text-[#a855f7]">
                        <Icon type="calendar" />
                      </span>
                      <span className="font-semibold text-[#7c3aed]">{item.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
