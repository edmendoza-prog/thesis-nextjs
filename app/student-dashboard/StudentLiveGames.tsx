"use client";

import { useEffect, useState } from "react";

type LiveGame = {
  id: number;
  title: string;
  sessionName: string;
  className: string;
  teacherName: string;
  status: string;
  selectedStudent: string | null;
  rotation: number;
  participants: string[];
};

export default function StudentLiveGames() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [joinedGame, setJoinedGame] = useState<LiveGame | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadGames = async () => {
      try {
        const response = await fetch("/api/student/live-games", {
          cache: "no-store",
        });
        const data = await response.json();
        if (mounted && response.ok) {
          setGames(data.games || []);
          setJoinedGame((current) =>
            current
              ? (data.games || []).find(
                (game: LiveGame) => game.id === current.id,
              ) || null
              : null,
          );
        }
      } catch {
        /* Polling will retry. */
      }
    };
    loadGames();
    const interval = window.setInterval(loadGames, 2000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-700">
          Live now
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-foreground-900">
          Live Games
        </h1>
        <p className="mt-1 text-sm text-foreground-500">
          Join an active classroom session.
        </p>
      </div>
      {games.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary-200 bg-primary-50 p-8 text-center">
          <p className="font-bold text-foreground-700">
            No live games right now
          </p>
          <p className="mt-1 text-sm text-foreground-500">
            Active sessions for your enrolled classes will appear automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {games.map((game) => {
            const isPalosebo = game.title?.toLowerCase().includes("palosebo") || game.sessionName?.toLowerCase().includes("palosebo");
            const isTugOfWar = game.title?.toLowerCase().includes("tug") || game.sessionName?.toLowerCase().includes("tug");
            const coverImage = isPalosebo
              ? "/images/palosebo_race_cover.jpg"
              : isTugOfWar
                ? "/images/tug_of_war_cover.jpg"
                : null;

            return (
              <button
                key={game.id}
                type="button"
                onClick={async () => {
                  await fetch('/api/student/live-games', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: game.id }),
                  });
                  setJoinedGame(game);
                }}
                className="overflow-hidden rounded-xl border border-primary-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-accent-400 hover:shadow-md"
              >
                {coverImage && (
                  <div className="relative h-32 w-full overflow-hidden bg-background-100">
                    <img
                      src={coverImage}
                      alt={game.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-foreground-900">
                        {game.sessionName}
                      </h2>
                      <p className="mt-1 text-sm text-foreground-600">
                        {game.title} · {game.className}
                      </p>
                      <p className="mt-1 text-xs text-foreground-500">
                        Hosted by {game.teacherName}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-[#e3f7ed] px-2.5 py-1 text-[10px] font-bold uppercase text-[#16734e]">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#18a66e]" />
                      {game.status}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {joinedGame && <StudentSessionView game={joinedGame} onClose={() => setJoinedGame(null)} />}
    </section>
  );
}

function StudentSessionView({ game, onClose }: { game: LiveGame; onClose: () => void }) {
  const participants = game.participants && game.participants.length > 0 ? game.participants : ['Student 1', 'Student 2', 'Student 3', 'Student 4'];
  const segmentAngle = 360 / Math.max(participants.length, 1);
  const colors = ['#f97316', '#0f9f8f', '#6f55cf', '#3985d6', '#d84b78', '#d38b13'];
  const background = participants.map((_, index) => `${colors[index % colors.length]} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`).join(', ');

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111016]" role="dialog" aria-modal="true" aria-labelledby="student-session-title">
      <div className="flex h-screen w-full overflow-hidden bg-[#313338] text-[#dbdee1]">
        <aside className="flex w-44 shrink-0 flex-col bg-[#2b2d31] sm:w-60">
          <div className="border-b border-[#1f2023] px-4 py-4 sm:px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#f97316]">Live classroom</p>
            <h2 className="mt-1 truncate font-bold text-white">{game.sessionName}</h2>
            <p className="mt-1 text-xs text-[#949ba4]">{game.className}</p>
            <p className="mt-1 text-xs text-[#949ba4]">Hosted by {game.teacherName}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-3 flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wide text-[#949ba4]">
              <span>Participants</span>
              <span>{participants.length}</span>
            </div>
            {participants.map((student, index) => (
              <div key={student} className={`mb-1 flex items-center gap-2 rounded-md px-1 py-2 text-xs sm:gap-3 sm:px-2 sm:text-sm ${student === game.selectedStudent ? 'bg-[#f97316]/25 text-white' : 'hover:bg-[#35373c]'}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs ${index % 2 ? 'bg-[#0f9f8f]' : 'bg-[#f97316]'}`}>{student.split(' ').map((name) => name[0]).join('').slice(0, 2)}</span>
                <span className="truncate">{student}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#1f2023] p-3">
            <button type="button" onClick={onClose} className="w-full rounded-md px-2 py-2 text-left text-sm font-semibold text-[#b5bac1] hover:bg-[#3b3d44] hover:text-white">Leave session</button>
          </div>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col bg-[#313338]">
          <header className="flex items-center justify-between border-b border-[#202125] px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white" id="student-session-title"># {game.sessionName}</p>
              <p className="text-xs text-[#949ba4]">{game.title} · {game.className}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#1e1f22] px-3 py-2 text-xs font-bold text-[#b5bac1]">LIVE <strong className="ml-1 text-white">{String(game.id).slice(-6)}</strong></span>
              <button type="button" onClick={onClose} aria-label="Close live game" className="px-2 text-xl text-[#949ba4] hover:text-white">&times;</button>
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-7 text-center sm:px-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f97316]">{game.teacherName} is hosting</p>
            <h3 className="font-heading text-3xl font-bold text-white">Watch the wheel</h3>
            <div className="relative my-7 h-64 w-64 sm:h-[min(50vh,30rem)] sm:w-[min(50vh,30rem)]">
              <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2 text-3xl text-[#f97316]">▼</div>
              <div className="relative h-full w-full rounded-full border-8 border-[#f8f4ef] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-transform duration-[1800ms] ease-out" style={{ transform: `rotate(${game.rotation}deg)`, background: `conic-gradient(${background})` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-[#f8f4ef] bg-[#1e1f22] text-center text-[10px] font-bold uppercase tracking-wide text-white">WATCH<br />THE SPIN</div>
                </div>
              </div>
              {participants.map((student, index) => {
                const angle = (index * segmentAngle + segmentAngle / 2) * Math.PI / 180;
                return (
                  <span key={student} className="pointer-events-none absolute z-10 w-24 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-bold leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]" style={{ left: `${50 + Math.sin(angle) * 29}%`, top: `${50 - Math.cos(angle) * 29}%` }}>
                    {student}
                  </span>
                );
              })}
            </div>
            <p className="min-h-9 font-heading text-2xl font-bold text-[#f97316]">{game.selectedStudent || 'Waiting for the teacher to spin'}</p>
            <p className="mt-3 text-sm text-[#b5bac1]">Read-only view · The teacher controls the game</p>
          </div>
        </main>
        <aside className="hidden w-64 shrink-0 flex-col border-l border-[#202125] bg-[#2b2d31] lg:flex">
          <div className="border-b border-[#1f2023] px-4 py-4"><p className="text-xs font-bold uppercase tracking-wide text-[#949ba4]">Session chat</p></div>
          <div className="flex-1 space-y-3 p-4">
            <div><p className="text-[11px] font-bold text-[#f97316]">System</p><p className="text-sm text-[#dbdee1]">You joined the session.</p></div>
            <div><p className="text-[11px] font-bold text-[#f97316]">Teacher</p><p className="text-sm text-[#dbdee1]">Follow along with the wheel.</p></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
