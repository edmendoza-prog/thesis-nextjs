"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import UserAvatar from "@/app/components/UserAvatar";

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
  | "sparkle"
  | "file-pdf"
  | "file-slides"
  | "file-video"
  | "file-doc"
  | "arrow-left"
  | "download"
  | "eye"
  | "check-circle"
  | "clock"
  | "alert-circle"
  | "menu"
  | "x"
  | "user"
  | "list"
  | "grid"
  | "search"
  | "filter";

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
    case "arrow-left":
      return (
        <svg {...attributes}>
          <path d="m15 18-6-6 6-6" />
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
    case "check-circle":
      return (
        <svg {...attributes}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
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
    case "download":
      return (
        <svg {...attributes}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case "eye":
      return (
        <svg {...attributes}>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "clock":
      return (
        <svg {...attributes}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "alert-circle":
      return (
        <svg {...attributes}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "file-pdf":
      return (
        <svg {...attributes}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 13v4M9 13h2a1.5 1.5 0 0 0 0-3H9M15 13v4M15 13h2a1.5 1.5 0 0 0 0-3h-2" />
        </svg>
      );
    case "file-slides":
      return (
        <svg {...attributes}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <path d="m10 9 4 3-4 3V9Z" />
        </svg>
      );
    case "file-video":
      return (
        <svg {...attributes}>
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    case "file-doc":
      return (
        <svg {...attributes}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "list":
      return (
        <svg {...attributes}>
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      );
    case "grid":
      return (
        <svg {...attributes}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case "search":
      return (
        <svg {...attributes}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "filter":
      return (
        <svg {...attributes}>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      );
    default:
      return null;
  }
}

type LessonItem = {
  id: number;
  classId: number;
  title: string;
  fileName: string;
  fileType: "pdf" | "slides" | "video" | "doc" | string;
  fileUrl?: string;
  pagesOrDuration: string;
  notes?: string;
  uploadDate: string;
  createdAt: string;
  isRead: boolean;
};

type HomeworkItem = {
  id: number;
  classId: number;
  title: string;
  dueDate: string;
  dueDateRaw?: string | null;
  dueDateTime?: string | null;
  totalPoints: number;
  questionCount: number;
  status: "To do" | "Overdue" | "Submitted" | "Graded";
  score?: number | null;
  maxScore?: number | null;
  completed: boolean;
  isExam?: boolean;
  activityType?: string;
};

type ClassItem = {
  id: number;
  name: string;
  section: string;
  gradeLevel: number;
  teacherName: string;
  totalLessons: number;
  readLessons: number;
  lessonProgress: number;
  pendingHomeworkCount: number;
  totalHomeworkCount: number;
  badge: string;
  lessons: LessonItem[];
  homework: HomeworkItem[];
};

const navigation = [
  { label: "Overview", icon: "home" as IconName },
  { label: "Classes", icon: "book" as IconName },
];

function FileTypeBadge({ type }: { type: string }) {
  const t = (type || "").toLowerCase();
  if (t === "pdf") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200/80">
        <Icon name="file-pdf" className="h-3.5 w-3.5 text-rose-600" />
        PDF
      </span>
    );
  }
  if (t === "slides") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200/80">
        <Icon name="file-slides" className="h-3.5 w-3.5 text-amber-600" />
        Slides
      </span>
    );
  }
  if (t === "video") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200/80">
        <Icon name="file-video" className="h-3.5 w-3.5 text-purple-600" />
        Video
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200/80">
      <Icon name="file-doc" className="h-3.5 w-3.5 text-blue-600" />
      Document
    </span>
  );
}

function HomeworkStatusBadge({
  status,
  score,
  maxScore,
}: {
  status: "To do" | "Overdue" | "Submitted" | "Graded";
  score?: number | null;
  maxScore?: number | null;
}) {
  if (status === "Graded" && score !== null && score !== undefined) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
        <Icon name="check-circle" className="h-3.5 w-3.5 text-emerald-600" />
        Graded: {score} / {maxScore ?? 20}
      </span>
    );
  }
  if (status === "Submitted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
        <Icon name="check-circle" className="h-3.5 w-3.5 text-emerald-600" />
        Submitted {score !== null && score !== undefined ? `• ${score}/${maxScore}` : ""}
      </span>
    );
  }
  if (status === "Overdue") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
        <Icon name="alert-circle" className="h-3.5 w-3.5 text-rose-600" />
        Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
      <Icon name="clock" className="h-3.5 w-3.5 text-indigo-600" />
      To do
    </span>
  );
}

function StudentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const classIdParam = searchParams.get("classId");

  const [activeNav, setActiveNav] = useState(
    tabParam === "Classes" || tabParam === "Homework" || tabParam === "Assessment"
      ? "Classes"
      : "Overview"
  );

  const [studentName, setStudentName] = useState("Student");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [hearts, setHearts] = useState(5);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    classIdParam ? Number(classIdParam) : null
  );
  const [classDetailTab, setClassDetailTab] = useState<"lessons" | "homework">("lessons");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Homework view mode (list / grid), sorting, and filtering
  const [hwViewMode, setHwViewMode] = useState<"list" | "grid">("list");
  const [hwSort, setHwSort] = useState<"newest" | "oldest" | "title-asc" | "title-desc" | "score-high" | "score-low" | "due">("newest");
  const [hwFilter, setHwFilter] = useState<"all" | "todo" | "completed">("all");
  const [hwSearch, setHwSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        setIsMobileSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { }
    router.push("/login");
  };

  useEffect(() => {
    if (tabParam === "Classes" || tabParam === "Homework" || tabParam === "Assessment") {
      setActiveNav("Classes");
    } else if (tabParam === "Overview") {
      setActiveNav("Overview");
    }
  }, [tabParam]);

  const fetchClassesData = async () => {
    try {
      const response = await fetch("/api/student/classes", { cache: "no-store" });
      const data = await response.json();

      if (response.ok) {
        if (data.student?.name) {
          setStudentName(data.student.name);
        }
        if (data.student?.avatarSeed) {
          setAvatarSeed(data.student.avatarSeed);
        }
        if (typeof data.student?.hearts === "number") {
          setHearts(Math.max(1, Math.min(5, data.student.hearts)));
        }
        if (Array.isArray(data.classes)) {
          setClasses(data.classes);
        }
      }
    } catch (error) {
      console.error("Failed to load student classes:", error);
    }
  };

  useEffect(() => {
    fetchClassesData();

    const handleFocus = () => {
      fetchClassesData();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || null;


  const handleDownloadLesson = (lesson: LessonItem) => {
    if (lesson.fileUrl) {
      const a = document.createElement("a");
      a.href = lesson.fileUrl;
      a.download = lesson.fileName || `${lesson.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloading ${lesson.fileName || "lesson material"}...`);
      return;
    }

    if (lesson.notes) {
      const blob = new Blob([lesson.notes], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "lesson-material"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Downloading lesson text material...");
      return;
    }

    showToast("No downloadable file attached.");
  };

  const handleOpenHomework = (hw: HomeworkItem, cls: ClassItem) => {
    const params = new URLSearchParams({
      id: String(hw.id),
      classId: String(cls.id),
      title: hw.title,
      subject: cls.name,
      due: hw.dueDate,
      points: String(hw.totalPoints),
    });
    router.push(`/student-dashboard/assessment?${params.toString()}`);
  };

  // Aggregated overview stats
  const allHomework = classes.flatMap((c) => c.homework);
  const completedHwCount = allHomework.filter((h) => h.completed).length;
  const pendingHwCount = allHomework.filter((h) => !h.completed).length;
  const allLessons = classes.flatMap((c) => c.lessons);
  const readLessonsCount = allLessons.filter((l) => l.isRead).length;
  const currentStreak = completedHwCount > 0 || readLessonsCount > 0 ? 1 : 0;

  const stats = [
    {
      label: "Enrolled classes",
      value: String(classes.length),
      delta: `${classes.length} active`,
      icon: "book",
      iconColor: "bg-[#EDF0FF]",
      iconTextColor: "text-[#4255FF]",
    },
    {
      label: "Lessons read",
      value: `${readLessonsCount} / ${allLessons.length}`,
      delta: allLessons.length > 0 ? `${Math.round((readLessonsCount / allLessons.length) * 100)}% read` : "0%",
      icon: "check",
      iconColor: "bg-[#E6F8F0]",
      iconTextColor: "text-[#23B26D]",
    },
    {
      label: "Homework to do",
      value: String(pendingHwCount),
      delta: pendingHwCount === 0 ? "All caught up" : `${pendingHwCount} pending`,
      icon: "target",
      iconColor: "bg-[#FFF9E6]",
      iconTextColor: "text-[#D99B00]",
    },
    {
      label: "Learning streak",
      value: `${currentStreak} ${currentStreak === 1 ? "day" : "days"}`,
      delta: currentStreak > 0 ? "Active 🔥" : "Start today",
      icon: "flame",
      iconColor: "bg-[#FFF0ED]",
      iconTextColor: "text-[#FF725B]",
    },
  ];

  // Render: Overview Tab
  const renderOverview = () => (
    <>
      <header className="mb-7 flex flex-col gap-4 border-b border-[#E5E8F0] pb-6 animate-fadeInUp sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-[#4255FF]">
            Student workspace
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#2E3856]">
            Welcome back, {studentName}!
          </h1>
          <p className="mt-1 text-slate-600 text-sm">
            Access your classes, learning materials, and homework assignments all in one place.
          </p>

          {/* Student Life Hearts Standing Badge */}
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200/80 bg-linear-to-r from-rose-50/70 via-white to-primary-50/40 p-3 shadow-xs sm:inline-flex">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 border border-rose-200 text-lg shadow-xs">
                ❤️
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Student Life:
                  </span>
                  <span className="font-heading text-sm font-bold text-[#2E3856]">
                    {hearts} <span className="text-xs text-slate-400">/ 5 ❤️</span>
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((heartIdx) => (
                    <span
                      key={heartIdx}
                      className={`text-base leading-none transition-transform ${heartIdx <= hearts ? "opacity-100 drop-shadow-xs" : "opacity-25 grayscale"
                        }`}
                    >
                      {heartIdx <= hearts ? "❤️" : "🤍"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold shadow-xs ${hearts >= 4
                ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                : hearts === 3
                  ? "border border-blue-300 bg-blue-50 text-blue-800"
                  : "border border-rose-300 bg-rose-50 text-rose-800"
                }`}
            >
              {hearts >= 4 ? "✨ Full Life" : hearts === 3 ? "👍 Normal Life" : "⚠️ Needs Attention"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveNav("Classes");
            setSelectedClassId(null);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#4255FF] px-5 py-3 text-sm font-bold text-white shadow-sm shadow-[#4255FF]/25 transition hover:bg-[#3444D9] cursor-pointer"
        >
          <Icon name="book" className="h-5 w-5" />
          Open classes
        </button>
      </header>

      {/* Stats Grid */}
      <section className="mb-6 grid overflow-hidden rounded-2xl border border-[#E5E8F0] bg-white shadow-xs sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="border-b border-slate-100 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 animate-fadeInUp"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {stat.label}
              </p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconColor}`}>
                <Icon name={stat.icon as IconName} className={`h-5 w-5 ${stat.iconTextColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-heading text-3xl font-bold text-[#2E3856]">
                {stat.value}
              </span>
              <span className="mb-1 rounded-full bg-[#EDF0FF] px-2 py-0.5 text-xs font-bold text-[#4255FF]">
                {stat.delta}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* My Enrolled Classes Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#2E3856]">My Classes</h2>
            <p className="text-xs text-slate-500">Select a class to view lessons and homework</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveNav("Classes");
              setSelectedClassId(null);
            }}
            className="text-sm font-bold text-[#4255FF] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            View all classes <Icon name="arrow-right" className="h-4 w-4" />
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF0FF] text-[#4255FF]">
              <Icon name="book" className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#2E3856]">
              No enrolled classes yet
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              When your teacher enrolls you in a section, your class cards and lessons will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {classes.slice(0, 3).map((cls) => (
              <div
                key={cls.id}
                onClick={() => {
                  setActiveNav("Classes");
                  setSelectedClassId(cls.id);
                  setClassDetailTab("lessons");
                }}
                className="group flex flex-col justify-between rounded-2xl border border-[#E5E8F0] bg-white p-5 shadow-xs transition hover:border-[#BAC4FF] hover:shadow-md cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center rounded-lg bg-[#EDF0FF] px-2.5 py-1 text-xs font-bold text-[#4255FF]">
                      Grade {cls.gradeLevel || 1} • {cls.section}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cls.pendingHomeworkCount > 0
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                    >
                      {cls.badge}
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-xl font-bold text-[#2E3856] group-hover:text-[#4255FF] transition">
                    {cls.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">Teacher: {cls.teacherName}</p>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Lessons read</span>
                    <span className="font-bold text-[#4255FF]">
                      {cls.readLessons} / {cls.totalLessons} ({cls.lessonProgress}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#4255FF] transition-all duration-300"
                      style={{ width: `${cls.lessonProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );

  // Render: Classes List or Drill-down (NEO LMS style with Lessons & Homework tabs)
  const renderClasses = () => {
    // If a class is selected, show the LMS drill-down view!
    if (selectedClass) {
      return (
        <div className="space-y-6">
          {/* Top Bar / Back button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedClassId(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#4255FF] shadow-xs transition hover:bg-[#EDF0FF] cursor-pointer"
            >
              <Icon name="arrow-left" className="h-4 w-4" />
              Back to Classes
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Class Progress:</span>
              <span className="rounded-full bg-[#EDF0FF] px-3 py-1 text-xs font-extrabold text-[#4255FF]">
                {selectedClass.lessonProgress}% completed
              </span>
            </div>
          </div>

          {/* Class Header Banner (NEO LMS banner style) */}
          <div className="relative overflow-hidden rounded-3xl border border-[#BAC4FF]/60 bg-linear-to-r from-[#0A092D] via-[#1E2340] to-[#2B325B] p-6 sm:p-8 text-white shadow-lg">
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-lg bg-[#4255FF] px-2.5 py-0.5 text-xs font-extrabold tracking-wider uppercase text-white shadow-xs">
                    {selectedClass.section}
                  </span>
                  <span className="text-xs font-medium text-slate-300">
                    Grade {selectedClass.gradeLevel || 1}
                  </span>
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {selectedClass.name}
                </h1>
                <p className="mt-2 text-sm text-slate-300 flex items-center gap-2">
                  <span>Instructor: <strong className="text-white">{selectedClass.teacherName}</strong></span>
                  <span>•</span>
                  <span>{selectedClass.totalLessons} Lessons</span>
                  <span>•</span>
                  <span>{selectedClass.totalHomeworkCount} Homework</span>
                </p>
              </div>

              {/* Quick Status Pill */}
              <div className="shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-extrabold shadow-md ${selectedClass.pendingHomeworkCount > 0
                    ? "bg-[#FFCD1F] text-slate-950"
                    : "bg-emerald-500 text-white"
                    }`}
                >
                  <Icon
                    name={selectedClass.pendingHomeworkCount > 0 ? "clock" : "check"}
                    className="h-4 w-4"
                  />
                  {selectedClass.badge}
                </span>
              </div>
            </div>

            {/* Subtle background decoration */}
            <div className="pointer-events-none absolute -right-8 -bottom-8 h-48 w-48 rounded-full bg-[#4255FF]/20 blur-2xl" />
          </div>

          {/* Tab Navigation: Lessons & Homework */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setClassDetailTab("lessons")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition cursor-pointer ${classDetailTab === "lessons"
                ? "border-[#4255FF] text-[#4255FF]"
                : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              <Icon name="book" className="h-4 w-4" />
              Lessons ({selectedClass.lessons.length})
            </button>
            <button
              type="button"
              onClick={() => setClassDetailTab("homework")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition cursor-pointer ${classDetailTab === "homework"
                ? "border-[#4255FF] text-[#4255FF]"
                : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              <Icon name="target" className="h-4 w-4" />
              Homework ({selectedClass.homework.length})
              {selectedClass.pendingHomeworkCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-white">
                  {selectedClass.pendingHomeworkCount}
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: LESSONS TAB */}
          {classDetailTab === "lessons" && (
            <div className="space-y-4">
              {selectedClass.lessons.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Icon name="book" className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#2E3856]">
                    No lessons yet
                  </h3>
                  <p className="mt-1 max-w-md text-xs text-slate-500">
                    Your teacher has not uploaded any lessons for this section.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-2xl border border-[#E5E8F0] bg-white shadow-xs overflow-hidden">
                  {selectedClass.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="pt-0.5 shrink-0">
                          <FileTypeBadge type={lesson.fileType} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-heading text-base font-bold text-[#2E3856] truncate">
                              {lesson.title}
                            </h3>
                            {lesson.isRead ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                <Icon name="check" className="h-3 w-3" /> Read
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-[#EDF0FF] px-2 py-0.5 text-[11px] font-bold text-[#4255FF] border border-[#BAC4FF]">
                                New
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span className="font-medium text-slate-600">{lesson.pagesOrDuration}</span>
                            <span>•</span>
                            <span>Uploaded {lesson.uploadDate}</span>
                            {lesson.notes && (
                              <>
                                <span>•</span>
                                <span className="italic text-slate-500 truncate max-w-xs">
                                  Notes: &quot;{lesson.notes}&quot;
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => router.push(`/student-dashboard/lesson?id=${lesson.id}&classId=${selectedClass.id}`)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#4255FF] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#3444D9] cursor-pointer"
                        >
                          <Icon name="eye" className="h-3.5 w-3.5" />
                          Open lesson
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: HOMEWORK TAB */}
          {classDetailTab === "homework" && (() => {
            const hwList = selectedClass.homework || [];
            const todoCount = hwList.filter((h) => !h.completed && h.status !== "Graded").length;
            const completedCount = hwList.filter((h) => h.completed || h.status === "Graded" || h.status === "Submitted").length;

            let displayedHomework = [...hwList];
            if (hwSearch.trim()) {
              const q = hwSearch.toLowerCase().trim();
              displayedHomework = displayedHomework.filter((h) => h.title.toLowerCase().includes(q));
            }
            if (hwFilter === "todo") {
              displayedHomework = displayedHomework.filter((h) => !h.completed && h.status !== "Graded");
            } else if (hwFilter === "completed") {
              displayedHomework = displayedHomework.filter((h) => h.completed || h.status === "Graded" || h.status === "Submitted");
            }

            displayedHomework.sort((a, b) => {
              if (hwSort === "newest") return (b.id || 0) - (a.id || 0);
              if (hwSort === "oldest") return (a.id || 0) - (b.id || 0);
              if (hwSort === "title-asc") return a.title.localeCompare(b.title);
              if (hwSort === "title-desc") return b.title.localeCompare(a.title);
              if (hwSort === "score-high") {
                const sA = a.score != null ? a.score : -1;
                const sB = b.score != null ? b.score : -1;
                return sB - sA;
              }
              if (hwSort === "score-low") {
                const sA = a.score != null ? a.score : 9999;
                const sB = b.score != null ? b.score : 9999;
                return sA - sB;
              }
              if (hwSort === "due") {
                const dA = a.dueDateRaw ? new Date(a.dueDateRaw).getTime() : 0;
                const dB = b.dueDateRaw ? new Date(b.dueDateRaw).getTime() : 0;
                return dA - dB;
              }
              return (b.id || 0) - (a.id || 0);
            });

            return (
              <div className="space-y-4">
                {hwList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <Icon name="target" className="h-7 w-7" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[#2E3856]">
                      No homework available
                    </h3>
                    <p className="mt-1 max-w-md text-xs text-slate-500">
                      Once your teacher assigns work for this class, it will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Toolbar: Search, Filters, View Mode, and Sorting */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#E5E8F0] shadow-xs">
                      {/* Search Bar */}
                      <div className="relative flex-1 min-w-[180px] max-w-md">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={hwSearch}
                          onChange={(e) => setHwSearch(e.target.value)}
                          placeholder="Search homework..."
                          className="w-full pl-9 pr-8 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-[#4255FF] transition-all text-slate-800"
                        />
                        {hwSearch && (
                          <button
                            type="button"
                            onClick={() => setHwSearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Controls Area */}
                      <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                        {/* Filter Status Pills */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setHwFilter("all")}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              hwFilter === "all"
                                ? "bg-white text-[#4255FF] shadow-xs font-extrabold"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            All ({hwList.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setHwFilter("todo")}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              hwFilter === "todo"
                                ? "bg-white text-indigo-600 shadow-xs font-extrabold"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            To Do ({todoCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setHwFilter("completed")}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              hwFilter === "completed"
                                ? "bg-white text-emerald-600 shadow-xs font-extrabold"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Finished ({completedCount})
                          </button>
                        </div>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs">
                          <Icon name="filter" className="h-3.5 w-3.5 text-[#4255FF]" />
                          <span className="text-slate-500 font-semibold hidden lg:inline">Sort:</span>
                          <select
                            value={hwSort}
                            onChange={(e) => setHwSort(e.target.value as any)}
                            className="bg-transparent outline-none cursor-pointer font-bold text-slate-800 pr-1"
                          >
                            <option value="newest">🕒 Newest First</option>
                            <option value="oldest">⏳ Oldest First</option>
                            <option value="due">📅 Due Date</option>
                            <option value="title-asc">🔤 Title (A → Z)</option>
                            <option value="title-desc">🔡 Title (Z → A)</option>
                            <option value="score-high">🏆 Score (High → Low)</option>
                            <option value="score-low">📉 Score (Low → High)</option>
                          </select>
                        </div>

                        {/* View Mode Toggle: List vs Grid */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setHwViewMode("list")}
                            title="List View"
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              hwViewMode === "list" ? "bg-white text-[#4255FF] shadow-xs" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <Icon name="list" className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setHwViewMode("grid")}
                            title="Grid View"
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              hwViewMode === "grid" ? "bg-white text-[#4255FF] shadow-xs" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <Icon name="grid" className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Empty Filter State */}
                    {displayedHomework.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
                        <p className="font-heading text-sm font-bold text-slate-600">
                          No homework found matching your search or filter.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setHwSearch("");
                            setHwFilter("all");
                          }}
                          className="mt-3 text-xs font-bold text-[#4255FF] hover:underline cursor-pointer"
                        >
                          Clear search and filters
                        </button>
                      </div>
                    ) : hwViewMode === "list" ? (
                      /* LIST VIEW (matching Lessons style) */
                      <div className="divide-y divide-slate-100 rounded-2xl border border-[#E5E8F0] bg-white shadow-xs overflow-hidden">
                        {displayedHomework.map((hw) => (
                          <div
                            key={hw.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition hover:bg-slate-50/80"
                          >
                            {/* Left: Icon & Homework Info */}
                            <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                                  hw.completed
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80"
                                    : hw.status === "Overdue"
                                    ? "bg-rose-50 text-rose-600 border border-rose-200/80"
                                    : "bg-[#EDF0FF] text-[#4255FF] border border-[#BAC4FF]"
                                }`}
                              >
                                <Icon name={hw.completed ? "check-circle" : "target"} className="h-5 w-5" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-heading text-base font-bold text-[#2E3856] truncate">
                                    {hw.title}
                                  </h3>
                                  <HomeworkStatusBadge
                                    status={hw.status}
                                    score={hw.score}
                                    maxScore={hw.maxScore}
                                  />
                                </div>

                                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                                  <span className="font-semibold text-slate-600">
                                    {hw.totalPoints} points • {hw.questionCount} questions
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 font-medium">
                                    <Icon name="clock" className="h-3.5 w-3.5 text-slate-400" />
                                    Due: <strong className="text-slate-700">{hw.dueDate}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              {hw.completed && (
                                <span className="text-xs font-bold text-emerald-700 hidden lg:inline-flex items-center gap-1">
                                  <Icon name="check" className="h-4 w-4" /> Finished
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenHomework(hw, selectedClass)}
                                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition cursor-pointer shadow-xs ${
                                  hw.completed
                                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    : "bg-[#4255FF] text-white hover:bg-[#3444D9] shadow-[#4255FF]/20"
                                }`}
                              >
                                {hw.completed ? "Review homework" : "Start homework"}
                                <Icon name="arrow-right" className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* GRID VIEW */
                      <div className="grid gap-4 md:grid-cols-2">
                        {displayedHomework.map((hw) => (
                          <article
                            key={hw.id}
                            className="flex flex-col justify-between rounded-2xl border border-[#E5E8F0] bg-white p-6 shadow-xs transition hover:border-[#BAC4FF] hover:shadow-md"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                  {hw.totalPoints} points • {hw.questionCount} questions
                                </span>
                                <HomeworkStatusBadge
                                  status={hw.status}
                                  score={hw.score}
                                  maxScore={hw.maxScore}
                                />
                              </div>

                              <h3 className="mt-4 font-heading text-xl font-bold text-[#2E3856]">
                                {hw.title}
                              </h3>

                              <p className="mt-2 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                <Icon name="clock" className="h-3.5 w-3.5 text-slate-400" />
                                Due: <strong className="text-slate-700">{hw.dueDate}</strong>
                              </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                              {hw.completed ? (
                                <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                                  <Icon name="check" className="h-4 w-4" /> Finished
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-slate-500">
                                  Status: <strong className={hw.status === "Overdue" ? "text-rose-600" : "text-[#4255FF]"}>{hw.status}</strong>
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenHomework(hw, selectedClass)}
                                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition cursor-pointer shadow-xs ${
                                  hw.completed
                                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    : "bg-[#4255FF] text-white hover:bg-[#3444D9] shadow-[#4255FF]/20"
                                }`}
                              >
                                {hw.completed ? "Review homework" : "Start homework"}
                                <Icon name="arrow-right" className="h-4 w-4" />
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      );
    }

    // Default: List all Class Cards
    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-2 border-b border-[#E5E8F0] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4255FF]">
              Enrolled Sections
            </p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold text-[#2E3856]">
              My Classes
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any class to access lesson handouts, lecture notes, and assigned homework.
            </p>
          </div>
          <div className="rounded-full bg-[#EDF0FF] px-4 py-1.5 text-xs font-bold text-[#4255FF] self-start sm:self-auto">
            {classes.length} {classes.length === 1 ? "Class" : "Classes"}
          </div>
        </header>

        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF0FF] text-[#4255FF]">
              <Icon name="book" className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#2E3856]">
              No classes assigned yet
            </h3>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              Your teacher will assign you to your classroom section soon. Once enrolled, your classes will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setClassDetailTab("lessons");
                }}
                className="group flex flex-col lg:flex-row lg:items-center justify-between gap-5 rounded-2xl border border-[#E5E8F0] bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-[#BAC4FF] hover:shadow-md hover:bg-slate-50/40 cursor-pointer"
              >
                {/* Left: Icon & Class Info */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EDF0FF] text-[#4255FF] group-hover:bg-[#4255FF] group-hover:text-white transition-colors">
                    <Icon name="book" className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-lg bg-[#EDF0FF] px-2.5 py-0.5 text-xs font-bold text-[#4255FF]">
                        Grade {cls.gradeLevel || 1} • {cls.section}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${cls.pendingHomeworkCount > 0
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                      >
                        {cls.badge}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-[#2E3856] group-hover:text-[#4255FF] transition truncate">
                      {cls.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">
                      Instructor: <strong className="text-slate-700">{cls.teacherName}</strong>
                    </p>
                  </div>
                </div>

                {/* Middle: Lessons & Homework Counts + Progress Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8 shrink-0">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
                    <span className="flex items-center gap-1.5 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Icon name="book" className="h-4 w-4 text-[#4255FF]" />
                      {cls.totalLessons} Lessons
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Icon name="target" className="h-4 w-4 text-amber-500" />
                      {cls.totalHomeworkCount} Homework
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="w-full sm:w-44">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">Lessons</span>
                      <span className="text-[#4255FF]">
                        {cls.readLessons}/{cls.totalLessons} ({cls.lessonProgress}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#4255FF] transition-all duration-300"
                        style={{ width: `${cls.lessonProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Enter Class Button */}
                <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-[#EDF0FF] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#4255FF] group-hover:bg-[#4255FF] group-hover:text-white transition-colors">
                    Enter Class
                    <Icon name="arrow-right" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F6F7FB] text-[#2E3856] font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#0A092D] px-5 py-3 text-sm font-bold text-white shadow-2xl animate-fadeInUp">
          <Icon name="sparkle" className="h-4 w-4 text-[#FFCD1F]" />
          <span>{toastMessage}</span>
        </div>
      )}



      {/* Desktop Fixed Dark Navy Sidebar */}
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-64 flex-col border-r border-[#1E2340] bg-[#0A092D] p-5 shadow-xl lg:flex text-white">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4255FF] text-white shadow-md shadow-[#4255FF]/25">
            <Icon name="sparkle" className="h-6 w-6" />
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-white">
              Go Learning
            </p>
            <p className="text-xs text-slate-400">Student Portal</p>
          </div>
        </div>

        {/* Navigation Items (Overview & Classes) */}
        <nav className="mt-8 space-y-1.5" aria-label="Student navigation">
          {navigation.map((item) => {
            const active = activeNav === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setActiveNav(item.label);
                  if (item.label === "Classes") {
                    setSelectedClassId(null);
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition cursor-pointer ${active
                  ? "bg-[#4255FF] text-white shadow-md font-bold scale-[1.01]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon name={item.icon} className={`h-5 w-5 ${active ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {item.label === "Classes" && pendingHwCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-black text-white shadow-xs">
                    {pendingHwCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 hover:bg-white/10 hover:text-rose-400 transition cursor-pointer"
        >
          <Icon name="logout" className="h-5 w-5" />
          Sign out
        </button>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0A092D]/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0A092D] p-5 text-white shadow-2xl flex flex-col border-r border-[#1E2340]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2340]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4255FF] text-white shadow-md">
                  <Icon name="sparkle" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading text-base font-bold text-white">Go Learning</p>
                  <p className="text-[11px] text-slate-400">Student Portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Close sidebar"
              >
                <Icon name="x" className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 space-y-1.5 flex-1" aria-label="Mobile student navigation">
              {navigation.map((item) => {
                const active = activeNav === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setActiveNav(item.label);
                      if (item.label === "Classes") {
                        setSelectedClassId(null);
                      }
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition cursor-pointer ${active
                      ? "bg-[#4255FF] text-white shadow-md font-bold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <Icon name={item.icon} className={`h-5 w-5 ${active ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                    {item.label === "Classes" && pendingHwCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-black text-white shadow-xs">
                        {pendingHwCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 hover:bg-white/10 hover:text-rose-400 transition cursor-pointer"
            >
              <Icon name="logout" className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Column with Full-Width Top Navbar */}
      <div className="flex flex-1 flex-col min-h-screen w-full lg:ml-64">
        {/* Full-Width Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-2xs">
          {/* Left: Mobile Toggle + Date */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden focus:outline-hidden cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <Icon name="menu" className="h-6 w-6" />
            </button>

            {/* Mobile Branding */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4255FF] text-white shadow-sm">
                <Icon name="sparkle" className="h-5 w-5" />
              </div>
              <span className="font-heading text-base font-extrabold text-slate-900">
                Go <span className="text-[#4255FF]">Learning</span>
              </span>
            </div>

            {/* Desktop Date */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Icon name="clock" className="h-4 w-4 text-slate-400" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Right: Student Profile & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group flex items-center gap-2.5 rounded-full sm:rounded-xl p-1 sm:py-1.5 sm:px-2.5 transition-colors hover:bg-slate-100 focus:outline-hidden cursor-pointer"
              aria-label="Student profile menu"
              aria-expanded={isDropdownOpen}
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-xs">
                <UserAvatar seed={avatarSeed || studentName || "Student"} size={36} className="w-full h-full" />
              </div>

              {/* Name & Role */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight max-w-[140px] truncate">
                  {studentName || "Student"}
                </span>
                <span className="text-[11px] font-medium text-slate-500 leading-none mt-0.5">
                  Student Account
                </span>
              </div>

              {/* Dropdown Chevron */}
              <div className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}>
                <Icon name="chevron-down" className="h-4 w-4" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 ring-1 ring-black/5 z-50 animate-fadeInUp">
                {/* Summary Header */}
                <div className="flex items-center gap-3 p-3 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-xs">
                    <UserAvatar seed={avatarSeed || studentName || "Student"} size={40} className="w-full h-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{studentName || "Student"}</p>
                    <p className="text-xs text-[#4255FF] font-semibold">Student Account</p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="space-y-0.5">
                  <Link
                    href="/student-dashboard/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-[#EDF0FF] hover:text-[#4255FF] transition-colors"
                  >
                    <Icon name="user" className="h-4 w-4 text-[#4255FF]" />
                    <span>My Profile</span>
                  </Link>
                </div>

                {/* Divider & Sign out */}
                <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <Icon name="logout" className="h-4 w-4 text-red-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 w-full">
          {activeNav === "Classes" ? renderClasses() : renderOverview()}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F7FB] p-6 text-sm font-semibold text-[#4255FF]">
          Loading dashboard...
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  );
}
