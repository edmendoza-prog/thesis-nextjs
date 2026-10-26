"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { extractLessonText } from "@/lib/documentParser";

// --- Types ---
export interface TugTeam {
  id: "red" | "blue";
  name: string;
  color: string;
  accent: string;
  avatar: string;
  members: string[];
  correctAnswers: number;
  wrongAnswers: number;
}

export interface TugQuestion {
  id: string;
  question: string;
  answer: string;
  category?: string;
  used?: boolean;
}

export type TugGameStage =
  | "main-menu"
  | "how-to-play"
  | "setup"
  | "arena"
  | "results";



// Web Audio API Sound Effects Synthesizer
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playWhistle() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.linearRampToValueAtTime(2900, now + 0.08);
    osc.frequency.linearRampToValueAtTime(2200, now + 0.25);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  playTug() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Heave bass thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // Rope snap friction
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = "sawtooth";
    snap.frequency.setValueAtTime(400, now + 0.05);
    snap.frequency.exponentialRampToValueAtTime(150, now + 0.2);
    snapGain.gain.setValueAtTime(0.15, now + 0.05);
    snapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    snap.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snap.start(now + 0.05);
    snap.stop(now + 0.2);
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.25, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.22);
    });
  }

  playSlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.35);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const fanNotes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 523.25, d: 0.12 }, // C5
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.35 }, // E5
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
      timeOffset += d * 0.7;
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
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

const sfx = new SoundEffects();

// Confetti Particle System
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

    const colors = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#fbbf24", "#ec4899", "#8b5cf6"];
    const particles = Array.from({ length: 110 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 4 + 2,
      speedX: Math.random() * 5 - 2.5,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 7 - 3.5,
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
      className="pointer-events-none fixed inset-0 z-[110]"
    />
  );
}

export interface TugConfiguredTeamProp {
  id: string;
  name: string;
  color: string;
  accent?: string;
  avatar?: string;
}

