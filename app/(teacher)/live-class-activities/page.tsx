"use client";

import { useEffect, useState } from "react";
import WheelDisplay from "./WheelDisplay";

const activities = [
  {
    id: "spin-wheel",
    title: "Spin the Wheel",
    description: "Pick a student at random",
    category: "Warm up",
    icon: "🎡",
    color: "bg-[#fff1e8]",
    iconColor: "bg-[#f97316]",
  },
  {
    id: "racing-game",
    title: "Racing Game",
    description: "Turn questions into a team race",
    category: "Competition",
    icon: "🏁",
    color: "bg-[#e8f7f4]",
    iconColor: "bg-[#0f9f8f]",
  },
  {
    id: "quiz-battle",
    title: "Quiz Battle",
    description: "Host a live quiz showdown",
    category: "Quiz",
    icon: "🎯",
    color: "bg-[#f1edff]",
    iconColor: "bg-[#6f55cf]",
  },
  {
    id: "word-cloud",
    title: "Word Cloud",
    description: "Collect ideas from the whole class",
    category: "Discussion",
    icon: "☁️",
    color: "bg-[#eaf3ff]",
    iconColor: "bg-[#3985d6]",
  },
  {
    id: "true-false",
    title: "True or False",
    description: "Check understanding in seconds",
    category: "Assessment",
    icon: "✓",
    color: "bg-[#fff5d9]",
    iconColor: "bg-[#d38b13]",
  },
  {
    id: "team-points",
    title: "Team Points",
    description: "Keep a visible class leaderboard",
    category: "Competition",
    icon: "★",
    color: "bg-[#ffeaf1]",
    iconColor: "bg-[#d84b78]",
  },
];

type GameSession = {
  id: number;
  title: string;
  sessionName: string;
  grade: string;
  section: string;
  status: "Live" | "Ready";
  participants: string[];
  selectedStudent?: string;
};

type GameClass = {
  id: number;
  name: string;
  grade: string;
  section: string;
  students: string[];
};

function Icon({
  type,
  className = "h-5 w-5",
}: {
  type: string;
  className?: string;
}) {
  switch (type) {
    case "gamepad":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <line x1="6" x2="10" y1="11" y2="11" />
          <line x1="8" x2="8" y1="9" y2="13" />
          <line x1="15" x2="15.01" y1="12" y2="12" />
          <line x1="18" x2="18.01" y1="10" y2="10" />
          <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5Z" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
      );
    case "search":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );
    case "clock":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    default:
      return null;
  }
}

