"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

// --- Types ---
export interface Team {
  id: string;
  name: string;
  color: string;
  accent: string;
  avatar: string;
  climberImage?: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  lastDelta: number; // For climb/slip animation: +1, -1, 0
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  opened?: boolean;
}

export type GameStage =
  | "main-menu"
  | "how-to-play"
  | "setup"
  | "chest-board"
  | "question"
  | "race"
  | "results";

// Preset Color Palettes & Avatars for 2–6 Teams
const TEAM_PRESETS = [
  { name: "Team Tamaraw", color: "#ef4444", accent: "#fca5a5", avatar: "🐃", climberImage: "/images/climber_red.png" },
  { name: "Team Agila", color: "#3b82f6", accent: "#93c5fd", avatar: "🦅", climberImage: "/images/climber_blue.png" },
  { name: "Team Tarsier", color: "#10b981", accent: "#6ee7b7", avatar: "🐒", climberImage: "/images/climber_green.png" },
  { name: "Team Haribon", color: "#f59e0b", accent: "#fcd34d", avatar: "🦜", climberImage: "/images/climber_yellow.png" },
  { name: "Team Pawikan", color: "#8b5cf6", accent: "#c4b5fd", avatar: "🐢", climberImage: "/images/climber_purple.png" },
  { name: "Team Kalabaw", color: "#ec4899", accent: "#f9a8d4", avatar: "🐂", climberImage: "/images/climber_red.png" },
];

export const getClimberImage = (color: string, index: number) => {
  const c = color.toLowerCase();
  if (c.includes("ef4444") || c.includes("red")) return "/images/climber_red.png";
  if (c.includes("3b82f6") || c.includes("blue")) return "/images/climber_blue.png";
  if (c.includes("10b981") || c.includes("green")) return "/images/climber_green.png";
  if (c.includes("f59e0b") || c.includes("yellow") || c.includes("amber")) return "/images/climber_yellow.png";
  if (c.includes("8b5cf6") || c.includes("purple")) return "/images/climber_purple.png";
  const defaults = [
    "/images/climber_red.png",
    "/images/climber_blue.png",
    "/images/climber_green.png",
    "/images/climber_yellow.png",
    "/images/climber_purple.png",
  ];
  return defaults[index % defaults.length];
};


// Web Audio API Sound Effects Synthesizer
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playChestOpen() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Creak / Pop sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // Chime
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = "sine";
    chime.frequency.setValueAtTime(1174.66, now + 0.1); // D6
    chimeGain.gain.setValueAtTime(0.2, now + 0.1);
    chimeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    chime.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);
    chime.start(now + 0.1);
    chime.stop(now + 0.4);
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major Arpeggio)
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  playSlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Slide whistle down
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const fanNotes = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.4 },  // E5
      { f: 783.99, d: 0.2 },  // G5
      { f: 1046.5, d: 0.8 },  // C6
    ];
    let timeOffset = 0;
    fanNotes.forEach(({ f, d }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now + timeOffset);
      gain.gain.setValueAtTime(0.3, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + d);
      timeOffset += d * 0.75;
    });
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

const sfx = new SoundEffects();

// Confetti Particle System Component for Victory
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const colors = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6", "#f97316"];
    const particles = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 9 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 4 - 2,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 6 - 3,
    }));

    let animId: number;
    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;
        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100]"
    />
  );
}



export interface ConfiguredTeamProp {
  id: string;
  name: string;
  color: string;
  accent?: string;
  avatar?: string;
}

