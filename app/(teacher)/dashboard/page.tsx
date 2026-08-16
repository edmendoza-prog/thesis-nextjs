'use client';

import { useEffect, useState } from 'react';

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
    default:
      return null;
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStat[]>(defaultStats);
  const [recentActivity, setRecentActivity] = useState<DashboardItem[]>(defaultRecentActivity);
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const [upcomingActivities, setUpcomingActivities] = useState<UpcomingActivityItem[]>(defaultUpcomingActivities);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const response = await fetch('/api/teacher/dashboard');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load dashboard data');
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
  }, []);

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between animate-fadeInUp">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground-900 mb-2">Teacher Dashboard</h1>
          <p className="text-foreground-600 font-body">Welcome back! Here&apos;s what&apos;s happening today</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-foreground-800 text-white flex items-center justify-center hover:bg-foreground-900 transition-colors">
          <Icon type="x" className="h-5 w-5" />
        </button>
      </header>

      {/* Stats cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {loading ? (
          <div className="col-span-full text-sm text-foreground-500 font-body">Loading dashboard data...</div>
        ) : (
          stats.map((stat, idx) => (
            <div 
              key={stat.label} 
              className="bg-background-50 rounded-2xl border border-background-200/70 p-6 transition-all duration-300 hover:scale-[1.02] animate-fadeInUp"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconColor}`}>
                  <Icon type={stat.icon} className={`h-6 w-6 ${stat.iconTextColor}`} />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-accent-100 text-accent-700 text-xs font-bold font-body whitespace-nowrap">
                  {stat.delta}
                </span>
              </div>
              <div className="text-5xl font-bold text-foreground-900 font-heading mb-2">{stat.value}</div>
              <div className="text-sm text-foreground-600 font-body">{stat.label}</div>
            </div>
          ))
        )}
      </section>

      {/* Two-column section */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Recent Activity (3/5) */}
        <div 
          className="lg:col-span-3 bg-background-50 rounded-2xl border border-background-200/70 p-6 transition-all duration-300 hover:scale-[1.01] animate-fadeInUp"
          style={{ animationDelay: '500ms' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Icon type="activity" className="h-6 w-6 text-foreground-700" />
            <h2 className="text-2xl font-heading font-bold text-foreground-900">Recent Student Activity</h2>
          </div>
          <div className="space-y-3 mb-5">
            {!loading && recentActivity.length === 0 ? (
              <div className="text-sm text-foreground-500 font-body">No recent activity found.</div>
            ) : (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-background-100/50 hover:bg-background-200/50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${activity.color} font-bold text-foreground-800 font-heading text-lg`}>
                      {activity.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground-900 font-body">{activity.name}</div>
                      <div className="text-sm text-foreground-600 font-body">{activity.action}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.score && (
                      <div className="font-bold text-foreground-900 font-heading mb-0.5">{activity.score}</div>
                    )}
                    <div className="text-xs text-foreground-500 font-body whitespace-nowrap">{activity.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full py-3.5 bg-accent-500 text-white font-bold rounded-2xl transition-all duration-300 hover:bg-accent-600 font-body whitespace-nowrap">
            View Full Analytics
          </button>
        </div>

        {/* Notifications (2/5) */}
        <div 
          className="lg:col-span-2 bg-background-50 rounded-2xl border border-background-200/70 p-6 transition-all duration-300 hover:scale-[1.01] animate-fadeInUp"
          style={{ animationDelay: '600ms' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Icon type="bell" className="h-6 w-6 text-foreground-700" />
            <h2 className="text-2xl font-heading font-bold text-foreground-900">Notifications</h2>
          </div>
          <div className="space-y-3">
            {!loading && notifications.length === 0 ? (
              <div className="text-sm text-foreground-500 font-body">No notifications.</div>
            ) : (
              notifications.map((notification, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl ${notification.bgColor} border-l-4 ${notification.borderColor} hover:shadow-sm transition-shadow`}
                >
                  <div className="font-semibold text-foreground-900 text-sm font-body leading-relaxed mb-1">{notification.title}</div>
                  <div className="text-xs text-foreground-500 font-body">{notification.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Activities */}
      <section 
        className="animate-fadeInUp"
        style={{ animationDelay: '700ms' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Icon type="calendar" className="h-6 w-6 text-foreground-700" />
          <h2 className="text-2xl font-heading font-bold text-foreground-900">Upcoming Activities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {!loading && upcomingActivities.length === 0 ? (
            <div className="text-sm text-foreground-500 font-body">No upcoming activities.</div>
          ) : (
            upcomingActivities.map((activity, idx) => (
              <div 
                key={idx} 
                className="bg-background-50 rounded-2xl border border-background-200/70 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activity.statusColor} font-body whitespace-nowrap`}>
                    {activity.status}
                  </span>
                </div>
                <h3 className="font-bold text-foreground-900 text-lg mb-2 font-heading leading-snug">{activity.title}</h3>
                <p className="text-sm text-foreground-600 mb-1 font-body">{activity.grade}</p>
                <p className="text-xs text-foreground-500 font-body flex items-center gap-1.5">
                  <Icon type="calendar" className="h-3.5 w-3.5" />
                  {activity.dueDate}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-foreground-500 font-body animate-fadeInUp" style={{ animationDelay: '800ms' }}>
        © 2026 Sacred Heart School of Butuan, Inc. All rights reserved.
      </footer>
    </div>
  );
}
