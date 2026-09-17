'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  { label: 'Total Students', value: '0', delta: '+0', iconColor: 'bg-accent-100', iconTextColor: 'text-accent-600', icon: 'users' },
  { label: 'Active Activities', value: '0', delta: '+0', iconColor: 'bg-secondary-100', iconTextColor: 'text-secondary-600', icon: 'activity' },
  { label: 'Completed Activities', value: '0', delta: '+0', iconColor: 'bg-accent-100', iconTextColor: 'text-accent-600', icon: 'check-circle' },
  { label: 'Average Class Score', value: '0%', delta: '+0%', iconColor: 'bg-secondary-100', iconTextColor: 'text-secondary-600', icon: 'chart' },
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
  const [stats, setStats] = useState<DashboardStat[]>(defaultStats);
  const [recentActivity, setRecentActivity] = useState<DashboardItem[]>(defaultRecentActivity);
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const [upcomingActivities, setUpcomingActivities] = useState<UpcomingActivityItem[]>(defaultUpcomingActivities);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="mb-7 flex flex-col gap-4 border-b border-primary-200/70 pb-6 animate-fadeInUp sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-accent-700">Teacher workspace</p>
          <h1 className="font-heading text-4xl font-bold text-foreground-900">Overview</h1>
          <p className="mt-2 text-foreground-600">A quick view of your learners, activities, and classroom follow-ups.</p>
        </div>
        <Link href="/create-activity" className="flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-700"><Icon type="plus" className="h-5 w-5" />Create activity</Link>
      </header>

      <section className="mb-6 grid overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <div className="col-span-full p-6 text-sm text-foreground-500 font-body">Loading dashboard data...</div>
        ) : (
          stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="border-b border-primary-100 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 animate-fadeInUp"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">{stat.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconColor}`}>
                  <Icon type={stat.icon} className={`h-5 w-5 ${stat.iconTextColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-end gap-2"><span className="font-heading text-4xl font-bold text-foreground-900">{stat.value}</span><span className="mb-1 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-bold text-accent-700">{stat.delta}</span></div>
            </div>
          ))
        )}
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <div
          className="overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm animate-fadeInUp"
          style={{ animationDelay: '500ms' }}
        >
          <div className="flex items-center justify-between border-b border-primary-200 px-5 py-4">
            <div><h2 className="font-heading text-2xl font-bold text-foreground-900">Learner activity</h2><p className="mt-1 text-sm text-foreground-500">Latest work submitted in your classes.</p></div>
            <Link href="/student-analytics" className="hidden items-center gap-1 text-sm font-bold text-accent-700 hover:text-accent-800 sm:flex">Analytics <Icon type="arrow-right" className="h-4 w-4" /></Link>
          </div>
          <div>
            {!loading && recentActivity.length === 0 ? (
              <div className="p-6 text-sm text-foreground-500 font-body">No recent activity found.</div>
            ) : (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 border-b border-primary-100 px-5 py-4 last:border-b-0 hover:bg-accent-50">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.color} font-bold text-foreground-800 font-heading text-sm`}>
                      {activity.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground-900 font-body">{activity.name}</div>
                      <div className="text-sm text-foreground-600 font-body">{activity.action}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.score && <div className="font-heading font-bold text-accent-700">{activity.score}</div>}
                    <div className="text-xs text-foreground-500 font-body whitespace-nowrap">{activity.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div
          className="overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm animate-fadeInUp"
          style={{ animationDelay: '600ms' }}
        >
          <div className="flex items-center gap-2 border-b border-primary-200 px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff1d2] text-[#d97706]"><Icon type="bell" className="h-5 w-5" /></span>
            <div><h2 className="font-heading text-xl font-bold text-foreground-900">Needs your attention</h2><p className="text-sm text-foreground-500">Classroom updates</p></div>
          </div>
          <div>
            {!loading && notifications.length === 0 ? (
              <div className="p-6 text-sm text-foreground-500 font-body">No notifications.</div>
            ) : (
              notifications.map((notification, idx) => (
                <div
                  key={idx}
                  className={`border-b border-primary-100 px-5 py-4 last:border-b-0 ${notification.bgColor} border-l-4 ${notification.borderColor}`}
                >
                  <div className="font-semibold text-foreground-900 text-sm font-body leading-relaxed mb-1">{notification.title}</div>
                  <div className="text-xs text-foreground-500 font-body">{notification.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section
        className="overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm animate-fadeInUp"
        style={{ animationDelay: '700ms' }}
      >
        <div className="flex items-center justify-between border-b border-primary-200 px-5 py-4">
          <div><h2 className="font-heading text-2xl font-bold text-foreground-900">Upcoming activities</h2><p className="mt-1 text-sm text-foreground-500">Keep assessment dates visible.</p></div>
          <Link href="/create-activity" className="hidden items-center gap-1 text-sm font-bold text-accent-700 hover:text-accent-800 sm:flex">Manage <Icon type="arrow-right" className="h-4 w-4" /></Link>
        </div>
        <div className="divide-y divide-primary-100">
          {!loading && upcomingActivities.length === 0 ? (
            <div className="p-6 text-sm text-foreground-500 font-body">No upcoming activities.</div>
          ) : (
            upcomingActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-accent-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700"><Icon type="calendar" className="h-5 w-5" /></span><div><h3 className="font-heading text-lg font-bold text-foreground-900">{activity.title}</h3><p className="mt-1 text-sm text-foreground-600">{activity.grade}</p></div></div>
                <div className="flex items-center justify-between gap-4 sm:justify-end"><span className="text-sm font-semibold text-foreground-600">{activity.dueDate}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${activity.statusColor} whitespace-nowrap`}>{activity.status}</span></div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-foreground-500 font-body animate-fadeInUp" style={{ animationDelay: '800ms' }}>
        © 2026 Learning Management System. All rights reserved.
      </footer>
    </div>
  );
}
