'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/app/components/UserAvatar';
import CreateActivityModal from '@/app/components/CreateActivityModal';

type DashboardStat = {
  label: string;
  value: string;
  delta: string;
  iconColor: string;
  iconTextColor: string;
  icon: string;
};

type DashboardItem = {
  name: string;
  initials: string;
  avatarSeed?: string;
  color: string;
  action: string;
  score: string;
  time: string;
};

type NotificationItem = {
  title: string;
  time: string;
  borderColor: string;
  bgColor: string;
};

type UpcomingActivityItem = {
  title: string;
  grade: string;
  dueDate: string;
  status: string;
  statusColor: string;
};

const defaultStats: DashboardStat[] = [
  { label: 'Total Students', value: '0', delta: '+0', iconColor: 'bg-blue-50', iconTextColor: 'text-blue-600', icon: 'users' },
  { label: 'Active Activities', value: '0', delta: '+0', iconColor: 'bg-emerald-50', iconTextColor: 'text-emerald-600', icon: 'activity' },
  { label: 'Completed Activities', value: '0', delta: '+0', iconColor: 'bg-amber-50', iconTextColor: 'text-amber-600', icon: 'check-circle' },
  { label: 'Average Class Score', value: '0%', delta: '+0%', iconColor: 'bg-sky-50', iconTextColor: 'text-sky-600', icon: 'chart' },
];

const defaultRecentActivity: DashboardItem[] = [];
const defaultNotifications: NotificationItem[] = [];
const defaultUpcomingActivities: UpcomingActivityItem[] = [];

function Icon({ type, className = "h-5 w-5" }: { type: string; className?: string }) {
  switch (type) {
    case 'users':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" /><circle cx="9.5" cy="7" r="3.5" /><path d="M22 19v-1a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'check-circle':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></svg>;
    case 'chart':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>;
    case 'activity':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;
    case 'bell':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
    case 'calendar':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case 'x':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18M6 6l12 12" /></svg>;
    case 'plus':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14M5 12h14" /></svg>;
    case 'arrow-right':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    default:
      return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState('Teacher');
  const [stats, setStats] = useState<DashboardStat[]>(defaultStats);
  const [recentActivity, setRecentActivity] = useState<DashboardItem[]>(defaultRecentActivity);
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const [upcomingActivities, setUpcomingActivities] = useState<UpcomingActivityItem[]>(defaultUpcomingActivities);
  const [loading, setLoading] = useState(true);
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const response = await fetch('/api/teacher/dashboard');
        if (response.status === 401) {
          router.push('/login');
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          console.warn('Dashboard fetch warning:', data.error || 'Unable to load dashboard data');
          return;
        }

        if (data.teacherName) {
          setTeacherName(data.teacherName);
        }
        setStats(data.stats ?? defaultStats);
        setRecentActivity(data.recentActivity ?? defaultRecentActivity);
        setNotifications(data.notifications ?? defaultNotifications);
        setUpcomingActivities(data.upcomingActivities ?? defaultUpcomingActivities);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  const firstName = teacherName ? teacherName.trim().split(/\s+/)[0] : 'Teacher';

  return (
    <div className="mx-auto max-w-[1280px]">
      {/* Executive Classroom Hero Header */}
      <header className="relative mb-7 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-md animate-fadeInUp sm:rounded-3xl sm:p-8 text-white">
        {/* Background Image with Deep Slate Gradient */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/images/classroom-hero.png"
            alt="Classroom Background"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/70" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Teacher Command Hub
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight sm:text-3xl lg:text-4xl">
              Welcome back, {firstName}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateActivityModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95 cursor-pointer shrink-0"
          >
            <Icon type="plus" className="h-4.5 w-4.5" />
            <span>Create Activity</span>
          </button>
        </div>
      </header>

      {/* KPI Stats Row */}
      <section className="mb-6 grid overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-sm text-slate-500">Loading metrics...</div>
        ) : (
          stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="border-b border-slate-100 p-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 animate-fadeInUp transition-colors hover:bg-slate-50/50"
              style={{ animationDelay: `${(idx + 1) * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.iconColor} border border-slate-100`}>
                  <Icon type={stat.icon} className={`h-4.5 w-4.5 ${stat.iconTextColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2.5">
                <span className="font-heading text-3xl font-extrabold tracking-tight text-slate-900">{stat.value}</span>
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-100/60">
                  {stat.delta}
                </span>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Main Grid: Activity & Notifications */}
      <section className="mb-6 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div
          className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs animate-fadeInUp"
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">Learner Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Recent submissions and assignment completions</p>
            </div>
            <Link href="/student-analytics" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700">
              View Analytics <Icon type="arrow-right" className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div>
            {!loading && recentActivity.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No recent submissions found.</div>
            ) : (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 border-b border-slate-100/80 px-6 py-3.5 last:border-b-0 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-2xs">
                      <UserAvatar seed={activity.avatarSeed || activity.name} size={36} className="w-full h-full" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{activity.name}</div>
                      <div className="text-xs text-slate-500">{activity.action}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.score && <div className="font-heading font-bold text-sm text-indigo-600">{activity.score}</div>}
                    <div className="text-[11px] text-slate-400 whitespace-nowrap">{activity.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs animate-fadeInUp"
          style={{ animationDelay: '500ms' }}
        >
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-6 py-4.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Icon type="bell" className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">Needs Attention</h2>
              <p className="text-xs text-slate-500 mt-0.5">Critical student updates & alerts</p>
            </div>
          </div>
          <div>
            {!loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">All alerts resolved.</div>
            ) : (
              notifications.map((notification, idx) => (
                <div
                  key={idx}
                  className={`border-b border-slate-100/80 px-6 py-3.5 last:border-b-0 ${notification.bgColor} border-l-4 ${notification.borderColor}`}
                >
                  <div className="font-medium text-slate-900 text-xs leading-relaxed mb-0.5">{notification.title}</div>
                  <div className="text-[11px] text-slate-500">{notification.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Activities Table */}
      <section
        className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs animate-fadeInUp"
        style={{ animationDelay: '600ms' }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">Scheduled Activities</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upcoming quizzes, exams, and milestones</p>
          </div>
          <Link href="/library" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700">
            Open Library <Icon type="arrow-right" className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {!loading && upcomingActivities.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No scheduled activities.</div>
          ) : (
            upcomingActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Icon type="calendar" className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-slate-900">{activity.title}</h3>
                    <p className="text-xs text-slate-500">{activity.grade}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="text-xs font-semibold text-slate-600">{activity.dueDate}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${activity.statusColor} whitespace-nowrap`}>{activity.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-slate-400 font-body animate-fadeInUp" style={{ animationDelay: '800ms' }}>
        © 2026 Go Learning. All rights reserved.
      </footer>

      {/* Modal: Create Activity Pop-up */}
      <CreateActivityModal
        isOpen={showCreateActivityModal}
        onClose={() => setShowCreateActivityModal(false)}
        onSaved={() => {
          // Re-fetch dashboard data
          fetch('/api/teacher/dashboard')
            .then((r) => r.json())
            .then((data) => {
              if (data?.stats) setStats(data.stats);
              if (data?.upcomingActivities) setUpcomingActivities(data.upcomingActivities);
            })
            .catch(() => {});
        }}
      />
    </div>
  );
}