export default function TugOfWarGame({
  onClose,
  initialStudents,
  configuredTeams,
  initialTargetWinTugs,
  initialQuestions,
  initialStage,
}: {
  onClose?: () => void;
  initialStudents?: string[];
  configuredTeams?: TugConfiguredTeamProp[];
  initialTargetWinTugs?: number;
  initialQuestions?: TugQuestion[];
  initialStage?: TugGameStage;
}) {
  const [stage, setStage] = useState<TugGameStage>(initialStage ?? "main-menu");
  const [targetWinTugs, setTargetWinTugs] = useState<number>(initialTargetWinTugs ?? 5);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Rope Position: 0 is centered. Positive is towards Red (Left), Negative is towards Blue (Right)
  const [ropePosition, setRopePosition] = useState<number>(0);
  const [lastPullDirection, setLastPullDirection] = useState<"red" | "blue" | null>(null);
  const [isPullingAnim, setIsPullingAnim] = useState<boolean>(false);

  // Teams: Red (Left) vs Blue (Right)
  const [teamRed, setTeamRed] = useState<TugTeam>(() => {
    if (configuredTeams && configuredTeams.length >= 1) {
      return {
        id: "red",
        name: configuredTeams[0].name || "Team Red Dragons",
        color: configuredTeams[0].color || "#ef4444",
        accent: configuredTeams[0].accent || "#fca5a5",
        avatar: configuredTeams[0].avatar || "🔴",
        members: initialStudents ? initialStudents.slice(0, Math.ceil(initialStudents.length / 2)) : ["Alex", "Maria", "Juan"],
        correctAnswers: 0,
        wrongAnswers: 0,
      };
    }
    const half = initialStudents ? Math.ceil(initialStudents.length / 2) : 0;
    return {
      id: "red",
      name: "Team Red Dragons",
      color: "#ef4444",
      accent: "#fca5a5",
      avatar: "🔴",
      members: initialStudents ? initialStudents.slice(0, half) : ["Alex", "Maria", "Juan"],
      correctAnswers: 0,
      wrongAnswers: 0,
    };
  });

  const [teamBlue, setTeamBlue] = useState<TugTeam>(() => {
    if (configuredTeams && configuredTeams.length >= 2) {
      return {
        id: "blue",
        name: configuredTeams[1].name || "Team Blue Sharks",
        color: configuredTeams[1].color || "#3b82f6",
        accent: configuredTeams[1].accent || "#93c5fd",
        avatar: configuredTeams[1].avatar || "🔵",
        members: initialStudents ? initialStudents.slice(Math.ceil(initialStudents.length / 2)) : ["Gabriel", "Sophia", "Lucas"],
        correctAnswers: 0,
        wrongAnswers: 0,
      };
    }
    const half = initialStudents ? Math.ceil(initialStudents.length / 2) : 0;
    return {
      id: "blue",
      name: "Team Blue Sharks",
      color: "#3b82f6",
      accent: "#93c5fd",
      avatar: "🔵",
      members: initialStudents ? initialStudents.slice(half) : ["Gabriel", "Sophia", "Lucas"],
      correctAnswers: 0,
      wrongAnswers: 0,
    };
  });

  // Questions (loaded strictly from question sets)
  const [questions, setQuestions] = useState<TugQuestion[]>(() => {
    return initialQuestions && initialQuestions.length > 0 ? initialQuestions : [];
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [activeTurn, setActiveTurn] = useState<"red" | "blue">("red");
  const [winnerTeam, setWinnerTeam] = useState<TugTeam | null>(null);

  // AI & Question Bank State
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(10);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [openQuestionIds, setOpenQuestionIds] = useState<Record<string, boolean>>({});
  const [hideQuestionsList, setHideQuestionsList] = useState<boolean>(false);

  // Custom question add form
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newAnswerText, setNewAnswerText] = useState("");
  const newCategoryText = "General";

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sfx.enabled = next;
    if (next) sfx.playClick();
  };

  useEffect(() => {
    sfx.enabled = soundEnabled;
  }, [soundEnabled]);

  // Current active question
  const currentQuestion = questions[currentQuestionIndex] || questions[0];

  // Toggle Single Question Answer Open
  const toggleQuestionOpen = (id: string) => {
    sfx.playClick();
    setOpenQuestionIds((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  // AI-Powered File Upload Parser (.pdf, .txt, .md, .csv, .json, .docx)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    const fileName = file.name;
    const extension = fileName.toLowerCase().slice(fileName.lastIndexOf("."));

    // Direct JSON parsing
    if (extension === ".json") {
      try {
        const content = await file.text();
        const jsonData = JSON.parse(content);
        if (Array.isArray(jsonData)) {
          const directQuestions = jsonData
            .filter((item: unknown): item is { question: unknown; answer: unknown; category?: unknown } => Boolean(item && typeof item === "object" && "question" in item && "answer" in item))
            .map((item, idx: number) => ({
              id: `tq-file-${Date.now()}-${idx}`,
              question: String(item.question).trim(),
              answer: String(item.answer).trim(),
              category: String(item.category || "Uploaded").trim(),
            }));
          if (directQuestions.length > 0) {
            setQuestions(directQuestions);
            setImportStatus(`Successfully loaded ${directQuestions.length} questions from ${fileName}!`);
            sfx.playCorrect();
            return;
          }
        }
      } catch { }
    }

    // Direct CSV parsing
    if (extension === ".csv") {
      try {
        const content = await file.text();
        const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const directQuestions: TugQuestion[] = [];
        for (let idx = 0; idx < lines.length; idx++) {
          const line = lines[idx];
          let parts = line.split(",");
          if (parts.length < 2) parts = line.split("\t");
          if (parts.length < 2) parts = line.split("|");
          if (parts.length < 2) parts = line.split(";");
          if (parts.length >= 2) {
            const q = parts[0].trim();
            const a = parts.slice(1).join(",").trim();
            if (q && a) {
              directQuestions.push({
                id: `tq-file-${Date.now()}-${idx}`,
                question: q,
                answer: a,
                category: "Uploaded",
              });
            }
          }
        }

        if (directQuestions.length >= 3) {
          setQuestions(directQuestions);
          setImportStatus(`Successfully loaded ${directQuestions.length} questions from ${fileName}!`);
          sfx.playCorrect();
          return;
        }
      } catch { }
    }

    // AI Document analysis (PDF, TXT, MD, DOC, etc.)
    // AI Document analysis (PPTX, PDF, Word, Excel, TXT, MD, etc.)
    setIsGeneratingAI(true);
    setImportStatus(`✨ AI is reading "${fileName}" and generating ${aiQuestionCount} quiz questions...`);
    sfx.playClick();

    try {
      const extractedText = await extractLessonText(file);

      if (!extractedText || extractedText.trim().length < 15) {
        throw new Error("The file did not contain readable lesson text.");
      }

      // Call AI Generation API
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-game-questions",
          lessonText: extractedText,
          questionCount: aiQuestionCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI failed to process the document.");
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        const generated: TugQuestion[] = data.questions.map((item: { question?: unknown; answer?: unknown }, idx: number) => ({
          id: `tq-ai-${Date.now()}-${idx}`,
          question: String(item.question || "").trim(),
          answer: String(item.answer || "").trim(),
          category: "AI Generated",
        }));
        setQuestions(generated);
        setImportStatus(`✨ AI generated ${generated.length} quiz questions from ${fileName}!`);
        sfx.playCorrect();
      } else {
        throw new Error("AI returned no questions. Please try a different lesson document.");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to process file.";
      setImportStatus(`⚠️ Error: ${errMsg}`);
      sfx.playSlip();
    } finally {
      setIsGeneratingAI(false);
    }
  };


  // Add Question
  const handleAddQuestion = () => {
    if (!newQuestionText.trim() || !newAnswerText.trim()) return;
    sfx.playClick();
    setQuestions((prev) => [
      ...prev,
      {
        id: `tq-${Date.now()}`,
        question: newQuestionText.trim(),
        answer: newAnswerText.trim(),
        category: newCategoryText.trim() || "General",
      },
    ]);
    setNewQuestionText("");
    setNewAnswerText("");
  };

  // Next Question
  const handleNextQuestion = () => {
    sfx.playClick();
    setShowAnswer(false);
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  // Handle Answer Action
  const handleAnswerResult = (answeringTeam: "red" | "blue", isCorrect: boolean) => {
    setShowAnswer(false);

    if (isCorrect) {
      sfx.playCorrect();
      setTimeout(() => sfx.playTug(), 150);
      setIsPullingAnim(true);
      setLastPullDirection(answeringTeam);

      // Positive = pull left (Red), Negative = pull right (Blue)
      const delta = answeringTeam === "red" ? 1 : -1;
      const nextPos = ropePosition + delta;
      setRopePosition(nextPos);

      if (answeringTeam === "red") {
        setTeamRed((prev) => ({
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
        }));
      } else {
        setTeamBlue((prev) => ({
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
        }));
      }

      // Check win condition
      if (Math.abs(nextPos) >= targetWinTugs) {
        setTimeout(() => {
          const winner = nextPos > 0 ? teamRed : teamBlue;
          setWinnerTeam(winner);
          sfx.playVictory();
          setStage("results");
        }, 600);
      } else {
        setTimeout(() => {
          setIsPullingAnim(false);
          setActiveTurn((prev) => (prev === "red" ? "blue" : "red"));
          setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
        }, 500);
      }
    } else {
      // Wrong answer
      sfx.playSlip();
      if (answeringTeam === "red") {
        setTeamRed((prev) => ({
          ...prev,
          wrongAnswers: prev.wrongAnswers + 1,
        }));
      } else {
        setTeamBlue((prev) => ({
          ...prev,
          wrongAnswers: prev.wrongAnswers + 1,
        }));
      }
      setActiveTurn((prev) => (prev === "red" ? "blue" : "red"));
      setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
    }
  };

  // Reset Game
  const handleResetGame = () => {
    sfx.playClick();
    setRopePosition(0);
    setWinnerTeam(null);
    setShowAnswer(false);
    setCurrentQuestionIndex(0);
    setActiveTurn("red");
    setTeamRed((prev) => ({ ...prev, correctAnswers: 0, wrongAnswers: 0 }));
    setTeamBlue((prev) => ({ ...prev, correctAnswers: 0, wrongAnswers: 0 }));
    setStage("arena");
  };

  // Calculate percentages for rope displacement
  // 0 is 50%. -targetWinTugs is 85% (Blue win). +targetWinTugs is 15% (Red win).
  const ribbonPercentage = useMemo(() => {
    const ratio = ropePosition / targetWinTugs; // -1 to +1
    // Red is Left (15% to 50%), Blue is Right (50% to 85%)
    return 50 - ratio * 35;
  }, [ropePosition, targetWinTugs]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden font-sans text-slate-100 select-none bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.92)), url('/images/tug_of_war_bg.jpg')`,
      }}
    >
      {/* Confetti if victory */}
      {stage === "results" && <ConfettiCanvas />}

      {/* Top Header Bar */}
      <header className="relative z-30 flex items-center justify-between border-b border-white/10 bg-slate-900/85 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-500 via-amber-500 to-blue-500 text-xl shadow-md">
            🪢
          </div>
          <div>
            <h1 className="font-heading text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-blue-400">
              TUG OF WAR QUIZ
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300/80">
              Interactive Team Rope Clash
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-amber-300 transition hover:bg-white/10"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>

          {/* Navigation Controls */}
          {stage !== "main-menu" && (
            <button
              onClick={() => {
                sfx.playClick();
                if (stage === "how-to-play" || stage === "setup") {
                  setStage("main-menu");
                } else if (stage === "arena") {
                  setStage("setup");
                } else if (stage === "results") {
                  setStage("arena");
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <span>⬅ Back</span>
            </button>
          )}

          {/* End Match button during arena */}
          {stage === "arena" && (
            <button
              onClick={() => {
                sfx.playClick();
                if (confirm("End the match now and see the current leader?")) {
                  const leader = ropePosition >= 0 ? teamRed : teamBlue;
                  setWinnerTeam(leader);
                  sfx.playVictory();
                  setStage("results");
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-500/30"
            >
              <span>🏁 End Match</span>
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
      <main className={`relative flex-1 overflow-y-auto ${stage === "arena" ? "p-2 sm:p-4 flex flex-col justify-start" : "p-4 sm:p-6"}`}>
        {/* ========================================================================= */}
        {/* 1. MAIN MENU                                                             */}
        {/* ========================================================================= */}
        {stage === "main-menu" && (
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-4 text-center animate-fadeInUp">
            <div className="relative mb-5 w-full max-w-xl">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-red-500/30 via-amber-500/30 to-blue-500/30 blur-xl" />
              <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/40 shadow-2xl shadow-amber-500/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/tug_of_war_cover.jpg"
                  alt="Tug of War Quiz Game"
                  className="w-full h-auto object-cover max-h-[300px]"
                />
              </div>
            </div>

            <span className="inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-amber-300">
              Interactive 2-Team Classroom Showdown
            </span>

            <h2 className="mt-3 font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-blue-400 drop-shadow-sm">
              TUG OF WAR QUIZ
            </h2>

            <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
              Split the class into <strong className="text-red-400">Team Red</strong> and <strong className="text-blue-400">Team Blue</strong>! Answer quiz questions correctly to pull the ribbon across the victory line!
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full max-w-lg">
              <button
                onClick={() => {
                  sfx.playClick();
                  setStage("setup");
                }}
                className="group relative flex h-14 sm:flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl bg-gradient-to-r from-red-500 via-amber-500 to-blue-600 px-6 text-base sm:text-lg font-black text-white shadow-xl shadow-amber-500/25 transition-all duration-200 hover:scale-105 hover:shadow-amber-500/40 active:scale-95 cursor-pointer"
              >
                <span className="text-xl transition-transform group-hover:scale-125">▶</span>
                <span className="tracking-wide drop-shadow-md">START MATCH</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  setStage("how-to-play");
                }}
                className="flex h-14 sm:flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-white/20 bg-white/10 px-6 text-base font-bold text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span className="text-lg">📜</span>
                <span>How to Play</span>
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 w-full">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm">
                <div className="text-2xl mb-1">🪢</div>
                <h3 className="font-bold text-amber-300 text-sm">Dynamic Physics</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Rope flexes and shakes smoothly towards the leading team with every right answer.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm">
                <div className="text-2xl mb-1">⚔️</div>
                <h3 className="font-bold text-red-400 text-sm">Team Showdown</h3>
                <p className="text-xs text-slate-400 mt-1">
                  1v1 Red vs Blue classroom trivia battle with custom team names and live score tracking.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm">
                <div className="text-2xl mb-1">✨</div>
                <h3 className="font-bold text-blue-400 text-sm">AI Question Bank</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload lesson docs or PDFs to auto-generate trivia, or create custom quiz decks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. HOW TO PLAY                                                           */}
        {/* ========================================================================= */}
        {stage === "how-to-play" && (
          <div className="mx-auto max-w-2xl py-6 animate-fadeInUp">
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="text-3xl">📖</span>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">How to Play Tug of War</h2>
                  <p className="text-xs text-amber-400 uppercase font-semibold">Rules & Gameplay Guide</p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm text-slate-200">
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">1</span>
                  <p>
                    <strong className="text-white">Form Two Teams:</strong> The classroom is split into <span className="text-red-400 font-bold">Team Red (Left)</span> and <span className="text-blue-400 font-bold">Team Blue (Right)</span>.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">2</span>
                  <p>
                    <strong className="text-white">Take Turns Answering:</strong> A question is shown on screen. The active team discusses and submits their answer.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">3</span>
                  <p>
                    <strong className="text-white">Correct Answer (+1 Pull):</strong> Getting it right earns a mighty heave, pulling the ribbon 1 notch closer to their victory zone!
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">4</span>
                  <p>
                    <strong className="text-white">Winning Condition:</strong> Pull the center ribbon all the way across the victory boundary (e.g., 5 tugs) to win the championship!
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => {
                    sfx.playClick();
                    setStage("setup");
                  }}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-bold text-slate-950 transition hover:brightness-110 active:scale-95"
                >
                  Configure Match & Rosters ➡
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. SETUP SCREEN (Game Configuration Studio)                              */}
        {/* ========================================================================= */}
        {stage === "setup" && (
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#ebf4f0] p-6 sm:p-8 space-y-6 shadow-2xl border border-white/10 text-slate-900 my-4 animate-fadeInUp">
            {/* Top Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#0f766e]">
                  MATCH SETUP
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  Game configuration
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Set up your match, organize teams, and prepare the question bank.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    sfx.playWhistle();
                    setRopePosition(0);
                    setStage("arena");
                  }}
                  disabled={questions.length === 0}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#136445] hover:bg-[#0e4d35] text-white font-bold text-sm px-6 py-3 shadow-md shadow-[#136445]/20 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="text-base">🚀</span>
                  <span>Start match</span>
                </button>
              </div>
            </div>

            {/* Row 1: Winning Score & Team Balance Cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* 01 Winning score Card */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                    01
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Winning tugs
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tugs needed to cross victory boundary
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setTargetWinTugs((prev) => Math.max(2, prev - 1));
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-bold text-lg cursor-pointer active:scale-95"
                  >
                    -
                  </button>

                  <div className="text-center min-w-[56px] flex flex-col items-center">
                    <input
                      type="number"
                      min={2}
                      max={20}
                      value={targetWinTugs}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setTargetWinTugs(Math.min(20, Math.max(2, val)));
                        }
                      }}
                      className="w-14 bg-transparent text-2xl sm:text-3xl font-extrabold text-[#136445] text-center outline-none border-b border-transparent hover:border-slate-200 focus:border-[#136445]"
                      title="Type winning tugs"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold block -mt-1">
                      tugs
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setTargetWinTugs((prev) => Math.min(20, prev + 1));
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-bold text-lg cursor-pointer active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 02 Match Format Card */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                    02
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Match format
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      1v1 Head-to-Head classroom battle
                    </p>
                  </div>
                </div>

                <span className="rounded-xl bg-emerald-50 border border-emerald-300/80 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-xs">
                  ⚔️ 2-Team Duel
                </span>
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
                  2 teams
                </span>
              </div>

              {/* Team Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team Red */}
                <div
                  className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-sm"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: "#ef4444",
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-500">01</span>
                      <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-red-600">
                        Left Side
                      </span>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                      TEAM RED NAME
                    </p>

                    <input
                      type="text"
                      value={teamRed.name}
                      onChange={(e) => setTeamRed({ ...teamRed, name: e.target.value })}
                      placeholder="Team Red Dragons"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm font-bold text-slate-800 outline-none transition focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                    <span className="h-2 w-2 rounded-full inline-block bg-red-500" />
                    <span className="text-[11px] text-slate-500 font-medium">
                      Left Zone (Pull Left)
                    </span>
                  </div>
                </div>

                {/* Team Blue */}
                <div
                  className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-sm"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: "#3b82f6",
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-500">02</span>
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                        Right Side
                      </span>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                      TEAM BLUE NAME
                    </p>

                    <input
                      type="text"
                      value={teamBlue.name}
                      onChange={(e) => setTeamBlue({ ...teamBlue, name: e.target.value })}
                      placeholder="Team Blue Sharks"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                    <span className="h-2 w-2 rounded-full inline-block bg-blue-500" />
                    <span className="text-[11px] text-slate-500 font-medium">
                      Right Zone (Pull Right)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Question Bank Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#0f766e]">
                    QUESTION BANK
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                    <span>Build your trivia deck</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      ✨ AI Powered
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload lesson files (.pdf, .docx, .txt, .csv, .json) to auto-generate questions with AI.
                  </p>
                </div>

                {/* Neatly Aligned Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="rounded-xl bg-[#e6f4ed] px-3.5 py-2 text-xs font-bold text-[#136445] whitespace-nowrap">
                    {questions.length} questions
                  </span>

                  {/* Typeable AI Question Count Input */}
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 gap-1.5 shadow-xs hover:border-[#0f766e] transition">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400">
                      Qty:
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={aiQuestionCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val)) {
                          setAiQuestionCount(1);
                        } else {
                          setAiQuestionCount(Math.min(50, Math.max(1, val)));
                        }
                      }}
                      className="w-11 bg-slate-50 rounded-lg py-0.5 text-xs font-black text-[#0f766e] text-center outline-none border border-slate-200 focus:border-[#0f766e] focus:bg-white"
                      title="Type how many questions to generate (1 to 50)"
                    />
                    <span className="text-xs text-slate-400 font-semibold">Qs</span>
                  </div>

                  {/* Larger AI File Import Button */}
                  <label
                    className={`cursor-pointer flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-[#0f766e] hover:text-[#0f766e] transition shadow-xs whitespace-nowrap ${isGeneratingAI ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    title={`Import PPTX, PDF, Word, Excel, TXT, CSV, or JSON file to auto-generate ${aiQuestionCount} questions`}
                  >
                    <span className="text-sm">{isGeneratingAI ? "⏳" : "⬆"}</span>
                    <span>{isGeneratingAI ? "Reading file..." : "Import file"}</span>
                    <input
                      type="file"
                      disabled={isGeneratingAI}
                      accept=".pptx,.ppt,.ppsx,.pptm,.pdf,.docx,.doc,.xlsx,.xls,.txt,.md,.csv,.json,.rtf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/*,*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Import / AI Status Banner */}
              {importStatus && (
                <div
                  className={`rounded-xl border p-3 text-xs font-medium flex items-center justify-between ${isGeneratingAI
                      ? "border-emerald-500/40 bg-emerald-50 text-emerald-900 animate-pulse"
                      : "border-emerald-500/30 bg-emerald-50 text-emerald-800"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {isGeneratingAI && <span className="animate-spin">✨</span>}
                    <span>{importStatus}</span>
                  </div>
                  {!isGeneratingAI && (
                    <button
                      onClick={() => setImportStatus(null)}
                      className="text-emerald-700 font-bold px-1 hover:text-emerald-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {/* Add Question Input Box */}
              <div className="rounded-xl border border-slate-200 bg-[#f8faf9] p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      QUESTION
                    </label>
                    <input
                      type="text"
                      placeholder="Type your question here..."
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#136445] focus:ring-1 focus:ring-[#136445]/20"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      CORRECT ANSWER
                    </label>
                    <input
                      type="text"
                      placeholder="Enter the answer..."
                      value={newAnswerText}
                      onChange={(e) => setNewAnswerText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddQuestion();
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#136445] focus:ring-1 focus:ring-[#136445]/20"
                    />
                  </div>

                  <button
                    onClick={handleAddQuestion}
                    className="flex items-center justify-center gap-1 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs px-5 py-2.5 transition shadow-sm active:scale-95 cursor-pointer h-[38px]"
                  >
                    <span>+ Add</span>
                  </button>
                </div>
              </div>

              {/* Questions List Header */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Questions ({questions.length})
                </span>

                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setHideQuestionsList((prev) => !prev);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition cursor-pointer active:scale-95"
                >
                  <span>{hideQuestionsList ? "👁️ Show List" : "👁️ Hide List"}</span>
                  <span className="text-[10px] text-slate-400">{hideQuestionsList ? "▼" : "▲"}</span>
                </button>
              </div>

              {/* Questions List (Toggleable) */}
              {!hideQuestionsList ? (
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 pr-1 animate-fadeIn">
                  {questions.map((q, idx) => {
                    const isOpen = openQuestionIds[q.id] !== false;
                    return (
                      <div
                        key={q.id}
                        className="py-2.5 px-2 group hover:bg-slate-50/80 rounded-xl transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            onClick={() => toggleQuestionOpen(q.id)}
                            className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer select-none"
                          >
                            <span className="text-xs font-bold text-[#ea580c] shrink-0 pt-0.5">
                              {String(idx + 1).padStart(2, "0")}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                                  {q.question}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0 font-bold">
                                  {isOpen ? "▼" : "▶"}
                                </span>
                              </div>

                              {isOpen && (
                                <p className="text-xs text-slate-400 mt-1 animate-fadeIn">
                                  Answer <span className="font-semibold text-[#0f766e]">{q.answer}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleQuestionOpen(q.id)}
                              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer text-xs"
                              title={isOpen ? "Close question" : "Open question"}
                            >
                              {isOpen ? "▲" : "▼"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                sfx.playClick();
                                setQuestions((prev) => prev.filter((item) => item.id !== q.id));
                              }}
                              className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                              title="Delete question"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 px-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-500 font-medium animate-fadeIn">
                  Questions list is hidden ({questions.length} questions ready). Click <strong className="text-slate-700">&quot;Show List&quot;</strong> above to expand and review.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. ARENA / BATTLE STAGE                                                  */}
        {/* ========================================================================= */}
        {stage === "arena" && (
          <div className="mx-auto w-full max-w-7xl xl:max-w-[1600px] space-y-4 px-1 sm:px-2 animate-fadeInUp">
            {/* Top Scoreboard & Tug Arena */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/85 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-3 items-center gap-4 mb-3">
                {/* Team Red Info */}
                <div className="text-left flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">🔴</span>
                  <div className="min-w-0">
                    <h3 className="font-heading font-black text-lg sm:text-2xl text-red-400 truncate">
                      {teamRed.name}
                    </h3>
                    <p className="text-xs text-red-300 font-bold">
                      Correct: {teamRed.correctAnswers} answers · Left Zone
                    </p>
                  </div>
                </div>

                {/* Center Status */}
                <div className="text-center flex flex-col items-center">
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg ${activeTurn === "red"
                      ? "bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse shadow-red-500/20"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/50 animate-pulse shadow-blue-500/20"
                    }`}>
                    {activeTurn === "red" ? `🔴 ${teamRed.name}'s Turn` : `🔵 ${teamBlue.name}'s Turn`}
                  </span>
                  <p className="text-xs text-amber-300 font-extrabold mt-1">
                    First to {targetWinTugs} tugs wins!
                  </p>
                </div>

                {/* Team Blue Info */}
                <div className="text-right flex items-center justify-end gap-3">
                  <div className="min-w-0">
                    <h3 className="font-heading font-black text-lg sm:text-2xl text-blue-400 truncate">
                      {teamBlue.name}
                    </h3>
                    <p className="text-xs text-blue-300 font-bold">
                      Correct: {teamBlue.correctAnswers} answers · Right Zone
                    </p>
                  </div>
                  <span className="text-3xl sm:text-4xl">🔵</span>
                </div>
              </div>

              {/* TUG OF WAR ROPE & CHARACTERS ARENA */}
              <div
                className="relative mt-2 h-72 sm:h-96 md:h-[440px] w-full rounded-2xl sm:rounded-3xl border-2 border-amber-500/40 bg-cover bg-bottom bg-no-repeat overflow-hidden shadow-2xl p-3"
                style={{
                  backgroundImage: `url('/images/tug_of_war_bg.jpg')`,
                }}
              >
                {/* Atmospheric overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none" />

                {/* Background Flags Decor */}
                <div className="absolute top-3 left-4 flex items-center gap-1.5 rounded-full bg-slate-950/75 border border-red-500/50 px-3.5 py-1.5 text-xs sm:text-sm font-black text-red-300 backdrop-blur-md shadow-lg">
                  <span>🚩</span>
                  <span>RED ZONE</span>
                </div>
                <div className="absolute top-3 right-4 flex items-center gap-1.5 rounded-full bg-slate-950/75 border border-blue-500/50 px-3.5 py-1.5 text-xs sm:text-sm font-black text-blue-300 backdrop-blur-md shadow-lg">
                  <span>BLUE ZONE</span>
                  <span>🚩</span>
                </div>

                {/* Center Marking Line */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 border-r-2 border-dashed border-white/90 z-10">
                  <span className="absolute top-4 -left-7 rounded-md bg-slate-950/90 border border-amber-400 px-2.5 py-0.5 text-[10px] font-black text-amber-300 shadow-xl">
                    CENTER
                  </span>
                </div>

                {/* Left Victory Line (Red Win) */}
                <div className="absolute top-0 bottom-0 left-[15%] w-0.5 border-r-2 border-red-500 z-10 shadow-[0_0_12px_rgba(239,68,68,0.9)]">
                  <span className="absolute bottom-4 -left-7 rounded-md bg-red-600 border border-white/30 px-2.5 py-1 text-[10px] font-black text-white shadow-xl">
                    RED WIN
                  </span>
                </div>

                {/* Right Victory Line (Blue Win) */}
                <div className="absolute top-0 bottom-0 right-[15%] w-0.5 border-r-2 border-blue-500 z-10 shadow-[0_0_12px_rgba(59,130,246,0.9)]">
                  <span className="absolute bottom-4 -left-7 rounded-md bg-blue-600 border border-white/30 px-2.5 py-1 text-[10px] font-black text-white shadow-xl">
                    BLUE WIN
                  </span>
                </div>

                {/* PULLERS & ROPE GRAPHIC LAYER */}
                <div
                  className="absolute inset-0 flex items-end justify-center pb-8 sm:pb-12 pointer-events-none overflow-visible"
                >
                  <div
                    className={`relative h-[65%] sm:h-[75%] md:h-[82%] max-w-none w-auto flex items-center justify-center transition-all duration-700 ease-out ${isPullingAnim
                        ? lastPullDirection === "red"
                          ? "-translate-x-6 scale-[1.03]"
                          : "translate-x-6 scale-[1.03]"
                        : ""
                      }`}
                    style={{
                      transform: `translateX(${(50 - ribbonPercentage) * -8}px)`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/tug_of_war_pullers.png"
                      alt="Tug of War Pullers"
                      className="h-full w-auto max-w-none object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] select-none pointer-events-none"
                    />

                    {/* Active Team Dynamic Speech Badge */}
                    <div
                      className="absolute -top-3 sm:-top-5 transition-all duration-500 pointer-events-none"
                      style={{
                        left: activeTurn === "red" ? "20%" : "80%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-black tracking-wide shadow-2xl border-2 animate-bounce ${activeTurn === "red"
                            ? "bg-red-600 text-white border-red-300 shadow-red-500/50"
                            : "bg-blue-600 text-white border-blue-300 shadow-blue-500/50"
                          }`}
                      >
                        {activeTurn === "red" ? "🔴 PULL HARD!" : "🔵 HEAVE TOGETHER!"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Marker Ticks at the bottom */}
                <div className="absolute bottom-3 left-[12%] right-[12%] flex justify-between items-center rounded-xl bg-slate-950/85 px-4 py-2 text-xs sm:text-sm font-black text-white border border-white/15 backdrop-blur-md shadow-2xl z-20">
                  <span className="text-red-400">◀ RED +{targetWinTugs}</span>
                  <span className={`${ropePosition === 0 ? "text-amber-300 font-black" : "text-slate-200"}`}>
                    Match Status: {ropePosition > 0 ? `Red +${ropePosition} Lead` : ropePosition < 0 ? `Blue +${Math.abs(ropePosition)} Lead` : "Tied (0 - 0)"}
                  </span>
                  <span className="text-blue-400">BLUE +{targetWinTugs} ▶</span>
                </div>
              </div>
            </div>

            {/* QUESTION & ACTION CONSOLE */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 font-black text-sm border border-amber-500/40 shadow-sm">
                    #{currentQuestionIndex + 1}
                  </span>
                  <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300">
                    Category: {currentQuestion.category || "General"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    {showAnswer ? "🙈 Hide Answer" : "👁 Reveal Answer"}
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/20 transition cursor-pointer"
                  >
                    Skip Question ➡
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="my-6 text-center">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-black mb-2">
                  ACTIVE QUESTION
                </p>
                <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight max-w-5xl mx-auto">
                  {currentQuestion.question}
                </h3>

                {/* Revealed Answer Box */}
                {showAnswer && (
                  <div className="mt-4 inline-block rounded-2xl bg-emerald-500/20 border border-emerald-500/40 px-6 py-3 text-base sm:text-lg font-bold text-emerald-300 animate-fadeInUp shadow-lg">
                    ✅ Correct Answer: <span className="text-white underline">{currentQuestion.answer}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Red and Blue Teams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                {/* Team Red Result Controls */}
                <div className="rounded-2xl border-2 border-red-500/40 bg-red-950/30 p-4 sm:p-5 text-center shadow-lg">
                  <p className="text-xs sm:text-sm font-black text-red-400 uppercase tracking-wider mb-3">
                    🔴 {teamRed.name} Answered:
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAnswerResult("red", true)}
                      className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3.5 sm:py-4 text-sm sm:text-base font-black text-white shadow-xl shadow-red-500/25 hover:brightness-110 active:scale-95 transition cursor-pointer"
                    >
                      ✅ CORRECT (+1 TUG)
                    </button>
                    <button
                      onClick={() => handleAnswerResult("red", false)}
                      className="rounded-xl border border-red-500/50 bg-red-900/30 px-5 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-red-300 hover:bg-red-900/60 active:scale-95 transition cursor-pointer"
                    >
                      ❌ WRONG
                    </button>
                  </div>
                </div>

                {/* Team Blue Result Controls */}
                <div className="rounded-2xl border-2 border-blue-500/40 bg-blue-950/30 p-4 sm:p-5 text-center shadow-lg">
                  <p className="text-xs sm:text-sm font-black text-blue-400 uppercase tracking-wider mb-3">
                    🔵 {teamBlue.name} Answered:
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAnswerResult("blue", true)}
                      className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 sm:py-4 text-sm sm:text-base font-black text-white shadow-xl shadow-blue-500/25 hover:brightness-110 active:scale-95 transition cursor-pointer"
                    >
                      ✅ CORRECT (+1 TUG)
                    </button>
                    <button
                      onClick={() => handleAnswerResult("blue", false)}
                      className="rounded-xl border border-blue-500/50 bg-blue-900/30 px-5 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-blue-300 hover:bg-blue-900/60 active:scale-95 transition cursor-pointer"
                    >
                      ❌ WRONG
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. RESULTS STAGE                                                         */}
        {/* ========================================================================= */}
        {stage === "results" && winnerTeam && (
          <div className="mx-auto max-w-3xl py-4 animate-fadeInUp">
            <div className="rounded-3xl border-2 border-amber-400/40 bg-slate-900/95 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
              {/* Top ambient glow */}
              <div
                className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none ${winnerTeam.id === "red" ? "bg-red-500" : "bg-blue-500"
                  }`}
              />

              {/* Victory Celebration Character Banner */}
              <div className="relative mx-auto mb-4 w-full max-w-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    winnerTeam.id === "red"
                      ? "/images/tug_of_war_win_red.png"
                      : "/images/tug_of_war_win_blue.png"
                  }
                  alt={`${winnerTeam.name} Victory Celebration`}
                  className="mx-auto h-auto max-h-[300px] sm:max-h-[350px] w-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] animate-bounce"
                />
              </div>

              <span className="inline-block rounded-full bg-amber-400/20 border border-amber-400/40 px-5 py-1.5 text-xs font-black uppercase tracking-widest text-amber-300 shadow-sm">
                🏆 TUG OF WAR CHAMPIONS 🏆
              </span>

              <h2
                className={`mt-3 font-heading text-3xl sm:text-5xl font-black drop-shadow-md ${winnerTeam.id === "red" ? "text-red-400" : "text-blue-400"
                  }`}
              >
                {winnerTeam.name} WINS!
              </h2>

              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                They pulled the rope across the victory line with exceptional teamwork and classroom trivia knowledge!
              </p>

              {/* Match Stats Summary */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div
                  className={`rounded-2xl border p-4 transition ${winnerTeam.id === "red"
                      ? "border-red-500/60 bg-red-950/40 shadow-lg shadow-red-500/10"
                      : "border-red-500/30 bg-red-950/20"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-base text-red-400">🔴 {teamRed.name}</h4>
                    {winnerTeam.id === "red" && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-[10px] font-black uppercase">
                        👑 Winner
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    Correct Answers: <strong className="text-white text-sm">{teamRed.correctAnswers}</strong>
                  </p>
                  <p className="text-xs text-slate-400">Wrong Answers: {teamRed.wrongAnswers}</p>
                </div>

                <div
                  className={`rounded-2xl border p-4 transition ${winnerTeam.id === "blue"
                      ? "border-blue-500/60 bg-blue-950/40 shadow-lg shadow-blue-500/10"
                      : "border-blue-500/30 bg-blue-950/20"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-base text-blue-400">🔵 {teamBlue.name}</h4>
                    {winnerTeam.id === "blue" && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-[10px] font-black uppercase">
                        👑 Winner
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    Correct Answers: <strong className="text-white text-sm">{teamBlue.correctAnswers}</strong>
                  </p>
                  <p className="text-xs text-slate-400">Wrong Answers: {teamBlue.wrongAnswers}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleResetGame}
                  className="w-full sm:flex-1 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-4 text-base font-black text-slate-950 shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  🔄 Rematch / Play Again
                </button>
                <button
                  onClick={() => {
                    sfx.playClick();
                    setStage("main-menu");
                  }}
                  className="w-full sm:flex-1 rounded-2xl border border-white/20 bg-white/10 py-4 text-base font-bold text-white hover:bg-white/20 active:scale-95 transition cursor-pointer"
                >
                  🏠 Game Menu
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="w-full sm:flex-1 rounded-2xl border border-red-500/30 bg-red-500/10 py-4 text-base font-bold text-red-300 hover:bg-red-500/20 active:scale-95 transition cursor-pointer"
                  >
                    ✕ Exit to My Sets
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
