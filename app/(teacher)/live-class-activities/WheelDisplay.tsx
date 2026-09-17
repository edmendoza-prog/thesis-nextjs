"use client";

import { useState } from "react";

type Session = {
  id: number;
  sessionName: string;
  grade: string;
  section: string;
  participants: string[];
  selectedStudent?: string;
};

function getLabelPoint(index: number, segmentAngle: number) {
  const angle = index * segmentAngle + segmentAngle / 2;
  const radians = (angle * Math.PI) / 180;
  return {
    angle,
    x: 50 + Math.sin(radians) * 31,
    y: 50 - Math.cos(radians) * 31,
  };
}

function measureLabelWidth(label: string, fontSize: number) {
  if (typeof document === "undefined") return label.length * fontSize * 0.55;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return label.length * fontSize * 0.55;
  context.font = `700 ${fontSize}px Nunito, sans-serif`;
  return context.measureText(label).width;
}

function getLabelFont(label: string, segmentAngle: number) {
  const maxFontSize = Math.min(5.4, Math.max(3.2, segmentAngle * 0.075));
  const minFontSize = 1.25;
  const availableRadialLength = 27;
  let fontSize = maxFontSize;

  while (fontSize > minFontSize && measureLabelWidth(label, fontSize) > availableRadialLength) {
    fontSize -= 0.1;
  }

  const fits = measureLabelWidth(label, fontSize) <= availableRadialLength;
  return {
    fontSize,
    letterSpacing: fits ? 0 : -0.08,
  };
}

export default function WheelDisplay({
  session,
  rotation,
  onSpin,
  onClose,
  onEnd,
}: {
  session: Session;
  rotation: number;
  onSpin: () => void;
  onClose: () => void;
  onEnd: () => void;
}) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    "Teacher started the session",
    "Welcome to today's game!",
  ]);
  const segmentAngle = 360 / session.participants.length;
  const wheelColors = [
    "#f97316",
    "#0f9f8f",
    "#6f55cf",
    "#3985d6",
    "#d84b78",
    "#d38b13",
  ];
  const wheelBackground = session.participants
    .map(
      (_, index) =>
        `${wheelColors[index % wheelColors.length]} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`,
    )
    .join(", ");

  const sendMessage = () => {
    if (!message.trim()) return;
    setChat((current) => [...current, message.trim()]);
    setMessage("");
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111016]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wheel-session-title"
    >
      <div className="flex h-screen w-full overflow-hidden bg-[#313338] text-[#dbdee1] shadow-2xl">
        <aside className="flex w-40 shrink-0 flex-col bg-[#2b2d31] sm:w-60">
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
            <div className="mb-3 flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wide text-[#949ba4]">
              <span>Names on wheel</span>
              <span>{session.participants.length}</span>
            </div>
            {session.participants.map((student, index) => (
              <div
                key={student}
                className={`mb-1 flex items-center gap-2 rounded-md px-1 py-2 text-xs sm:gap-3 sm:px-2 sm:text-sm ${student === session.selectedStudent ? "bg-[#f97316]/20 text-white" : "hover:bg-[#35373c]"}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs ${index % 2 ? "bg-[#0f9f8f]" : "bg-[#f97316]"}`}
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
            <button onClick={onEnd} className="mb-2 w-full rounded-md bg-[#ed4245] px-3 py-2 text-left text-sm font-semibold text-white transition hover:bg-[#c93437]">
              End session
            </button>
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
                id="wheel-session-title"
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
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 text-center sm:px-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f97316]">
              Teacher is hosting
            </p>
            <h3 className="font-heading text-3xl font-bold text-white">
              Who&apos;s up next?
            </h3>
            <div className="relative my-4 h-64 w-64 sm:my-3 sm:h-[min(58vh,32rem)] sm:w-[min(58vh,32rem)]">
              <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2 text-3xl text-[#f97316]">
                ▼
              </div>
              <div
                className="relative h-full w-full rounded-full border-8 border-[#f8f4ef] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-transform duration-[1800ms] ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(${wheelBackground})`,
                }}
              >
                <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 100 100" aria-label="Student names on the wheel">
                  {session.participants.map((student, index) => {
                    const label = getLabelPoint(index, segmentAngle);
                    const labelStyle = getLabelFont(student, segmentAngle);
                    return <text key={student} x={label.x} y={label.y} transform={`rotate(${label.angle} ${label.x} ${label.y})`} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={labelStyle.fontSize} letterSpacing={labelStyle.letterSpacing} fontWeight="700" stroke="#202124" strokeWidth="0.35" paintOrder="stroke" className="font-body">{student}</text>;
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
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
