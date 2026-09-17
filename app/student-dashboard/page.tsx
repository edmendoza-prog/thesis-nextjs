"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import StudentLiveGames from "./StudentLiveGames";

type IconName =
  | "home"
  | "book"
  | "game"
  | "medal"
  | "chart"
  | "bell"
  | "arrow-right"
  | "play"
  | "logout"
  | "check"
  | "flame"
  | "chevron-down"
  | "target"
  | "sparkle";

export type StudentNotification = {
  key: string;
  type: 'enrollment' | 'activity' | 'grade' | 'live_game' | 'attendance';
  title: string;
  message: string;
  className: string;
  classSection: string;
  teacherName: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
};

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type AssignmentItem = {
  id?: number;
  studentId?: number;
  subject: string;
  title: string;
  due: string;
  progress: number;
  color: string;
  tint: string;
  text: string;
  score?: number | null;
  maxScore?: number | null;
  completed?: boolean;
};

const navigation = [
  { label: "Overview", icon: "home" as IconName },
  { label: "Assessment", icon: "book" as IconName },
  { label: "Live Games", icon: "game" as IconName },
];

const defaultAssignments: AssignmentItem[] = [];

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const attributes = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
    case "home":
      return (
        <svg {...attributes}>
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" />
          <path d="M9 21v-7h6v7" />
        </svg>
      );
    case "book":
      return (
        <svg {...attributes}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
      );
    case "game":
      return (
        <svg {...attributes}>
          <rect x="3" y="7" width="18" height="12" rx="3" />
          <path d="M8 13h4M10 11v4M16 12h.01M18 14h.01" />
        </svg>
      );
    case "medal":
      return (
        <svg {...attributes}>
          <path d="m8 3 4 5 4-5" />
          <circle cx="12" cy="15" r="6" />
          <path d="m12 12 1 2 2 .3-1.5 1.45.35 2.05L12 16.7l-1.85 1.1.35-2.05L9 14.3l2-.3 1-2Z" />
        </svg>
      );
    case "chart":
      return (
        <svg {...attributes}>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
      );
    case "bell":
      return (
        <svg {...attributes}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...attributes}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "play":
      return (
        <svg {...attributes}>
          <path d="m8 5 11 7-11 7V5Z" />
        </svg>
      );
    case "logout":
      return (
        <svg {...attributes}>
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
        </svg>
      );
    case "check":
      return (
        <svg {...attributes}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "flame":
      return (
        <svg {...attributes}>
          <path d="M12 22c4 0 7-2.7 7-7 0-3.7-2.4-6-5-9-1 3-3 3-4 5.5-.7-1.5-.7-3-.2-4.5C6.9 9.3 5 12 5 15c0 4.3 3 7 7 7Z" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...attributes}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "target":
      return (
        <svg {...attributes}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <path d="m17 7 4-4" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...attributes}>
          <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
        </svg>
      );
  }
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Overview");
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");
  const [assignments, setAssignments] =
    useState<AssignmentItem[]>(defaultAssignments);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const noticeDropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/student/notifications", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(Number(data.unreadCount ?? 0));
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const markNotificationAsRead = async (notificationKey: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.key === notificationKey ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await fetch("/api/student/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: notificationKey }),
      });
    } catch {}
  };

  const markAllNotificationsAsRead = async () => {
    const unreadKeys = notifications.filter((n) => !n.isRead).map((n) => n.key);
    if (unreadKeys.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/student/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: unreadKeys }),
      });
    } catch {}
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch("/api/student/activities", { cache: "no-store" });
        const data = await response.json();

        if (response.ok) {
          if (data.student?.name) {
            setStudentName(data.student.name);
          }
          if (Array.isArray(data.activities)) {
            setAssignments(data.activities);
          }
        }
      } catch (error) {
        console.error("Failed to load student activities:", error);
      }
    };

    fetchAssignments();
    fetchNotifications();

    const handleFocus = () => {
      fetchAssignments();
      fetchNotifications();
    };

    const interval = window.setInterval(fetchNotifications, 10000);

    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (noticeDropdownRef.current && !noticeDropdownRef.current.contains(event.target as Node)) {
        setNoticeOpen(false);
      }
    }
    if (noticeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [noticeOpen]);

  const handleNotificationClick = (notif: StudentNotification) => {
    if (!notif.isRead) {
      markNotificationAsRead(notif.key);
    }
    setNoticeOpen(false);

    if (notif.type === "activity" || notif.type === "grade") {
      const activityId = notif.metadata?.activityId;
      const targetAssignment = assignments.find((a) => a.id === activityId);
      if (targetAssignment) {
        openAssessment(targetAssignment);
      } else {
        setActiveNav("Assessment");
      }
    } else if (notif.type === "live_game") {
      setActiveNav("Live Games");
    } else {
      setActiveNav("Overview");
    }
  };

  const openAssessment = (item: AssignmentItem) => {
    const params = new URLSearchParams({
      title: item.title,
      subject: item.subject,
      due: item.due,
      studentId: String(item.studentId ?? 0),
    });

    if (item.id) {
      params.set("id", String(item.id));
    }

    router.push(`/student-dashboard/assessment?${params.toString()}`);
  };

  const completedAssignments = assignments.filter((assignment) => assignment.completed || (assignment.score !== null && assignment.score !== undefined));
  const completedCount = completedAssignments.length;
  const pendingAssignments = assignments.filter((assignment) => !assignment.completed && (assignment.score === null || assignment.score === undefined));
  const averageScore = completedCount
    ? Math.round(completedAssignments.reduce((total, assignment) => total + ((assignment.score ?? 0) / (assignment.maxScore || 1)) * 100, 0) / completedCount)
    : 0;

  const learningMinutes = completedCount * 25;
  const learningTimeDisplay = completedCount === 0
    ? "0m"
    : learningMinutes >= 60
      ? `${Math.floor(learningMinutes / 60)}h ${learningMinutes % 60}m`
      : `${learningMinutes}m`;

  const currentStreak = completedCount > 0 ? 1 : 0;

  const stats = [
    {
      label: "Learning time",
      value: learningTimeDisplay,
      delta: completedCount > 0 ? `+${learningMinutes}m` : "0m",
      icon: "book",
      iconColor: "bg-[#dff2ee]",
      iconTextColor: "text-[#17846f]",
    },
    {
      label: "Activities done",
      value: String(completedCount),
      delta: completedCount > 0 ? `+${completedCount}` : "0",
      icon: "check",
      iconColor: "bg-[#e8e4ff]",
      iconTextColor: "text-[#6b52bd]",
    },
    {
      label: "Average score",
      value: `${averageScore}%`,
      delta: completedCount > 0 ? (averageScore >= 75 ? "Passing" : "In progress") : "0%",
      icon: "target",
      iconColor: "bg-[#fff0da]",
      iconTextColor: "text-[#d77a17]",
    },
    {
      label: "Current streak",
      value: `${currentStreak} ${currentStreak === 1 ? "day" : "days"}`,
      delta: currentStreak > 0 ? "+1" : "0",
      icon: "flame",
      iconColor: "bg-[#ffe5e5]",
      iconTextColor: "text-[#d44f4f]",
    },
  ];

  const renderOverview = () => (
    <>
      <header className="mb-7 flex flex-col gap-4 border-b border-primary-200/70 pb-6 animate-fadeInUp sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-accent-700">
            Student workspace
          </p>
          <h1 className="font-heading text-4xl font-bold text-foreground-900">
            Overview
          </h1>
          <p className="mt-2 text-foreground-600">
            Your learning progress, assessments, and classroom updates in one
            place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveNav("Assessment")}
          className="flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-700"
        >
          <Icon name="book" className="h-5 w-5" />
          Open assessments
        </button>
      </header>

      <section className="mb-6 grid overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="border-b border-primary-100 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 animate-fadeInUp"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">
                {stat.label}
              </p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconColor}`}
              >
                <Icon
                  name={stat.icon as IconName}
                  className={`h-5 w-5 ${stat.iconTextColor}`}
                />
              </div>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-heading text-4xl font-bold text-foreground-900">
                {stat.value}
              </span>
              <span className="mb-1 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-bold text-accent-700">
                {stat.delta}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <div
          className="overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm animate-fadeInUp"
          style={{ animationDelay: "500ms" }}
        >
          <div className="flex items-center justify-between border-b border-primary-200 px-5 py-4">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground-900">
                Student activity
              </h2>
              <p className="mt-1 text-sm text-foreground-500">
                Latest work submitted in your classes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveNav("Assessment")}
              className="hidden items-center gap-1 text-sm font-bold text-accent-700 hover:text-accent-800 sm:flex"
            >
              Analytics <Icon name="arrow-right" className="h-4 w-4" />
            </button>
          </div>

          <div className="divide-y divide-primary-100">
            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <Icon name="book" className="h-6 w-6" />
                </div>
                <p className="font-heading text-base font-bold text-foreground-900">
                  No classroom activities yet
                </p>
                <p className="mt-1 max-w-xs text-xs text-foreground-500">
                  When your teacher assigns work for your class, it will appear here.
                </p>
              </div>
            ) : (
              assignments.map((item, index) => (
                <article
                  key={`${item.title}-${item.subject}-${index}`}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${item.tint} ${item.text}`}
                  >
                    <Icon name="book" className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold ${item.text}`}>
                      {item.subject}
                    </p>
                    <h3 className="mt-1 truncate text-sm font-bold">
                      {item.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-100">
                        <div
                          className={`h-full rounded-full ${item.completed ? 'bg-accent-500' : item.color}`}
                          style={{ width: `${item.completed ? 100 : item.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground-500">
                        {item.completed ? '100%' : `${item.progress}%`}
                      </span>
                    </div>
                    <p className={`mt-1 text-xs font-bold ${item.completed ? 'text-accent-700' : 'text-foreground-500'}`}>
                      {item.completed
                        ? `Completed ${item.score !== null && item.score !== undefined ? `• Score: ${item.score}/${item.maxScore}` : ''}`
                        : 'Not completed'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                    <p className="text-xs text-foreground-500">{item.due}</p>
                    <button
                      type="button"
                      onClick={() => openAssessment(item)}
                      className="mt-1.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white hover:bg-primary-600 cursor-pointer"
                      aria-label={`Open ${item.title}`}
                      title={item.completed ? `Review ${item.title}` : `Open ${item.title}`}
                    >
                      <Icon
                        name={item.completed ? "check" : "play"}
                        className="h-4 w-4"
                      />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div
          className="overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm animate-fadeInUp"
          style={{ animationDelay: "600ms" }}
        >
          <div className="flex items-center gap-2 border-b border-primary-200 px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff1d2] text-[#d97706]">
              <Icon name="bell" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground-900">
                Needs your attention
              </h2>
              <p className="text-sm text-foreground-500">Classroom updates</p>
            </div>
          </div>
          <div>
            {pendingAssignments.length > 0 ? (
              pendingAssignments.slice(0, 3).map((pending, idx) => (
                <div
                  key={pending.id || idx}
                  className="border-b border-primary-100 px-5 py-4 bg-[#fff7d6] border-l-4 border-l-[#d97706] last:border-b-0 cursor-pointer hover:bg-[#fff2be] transition-colors"
                  onClick={() => openAssessment(pending)}
                >
                  <div className="font-semibold text-foreground-900 text-sm leading-relaxed mb-1 flex items-center justify-between">
                    <span>{pending.title}</span>
                    <span className="text-xs font-bold text-amber-700 uppercase">Pending</span>
                  </div>
                  <div className="text-xs text-foreground-600">
                    {pending.subject} • {pending.due}
                  </div>
                </div>
              ))
            ) : assignments.length > 0 ? (
              <div className="px-5 py-6 bg-[#e0f4ea] border-l-4 border-l-[#16a34a]">
                <div className="font-semibold text-foreground-900 text-sm leading-relaxed mb-1">
                  All assessments completed!
                </div>
                <div className="text-xs text-foreground-600">
                  Great job! You have submitted all assigned coursework.
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-primary-100 px-5 py-4 bg-[#e0f4ea] border-l-4 border-l-[#16a34a]">
                  <div className="font-semibold text-foreground-900 text-sm leading-relaxed mb-1">
                    No urgent classroom updates
                  </div>
                  <div className="text-xs text-foreground-500">
                    You are all caught up with your classes
                  </div>
                </div>
                <div className="border-b border-primary-100 px-5 py-4 bg-[#fff7d6] border-l-4 border-l-[#d97706]">
                  <div className="font-semibold text-foreground-900 text-sm leading-relaxed mb-1">
                    Classroom assignments pending
                  </div>
                  <div className="text-xs text-foreground-500">
                    Assigned tasks will appear automatically
                  </div>
                </div>
                <div className="px-5 py-4 bg-[#f5f3ff] border-l-4 border-l-[#7c3aed]">
                  <div className="font-semibold text-foreground-900 text-sm leading-relaxed mb-1">
                    Live updates ready
                  </div>
                  <div className="text-xs text-foreground-500">
                    System is connected to your student profile
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section
        className="overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm animate-fadeInUp"
        style={{ animationDelay: "700ms" }}
      >
        <div className="flex items-center justify-between border-b border-primary-200 px-5 py-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground-900">
              Upcoming assessments
            </h2>
            <p className="mt-1 text-sm text-foreground-500">
              Keep your dates visible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveNav("Assessment")}
            className="hidden items-center gap-1 text-sm font-bold text-accent-700 hover:text-accent-800 sm:flex"
          >
            Manage <Icon name="arrow-right" className="h-4 w-4" />
          </button>
        </div>
        <div className="divide-y divide-primary-100">
          {assignments.length === 0 ? (
            <div className="p-8 text-center text-sm text-foreground-500">
              No upcoming assessments scheduled.
            </div>
          ) : (
            assignments.map((activity, index) => (
              <div
                key={`${activity.title}-${activity.subject}-${index}`}
                className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-accent-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                    <Icon name="book" className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground-900">
                      {activity.title}
                    </h3>
                    <p className="mt-1 text-sm text-foreground-600">
                      {activity.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="text-sm font-semibold text-foreground-600">
                    {activity.due}
                  </span>
                  <button
                    type="button"
                    onClick={() => openAssessment(activity)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${activity.completed ? 'bg-accent-100 text-accent-700' : 'bg-primary-500 text-white'}`}
                  >
                    {activity.completed ? 'COMPLETED' : 'OPEN'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );

  const renderAssessment = () => (
    <div className="space-y-5 py-4">
      <section className="rounded-xl border border-primary-200 bg-background-50 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">
              Assessment
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold">
              My assessments
            </h2>
          </div>
          <div className="rounded-full bg-accent-100 px-3 py-1.5 text-xs font-bold text-accent-700">
            {assignments.length} available
          </div>
        </div>
      </section>

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-primary-200 bg-white p-12 text-center shadow-sm">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
            <Icon name="book" className="h-7 w-7" />
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground-900">
            No assessments available
          </h3>
          <p className="mt-1 max-w-md text-sm text-foreground-500">
            You currently have no assigned assessments. Once your teacher assigns work, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((item, index) => (
            <article
              key={`${item.title}-${item.subject}-${index}`}
              className="rounded-2xl border border-primary-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${item.text} ${item.tint}`}
                >
                  <Icon name="book" className="h-3.5 w-3.5" />
                  {item.subject}
                </div>
                {item.completed && (
                  <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-bold text-accent-700">
                    Completed
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-heading text-2xl font-bold text-foreground-900">
                {item.title}
              </h3>
              <div className="mt-3 flex items-center justify-between text-sm text-foreground-500">
                <span>{item.due}</span>
                <span className="font-semibold text-accent-700">
                  {item.completed ? '100% complete' : `${item.progress}% complete`}
                </span>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-primary-100">
                <div
                  className={`h-full rounded-full ${item.completed ? 'bg-accent-500' : item.color}`}
                  style={{ width: `${item.completed ? 100 : item.progress}%` }}
                />
              </div>
              {item.completed && item.score !== null && item.score !== undefined && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-accent-50 px-3 py-2 text-xs font-bold text-accent-700">
                  <span>Score: {item.score} / {item.maxScore}</span>
                  <span>{Math.round(((item.score) / (item.maxScore || 1)) * 100)}%</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => openAssessment(item)}
                className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition cursor-pointer ${
                  item.completed
                    ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {item.completed ? 'Review assessment' : 'Open assessment'}
                <Icon name="arrow-right" className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  const renderLiveGames = () => <StudentLiveGames />;

  return (
    <main className="min-h-screen bg-primary-100 p-3 text-foreground-900 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1540px] gap-5 lg:min-h-[calc(100vh-2.5rem)]">
        <aside className="fixed bottom-0 left-0 top-0 z-50 hidden w-64 flex-col rounded-r-3xl border-r border-primary-200/50 bg-primary-50 p-5 shadow-sm lg:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500 text-white shadow-sm">
              <Icon name="sparkle" className="h-6 w-6" />
            </div>
            <div>
              <p className="font-heading text-lg font-bold">
                Student Workspace
              </p>
              <p className="text-xs text-foreground-500">Learning portal</p>
            </div>
          </div>
          <nav className="mt-10 space-y-1.5" aria-label="Student navigation">
            {navigation.map((item) => {
              const active = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveNav(item.label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${active ? "bg-primary-500 text-white shadow-sm" : "text-foreground-600 hover:bg-primary-100"}`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto rounded-xl bg-[#fff0da] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ef9c3a] text-white">
              <Icon name="flame" className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-bold">
              {currentStreak} {currentStreak === 1 ? "day streak" : "days streak"}
            </p>
            <p className="mt-1 text-xs leading-5 text-foreground-600">
              {currentStreak > 0
                ? "One more lesson keeps your streak growing."
                : "Complete your first lesson to start your streak."}
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
              router.push('/login');
            }}
            className="mt-4 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-foreground-500 hover:bg-rose-50 hover:text-rose-600"
          >
            <Icon name="logout" className="h-5 w-5" />
            Sign out
          </button>
        </aside>

        <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm lg:ml-64">
          <header className="flex items-center justify-between border-b border-primary-200/70 px-5 py-4 md:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
                <Icon name="sparkle" />
              </div>
              <span className="font-heading text-lg font-bold">
                Student Workspace
              </span>
            </div>
            <p className="hidden text-sm font-semibold text-foreground-500 lg:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div className="ml-auto flex items-center gap-3">
              <div className="relative" ref={noticeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setNoticeOpen(!noticeOpen)}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-lg border border-primary-200 transition-colors ${
                    noticeOpen ? 'bg-primary-100 text-primary-800' : 'text-foreground-600 hover:bg-primary-50'
                  }`}
                  aria-label="Notifications"
                >
                  <Icon name="bell" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {noticeOpen && (
                  <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-primary-200 bg-white shadow-2xl animate-fadeInUp overflow-hidden">
                    <div className="flex items-center justify-between border-b border-primary-100 bg-primary-50/70 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-base font-bold text-foreground-900">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="text-xs font-bold text-primary-700 hover:text-primary-900 transition cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-primary-100">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                            <Icon name="bell" className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-bold text-foreground-800">
                            No notifications yet
                          </p>
                          <p className="mt-1 text-xs text-foreground-500 max-w-xs">
                            When your teachers enroll you, assign coursework, or grade assessments, updates will appear here.
                          </p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const iconBg =
                            notif.type === 'enrollment'
                              ? 'bg-purple-100 text-purple-700'
                              : notif.type === 'activity'
                              ? 'bg-amber-100 text-amber-700'
                              : notif.type === 'grade'
                              ? 'bg-emerald-100 text-emerald-700'
                              : notif.type === 'live_game'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-sky-100 text-sky-700';

                          const iconType: IconName =
                            notif.type === 'enrollment'
                              ? 'sparkle'
                              : notif.type === 'activity'
                              ? 'book'
                              : notif.type === 'grade'
                              ? 'target'
                              : notif.type === 'live_game'
                              ? 'game'
                              : 'check';

                          const actionText =
                            notif.type === 'activity'
                              ? 'Open Assessment'
                              : notif.type === 'grade'
                              ? 'View Score & Assessment'
                              : notif.type === 'live_game'
                              ? 'Join Live Session'
                              : notif.type === 'enrollment'
                              ? 'View Coursework'
                              : 'View Overview';

                          const actionTone =
                            notif.type === 'activity'
                              ? 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                              : notif.type === 'grade'
                              ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                              : notif.type === 'live_game'
                              ? 'text-rose-800 bg-rose-50 hover:bg-rose-100'
                              : notif.type === 'enrollment'
                              ? 'text-purple-800 bg-purple-50 hover:bg-purple-100'
                              : 'text-sky-800 bg-sky-50 hover:bg-sky-100';

                          return (
                            <div
                              key={notif.key}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleNotificationClick(notif)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleNotificationClick(notif);
                                }
                              }}
                              title={`Click to open: ${notif.title}`}
                              className={`group flex items-start gap-3 px-4 py-3.5 transition-all duration-150 hover:bg-primary-100/60 cursor-pointer active:scale-[0.99] border-l-4 ${
                                !notif.isRead ? 'border-l-primary-600 bg-primary-50/40' : 'border-l-transparent bg-white hover:border-l-primary-300'
                              }`}
                            >
                              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${iconBg}`}>
                                <Icon name={iconType} className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="truncate text-[11px] font-bold text-primary-800">
                                    Teacher {notif.teacherName} • {notif.className}
                                  </span>
                                  <span className="shrink-0 text-[10px] font-medium text-foreground-400">
                                    {formatRelativeTime(notif.createdAt)}
                                  </span>
                                </div>

                                <h4 className="mt-0.5 text-xs font-bold text-foreground-900 line-clamp-1 group-hover:text-primary-800 transition-colors">
                                  {notif.title}
                                </h4>

                                <p className="mt-0.5 text-xs text-foreground-600 line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>

                                <div className="mt-2 flex items-center justify-between">
                                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-all group-hover:translate-x-0.5 ${actionTone}`}>
                                    {actionText}
                                    <Icon name="arrow-right" className="h-3 w-3" />
                                  </span>
                                  {!notif.isRead && (
                                    <span className="text-[10px] font-bold text-primary-600">Unread</span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 flex items-center text-foreground-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all shrink-0">
                                <Icon name="arrow-right" className="h-4 w-4" />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/student-dashboard/profile"
                className="flex items-center gap-2 rounded-lg border-l border-primary-200 pl-3 transition-colors hover:bg-primary-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-200 font-heading font-bold text-primary-800">
                  {studentName ? studentName.trim().charAt(0).toUpperCase() || 'S' : 'S'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold">{studentName || 'Student'}</p>
                  <p className="text-xs text-foreground-500">Student Account</p>
                </div>
                <Icon
                  name="chevron-down"
                  className="hidden h-4 w-4 text-foreground-400 sm:block"
                />
              </Link>
            </div>
          </header>

          <div className="px-5 py-7 md:px-8 md:py-9">
            {activeNav === "Assessment"
              ? renderAssessment()
              : activeNav === "Live Games"
                ? renderLiveGames()
                : renderOverview()}
          </div>
        </div>
      </div>
    </main>
  );
}