// --- Main Palosebo Race Game Component ---
export default function PaloseboRaceGame({
  onClose,
  initialTeams,
  configuredTeams,
  initialTargetScore,
  initialQuestions,
  initialStage,
}: {
  onClose?: () => void;
  initialTeams?: string[];
  configuredTeams?: ConfiguredTeamProp[];
  initialTargetScore?: number;
  initialQuestions?: Question[];
  initialStage?: GameStage;
}) {
  const [stage, setStage] = useState<GameStage>(initialStage ?? "main-menu");
  const [targetScore, setTargetScore] = useState<number>(initialTargetScore ?? 5);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Teams State (2–6 teams)
  const [teams, setTeams] = useState<Team[]>(() => {
    if (configuredTeams && configuredTeams.length >= 2) {
      return configuredTeams.map((ct, idx) => ({
        id: ct.id || `team-${idx + 1}`,
        name: ct.name,
        color: ct.color,
        accent: ct.accent || ct.color,
        avatar: ct.avatar || TEAM_PRESETS[idx % TEAM_PRESETS.length]?.avatar || "⭐",
        climberImage: getClimberImage(ct.color, idx),
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        lastDelta: 0,
      }));
    }
    const count = initialTeams && initialTeams.length >= 2 ? Math.min(initialTeams.length, 6) : 3;
    return TEAM_PRESETS.slice(0, count).map((preset, idx) => ({
      id: `team-${idx + 1}`,
      name: (initialTeams && initialTeams[idx]) || preset.name,
      color: preset.color,
      accent: preset.accent,
      avatar: preset.avatar,
      climberImage: preset.climberImage,
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      lastDelta: 0,
    }));
  });

  // Questions State (loaded strictly from question sets)
  const [questions, setQuestions] = useState<Question[]>(() => {
    return initialQuestions && initialQuestions.length > 0 ? initialQuestions : [];
  });

  // Active Question & Board State
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);
  const [openingChest, setOpeningChest] = useState<{
    index: number;
    phase: "shaking" | "burst";
  } | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [winnerTeam, setWinnerTeam] = useState<Team | null>(null);
  const [raceTriggeredBy, setRaceTriggeredBy] = useState<string | null>(null);

  // Toggle Sound
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sfx.enabled = next;
    if (next) sfx.playClick();
  };

  // Sound sync
  useEffect(() => {
    sfx.enabled = soundEnabled;
  }, [soundEnabled]);



  // Handle Team count change in Setup
  const handleSetTeamCount = (count: number) => {
    sfx.playClick();
    if (count < 2 || count > 6) return;
    setTeams((prev) => {
      if (count > prev.length) {
        const added = TEAM_PRESETS.slice(prev.length, count).map((preset, idx) => ({
          id: `team-${prev.length + idx + 1}`,
          name: preset.name,
          color: preset.color,
          accent: preset.accent,
          avatar: preset.avatar,
          climberImage: preset.climberImage,
          score: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          lastDelta: 0,
        }));
        return [...prev, ...added];
      } else {
        return prev.slice(0, count);
      }
    });
  };

  // Update Team details
  const updateTeam = <K extends keyof Team>(index: number, field: K, value: Team[K]) => {
    setTeams((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };


  // Start Game
  const handleStartGame = () => {
    sfx.playClick();
    // Reset all team scores
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        lastDelta: 0,
      }))
    );
    // Shuffle and reset questions
    const shuffled = [...questions]
      .map((q) => ({ ...q, opened: false }))
      .sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setWinnerTeam(null);
    setActiveQuestionIndex(null);
    setShowAnswer(false);
    setStage("chest-board");
  };

  // Open Treasure Chest with Animation
  const handleOpenChest = (index: number) => {
    if (questions[index]?.opened || openingChest !== null) return;

    // Start shaking closed chest
    setOpeningChest({ index, phase: "shaking" });
    sfx.playChestOpen();

    // Burst open with glowing treasure
    setTimeout(() => {
      setOpeningChest({ index, phase: "burst" });
      sfx.playCorrect();
    }, 450);

    // Transition to question screen
    setTimeout(() => {
      setActiveQuestionIndex(index);
      setShowAnswer(false);
      setQuestions((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], opened: true };
        return updated;
      });
      setOpeningChest(null);
      setStage("question");
    }, 1250);
  };

  // Award Points to Team (Correct = +1, Wrong = -1 slip)
  const handleTeamScore = (teamId: string, isCorrect: boolean) => {
    if (isCorrect) {
      sfx.playCorrect();
    } else {
      sfx.playSlip();
    }

    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return { ...team, lastDelta: 0 };
        if (isCorrect) {
          const newScore = Math.min(targetScore, team.score + 1);
          return {
            ...team,
            score: newScore,
            correctAnswers: team.correctAnswers + 1,
            lastDelta: 1,
          };
        } else {
          const newScore = Math.max(0, team.score - 1);
          return {
            ...team,
            score: newScore,
            wrongAnswers: team.wrongAnswers + 1,
            lastDelta: -1,
          };
        }
      })
    );

    const answeredTeam = teams.find((t) => t.id === teamId);
    setRaceTriggeredBy(answeredTeam ? answeredTeam.name : "");

    if (isCorrect && answeredTeam && answeredTeam.score + 1 >= targetScore) {
      setTimeout(() => {
        setWinnerTeam({
          ...answeredTeam,
          score: targetScore,
          correctAnswers: answeredTeam.correctAnswers + 1,
        });
        sfx.playVictory();
        setStage("results");
      }, 700);
    } else {
      setTimeout(() => {
        setStage("race");
      }, 350);
    }
  };


  // Ranked Leaderboard
  const sortedLeaderboard = useMemo(() => {
    return [...teams].sort((a, b) => b.score - a.score || b.correctAnswers - a.correctAnswers);
  }, [teams]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#090d16] font-sans text-slate-100 select-none">
      {/* Confetti if won */}
      {stage === "results" && <ConfettiCanvas />}

      {/* Top Header Bar */}
      <header className="relative z-30 flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-xl shadow-md">
            🎋
          </div>
          <div>
            <h1 className="font-heading text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200">
              PALOSEBO RACE QUIZ
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
              Palarong Pinoy · Greasy Pole Showdown
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-amber-300 transition hover:bg-white/10 cursor-pointer"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>

          {/* Navigation Controls depending on stage */}
          {stage !== "main-menu" && (
            <button
              onClick={() => {
                sfx.playClick();
                if (stage === "how-to-play" || stage === "setup") {
                  setStage("main-menu");
                } else if (stage === "question" || stage === "race") {
                  setStage("chest-board");
                } else if (stage === "chest-board") {
                  setStage("setup");
                } else if (stage === "results") {
                  setStage("chest-board");
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <span>⬅ Back</span>
            </button>
          )}

          {/* Quick Race View Button (when in chest-board or question) */}
          {(stage === "chest-board" || stage === "question") && (
            <button
              onClick={() => {
                sfx.playClick();
                setStage("race");
              }}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/30"
            >
              <span>🚩 View Pole Arena</span>
            </button>
          )}

          {/* Manual End Game Button (when active game) */}
          {(stage === "chest-board" || stage === "question" || stage === "race") && (
            <button
              onClick={() => {
                sfx.playClick();
                if (confirm("Are you sure you want to end the race now and view the final results?")) {
                  setWinnerTeam(sortedLeaderboard[0] || teams[0]);
                  sfx.playVictory();
                  setStage("results");
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-500/30"
            >
              <span>🏁 End Race</span>
            </button>
          )}

          {/* Exit Game Button */}
          {onClose && (
            <button
              onClick={onClose}
              title="Exit to My Sets"
              className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-500/20 cursor-pointer"
            >
              <span className="text-base leading-none">✕</span>
              <span className="hidden sm:inline">Exit to My Sets</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT STAGE ROUTING */}
      <main className={`relative flex-1 overflow-y-auto ${stage === "chest-board" || stage === "race" ? "p-0" : "p-4 sm:p-6"}`}>
        {/* ========================================================================= */}
        {/* 1. MAIN MENU                                                             */}
        {/* ========================================================================= */}
        {stage === "main-menu" && (
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-4 text-center animate-fadeInUp">
            <div className="relative mb-5 w-full max-w-xl">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-yellow-500/20 blur-xl" />
              <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/40 shadow-2xl shadow-amber-500/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/palosebo_race_cover.jpg"
                  alt="Palosebo Race Quiz Game"
                  className="w-full h-auto object-cover max-h-[300px]"
                />
              </div>
            </div>

            <span className="inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-amber-300">
              Interactive Classroom Race Game
            </span>

            <h2 className="mt-3 font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-yellow-400 drop-shadow-sm">
              PALOSEBO RACE QUIZ
            </h2>

            <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
              Climb the legendary greasy bamboo pole to grab the prize! Answer classroom quiz questions correctly to climb higher, but watch out for slips!
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
              <button
                onClick={() => {
                  sfx.playClick();
                  setStage("setup");
                }}
                className="group relative flex w-full sm:flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-8 py-4 text-lg font-black text-slate-950 shadow-xl shadow-amber-500/20 transition-all duration-200 hover:scale-105 hover:shadow-amber-500/40 active:scale-95"
              >
                <span className="text-2xl transition-transform group-hover:scale-125">▶</span>
                <span>PLAY NOW</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  setStage("how-to-play");
                }}
                className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-base font-bold text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
              >
                <span>📜 How to Play</span>
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 w-full">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm">
                <div className="text-2xl mb-1">🎁</div>
                <h3 className="font-bold text-amber-300 text-sm">Treasure Chests</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pick shuffled chests to reveal exciting quiz challenges.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm">
                <div className="text-2xl mb-1">🧗‍♂️</div>
                <h3 className="font-bold text-orange-300 text-sm">Climb & Slide</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Correct answers boost your climber; mistakes slide you down!
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm">
                <div className="text-2xl mb-1">👑</div>
                <h3 className="font-bold text-yellow-300 text-sm">Flag Victory</h3>
                <p className="text-xs text-slate-400 mt-1">
                  First team to reach the target height claims the prize bag!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. HOW TO PLAY                                                           */}
        {/* ========================================================================= */}
        {stage === "how-to-play" && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-fadeInUp">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="text-3xl">📜</span>
              <div>
                <h2 className="font-heading text-2xl font-black text-amber-300">
                  How to Play Palosebo Race
                </h2>
                <p className="text-xs text-slate-400">
                  Game rules and classroom guide for teachers and students
                </p>
              </div>
            </div>

            <ol className="mt-6 space-y-4 text-sm sm:text-base text-slate-200">
              <li className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 border border-white/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500 font-bold text-slate-950 text-sm">
                  1
                </span>
                <div>
                  <strong className="text-amber-300">Form Teams (2–6 Teams):</strong>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    Divide the class into 2 to 6 teams. Customize each team’s name, color, and mascot.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 border border-white/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500 font-bold text-slate-950 text-sm">
                  2
                </span>
                <div>
                  <strong className="text-amber-300">Pick a Treasure Chest:</strong>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    Teams take turns selecting an unopened numbered chest from the board to reveal its assigned question.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 border border-white/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-green-500 font-bold text-slate-950 text-sm">
                  3
                </span>
                <div>
                  <strong className="text-green-300">Correct Answer = Climb Up (+1):</strong>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    A correct answer propels the team’s climber higher up their greasy bamboo pole toward the prize!
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 border border-white/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-red-500 font-bold text-white text-sm">
                  4
                </span>
                <div>
                  <strong className="text-red-300">Wrong Answer = Slide Down (-1):</strong>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    An incorrect response causes the climber to slip down the bamboo pole (cannot fall below ground level).
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 border border-white/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-yellow-400 font-bold text-slate-950 text-sm">
                  5
                </span>
                <div>
                  <strong className="text-yellow-300">Reach the Top & Win! 🏆:</strong>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    The race ends automatically when any team reaches the Target Score to grab the golden prize pouch!
                  </p>
                </div>
              </li>
            </ol>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  sfx.playClick();
                  setStage("setup");
                }}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950 shadow-lg transition hover:bg-amber-400"
              >
                <span>Proceed to Game Setup ➡</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. SETUP SCREEN (Redesigned Game Configuration Studio)                   */}
        {/* ========================================================================= */}
        {stage === "setup" && (
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#ebf4f0] p-6 sm:p-8 space-y-6 shadow-2xl border border-white/10 text-slate-900 my-4 animate-fadeInUp">
            {/* Top Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#0f766e]">
                  RACE SETUP
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  Game configuration
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Set up your winning target and organize competing teams.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-[#e6f4ed] px-3.5 py-2 text-xs font-bold text-[#136445]">
                  {questions.length} {questions.length === 1 ? "question" : "questions"} in deck
                </span>
                <button
                  onClick={handleStartGame}
                  disabled={questions.length === 0}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#136445] hover:bg-[#0e4d35] text-white font-bold text-sm px-6 py-3 shadow-md shadow-[#136445]/20 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="text-base">🚀</span>
                  <span>Start race</span>
                </button>
              </div>
            </div>

            {/* Row 1: Winning Score & Number of Teams Cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* 01 Winning score Card */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                    01
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Winning score
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Points needed to reach the top
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setTargetScore((prev) => Math.max(2, prev - 1));
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-bold text-lg cursor-pointer active:scale-95"
                  >
                    -
                  </button>

                  <div className="text-center min-w-[56px] flex flex-col items-center">
                    <input
                      type="number"
                      min={2}
                      max={50}
                      value={targetScore}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setTargetScore(Math.min(50, Math.max(2, val)));
                        }
                      }}
                      className="w-14 bg-transparent text-2xl sm:text-3xl font-extrabold text-[#136445] text-center outline-none border-b border-transparent hover:border-slate-200 focus:border-[#136445]"
                      title="Type winning score"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold block -mt-1">
                      points
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setTargetScore((prev) => Math.min(50, prev + 1));
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-bold text-lg cursor-pointer active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 02 Number of teams Card */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                    02
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Number of teams
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Choose 2 to 6 competing teams
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (teams.length > 2) handleSetTeamCount(teams.length - 1);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-bold text-lg cursor-pointer active:scale-95"
                  >
                    -
                  </button>

                  <div className="text-center min-w-[56px] flex flex-col items-center">
                    <input
                      type="number"
                      min={2}
                      max={6}
                      value={teams.length}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          handleSetTeamCount(Math.min(6, Math.max(2, val)));
                        }
                      }}
                      className="w-14 bg-transparent text-2xl sm:text-3xl font-extrabold text-[#136445] text-center outline-none border-b border-transparent hover:border-slate-200 focus:border-[#136445]"
                      title="Type number of teams (2 to 6)"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold block -mt-1">
                      teams
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (teams.length < 6) handleSetTeamCount(teams.length + 1);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-bold text-lg cursor-pointer active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Teams Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#0f766e]">
                    TEAMS
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    Meet the challengers
                  </h3>
                </div>

                <span className="rounded-full bg-[#e6f4ed] px-3 py-1 text-xs font-bold text-[#136445]">
                  {teams.length} teams
                </span>
              </div>

              {/* Team Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {teams.map((team, idx) => (
                  <div
                    key={team.id}
                    className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-sm"
                    style={{
                      borderLeftWidth: 4,
                      borderLeftColor: team.color,
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-bold"
                          style={{ color: team.color }}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {/* Mini climber avatar */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={team.climberImage || getClimberImage(team.color, idx)}
                            alt={team.name}
                            className="h-6 w-6 object-contain"
                            title="Climber Mascot"
                          />
                          {/* Color picker */}
                          <input
                            type="color"
                            value={team.color}
                            onChange={(e) => updateTeam(idx, "color", e.target.value)}
                            className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent"
                            title="Edit Team Color"
                          />
                        </div>
                      </div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                        TEAM NAME
                      </p>

                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => updateTeam(idx, "name", e.target.value)}
                        placeholder={`Team ${idx + 1}`}
                        className="mt-0.5 w-full bg-transparent text-sm font-bold text-slate-800 outline-none focus:border-b focus:border-slate-400"
                      />
                    </div>

                    <div className="mt-3 flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full inline-block"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="text-[11px] text-slate-400 font-medium">
                        Pole #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. TREASURE CHEST BOARD                                                  */}
        {/* ========================================================================= */}
        {stage === "chest-board" && (
          <div
            className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-cover bg-center bg-no-repeat overflow-y-auto animate-fadeIn"
            style={{
              backgroundImage: `url('/images/palosebo_chest_bg.jpg')`,
            }}
          >
            {/* Atmospheric overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/40 pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-[1550px] w-full flex-1 flex flex-col justify-center gap-6 py-4 pb-6">
              {/* Chest Grid filling the screen with expansive, tactile cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-7 flex-1 content-center">
                {questions.map((q, idx) => {
                  const isOpened = q.opened;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleOpenChest(idx)}
                      disabled={isOpened || openingChest !== null}
                      className={`group relative flex flex-col items-center justify-center rounded-3xl p-4 sm:p-6 md:p-7 backdrop-blur-md transition-all duration-300 min-h-[160px] sm:min-h-[200px] md:min-h-[230px] ${isOpened
                        ? "border border-white/10 bg-slate-950/50 opacity-55 cursor-not-allowed shadow-none"
                        : "border-2 border-amber-400/50 bg-slate-950/80 hover:bg-slate-900/95 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/35 hover:-translate-y-2 active:scale-95 shadow-xl"
                        }`}
                    >
                      {/* Chest Image Thumbnail (Large & Centered) */}
                      <div className="relative flex items-center justify-center h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={isOpened ? "/images/chest_open.png" : "/images/chest_closed.png"}
                          alt={isOpened ? "Opened Chest" : "Closed Chest"}
                          className={`h-full w-full object-contain rounded-2xl transition-all duration-300 ${isOpened
                            ? "opacity-60 scale-95"
                            : "group-hover:scale-110 drop-shadow-[0_10px_25px_rgba(245,158,11,0.5)]"
                            }`}
                        />

                        {/* Chest Number Tag Badge */}
                        <span
                          className={`absolute -top-1 -right-1 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs sm:text-sm font-black shadow-xl ${isOpened
                            ? "bg-slate-700 text-slate-300 border border-slate-600"
                            : "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-2 border-amber-200"
                            }`}
                        >
                          {idx + 1}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opening Chest Full-Screen Popup Animation */}
            {openingChest !== null && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
                {/* Background radiant burst glow */}
                <div
                  className={`absolute h-80 w-80 sm:h-96 sm:w-96 rounded-full blur-3xl transition-all duration-700 ${openingChest.phase === "burst"
                    ? "bg-amber-400/40 scale-150"
                    : "bg-amber-500/20 scale-100 animate-pulse"
                    }`}
                />

                <div className="relative flex flex-col items-center text-center">
                  {/* Chest Image Animation */}
                  <div className="relative h-64 w-64 sm:h-80 sm:w-80 flex items-center justify-center">
                    {openingChest.phase === "shaking" ? (
                      <div className="animate-bounce">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/chest_closed.png"
                          alt="Opening Closed Chest"
                          className="h-56 w-56 sm:h-72 sm:w-72 object-contain rounded-3xl drop-shadow-[0_15px_35px_rgba(245,158,11,0.6)] rotate-[-3deg] animate-pulse"
                        />
                      </div>
                    ) : (
                      <div className="animate-fadeInUp scale-110 transition-transform duration-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/chest_open.png"
                          alt="Bursting Open Chest"
                          className="h-64 w-64 sm:h-80 sm:w-80 object-contain rounded-3xl drop-shadow-[0_20px_50px_rgba(245,158,11,0.8)]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Banner underneath */}
                  <div className="mt-4 rounded-full border border-amber-400/50 bg-amber-400/20 px-6 py-2 text-sm sm:text-base font-black text-amber-300 shadow-xl backdrop-blur-md">
                    {openingChest.phase === "shaking"
                      ? `Opening Chest #${openingChest.index + 1}...`
                      : `Chest #${openingChest.index + 1} Unlocked! 🎁`}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. QUESTION SCREEN                                                       */}
        {/* ========================================================================= */}
        {stage === "question" && activeQuestionIndex !== null && (
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center py-2 sm:py-4 animate-fadeInUp">
            {/* Question Parchment Scroll Card (max-w-5xl) */}
            <div
              className="relative mx-auto flex min-h-[520px] sm:min-h-[580px] md:min-h-[640px] w-full max-w-5xl flex-col justify-between p-10 sm:p-14 md:p-18 px-14 sm:px-24 md:px-32 lg:px-36 drop-shadow-[0_30px_60px_rgba(0,0,0,0.95)] animate-fadeInUp"
              style={{
                backgroundImage: "url('/images/question_scroll.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            >
              {/* Header info inside scroll safe area */}
              <div className="flex items-center justify-between pt-3 sm:pt-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-900/40 bg-amber-900/10 px-4 py-1.5 text-xs sm:text-sm font-black uppercase tracking-widest text-amber-950 shadow-sm">
                  📜 Chest #{activeQuestionIndex + 1}
                </span>
                <span className="text-xs sm:text-sm font-black tracking-widest text-amber-950/75 uppercase">
                  Classroom Question
                </span>
              </div>

              {/* Question Text Centered */}
              <div className="my-auto py-6 sm:py-8 text-center">
                <p className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-[#24130c] leading-tight drop-shadow-sm px-2 sm:px-4">
                  {questions[activeQuestionIndex]?.question}
                </p>
              </div>

              {/* Reveal Answer Section */}
              <div className="pb-5 sm:pb-8 space-y-3">
                {!showAnswer ? (
                  <div className="mx-auto max-w-md">
                    <button
                      onClick={() => {
                        sfx.playChestOpen();
                        setShowAnswer(true);
                      }}
                      className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-amber-900/50 bg-amber-900/15 py-3.5 sm:py-4 text-base sm:text-lg font-black text-amber-950 shadow-lg transition hover:bg-amber-900/30 active:scale-95"
                    >
                      <span>👁 Show Correct Answer</span>
                    </button>
                  </div>
                ) : (
                  <div className="mx-auto max-w-xl rounded-2xl border-2 border-emerald-900/50 bg-emerald-950/15 p-4 sm:p-5 text-center shadow-lg animate-fadeInUp">
                    <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-950">
                      ✓ Correct Answer
                    </p>
                    <p className="mt-1 font-heading text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950">
                      {questions[activeQuestionIndex]?.answer}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation action buttons below the scroll */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  sfx.playClick();
                  setStage("chest-board");
                }}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-3.5 text-base sm:text-lg font-black text-slate-200 shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-white/15 hover:text-white active:scale-95"
              >
                <span>📦 Back to Treasure Chests</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  setStage("race");
                }}
                className="flex items-center gap-2 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-8 py-3.5 text-base sm:text-lg font-black text-slate-950 shadow-2xl transition hover:scale-105 hover:shadow-amber-500/30 active:scale-95"
              >
                <span>🚩 View Pole Arena</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. RACE ARENA (Animated Palo Sebo Greasy Pole Climbing)                   */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* 6. RACE ARENA (Animated Palo Sebo Greasy Pole Climbing - Fullscreen Arena) */}
        {/* ========================================================================= */}
        {stage === "race" && (
          <div
            className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 bg-cover bg-center bg-no-repeat animate-fadeIn overflow-hidden"
            style={{
              backgroundImage: `url('/images/palosebo_arena_bg.jpg')`,
            }}
          >
            {/* Soft atmospheric gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20 pointer-events-none" />

            {/* Top Control Bar */}
            <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl border border-white/15 bg-slate-950/80 px-5 py-2.5 backdrop-blur-md shadow-2xl">
              <div>
                <h2 className="font-heading text-lg font-black text-amber-300 flex items-center gap-2">
                  <span>🎋</span> Palo Sebo Greasy Pole Arena
                </h2>
                <p className="text-xs text-slate-300">
                  {raceTriggeredBy ? `Action updated for: ${raceTriggeredBy}` : "Watch teams race to the top!"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    sfx.playClick();
                    setStage("chest-board");
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg transition hover:scale-105"
                >
                  <span>📦 Next Question (Chest Board)</span>
                </button>
              </div>
            </div>

            {/* Target Score Badge */}
            <div className="relative flex justify-center z-10 my-2">
              <div className="flex items-center gap-2 rounded-full border border-yellow-400/40 bg-slate-950/85 backdrop-blur-md px-6 py-2 text-xs sm:text-sm font-black text-yellow-300 shadow-2xl">
                <span className="text-base">🏆</span>
                <span className="tracking-wide">TARGET: {targetScore} POINTS TO GRAB THE GOLD PRIZE</span>
                <span className="text-base">🚩</span>
              </div>
            </div>

            {/* Centered Poles directly standing on the ground */}
            <div className="relative flex flex-wrap justify-center items-end gap-4 sm:gap-8 md:gap-12 px-2 sm:px-6 max-w-6xl mx-auto w-full z-10 pb-4">
              {teams.map((team, teamIdx) => {
                const percentage = Math.min(100, Math.max(0, (team.score / targetScore) * 100));

                return (
                  <div
                    key={team.id}
                    className="relative flex flex-col items-center h-full justify-end flex-1 min-w-[130px] max-w-[190px] sm:max-w-[230px]"
                  >
                    {/* Top Pole Flag & Prize Bag */}
                    <div className="absolute -top-9 flex flex-col items-center z-10">
                      <span className="text-3xl animate-bounce drop-shadow-md">🚩</span>
                      <span className="text-sm -mt-1">💰</span>
                    </div>

                    {/* Bamboo Pole Trunk with Image & Climber */}
                    <div className="relative w-20 sm:w-28 md:w-32 h-[340px] sm:h-[400px] md:h-[440px] flex items-center justify-center">
                      {/* Bamboo Pole Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/bamboo_pole.png"
                        alt="Bamboo Pole"
                        className="h-full w-full object-fill drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] pointer-events-none select-none"
                      />

                      {/* Animated Climber Character */}
                      <div
                        className={`absolute z-20 flex flex-col items-center transition-all duration-700 ease-out pointer-events-none select-none ${team.lastDelta > 0 ? "animate-bounce" : team.lastDelta < 0 ? "animate-pulse" : ""
                          }`}
                        style={{
                          bottom: `${3 + (percentage * 0.72)}%`,
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        {/* Score Bubble Above Climber Head */}
                        <div
                          className="mb-1 rounded-full px-2.5 py-0.5 text-[11px] font-black text-white shadow-md border border-white/60 whitespace-nowrap drop-shadow"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.score} pts
                        </div>

                        {/* Climber Character Image (Balanced Size) */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={team.climberImage || getClimberImage(team.color, teamIdx)}
                          alt={`${team.name} Climber`}
                          className="w-20 sm:w-24 md:w-28 h-auto object-contain max-w-none drop-shadow-[0_6px_14px_rgba(0,0,0,0.65)]"
                        />
                      </div>
                    </div>

                    {/* Pole Base / Ground Patch */}
                    <div className="w-32 sm:w-40 h-4 rounded-full bg-amber-950 border border-amber-800 -mt-2 z-10 shadow-2xl" />

                    {/* Team Name, Stats & Plus Scoring Button */}
                    <div
                      className="mt-2 text-center rounded-2xl p-2.5 w-full border border-white/20 bg-slate-950/90 backdrop-blur-md shadow-2xl flex flex-col items-center gap-1.5"
                      style={{ borderBottomColor: team.color, borderBottomWidth: 3 }}
                    >
                      <div className="flex items-center justify-center gap-1.5 w-full">
                        <span className="text-base">{team.avatar}</span>
                        <p className="truncate text-xs sm:text-sm font-bold text-white">
                          {team.name}
                        </p>
                      </div>

                      <p className="text-[11px] font-black text-amber-400">
                        {team.score}/{targetScore} pts ({Math.round(percentage)}%)
                      </p>

                      {/* Plus & Minus Point Action Buttons */}
                      <div className="flex items-center gap-1.5 mt-1 w-full justify-center">
                        <button
                          onClick={() => handleTeamScore(team.id, false)}
                          disabled={team.score <= 0}
                          title="Deduct point (-1)"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/20 text-xs font-black text-rose-300 transition hover:bg-rose-500/30 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleTeamScore(team.id, true)}
                          disabled={team.score >= targetScore}
                          title="Add point (+1)"
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-500 py-1.5 px-2 text-xs font-black text-slate-950 shadow-md transition hover:bg-emerald-400 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <span className="text-sm font-black">+</span>
                          <span>Add Point</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. RESULTS SCREEN & LEADERBOARD                                           */}
        {/* ========================================================================= */}
        {stage === "results" && (
          <div className="mx-auto max-w-3xl space-y-6 text-center animate-fadeInUp">
            {/* Winner Banner */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-yellow-400 bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 p-8 shadow-2xl">
              <div className="text-6xl sm:text-7xl mb-2 animate-bounce">
                👑
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                Palosebo Champion!
              </p>
              <h2 className="mt-2 font-heading text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-400">
                {winnerTeam?.name || sortedLeaderboard[0]?.name}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Reached the top of the pole and claimed the golden fiesta prize!
              </p>

              {/* Quick Actions */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleStartGame}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-black text-slate-950 shadow-lg transition hover:scale-105"
                >
                  <span>🔄 Play Again</span>
                </button>

                <button
                  onClick={() => {
                    sfx.playClick();
                    setStage("setup");
                  }}
                  className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/20"
                >
                  <span>⚙ New Game Setup</span>
                </button>

                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-3 font-bold text-red-300 transition hover:bg-red-500/20 cursor-pointer"
                  >
                    <span>✕ Exit to My Sets</span>
                  </button>
                )}
              </div>
            </div>

            {/* Final Ranked Leaderboard Table */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md text-left">
              <h3 className="font-heading text-lg font-black text-amber-300 mb-4 flex items-center gap-2">
                <span>🏆</span>
                <span>Final Race Leaderboard</span>
              </h3>

              <div className="space-y-3">
                {sortedLeaderboard.map((team, idx) => {
                  const isTop = idx === 0;
                  return (
                    <div
                      key={team.id}
                      className={`flex items-center justify-between rounded-2xl border p-4 transition ${isTop
                        ? "border-amber-400/50 bg-amber-500/10 shadow-lg"
                        : "border-white/5 bg-white/5"
                        }`}
                      style={{ borderLeftColor: team.color, borderLeftWidth: 5 }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-sm ${idx === 0
                            ? "bg-yellow-400 text-slate-950"
                            : idx === 1
                              ? "bg-slate-300 text-slate-950"
                              : idx === 2
                                ? "bg-amber-700 text-white"
                                : "bg-white/10 text-slate-400"
                            }`}
                        >
                          {idx === 0 ? "1st" : idx === 1 ? "2nd" : idx === 2 ? "3rd" : `#${idx + 1}`}
                        </span>

                        <span className="text-2xl">{team.avatar}</span>

                        <div>
                          <p className="font-bold text-base text-white">
                            {team.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {team.correctAnswers} Correct · {team.wrongAnswers} Slips
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-heading text-xl font-black text-amber-300">
                          {team.score} <span className="text-xs text-slate-400">pts</span>
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                          {Math.round((team.score / targetScore) * 100)}% of Pole
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