export function LegacySpinWheelSession({
  session,
  rotation,
  onSpin,
  onClose,
}: {
  session: GameSession;
  rotation: number;
  onSpin: () => void;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    "Teacher started the session",
    "Welcome to today&apos;s game!",
  ]);
  const sendMessage = () => {
    if (!message.trim()) return;
    setChat((current) => [...current, message.trim()]);
    setMessage("");
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111016]/90 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discord-session-title"
    >
      <div className="flex h-[min(760px,94vh)] w-full max-w-6xl overflow-hidden rounded-2xl bg-[#313338] text-[#dbdee1] shadow-2xl">
        <aside className="hidden w-60 shrink-0 flex-col bg-[#2b2d31] sm:flex">
          <div className="border-b border-[#1f2023] px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#f97316]">
              Live classroom
            </p>
            <h2 className="mt-1 truncate font-bold text-white">
              {session.sessionName}
            </h2>
            <p className="mt-1 text-xs text-[#949ba4]">
              {session.grade} · {session.section}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-3 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wide text-[#949ba4]">
              <span>Participants</span>
              <span>{session.participants.length}</span>
            </div>
            {session.participants.map((student, index) => (
              <div
                key={student}
                className="mb-1 flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-[#35373c]"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${index % 2 ? "bg-[#0f9f8f]" : "bg-[#f97316]"}`}
                >
                  {student
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="truncate">{student}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#1f2023] p-3">
            <button
              onClick={onClose}
              className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-[#b5bac1] transition hover:bg-[#3b3d44] hover:text-white"
            >
              Exit session
            </button>
          </div>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col bg-[#313338]">
          <header className="flex items-center justify-between border-b border-[#202125] px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p
                className="truncate text-sm font-bold text-white"
                id="discord-session-title"
              >
                # {session.sessionName}
              </p>
              <p className="text-xs text-[#949ba4]">
                Spin the Wheel · {session.grade}, {session.section}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#1e1f22] px-3 py-2 text-xs font-bold text-[#b5bac1]">
                JOIN CODE{" "}
                <strong className="ml-1 text-white">
                  {String(session.id).slice(-6)}
                </strong>
              </span>
              <button
                onClick={onClose}
                aria-label="Close session"
                className="px-2 text-xl text-[#949ba4] hover:text-white"
              >
                &times;
              </button>
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-7 text-center sm:px-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f97316]">
              Teacher is hosting
            </p>
            <h3 className="font-heading text-3xl font-bold text-white">
              Who&apos;s up next?
            </h3>
            <div className="relative my-7 h-64 w-64 sm:h-72 sm:w-72">
              <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 text-3xl text-[#f97316]">
                ▼
              </div>
              <div
                className="h-full w-full rounded-full border-8 border-[#f8f4ef] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-transform duration-[1800ms] ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background:
                    "conic-gradient(#f97316 0deg 45deg, #0f9f8f 45deg 90deg, #6f55cf 90deg 135deg, #3985d6 135deg 180deg, #d84b78 180deg 225deg, #d38b13 225deg 270deg, #f97316 270deg 315deg, #0f9f8f 315deg 360deg)",
                }}
              >
                <div className="flex h-full w-full items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-[#f8f4ef] bg-[#1e1f22] text-center text-[10px] font-bold uppercase tracking-wide text-white">
                    Spin
                    <br />
                    the wheel
                  </div>
                </div>
              </div>
            </div>
            <p className="mb-4 min-h-9 font-heading text-2xl font-bold text-[#f97316]">
              {session.selectedStudent ?? "Ready to choose a student"}
            </p>
            <button
              onClick={onSpin}
              className="rounded-md bg-[#f97316] px-8 py-3 font-bold text-white transition hover:bg-[#d9570a]"
            >
              Spin the wheel
            </button>
          </div>
        </main>
        <aside className="hidden w-64 shrink-0 flex-col border-l border-[#202125] bg-[#2b2d31] lg:flex">
          <div className="border-b border-[#1f2023] px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#949ba4]">
              Session chat
            </p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {chat.map((item, index) => (
              <div key={`${item}-${index}`}>
                <p className="text-[11px] font-bold text-[#f97316]">
                  {index % 2 ? "Teacher" : "System"}
                </p>
                <p className="text-sm text-[#dbdee1]">{item}</p>
              </div>
            ))}
          </div>
          <div className="p-3">
            <div className="flex rounded-md bg-[#383a40] p-1">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder="Message the class"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-[#949ba4]"
              />
              <button
                onClick={sendMessage}
                aria-label="Send message"
                className="px-2 text-[#f97316]"
              >
                ➤
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function LiveClassActivitiesPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("Grade 1");
  const [selectedSection, setSelectedSection] = useState("Section A");
  const [sessionName, setSessionName] = useState("");
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [gameClasses, setGameClasses] = useState<GameClass[]>([]);
  const [activeSpinSession, setActiveSpinSession] = useState<number | null>(
    null,
  );
  const [wheelRotation, setWheelRotation] = useState(0);
  const selectedClass = gameClasses.find((gameClass) => gameClass.id === Number(selectedGrade));
  const selectedStudents = selectedClass?.students ?? [];
  const liveSession = sessions.find(
    (session) => session.id === activeSpinSession,
  );
  const activeSession = liveSession;
  const endSession = async () => {
    if (!liveSession) return;
    await fetch('/api/teacher/live-games', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: liveSession.id, status: 'finished' }) });
    setSessions((current) => current.filter((session) => session.id !== liveSession.id));
    setActiveSpinSession(null);
  };
  const spinWheel = async () => {
    if (!liveSession?.participants.length) return;
    const selectedIndex = Math.floor(
      Math.random() * liveSession.participants.length,
    );
    const selectedStudent = liveSession.participants[selectedIndex];
    const segmentAngle = 360 / liveSession.participants.length;
    const segmentCenter = selectedIndex * segmentAngle + segmentAngle / 2;
    const currentAngle = ((wheelRotation % 360) + 360) % 360;
    const alignment = (360 - ((segmentCenter + currentAngle) % 360)) % 360;
    setWheelRotation((current) => current + 720 + alignment);
    setSessions((current) =>
      current.map((session) =>
        session.id === liveSession.id
          ? { ...session, status: "Live", selectedStudent }
          : session,
      ),
    );
    await fetch("/api/teacher/live-games", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: liveSession.id,
        selectedStudent,
        wheelRotation: wheelRotation + 720 + alignment,
      }),
    });
  };
  useEffect(() => {
    fetch('/api/teacher/grades', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        const classes = (data.grades ?? []).map((grade: any) => ({
          id: Number(grade.id),
          name: String(grade.name),
          grade: `Grade ${grade.grade_level ?? grade.name}`,
          section: `Section ${grade.section ?? 'A'}`,
          students: (grade.sections?.[0]?.studentList ?? []).map((student: any) => student.name),
        }));
        setGameClasses(classes);
        if (classes[0]) {
          setSelectedGrade(String(classes[0].id));
          setSelectedSection(classes[0].section);
        }
      })
      .catch(() => undefined);
    fetch('/api/teacher/live-games', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.sessions)) setSessions(data.sessions);
      })
      .catch(() => undefined);
  }, []);

  const visibleActivities = activities.filter((activity) =>
    `${activity.title} ${activity.description} ${activity.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl pb-10">
      {liveSession && (
        <WheelDisplay
          session={liveSession}
          rotation={wheelRotation}
          onSpin={spinWheel}
          onClose={() => setActiveSpinSession(null)}
          onEnd={endSession}
        />
      )}
      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end animate-fadeInUp">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f97316]">
            Teacher tools
          </p>
          <h1 className="font-heading text-4xl font-bold text-foreground-900">
            Live Games
          </h1>
          <p className="mt-2 text-foreground-600">
            Make every lesson feel like a shared moment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-bold text-foreground-500 sm:inline">
            Games for {selectedGrade}
          </span>
          <button
            onClick={() => setSelectedGame("new")}
            className="flex items-center gap-2 rounded-xl bg-foreground-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-foreground-800"
          >
            <span className="text-lg leading-none">+</span> Create game
          </button>
        </div>
      </header>

      <section
        className="mb-8 grid gap-4 md:grid-cols-[1.5fr_1fr_1fr] animate-fadeInUp"
        style={{ animationDelay: "80ms" }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#f97316] p-6 text-white shadow-sm">
          <div className="relative z-10 max-w-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-100">
              Ready when you are
            </p>
            <h2 className="font-heading text-2xl font-bold">
              Start a game for your class
            </h2>
            <p className="mt-2 text-sm leading-6 text-orange-50">
              Choose an activity, share the join code, and let the room come
              alive.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-5 text-[9rem] leading-none opacity-20">
            🎮
          </div>
        </div>
        <div className="rounded-2xl border border-background-200 bg-background-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground-600">
              Games played
            </span>
            <span className="rounded-lg bg-[#e8f7f4] px-2 py-1 text-xs font-bold text-[#087d71]">
              This month
            </span>
          </div>
          <p className="font-heading text-3xl font-bold text-foreground-900">
            24
          </p>
          <p className="mt-1 text-xs text-foreground-500">+8 from last month</p>
        </div>
        <div className="rounded-2xl border border-background-200 bg-background-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground-600">
              Last session
            </span>
            <Icon type="clock" className="h-4 w-4 text-foreground-400" />
          </div>
          <p className="font-heading text-xl font-bold text-foreground-900">
            Quiz Battle
          </p>
          <p className="mt-1 text-xs text-foreground-500">
            Yesterday · Grade 1
          </p>
        </div>
      </section>

      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground-900">
            Game library
          </h2>
          <p className="mt-1 text-sm text-foreground-500">
            Pick a format that fits today&apos;s lesson.
          </p>
        </div>
        <label className="relative block w-full sm:w-64">
          <span className="sr-only">Search games</span>
          <Icon
            type="search"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search games"
            className="w-full rounded-xl border border-background-300 bg-background-50 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-foreground-400 focus:border-[#f97316]"
          />
        </label>
      </div>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleActivities.map((activity, idx) => (
          <article
            key={activity.id}
            className="group rounded-2xl border border-background-200 bg-background-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-background-300 hover:shadow-lg animate-fadeInUp"
            style={{ animationDelay: `${(idx + 1) * 60}ms` }}
          >
            <div
              className={`flex h-28 items-center justify-center rounded-xl ${activity.color}`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${activity.iconColor} text-4xl shadow-sm`}
              >
                {activity.icon}
              </div>
            </div>
            <div className="p-2 pt-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-heading text-lg font-bold text-foreground-900">
                  {activity.title}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wide text-foreground-400">
                  {activity.category}
                </span>
              </div>
              <p className="mb-4 text-sm text-foreground-600">
                {activity.description}
              </p>
              <button
                onClick={() => setSelectedGame(activity.id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground-900 py-2.5 text-sm font-bold text-white transition hover:bg-[#f97316]"
              >
                Launch game <Icon type="arrow-right" className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </section>

      <section
        className="mt-9 rounded-2xl border border-background-200 bg-background-50 p-5 animate-fadeInUp"
        style={{ animationDelay: "500ms" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground-900">
              Created game sessions
            </h2>
            <p className="mt-1 text-sm text-foreground-500">
              Your launched games appear here for quick access.
            </p>
          </div>
          <span className="rounded-lg bg-[#e8f7f4] px-2 py-1 text-xs font-bold text-[#087d71]">
            {sessions.length} created
          </span>
        </div>
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-background-300 bg-background-100 px-5 py-8 text-center">
            <p className="font-bold text-foreground-700">
              No games created yet
            </p>
            <p className="mt-1 text-sm text-foreground-500">
              Create and launch a game to see it listed here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-4 rounded-xl bg-background-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-lg font-bold text-foreground-900">
                      {session.sessionName}
                    </h3>
                    <span className="rounded-full bg-[#d9f5ed] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#087d71]">
                      {session.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground-600">
                    {session.title} · {session.grade}, {session.section}
                  </p>
                  {session.title === "Spin the Wheel" && (
                    <p className="mt-1 text-xs text-foreground-500">
                      {session.participants.length} students in the wheel
                      {session.selectedStudent
                        ? ` · Selected: ${session.selectedStudent}`
                        : ""}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-foreground-500">
                    Created just now · Students in this section only
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSessions((current) =>
                      current.map((item) =>
                        item.id === session.id
                          ? { ...item, status: "Live" }
                          : item,
                      ),
                    );
                    if (session.title === "Spin the Wheel")
                      setActiveSpinSession(session.id);
                  }}
                  className="rounded-xl bg-foreground-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#f97316]"
                >
                  Join Session
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      {selectedGame && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="launch-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-background-50 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[#f97316]">
                  New session
                </p>
                <h2
                  id="launch-title"
                  className="font-heading text-2xl font-bold text-foreground-900"
                >
                  {selectedGame === "new"
                    ? "Create a game"
                    : activities.find(
                        (activity) => activity.id === selectedGame,
                      )?.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedGame(null)}
                aria-label="Close dialog"
                className="text-2xl leading-none text-foreground-400 hover:text-foreground-900"
              >
                &times;
              </button>
            </div>
            <label
              className="mb-2 block text-sm font-bold text-foreground-700"
              htmlFor="session-name"
            >
              Session name
            </label>
            <input
              id="session-name"
              value={sessionName}
              onChange={(event) => setSessionName(event.target.value)}
              placeholder="e.g. Friday review"
              className="mb-4 w-full rounded-xl border border-background-300 px-4 py-3 text-sm outline-none focus:border-[#f97316]"
            />
            {selectedGame === "spin-wheel" && (
              <div className="mb-4 rounded-xl bg-[#e8f7f4] px-4 py-3 text-sm text-[#087d71]">
                <p className="font-bold">
                  {selectedStudents.length} students loaded automatically
                </p>
                <p className="mt-1 text-xs">{selectedStudents.join(" · ")}</p>
              </div>
            )}
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div>
                <label
                  className="mb-2 block text-sm font-bold text-foreground-700"
                  htmlFor="game-grade"
                >
                  Grade
                </label>
                <select
                  id="game-grade"
                  value={selectedGrade}
                  onChange={(event) => setSelectedGrade(event.target.value)}
                  className="w-full rounded-xl border border-background-300 bg-background-50 px-3 py-3 text-sm font-semibold text-foreground-700 outline-none focus:border-[#f97316]"
                >
                  {gameClasses.length === 0 ? <option value="">No classes available</option> : gameClasses.map((gameClass) => <option key={gameClass.id} value={gameClass.id}>{gameClass.name}</option>)}
                </select>
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-bold text-foreground-700"
                  htmlFor="game-section"
                >
                  Section
                </label>
                <select
                  id="game-section"
                  value={selectedSection}
                  onChange={(event) => setSelectedSection(event.target.value)}
                  className="w-full rounded-xl border border-background-300 bg-background-50 px-3 py-3 text-sm font-semibold text-foreground-700 outline-none focus:border-[#f97316]"
                >
                  <option>{selectedClass?.section ?? selectedSection}</option>
                </select>
              </div>
            </div>
            <div className="mb-5 rounded-xl bg-[#fff1e8] px-4 py-3 text-sm text-[#9a430e]">
              This game will be available to{" "}
              <strong>
                {selectedGrade}, {selectedSection}
              </strong>{" "}
              only.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedGame(null);
                  setSessionName("");
                }}
                className="flex-1 rounded-xl border border-background-300 py-3 text-sm font-bold text-foreground-700 hover:bg-background-100"
              >
                Cancel
              </button>
              <button
                disabled={
                  !sessionName.trim() ||
                  (selectedGame === "spin-wheel" && selectedStudents.length < 2)
                }
                onClick={async () => {
                  const activity = activities.find(
                    (item) => item.id === selectedGame,
                  );
                  const response = await fetch('/api/teacher/live-games', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: activity?.title ?? 'Custom game',
                      sessionName: sessionName.trim(),
                      classId: selectedClass?.id,
                      grade: selectedGrade,
                      section: selectedSection,
                      gameType: selectedGame === 'quiz-battle' ? 'quiz' : selectedGame === 'racing-game' ? 'race' : 'challenge',
                      participants: selectedStudents,
                    }),
                  });
                  const data = await response.json();
                  if (!response.ok || !data.id) {
                    window.alert(data.error || 'Unable to create live game');
                    return;
                  }
                  const id = Number(data.id || Date.now());
                  setSessions((current) => [
                    {
                      id,
                      title: activity?.title ?? "Custom game",
                      sessionName: sessionName.trim(),
                      grade: selectedGrade,
                      section: selectedSection,
                      status: "Live",
                      participants: selectedStudents,
                    },
                    ...current,
                  ]);
                  setSelectedGame(null);
                  setSessionName("");
                  if (selectedGame === "spin-wheel") setActiveSpinSession(id);
                }}
                className="flex-1 rounded-xl bg-[#f97316] py-3 text-sm font-bold text-white hover:bg-[#d9570a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create &amp; launch
              </button>
            </div>
          </div>
        </div>
      )}
      {activeSession && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#17151f]/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="spin-display-title"
        >
          <div className="w-full max-w-4xl rounded-3xl bg-[#fffaf5] p-5 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f97316]">
                  Live game · {activeSession.grade}, {activeSession.section}
                </p>
                <h2
                  id="spin-display-title"
                  className="mt-1 font-heading text-3xl font-bold text-foreground-900"
                >
                  {activeSession.sessionName}
                </h2>
                <p className="mt-1 text-sm text-foreground-600">
                  Spin the wheel to choose a student.
                </p>
              </div>
              <button
                onClick={() => setActiveSpinSession(null)}
                aria-label="Close live game"
                className="text-2xl leading-none text-foreground-400 hover:text-foreground-900"
              >
                &times;
              </button>
            </div>
            <div className="grid items-center gap-8 md:grid-cols-[1fr_280px]">
              <div className="flex justify-center">
                <div className="relative h-72 w-72 sm:h-80 sm:w-80">
                  <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 text-3xl text-[#f97316]">
                    ▼
                  </div>
                  <div
                    className="h-full w-full rounded-full border-8 border-white shadow-[0_8px_30px_rgba(38,31,49,0.18)] transition-transform duration-[1800ms] ease-out"
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,
                      background:
                        "conic-gradient(#f97316 0deg 45deg, #0f9f8f 45deg 90deg, #6f55cf 90deg 135deg, #3985d6 135deg 180deg, #d84b78 180deg 225deg, #d38b13 225deg 270deg, #f97316 270deg 315deg, #0f9f8f 315deg 360deg)",
                    }}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-white bg-foreground-900 text-center text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                        Spin
                        <br />
                        the wheel
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground-500">
                  Selected student
                </p>
                <p className="mt-4 min-h-14 break-words font-heading text-2xl font-bold text-[#f97316]">
                  {activeSession.selectedStudent ?? "Ready to spin"}
                </p>
                <p className="mt-3 text-xs text-foreground-500">
                  {activeSession.participants.length} students in this game
                </p>
                <button
                  onClick={spinWheel}
                  className="mt-5 w-full rounded-xl bg-[#f97316] py-3 font-bold text-white transition hover:bg-[#d9570a]"
                >
                  Spin the wheel
                </button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-background-200 pt-5">
              {activeSession.participants.map((student) => (
                <span
                  key={student}
                  className="rounded-full bg-background-100 px-3 py-1.5 text-xs font-semibold text-foreground-700"
                >
                  {student}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
