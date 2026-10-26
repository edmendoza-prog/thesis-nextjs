"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import PaloseboRaceGame from "./PaloseboRaceGame";
import TugOfWarGame from "./TugOfWarGame";

// Types
export interface TriviaQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface TeamChallenger {
  id: string;
  name: string;
  color: string;
  climberImage?: string;
}

export interface QuestionSet {
  id: string;
  title: string;
  description: string;
  creationMethod: "manual" | "ai" | "csv";
  isPublic: boolean;
  coverStyle: "flame" | "ocean" | "sunset" | "emerald";
  coverImage?: string;
  timeLimit: number; // in seconds
  playCount: number;
  createdAt: string;
  questions: TriviaQuestion[];
  gameMode?: "palosebo" | "tug";
  winningScore?: number;
  teamCount?: number;
  teams?: TeamChallenger[];
}

const DEFAULT_CONFIG_TEAMS: TeamChallenger[] = [
  { id: "team-1", name: "Team Tamaraw", color: "#ef4444", climberImage: "/images/climber_red.png" },
  { id: "team-2", name: "Team Agila", color: "#3b82f6", climberImage: "/images/climber_blue.png" },
  { id: "team-3", name: "Team Tarsier", color: "#10b981", climberImage: "/images/climber_green.png" },
  { id: "team-4", name: "Team Haribon", color: "#f59e0b", climberImage: "/images/climber_yellow.png" },
  { id: "team-5", name: "Team Pawikan", color: "#8b5cf6", climberImage: "/images/climber_purple.png" },
  { id: "team-6", name: "Team Kalabaw", color: "#ec4899", climberImage: "/images/climber_red.png" },
];

export interface GameActivityOption {
  id: "palosebo" | "tug";
  title: string;
  description: string;
  category: string;
  image: string;
  teamsLabel: string;
}

const GAME_ACTIVITIES: GameActivityOption[] = [
  {
    id: "palosebo",
    title: "Palosebo Race Quiz",
    description: "Filipino greasy pole climbing quiz race for teams",
    category: "Competition",
    image: "/images/palosebo_race_cover.jpg",
    teamsLabel: "2–6 Teams",
  },
  {
    id: "tug",
    title: "Tug of War Quiz",
    description: "2-Team classroom rope clash showdown with live quiz trivia",
    category: "Team Battle",
    image: "/images/tug_of_war_cover.jpg",
    teamsLabel: "2 Teams",
  },
];


// Custom SVGs (No emojis allowed)
function SvgIcon({
  name,
  className = "w-5 h-5",
}: {
  name: string;
  className?: string;
}) {
  switch (name) {
    case "search":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4.5-4.5" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "sparkles":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
          <path d="M19 3v4m2-2h-4" />
        </svg>
      );
    case "flame":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.63-1.25-2.88-2-4.5-.75 1.62-2 2.87-2 4.5z" />
          <path d="M12 2c1 3 4 4.5 4 8.5a6 6 0 1 1-12 0C4 6.5 7 5 8 2c2 2 3 4 4 0z" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "edit":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case "trash":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      );
    case "image":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        </svg>
      );
    case "paperclip":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      );
    case "eye":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "eye-off":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      );
    case "upload":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case "file-text":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "chevron-up":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m18 15-6-6-6 6" />
        </svg>
      );
    case "gamepad":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <line x1="6" x2="10" y1="11" y2="11" />
          <line x1="8" x2="8" y1="9" y2="13" />
          <line x1="15" x2="15.01" y1="12" y2="12" />
          <line x1="18" x2="18.01" y1="10" y2="10" />
          <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5Z" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      );
    case "play":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case "trophy":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      );
    case "globe":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      );
    case "lock":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case "info":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case "menu":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      );
    default:
      return null;
  }
}

// Friendly Classroom-Game Empty State Illustration SVG
function ClassroomEmptyStateIllustration({ className = "w-64 h-52" }: { className?: string }) {
  return (
    <svg viewBox="0 0 380 280" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="podiumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id="cardGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id="cardGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="sunburst" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Soft Background Radial Aura */}
      <circle cx="190" cy="140" r="120" fill="url(#sunburst)" />

      {/* Floating Sparkles & Geometrics */}
      <circle cx="70" cy="70" r="6" fill="#06b6d4" />
      <polygon points="310,60 315,75 330,80 315,85 310,100 305,85 290,80 305,75" fill="#f59e0b" />
      <circle cx="320" cy="170" r="5" fill="#ec4899" />
      <polygon points="55,160 60,172 72,176 60,180 55,192 50,180 38,176 50,172" fill="#10b981" />

      {/* Ground Oval */}
      <ellipse cx="190" cy="245" rx="145" ry="18" fill="#e2e8f0" />

      {/* Podium Center (1st Place) */}
      <rect x="150" y="165" width="80" height="75" rx="12" fill="url(#podiumGrad)" />
      <rect x="156" y="171" width="68" height="63" rx="8" fill="#4338ca" />
      <text x="190" y="210" fill="#ffffff" fontSize="28" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">1</text>

      {/* Podium Left (2nd Place) */}
      <rect x="80" y="190" width="70" height="50" rx="10" fill="#0891b2" />
      <text x="115" y="222" fill="#ffffff" fontSize="20" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">2</text>

      {/* Podium Right (3rd Place) */}
      <rect x="230" y="200" width="70" height="40" rx="10" fill="#d946ef" />
      <text x="265" y="228" fill="#ffffff" fontSize="18" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">3</text>

      {/* Trophy on 1st place */}
      <g transform="translate(162, 92)">
        <path d="M12 28 C12 36 20 42 28 42 C36 42 44 36 44 28 L44 14 L12 14 Z" fill="url(#trophyGold)" />
        <path d="M12 18 C6 18 2 22 2 28 C2 33 6 36 12 36" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M44 18 C50 18 54 22 54 28 C54 33 50 36 44 36" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" fill="none" />
        <rect x="24" y="42" width="8" height="14" fill="#d97706" />
        <rect x="16" y="56" width="24" height="10" rx="3" fill="#b45309" />
        {/* Star in Trophy */}
        <polygon points="28,21 30,27 36,27 31,31 33,37 28,33 23,37 25,31 20,27 26,27" fill="#ffffff" />
      </g>

      {/* Floating Trivia Card Left */}
      <g transform="translate(48, 80) rotate(-14)">
        <rect x="0" y="0" width="62" height="74" rx="10" fill="url(#cardGrad1)" filter="drop-shadow(0 6px 12px rgba(236,72,153,0.3))" />
        <rect x="8" y="10" width="22" height="6" rx="3" fill="#ffffff" opacity="0.9" />
        <rect x="8" y="22" width="46" height="4" rx="2" fill="#ffffff" opacity="0.6" />
        <rect x="8" y="30" width="38" height="4" rx="2" fill="#ffffff" opacity="0.6" />
        <circle cx="31" cy="52" r="11" fill="#ffffff" />
        <text x="31" y="57" fill="#ec4899" fontSize="14" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">?</text>
      </g>

      {/* Floating Trivia Card Right */}
      <g transform="translate(272, 85) rotate(16)">
        <rect x="0" y="0" width="62" height="74" rx="10" fill="url(#cardGrad2)" filter="drop-shadow(0 6px 12px rgba(6,182,212,0.3))" />
        <rect x="8" y="10" width="22" height="6" rx="3" fill="#ffffff" opacity="0.9" />
        <rect x="8" y="22" width="46" height="4" rx="2" fill="#ffffff" opacity="0.6" />
        <rect x="8" y="30" width="34" height="4" rx="2" fill="#ffffff" opacity="0.6" />
        <path d="M25 52 L29 56 L37 46" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

// Relative time formatter
function formatTimeAgo(dateStr: string) {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours <= 1) return "Edited an hour ago";
    if (diffHours < 24) return `Edited ${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Edited yesterday";
    return `Edited ${diffDays} days ago`;
  } catch {
    return "Edited an hour ago";
  }
}

// Clean "No image" placeholder for question set cards when no custom cover is uploaded
function NoImagePlaceholder({ className = "w-full h-full" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-[#F2F2F2] select-none ${className}`}>
      <svg
        viewBox="0 0 642 535"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-[92%] max-w-[240px] p-1.5"
        aria-label="No image placeholder"
      >
        <defs>
          <clipPath id="frameInnerClip">
            <rect x="91" y="85" width="440" height="305" rx="42" />
          </clipPath>
          <mask id="mountainSlitMask">
            <rect width="642" height="535" fill="white" />
            {/* Diagonal slit matching reference: starts from valley (265, 298) down-right to (330, 371) with rounded cap */}
            <line x1="265" y1="298" x2="330" y2="371" stroke="black" strokeWidth="14" strokeLinecap="round" />
          </mask>
        </defs>

        {/* Outer Frame with rounded corners */}
        <rect
          x="91"
          y="85"
          width="440"
          height="305"
          rx="42"
          stroke="#565656"
          strokeWidth="20"
          strokeLinejoin="round"
        />

        {/* Sun in upper-left */}
        <circle cx="197" cy="170" r="32" fill="#565656" />

        {/* Mountains group clipped to inside rounded bounds of frame */}
        <g clipPath="url(#frameInnerClip)">
          {/* Back/Right taller mountain with slit cut out by mask */}
          <path
            d="M265 391 L353 186 C363 162 391 162 401 186 L536 391 Z"
            fill="#565656"
            mask="url(#mountainSlitMask)"
          />

          {/* Front/Left lower mountain */}
          <path
            d="M75 391 L183 282 C193 271 207 271 217 282 L315 391 Z"
            fill="#565656"
          />
        </g>

        {/* Text "No image" in clean condensed sans-serif */}
        <text
          x="320"
          y="488"
          textAnchor="middle"
          fill="#565656"
          fontSize="80"
          fontWeight="300"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          letterSpacing="-1px"
          transform="scale(0.85, 1.05)"
          style={{ transformOrigin: "320px 488px" }}
        >
          No image
        </text>
      </svg>
    </div>
  );
}

export default function LiveClassActivitiesPage() {
  // Navigation / Views: 'my-sets' | 'create-set' | 'editor' | 'pick-game'
  const [currentView, setCurrentView] = useState<"my-sets" | "create-set" | "editor" | "pick-game">("my-sets");
  const [pickerSource, setPickerSource] = useState<"my-sets" | "editor">("my-sets");
  const [gameActivitySearch, setGameActivitySearch] = useState("");

  // Question Sets State
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Search & Sorting
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"most-played" | "recently-created" | "alphabetical">("recently-created");

  // Create Set Modal State
  const [createMethod, setCreateMethod] = useState<"manual" | "ai" | "csv">("manual");
  const [setTitleInput, setSetTitleInput] = useState("");
  const [setDescriptionInput, setSetDescriptionInput] = useState("");
  const [setIsPublic, setSetIsPublic] = useState(true);
  const [coverStyleInput, setCoverStyleInput] = useState<"flame" | "ocean" | "sunset" | "emerald">("flame");
  const [coverImageInput, setCoverImageInput] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const editorCoverFileInputRef = useRef<HTMLInputElement>(null);

  // Cover image upload file reader
  const handleProcessCoverFile = (file: File, callback: (base64: string) => void) => {
    if (!file.type.startsWith("image/")) {
      triggerToast("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Image is too large. Please select an image under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        callback(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessCoverFile(file, (dataUrl) => {
        setCoverImageInput(dataUrl);
        triggerToast("Cover image uploaded!");
      });
      e.target.value = "";
    }
  };

  const handleEditorCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessCoverFile(file, (dataUrl) => {
        setActiveSet((prev) => (prev ? { ...prev, coverImage: dataUrl } : null));
        triggerToast("Cover image updated!");
      });
      e.target.value = "";
    }
  };

  // Editor State
  const [activeSet, setActiveSet] = useState<QuestionSet | null>(null);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [bankTab, setBankTab] = useState<"manual" | "ai">("manual");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [aiTopicInput, setAiTopicInput] = useState("");
  const [aiCountInput, setAiCountInput] = useState<number>(5);
  const [aiUploadedFileName, setAiUploadedFileName] = useState<string | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const manualQuestionInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const lastFocusedTriggerRef = useRef<HTMLElement | null>(null);

  const [tableQuestionSearch, setTableQuestionSearch] = useState("");
  const [questionOrder, setQuestionOrder] = useState<"default" | "shuffle">("default");
  const [showQuestionList, setShowQuestionList] = useState(true);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editTitleDraft, setEditTitleDraft] = useState("");
  const [editDescDraft, setEditDescDraft] = useState("");
  const [isSettingTimeLimit, setIsSettingTimeLimit] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);



  // Game Configuration Studio State
  const [activeGameMode, setActiveGameMode] = useState<"palosebo" | "tug">("palosebo");
  const [activeTargetScore, setActiveTargetScore] = useState<number>(5);
  const [activeTeamCount, setActiveTeamCount] = useState<number>(3);
  const [activeTeams, setActiveTeams] = useState<TeamChallenger[]>(DEFAULT_CONFIG_TEAMS.slice(0, 3));

  // Live Games hosting support (Palosebo & Tug of War)
  const [hostingSet, setHostingSet] = useState<QuestionSet | null>(null);
  const [hostChoiceSet, setHostChoiceSet] = useState<QuestionSet | null>(null);
  const [showPalosebo, setShowPalosebo] = useState(false);
  const [showTugOfWar, setShowTugOfWar] = useState(false);

  // Getting started tutorial modal
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  // Filtered game activities for Game Center picker
  const visibleGameActivities = useMemo(() => {
    const q = gameActivitySearch.trim().toLowerCase();
    if (!q) return GAME_ACTIVITIES;
    return GAME_ACTIVITIES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [gameActivitySearch]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("golearning_question_sets");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestionSets(parsed);
        }
      }
    } catch {
      // Use fallback
    }
    setHasLoadedInitial(true);
  }, []);

  // Save to localStorage when sets change (after initial load)
  useEffect(() => {
    if (!hasLoadedInitial) return;
    try {
      localStorage.setItem("golearning_question_sets", JSON.stringify(questionSets));
    } catch {
      // ignore
    }
  }, [questionSets, hasLoadedInitial]);

  // Show toast notification helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered and sorted question sets
  const filteredSets = useMemo(() => {
    let result = questionSets.filter((set) => {
      const matchSearch =
        set.title.toLowerCase().includes(search.toLowerCase()) ||
        set.description.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });

    switch (sortBy) {
      case "most-played":
        result.sort((a, b) => b.playCount - a.playCount);
        break;
      case "alphabetical":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "recently-created":
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [questionSets, search, sortBy]);

  // Handler: Open Create Set
  const handleOpenCreateSet = () => {
    setSetTitleInput("");
    setSetDescriptionInput("");
    setCreateMethod("manual");
    setSetIsPublic(true);
    setCoverStyleInput("flame");
    setCoverImageInput(null);
    setCurrentView("create-set");
  };

  // Handler: Continue to Questions
  const handleContinueToQuestions = () => {
    if (!setTitleInput.trim()) return;

    const newSet: QuestionSet = {
      id: `set-${Date.now()}`,
      title: setTitleInput.trim(),
      description: setDescriptionInput.trim() || "Classroom trivia question deck for live educational competitions.",
      creationMethod: "manual",
      isPublic: setIsPublic,
      coverStyle: coverStyleInput,
      coverImage: coverImageInput || undefined,
      timeLimit: 30,
      playCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      questions: [],
      gameMode: "palosebo",
      winningScore: 5,
      teamCount: 3,
      teams: DEFAULT_CONFIG_TEAMS.slice(0, 3),
    };

    setActiveSet(newSet);
    setActiveGameMode("palosebo");
    setActiveTargetScore(5);
    setActiveTeamCount(3);
    setActiveTeams(DEFAULT_CONFIG_TEAMS.slice(0, 3));
    setIsQuestionBankOpen(true); // Open question bank for quick entry
    setCurrentView("editor");
  };

  // Handler: Edit an existing set
  const handleEditSet = (set: QuestionSet) => {
    setActiveSet({ ...set, questions: [...set.questions] });
    setActiveGameMode(set.gameMode || "palosebo");
    setActiveTargetScore(set.winningScore || 5);
    setActiveTeamCount(set.teamCount || (set.teams?.length || 3));
    setActiveTeams(set.teams && set.teams.length >= 2 ? set.teams : DEFAULT_CONFIG_TEAMS.slice(0, 3));
    setIsQuestionBankOpen(set.questions.length === 0);
    setCurrentView("editor");
  };

  // Handler: Set team count in Game Configurations
  const handleSetTeamCount = (count: number) => {
    const clamped = Math.min(6, Math.max(2, count));
    setActiveTeamCount(clamped);
    setActiveTeams((prev) => {
      if (clamped > prev.length) {
        const additional = DEFAULT_CONFIG_TEAMS.slice(prev.length, clamped).map((t, idx) => ({
          ...t,
          id: `team-${prev.length + idx + 1}`,
        }));
        return [...prev, ...additional];
      }
      return prev.slice(0, clamped);
    });
  };

  // Handler: Update specific team properties
  const updateConfiguredTeam = (index: number, field: keyof TeamChallenger, val: string) => {
    setActiveTeams((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Handler: Launch Live Game from Editor
  const handleLaunchLiveGameFromEditor = () => {
    if (!activeSet) return;
    setHostChoiceSet({
      ...activeSet,
      gameMode: activeGameMode,
      winningScore: activeTargetScore,
      teamCount: activeTeamCount,
      teams: activeTeams,
    });
    setPickerSource("editor");
    setCurrentView("pick-game");
  };

  // Questions filtered by the search input in the Questions card
  const displayedQuestions = useMemo(() => {
    if (!activeSet?.questions) return [];
    const q = tableQuestionSearch.trim().toLowerCase();
    if (!q) return activeSet.questions;
    return activeSet.questions.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [activeSet?.questions, tableQuestionSearch]);

  const formatEstimatedPlayTime = (seconds: number) => {
    if (seconds <= 0) return "0 min";
    const mins = Math.floor(seconds / 60);
    const remSecs = seconds % 60;
    if (mins === 0) return `${remSecs}s`;
    if (remSecs === 0) return `${mins} min`;
    return `${mins}m ${remSecs}s`;
  };

  // Handler: Open Add Questions modal
  const handleOpenAddQuestions = (e?: React.MouseEvent) => {
    if (e) {
      lastFocusedTriggerRef.current = e.currentTarget as HTMLElement;
    }
    setEditingQuestionId(null);
    setQuestionInput("");
    setAnswerInput("");
    setModalErrorMessage(null);
    setBankTab("manual");
    setIsQuestionBankOpen(true);
  };

  // Handler: Open Edit Question in modal (row edit)
  const handleOpenEditQuestion = (q: TriviaQuestion, e?: React.MouseEvent) => {
    if (e) {
      lastFocusedTriggerRef.current = e.currentTarget as HTMLElement;
    }
    setEditingQuestionId(q.id);
    setQuestionInput(q.question);
    setAnswerInput(q.answer);
    setBankTab("manual");
    setModalErrorMessage(null);
    setIsQuestionBankOpen(true);
  };

  // Handler: Close modal and restore focus
  const handleCloseQuestionModal = () => {
    setIsQuestionBankOpen(false);
    setEditingQuestionId(null);
    setQuestionInput("");
    setAnswerInput("");
    setModalErrorMessage(null);
    if (lastFocusedTriggerRef.current) {
      lastFocusedTriggerRef.current.focus();
    }
  };

  // Modal focus trap & Escape key listener
  useEffect(() => {
    if (!isQuestionBankOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCloseQuestionModal();
        return;
      }

      if (e.key === "Tab" && modalContentRef.current) {
        const focusable = modalContentRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isQuestionBankOpen]);

  // Handler: Add or update question manually
  const handleAddQuestion = () => {
    if (!questionInput.trim() || !answerInput.trim() || !activeSet) return;

    if (editingQuestionId) {
      const updated = activeSet.questions.map((q) =>
        q.id === editingQuestionId
          ? { ...q, question: questionInput.trim(), answer: answerInput.trim() }
          : q
      );
      setActiveSet({ ...activeSet, questions: updated });
      handleCloseQuestionModal();
      triggerToast("Question updated");
    } else {
      const newQuestion: TriviaQuestion = {
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        question: questionInput.trim(),
        answer: answerInput.trim(),
      };

      const updatedQuestions = [...activeSet.questions, newQuestion];
      setActiveSet({ ...activeSet, questions: updatedQuestions });
      setQuestionInput("");
      setAnswerInput("");
      setModalErrorMessage(null);
      triggerToast("Question added to set");
      setTimeout(() => {
        manualQuestionInputRef.current?.focus();
      }, 50);
    }
  };

  // Handler: AI generate questions based on Topic or file
  const handleAiGenerateQuestions = () => {
    if (!activeSet) return;
    const topic = aiTopicInput.trim() || (aiUploadedFileName ? aiUploadedFileName.replace(/\.[^/.]+$/, "") : activeSet.title);
    if (!topic) {
      setModalErrorMessage("Please enter a topic or upload a file first.");
      triggerToast("Please enter a topic or upload a file first.");
      return;
    }
    setModalErrorMessage(null);
    setIsGeneratingQuestions(true);

    setTimeout(() => {
      const count = Math.min(20, Math.max(1, aiCountInput || 5));
      const starterBank = [
        { q: `What is the fundamental concept or definition of ${topic}?`, a: "Core foundational principle" },
        { q: `Which key milestone or event is closely associated with ${topic}?`, a: "Historic milestone and observation" },
        { q: `Who is a notable figure or pioneer known for contributions to ${topic}?`, a: "Key historical innovator" },
        { q: `In what practical everyday situation is ${topic} observed?`, a: "Practical modern application" },
        { q: `What primary factor causes or directly influences ${topic}?`, a: "Essential driving force" },
        { q: `Which instrument, unit, or method is used to measure or analyze ${topic}?`, a: "Standard measurement system" },
        { q: `What is a common misconception commonly believed about ${topic}?`, a: "Debunked myth" },
        { q: `What future advancement or innovation is anticipated in ${topic}?`, a: "Next-generation development" },
        { q: `What is the origin or etymological root of ${topic}?`, a: "Classical linguistic origin" },
        { q: `How does ${topic} positively impact students and the community?`, a: "Societal and cultural benefit" },
      ];

      const generated: TriviaQuestion[] = Array.from({ length: count }).map((_, i) => {
        const item = starterBank[i % starterBank.length];
        return {
          id: `ai-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          question: item.q,
          answer: item.a,
        };
      });

      setActiveSet((prev) => prev ? { ...prev, questions: [...prev.questions, ...generated] } : null);
      setIsGeneratingQuestions(false);
      triggerToast(`Generated ${count} trivia questions!`);
    }, 600);
  };

  const handleAiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAiUploadedFileName(file.name);
      if (!aiTopicInput.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setAiTopicInput(cleanName);
      }
      triggerToast(`Attached ${file.name}`);
    }
  };

  const handleRemoveAiFile = () => {
    setAiUploadedFileName(null);
    if (aiFileInputRef.current) aiFileInputRef.current.value = "";
  };

  // Handler: Delete question
  const handleDeleteQuestion = (qId: string) => {
    if (!activeSet) return;
    const updated = activeSet.questions.filter((q) => q.id !== qId);
    setActiveSet({ ...activeSet, questions: updated });
    triggerToast("Question removed");
  };

  // Handler: Save Set from Editor
  const handleSaveSet = () => {
    if (!activeSet) return;

    const setWithConfigs: QuestionSet = {
      ...activeSet,
      gameMode: activeGameMode,
      winningScore: activeTargetScore,
      teamCount: activeTeamCount,
      teams: activeTeams,
    };

    setQuestionSets((prev) => {
      const existsIndex = prev.findIndex((s) => s.id === setWithConfigs.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = setWithConfigs;
        return copy;
      }
      return [setWithConfigs, ...prev];
    });

    triggerToast(`Question Set "${setWithConfigs.title}" saved successfully!`);
    setCurrentView("my-sets");
  };


  // Handler: Delete question set
  const handleDeleteSet = (id: string) => {
    setQuestionSets((prev) => prev.filter((s) => s.id !== id));
    triggerToast("Question set deleted");
  };

  // Handler: Open Live Game Choice Modal / Direct Game Picker
  const handleOpenHostChoiceModal = (set: QuestionSet) => {
    setHostChoiceSet(set);
    setPickerSource("my-sets");
    setCurrentView("pick-game");
  };

  // Handler: Launch Chosen Live Game
  const handleLaunchChosenGame = (set: QuestionSet | null, gameType: "palosebo" | "tug") => {
    const targetSet = set || activeSet || questionSets[0];
    if (!targetSet) return;
    setHostingSet({
      ...targetSet,
      gameMode: gameType,
      winningScore: targetSet.winningScore || activeTargetScore,
      teamCount: targetSet.teamCount || activeTeamCount,
      teams: targetSet.teams && targetSet.teams.length >= 2 ? targetSet.teams : activeTeams,
    });
    if (gameType === "palosebo") setShowPalosebo(true);
    else if (gameType === "tug") setShowTugOfWar(true);
  };

  // Handler: Close or End Live Game Arena and return back to "My Sets"
  const handleCloseLiveGame = () => {
    setShowPalosebo(false);
    setShowTugOfWar(false);
    setHostingSet(null);
    setHostChoiceSet(null);
    setCurrentView("my-sets");
  };

  return (
    <div className="font-nunito min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl border border-slate-700 animate-fadeInUp">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
            <SvgIcon name="check" className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: MY SETS SCREEN (Inside standard Teacher Layout)                   */}
      {/* ========================================================================= */}
      {currentView === "my-sets" && (
        <div className="space-y-6">
          {/* Top Header & Intro */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 border border-violet-200">
                  <SvgIcon name="gamepad" className="w-3.5 h-3.5" />
                  Live Games Hub
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800 border border-cyan-200">
                  {questionSets.length} {questionSets.length === 1 ? "Set" : "Sets"} Created
                </span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Live Games — My Sets
              </h1>
            </div>

            {/* Primary Action Button: Create Set */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleOpenCreateSet}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_0_0_#4c1d95] hover:bg-violet-700 active:translate-y-1 active:shadow-none transition-all cursor-pointer shrink-0"
              >
                <SvgIcon name="plus" className="w-5 h-5" />
                <span>Create Set</span>
              </button>
            </div>
          </div>

          {/* Controls Bar: Search + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
            {/* Search Field */}
            <div className="relative w-full sm:w-80">
              <SvgIcon
                name="search"
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search question sets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-9 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <SvgIcon name="x" className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Sort by:
              </span>
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-48 appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-8 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-500 cursor-pointer"
                >
                  <option value="recently-created">Recently created</option>
                  <option value="most-played">Most played</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
                <SvgIcon
                  name="chevron-down"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA: Empty states vs Card Grid */}
          {questionSets.length === 0 ? (
            /* Large Playful Empty-State Section (Zero Sets in Total) */
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-xs">
              <ClassroomEmptyStateIllustration className="w-72 h-56 sm:w-80 sm:h-64" />
              
              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900">
                You’ll need a question set to host!
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-600 leading-relaxed">
                Build your own trivia decks with custom questions or use AI to generate prompts to launch live games instantly.
              </p>

              {/* Action Buttons */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
                <button
                  onClick={handleOpenCreateSet}
                  className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_0_0_#4c1d95] hover:bg-violet-700 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  <SvgIcon name="plus" className="w-5 h-5" />
                  <span>Create a Set</span>
                </button>
              </div>

              {/* Getting started tutorial link */}
              <button
                onClick={() => setShowTutorialModal(true)}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 underline underline-offset-4 cursor-pointer"
              >
                <SvgIcon name="info" className="w-4 h-4" />
                <span>Getting started tutorial & guide</span>
              </button>
            </div>
          ) : filteredSets.length === 0 ? (
            /* Different Empty State for Active Search containing text */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-xs">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 border border-amber-200">
                <SvgIcon name="search" className="w-8 h-8" />
              </div>
              <h2 className="mt-4 text-xl sm:text-2xl font-extrabold text-slate-900">
                No question sets match your search
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                We couldn&apos;t find any question sets matching &ldquo;<span className="font-bold text-slate-700">{search}</span>&rdquo;. Check for typos, clear your query, or create a brand new set.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSearch("")}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
                <button
                  onClick={handleOpenCreateSet}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-700 shadow-sm transition-colors cursor-pointer"
                >
                  Create Set
                </button>
              </div>
            </div>
          ) : (
            /* Question Sets Grid */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSets.map((set) => (
                <div
                  key={set.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all duration-200"
                >
                  {/* Card Top: Custom Cover Image or "No image" Placeholder */}
                  <div className="relative h-44 w-full bg-[#F1F3F5] flex items-center justify-center border-b border-[#E4E7F3] overflow-hidden">
                    {set.coverImage ? (
                      <img
                        src={set.coverImage}
                        alt={set.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <NoImagePlaceholder className="w-full h-full" />
                    )}

                    {/* Question Count Badge (Bottom-Right of artwork) */}
                    <div className="absolute bottom-3 right-3 z-10 rounded-[8px] bg-[#1B2559]/80 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white shadow-xs">
                      {set.questions.length} {set.questions.length === 1 ? "Question" : "Questions"}
                    </div>

                    {/* Public / Private Pill (Top Right) */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1 rounded-[8px] bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-[#1B2559] border border-[#E4E7F3] shadow-2xs">
                        {set.isPublic ? (
                          <>
                            <SvgIcon name="globe" className="w-3 h-3 text-emerald-500" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <SvgIcon name="lock" className="w-3 h-3 text-slate-400" />
                            <span>Private</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Info matching Image 2 */}
                  <div className="p-4 pt-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-cyan-700 transition-colors">
                        {set.title}
                      </h3>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {set.playCount} Plays
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatTimeAgo(set.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Action Buttons Grid matching Image 2 (just Edit, Delete, & Host) */}
                  <div className="border-t border-slate-200">
                    {/* Row 1: Edit & Delete with vertical divider */}
                    <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleEditSet(set)}
                        className="flex items-center justify-center py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Edit Set"
                        aria-label="Edit Set"
                      >
                        <SvgIcon name="edit" className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSet(set.id)}
                        className="flex items-center justify-center py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Set"
                        aria-label="Delete Set"
                      >
                        <SvgIcon name="trash" className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>

                    {/* Row 2: Host Button (cyan button matching Image 2) */}
                    <div className="p-2.5 bg-white">
                      <button
                        type="button"
                        onClick={() => handleOpenHostChoiceModal(set)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00bcd4] hover:bg-[#00acc1] py-2.5 px-4 text-sm font-extrabold text-white shadow-[0_3px_0_0_#0097a7] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                      >
                        <SvgIcon name="play" className="w-4 h-4 text-white" />
                        <span>Host</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CREATE SET SCREEN / MODAL                                         */}
      {/* ========================================================================= */}
      {currentView === "create-set" && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/50 backdrop-blur-xs p-4 animate-fadeInUp">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 sm:px-8 py-5">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-600">
                  Question Set Builder
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Create a Question Set
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView("my-sets")}
                aria-label="Close"
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <SvgIcon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden cover image file input */}
            <input
              type="file"
              ref={coverFileInputRef}
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
            />

            {/* Two-Column Form Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
              {/* Left Column: Title, Description & Public set */}
              <div className="p-6 sm:p-8 md:col-span-7 space-y-6 bg-white">
                {/* Title Input */}
                <div>
                  <label htmlFor="set-title-input" className="block text-sm font-extrabold text-slate-800 mb-2">
                    Title <span className="text-violet-600">*</span>
                  </label>
                  <input
                    id="set-title-input"
                    type="text"
                    maxLength={70}
                    placeholder="Add a descriptive title"
                    value={setTitleInput}
                    onChange={(e) => setSetTitleInput(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                  {!setTitleInput.trim() && (
                    <p className="mt-1.5 text-xs font-semibold text-amber-600">
                      Title is required to continue.
                    </p>
                  )}
                </div>

                {/* Description Input */}
                <div>
                  <label htmlFor="set-desc-input" className="block text-sm font-extrabold text-slate-800 mb-2">
                    Description
                  </label>
                  <textarea
                    id="set-desc-input"
                    rows={4}
                    placeholder="Tell teachers and students about this set"
                    value={setDescriptionInput}
                    onChange={(e) => setSetDescriptionInput(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 resize-none h-32"
                  />
                </div>

                {/* Public Set Toggle Card */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div>
                    <span className="text-sm font-extrabold text-slate-800 block">
                      Public set
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Discoverable and playable by everyone
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSetIsPublic(!setIsPublic)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      setIsPublic ? "bg-[#06b6d4]" : "bg-slate-300"
                    }`}
                    aria-pressed={setIsPublic}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        setIsPublic ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Right Column: Cover Image & Action Button */}
              <div className="p-6 sm:p-8 md:col-span-5 bg-gradient-to-b from-[#faf9ff] to-[#f4f0fd] flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100">
                {/* Dashed Cover Image Frame */}
                <div className="border-2 border-dashed border-[#e2d9f3] bg-white/70 rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-center text-center min-h-[290px] transition-all">
                  {coverImageInput ? (
                    <div className="relative w-full h-52 rounded-2xl overflow-hidden group shadow-xs bg-slate-50 flex items-center justify-center p-2">
                      <img
                        src={coverImageInput}
                        alt="Cover preview"
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 cursor-pointer"
                        >
                          <SvgIcon name="upload" className="w-3.5 h-3.5" />
                          <span>Change</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCoverImageInput(null)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 cursor-pointer"
                        >
                          <SvgIcon name="trash" className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2eaff] text-[#8b5cf6] mb-3.5 shadow-2xs">
                        <SvgIcon name="image" className="w-7 h-7" />
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Add a cover image
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 max-w-[210px] leading-relaxed">
                        Help your set stand out with a colorful illustration or photo.
                      </p>
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                      >
                        <SvgIcon name="upload" className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload image</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Continue to Questions Button */}
                <button
                  type="button"
                  disabled={!setTitleInput.trim()}
                  onClick={handleContinueToQuestions}
                  className={`mt-5 w-full flex items-center justify-center gap-1.5 rounded-2xl py-3.5 text-sm font-extrabold transition-all ${
                    !setTitleInput.trim()
                      ? "bg-[#c6d0dc] text-white cursor-not-allowed"
                      : "bg-violet-600 text-white shadow-[0_4px_0_0_#4c1d95] hover:bg-violet-700 active:translate-y-1 active:shadow-none cursor-pointer"
                  }`}
                >
                  <span>Continue to Questions</span>
                  <span className="text-base font-bold">›</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: QUESTION SET EDITOR (Clean Professional Design)                    */}
      {/* ========================================================================= */}
      {currentView === "editor" && activeSet && (
        <div className="w-full max-w-7xl mx-auto space-y-6 text-[#1B2559]">
          {/* 1. Breadcrumb: "My sets / [set title]" */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-[#5E678F]">
            <button
              type="button"
              onClick={() => setCurrentView("my-sets")}
              className="hover:text-[#1B2559] transition-colors cursor-pointer focus:outline-hidden focus:underline"
            >
              My sets
            </button>
            <span aria-hidden="true" className="text-[#5E678F]/60">/</span>
            <span className="text-[#1B2559] font-semibold truncate max-w-[260px] sm:max-w-md">
              {activeSet.title || "Untitled set"}
            </span>
          </nav>

          {/* 2. Page header: large set title (28px, bold) with small badges below it. On the right: "Preview" and primary "Save set" */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E7F3]">
            <div>
              <h1 className="text-[28px] font-bold text-[#1B2559] tracking-tight leading-tight">
                {activeSet.title || "Untitled set"}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                {/* Draft Badge (soft yellow #FEF3C7 background, #8A5A00 text) */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-[8px] text-xs font-semibold bg-[#FEF3C7] text-[#8A5A00] border border-[#FEF3C7]">
                  Draft
                </span>
                {/* Visibility Badge */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-[8px] text-xs font-semibold bg-[#E6EAFF] text-[#3D4DF2]">
                  {activeSet.isPublic ? "Public" : "Private"}
                </span>
                {/* Time per question badge */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-[8px] text-xs font-semibold bg-[#EEF0FA] text-[#1B2559] border border-[#E4E7F3]">
                  {activeSet.timeLimit || 30} seconds per question
                </span>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleLaunchLiveGameFromEditor}
                className="inline-flex items-center gap-2 rounded-[8px] border border-[#E4E7F3] bg-white px-4 py-2 text-sm font-semibold text-[#1B2559] hover:bg-[#EEF0FA] transition-colors cursor-pointer focus:ring-2 focus:ring-[#3D4DF2]/30 focus:outline-hidden"
              >
                <SvgIcon name="play" className="w-3.5 h-3.5 text-[#1B2559]" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSet}
                className="inline-flex items-center gap-2 rounded-[8px] bg-[#3D4DF2] hover:bg-[#323FD1] px-5 py-2 text-sm font-semibold text-white transition-colors cursor-pointer shadow-xs focus:ring-2 focus:ring-[#3D4DF2]/40 focus:outline-hidden"
              >
                <SvgIcon name="check" className="w-4 h-4 text-white" />
                <span>Save set</span>
              </button>
            </div>
          </header>

          {/* 3. Two columns (the second drops below on mobile) */}
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Left card: "Questions" */}
            <div className="flex-1 w-full min-w-0 bg-white border border-[#E4E7F3] rounded-[12px] p-6 shadow-xs">
              {/* Header with search field, "Show answers" toggle, and primary "Add questions" */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E7F3]">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#1B2559]">Questions</h2>
                  <span className="text-xs font-semibold text-[#5E678F] bg-[#EEF0FA] px-2 py-0.5 rounded-[8px]">
                    {activeSet.questions.length}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search field */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-[#5E678F]">
                      <SvgIcon name="search" className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={tableQuestionSearch}
                      onChange={(e) => setTableQuestionSearch(e.target.value)}
                      className="w-40 sm:w-48 pl-8 pr-3 py-1.5 text-xs rounded-[8px] border border-[#E4E7F3] bg-white text-[#1B2559] placeholder:text-[#5E678F] focus:border-[#3D4DF2] focus:ring-2 focus:ring-[#3D4DF2]/20 outline-none transition"
                    />
                  </div>

                  {/* Show answers Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowAllAnswers(!showAllAnswers)}
                    className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E4E7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#1B2559] hover:bg-[#EEF0FA] transition-colors cursor-pointer focus:ring-2 focus:ring-[#3D4DF2]/30 focus:outline-hidden"
                  >
                    <SvgIcon name={showAllAnswers ? "eye-off" : "eye"} className="w-3.5 h-3.5 text-[#5E678F]" />
                    <span>{showAllAnswers ? "Hide answers" : "Show answers"}</span>
                  </button>

                  {/* Primary Add questions Button */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenAddQuestions(e)}
                    className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#3D4DF2] hover:bg-[#323FD1] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs focus:ring-2 focus:ring-[#3D4DF2]/40 focus:outline-hidden"
                  >
                    <SvgIcon name="plus" className="w-3.5 h-3.5 text-white" />
                    <span>Add questions</span>
                  </button>
                </div>
              </div>

              {/* Body: Table or Empty state */}
              {activeSet.questions.length === 0 ? (
                /* Empty state with blue "+" icon tile, "No questions yet", short explanation, and "Add questions" button */
                <div className="py-14 text-center">
                  <div className="w-12 h-12 rounded-[12px] bg-[#E6EAFF] text-[#3D4DF2] flex items-center justify-center mx-auto mb-3">
                    <SvgIcon name="plus" className="w-6 h-6 text-[#3D4DF2]" />
                  </div>
                  <h3 className="text-base font-bold text-[#1B2559]">No questions yet</h3>
                  <p className="text-xs text-[#5E678F] mt-1 max-w-sm mx-auto">
                    Write your own questions, or let AI draft them for you to get your trivia set ready.
                  </p>
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={(e) => handleOpenAddQuestions(e)}
                      className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#3D4DF2] hover:bg-[#323FD1] px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs focus:ring-2 focus:ring-[#3D4DF2]/40 focus:outline-hidden"
                    >
                      <SvgIcon name="plus" className="w-3.5 h-3.5 text-white" />
                      <span>Add questions</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-[8px] border border-[#E4E7F3]">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#EEF0FA] border-b border-[#E4E7F3] text-[11px] font-semibold text-[#5E678F] uppercase tracking-wider">
                        <th scope="col" className="py-3 px-3 text-center w-12">#</th>
                        <th scope="col" className="py-3 px-4">Question</th>
                        <th scope="col" className="py-3 px-4 w-44 sm:w-56">Correct answer</th>
                        <th scope="col" className="py-3 px-4 text-right w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7F3]">
                      {displayedQuestions.map((q, idx) => (
                        <tr key={q.id} className="hover:bg-[#EEF0FA]/40 transition-colors">
                          <td className="py-3.5 px-3 text-center text-xs font-semibold text-[#5E678F]">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#1B2559] break-words">
                            {q.question}
                          </td>
                          <td className="py-3.5 px-4">
                            {showAllAnswers ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-[8px] text-xs font-semibold bg-[#D9F5E8] text-[#0F8A5F]">
                                {q.answer}
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-[#5E678F] tracking-widest select-none">
                                ••••••
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditQuestion(q, e)}
                                className="p-1.5 rounded-[8px] text-[#5E678F] hover:text-[#3D4DF2] hover:bg-[#EEF0FA] transition-colors cursor-pointer"
                                title="Edit question"
                                aria-label={`Edit question ${idx + 1}`}
                              >
                                <SvgIcon name="edit" className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1.5 rounded-[8px] text-[#5E678F] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete question"
                                aria-label={`Delete question ${idx + 1}`}
                              >
                                <SvgIcon name="trash" className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {displayedQuestions.length === 0 && (
                    <div className="py-8 text-center text-xs text-[#5E678F]">
                      No questions match &ldquo;{tableQuestionSearch}&rdquo;.
                      <button
                        type="button"
                        onClick={() => setTableQuestionSearch("")}
                        className="ml-2 text-[#3D4DF2] font-semibold hover:underline cursor-pointer"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right card: "Set details" (340px wide) */}
            <aside className="w-full lg:w-[340px] shrink-0 bg-white border border-[#E4E7F3] rounded-[12px] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#1B2559] border-b border-[#E4E7F3] pb-3">
                Set details
              </h2>

              {/* Title */}
              <div>
                <label htmlFor="set-details-title" className="block text-xs font-semibold text-[#1B2559] mb-1.5">
                  Title
                </label>
                <input
                  id="set-details-title"
                  type="text"
                  value={activeSet.title}
                  onChange={(e) => setActiveSet({ ...activeSet, title: e.target.value })}
                  placeholder="Enter set title"
                  className="w-full rounded-[8px] border border-[#E4E7F3] bg-white px-3 py-2 text-sm text-[#1B2559] focus:border-[#3D4DF2] focus:ring-2 focus:ring-[#3D4DF2]/20 outline-none transition"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="set-details-desc" className="block text-xs font-semibold text-[#1B2559] mb-1.5">
                  Description
                </label>
                <textarea
                  id="set-details-desc"
                  rows={3}
                  value={activeSet.description}
                  onChange={(e) => setActiveSet({ ...activeSet, description: e.target.value })}
                  placeholder="Brief description of this trivia deck..."
                  className="w-full rounded-[8px] border border-[#E4E7F3] bg-white px-3 py-2 text-sm text-[#1B2559] focus:border-[#3D4DF2] focus:ring-2 focus:ring-[#3D4DF2]/20 outline-none transition resize-none"
                />
              </div>

              {/* Time per question */}
              <div>
                <label htmlFor="set-details-timelimit" className="block text-xs font-semibold text-[#1B2559] mb-1.5">
                  Time per question
                </label>
                <select
                  id="set-details-timelimit"
                  value={activeSet.timeLimit || 30}
                  onChange={(e) => setActiveSet({ ...activeSet, timeLimit: Number(e.target.value) })}
                  className="w-full rounded-[8px] border border-[#E4E7F3] bg-white px-3 py-2 text-sm text-[#1B2559] focus:border-[#3D4DF2] focus:ring-2 focus:ring-[#3D4DF2]/20 outline-none transition cursor-pointer"
                >
                  <option value={15}>15 seconds</option>
                  <option value={20}>20 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={45}>45 seconds</option>
                  <option value={60}>60 seconds</option>
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label htmlFor="set-details-visibility" className="block text-xs font-semibold text-[#1B2559] mb-1.5">
                  Visibility
                </label>
                <select
                  id="set-details-visibility"
                  value={activeSet.isPublic ? "public" : "private"}
                  onChange={(e) => setActiveSet({ ...activeSet, isPublic: e.target.value === "public" })}
                  className="w-full rounded-[8px] border border-[#E4E7F3] bg-white px-3 py-2 text-sm text-[#1B2559] focus:border-[#3D4DF2] focus:ring-2 focus:ring-[#3D4DF2]/20 outline-none transition cursor-pointer"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* Question order */}
              <div>
                <label htmlFor="set-details-order" className="block text-xs font-semibold text-[#1B2559] mb-1.5">
                  Question order
                </label>
                <select
                  id="set-details-order"
                  value={questionOrder}
                  onChange={(e) => setQuestionOrder(e.target.value as "default" | "shuffle")}
                  className="w-full rounded-[8px] border border-[#E4E7F3] bg-white px-3 py-2 text-sm text-[#1B2559] focus:border-[#3D4DF2] focus:ring-2 focus:ring-[#3D4DF2]/20 outline-none transition cursor-pointer"
                >
                  <option value="default">Default order</option>
                  <option value="shuffle">Random / Shuffled</option>
                </select>
              </div>

              {/* Dashed Cover Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#1B2559] mb-1.5">
                  Cover image
                </label>
                <input
                  type="file"
                  ref={editorCoverFileInputRef}
                  accept="image/*"
                  onChange={handleEditorCoverUpload}
                  className="hidden"
                />
                {activeSet.coverImage ? (
                  <div className="relative rounded-[8px] border border-[#E4E7F3] overflow-hidden bg-[#EEF0FA] p-2 flex flex-col items-center">
                    <img
                      src={activeSet.coverImage}
                      alt={activeSet.title}
                      className="w-full h-32 object-cover rounded-[6px]"
                    />
                    <div className="mt-2 flex items-center justify-between w-full px-1">
                      <button
                        type="button"
                        onClick={() => editorCoverFileInputRef.current?.click()}
                        className="text-xs font-semibold text-[#3D4DF2] hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSet({ ...activeSet, coverImage: undefined });
                          triggerToast("Cover image removed");
                        }}
                        className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => editorCoverFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E4E7F3] rounded-[8px] p-4 text-center cursor-pointer hover:border-[#3D4DF2] hover:bg-[#EEF0FA]/30 transition-all flex flex-col items-center justify-center gap-1.5"
                  >
                    <SvgIcon name="image" className="w-6 h-6 text-[#5E678F]" />
                    <span className="text-xs font-semibold text-[#1B2559]">Click to upload an image</span>
                    <span className="text-[11px] text-[#5E678F]">PNG, JPG up to 5MB</span>
                  </div>
                )}
              </div>

              {/* Bottom stats: Question count and Estimated play time */}
              <div className="border-t border-[#E4E7F3] pt-4 mt-4 grid grid-cols-2 gap-3">
                <div className="bg-[#EEF0FA] rounded-[8px] p-3 text-center">
                  <div className="text-base font-bold text-[#1B2559]">
                    {activeSet.questions.length}
                  </div>
                  <div className="text-[11px] font-medium text-[#5E678F]">Questions</div>
                </div>
                <div className="bg-[#EEF0FA] rounded-[8px] p-3 text-center">
                  <div className="text-base font-bold text-[#1B2559]">
                    {formatEstimatedPlayTime((activeSet.questions.length || 0) * (activeSet.timeLimit || 30))}
                  </div>
                  <div className="text-[11px] font-medium text-[#5E678F]">Est. play time</div>
                </div>
              </div>
            </aside>
          </div>

          {/* =================================================================== */}
          {/* ADD QUESTIONS MODAL (Restyled Question Bank window)                 */}
          {/* =================================================================== */}
          {isQuestionBankOpen && (
            <div
              className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6"
              onClick={(e) => {
                if (e.target === e.currentTarget) handleCloseQuestionModal();
              }}
              role="presentation"
            >
              <div
                ref={modalContentRef}
                className="relative w-full max-w-xl max-h-[88vh] flex flex-col rounded-[14px] bg-white border border-[#E4E7F3] shadow-xl overflow-hidden font-sans"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-questions-modal-title"
              >
                {/* Modal Header */}
                <div className="shrink-0 px-6 pt-6 pb-4 bg-white border-b border-[#E4E7F3]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2
                        id="add-questions-modal-title"
                        className="text-xl font-bold text-[#1B2559]"
                      >
                        {editingQuestionId ? "Edit question" : "Add questions"}
                      </h2>
                      <p className="mt-0.5 text-xs text-[#5E678F]">
                        {editingQuestionId
                          ? "Update your trivia question and correct answer below."
                          : "Write your own, or let AI draft them for you."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex shrink-0 items-center rounded-[8px] bg-[#E6EAFF] px-2.5 py-1 text-xs font-semibold text-[#3D4DF2]">
                        {editingQuestionId
                          ? "Editing"
                          : `${activeSet.questions.length} ${activeSet.questions.length === 1 ? "question" : "questions"}`}
                      </span>
                      <button
                        type="button"
                        onClick={handleCloseQuestionModal}
                        className="p-1 rounded-[8px] text-[#5E678F] hover:text-[#1B2559] hover:bg-[#EEF0FA] transition-colors cursor-pointer"
                        aria-label="Close dialog"
                      >
                        <SvgIcon name="x" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Segmented Tabs: Manual vs Generate with AI (hidden when editing a question!) */}
                  {!editingQuestionId && (
                    <div className="mt-4 rounded-[8px] bg-[#EEF0FA] p-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setBankTab("manual")}
                        className={`flex-1 rounded-[6px] py-1.5 text-xs font-semibold transition-all cursor-pointer text-center ${
                          bankTab === "manual"
                            ? "bg-white text-[#1B2559] shadow-xs"
                            : "text-[#5E678F] hover:text-[#1B2559]"
                        }`}
                      >
                        Manual
                      </button>
                      <button
                        type="button"
                        onClick={() => setBankTab("ai")}
                        className={`flex-1 rounded-[6px] py-1.5 text-xs font-semibold transition-all cursor-pointer text-center ${
                          bankTab === "ai"
                            ? "bg-white text-[#3D4DF2] shadow-xs"
                            : "text-[#5E678F] hover:text-[#1B2559]"
                        }`}
                      >
                        Generate with AI
                      </button>
                    </div>
                  )}
                </div>

                {/* Scrollable Content Container */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {/* TAB 1: MANUAL ADDITION */}
                  {bankTab === "manual" && (
                    <div className="space-y-3.5">
                      {/* Question Field */}
                      <div>
                        <label htmlFor="modal-question-input" className="block text-xs font-semibold text-[#1B2559] mb-1.5">
                          Question
                        </label>
                        <input
                          id="modal-question-input"
                          ref={manualQuestionInputRef}
                          type="text"
                          autoFocus
                          placeholder="What is the capital of France?"
                          value={questionInput}
                          onChange={(e) => setQuestionInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (questionInput.trim() && answerInput.trim()) {
                                handleAddQuestion();
                              }
                            }
                          }}
                          className="w-full rounded-[8px] border border-[#E4E7F3] bg-white px-3.5 py-2.5 text-sm text-[#1B2559] placeholder:text-[#5E678F]/60 outline-none transition focus:border-[#3D4DF2] focus:ring-2 focus:ring-[#3D4DF2]/20"
                        />
                      </div>

                      {/* Correct Answer Field */}
                      <div>
                        <label htmlFor="modal-answer-input" className="block text-xs font-semibold text-[#1B2559] mb-1.5">
                          Correct answer
                        </label>
                        <input
                          id="modal-answer-input"
                          type="text"
                          placeholder="Paris"
                          value={answerInput}
                          onChange={(e) => setAnswerInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (questionInput.trim() && answerInput.trim()) {
                                handleAddQuestion();
                              }
                            }
                          }}
                          className="w-full rounded-[8px] border border-[#E4E7F3] bg-white px-3.5 py-2.5 text-sm text-[#1B2559] placeholder:text-[#5E678F]/60 outline-none transition focus:border-[#3D4DF2] focus:ring-2 focus:ring-[#3D4DF2]/20"
                        />
                      </div>

                      {/* Add Question / Update Question Button */}
                      <button
                        type="button"
                        disabled={!questionInput.trim() || !answerInput.trim()}
                        onClick={handleAddQuestion}
                        className="w-full rounded-[8px] bg-[#3D4DF2] hover:bg-[#323FD1] disabled:opacity-50 disabled:cursor-not-allowed py-2.5 text-xs font-semibold text-white transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-[#3D4DF2]/40 focus:outline-hidden"
                      >
                        {editingQuestionId ? "Update question" : "Add question"}
                      </button>

                      {/* Keyboard shortcut hint */}
                      <p className="text-xs text-[#5E678F]">
                        Press{" "}
                        <kbd className="rounded border border-[#E4E7F3] bg-[#EEF0FA] px-1.5 py-0.5 text-[11px] font-mono font-semibold text-[#1B2559]">
                          Enter
                        </kbd>{" "}
                        in either field to save.
                      </p>
                    </div>
                  )}

                  {/* TAB 2: GENERATE WITH AI */}
                  {bankTab === "ai" && !editingQuestionId && (
                    <div className="space-y-3.5">
                      <input
                        type="file"
                        ref={aiFileInputRef}
                        onChange={handleAiFileUpload}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*"
                        className="hidden"
                      />

                      {/* Topic Field */}
                      <div>
                        <label htmlFor="ai-topic-input" className="block text-xs font-semibold text-[#1B2559] mb-1.5">
                          Topic
                        </label>
                        <input
                          id="ai-topic-input"
                          type="text"
                          autoFocus
                          placeholder="e.g. 90s movies, world geography, space"
                          value={aiTopicInput}
                          onChange={(e) => setAiTopicInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAiGenerateQuestions();
                          }}
                          className="w-full rounded-[8px] border border-[#E4E7F3] bg-white px-3.5 py-2.5 text-sm text-[#1B2559] placeholder:text-[#5E678F]/60 outline-none transition focus:border-[#3D4DF2] focus:ring-2 focus:ring-[#3D4DF2]/20"
                        />
                      </div>

                      {/* Dashed File Upload */}
                      <div>
                        <label className="block text-xs font-semibold text-[#1B2559] mb-1.5">
                          Or upload a file
                        </label>
                        <div
                          onClick={() => aiFileInputRef.current?.click()}
                          className="border-2 border-dashed border-[#E4E7F3] bg-white rounded-[8px] py-3.5 px-4 text-center cursor-pointer hover:border-[#3D4DF2] hover:bg-[#EEF0FA]/30 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-[#1B2559]"
                        >
                          <SvgIcon name="paperclip" className="w-4 h-4 text-[#5E678F]" />
                          <span>Upload a PDF, Word, PowerPoint, Excel, text or image</span>
                        </div>

                        {aiUploadedFileName && (
                          <div className="mt-2 rounded-[8px] bg-[#EEF0FA] px-3 py-2 flex items-center justify-between text-xs font-medium text-[#1B2559]">
                            <span className="truncate max-w-[260px] sm:max-w-xs">
                              {aiUploadedFileName}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveAiFile}
                              className="text-[#3D4DF2] font-semibold hover:underline cursor-pointer shrink-0 ml-2"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Questions count + Generate button */}
                      <div>
                        <label htmlFor="ai-count-input" className="block text-xs font-semibold text-[#1B2559] mb-1.5">
                          Questions
                        </label>
                        <div className="flex items-center gap-2.5">
                          <input
                            id="ai-count-input"
                            type="number"
                            min={1}
                            max={20}
                            value={aiCountInput}
                            onChange={(e) => setAiCountInput(parseInt(e.target.value, 10) || 1)}
                            className="w-16 h-10 rounded-[8px] border border-[#E4E7F3] bg-white text-center text-sm font-semibold text-[#1B2559] outline-none transition focus:border-[#3D4DF2] focus:ring-2 focus:ring-[#3D4DF2]/20"
                          />
                          <button
                            type="button"
                            disabled={isGeneratingQuestions || (!aiTopicInput.trim() && !aiUploadedFileName)}
                            onClick={handleAiGenerateQuestions}
                            className="flex-1 h-10 rounded-[8px] bg-[#3D4DF2] hover:bg-[#323FD1] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#3D4DF2]/40 focus:outline-hidden"
                          >
                            {isGeneratingQuestions ? (
                              <span>Generating questions...</span>
                            ) : (
                              <span>Generate questions</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <hr className="border-[#E4E7F3] my-4" />

                  {/* Added questions list or Empty state */}
                  {!activeSet.questions || activeSet.questions.length === 0 ? (
                    <div className="rounded-[8px] bg-[#EEF0FA] py-4 px-4 text-center text-xs font-medium text-[#5E678F]">
                      No questions yet. Add one above to get started.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5E678F] mb-1">
                        Questions in deck ({activeSet.questions.length})
                      </div>
                      {activeSet.questions
                        .slice()
                        .reverse()
                        .map((q, idx) => {
                          const revNumber = String(activeSet.questions.length - idx).padStart(2, "0");
                          return (
                            <div
                              key={q.id}
                              className="flex items-center justify-between gap-3 rounded-[8px] border border-[#E4E7F3] bg-white p-2.5 text-xs hover:border-[#3D4DF2]/40 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[#E6EAFF] text-[11px] font-bold text-[#3D4DF2]">
                                  {revNumber}
                                </span>
                                <span className="font-medium text-[#1B2559] truncate max-w-[200px] sm:max-w-xs">
                                  {q.question}
                                </span>
                                <span className="rounded-[8px] bg-[#D9F5E8] px-2 py-0.5 text-[10px] font-semibold text-[#0F8A5F] shrink-0">
                                  Ans: {q.answer}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="text-[#5E678F] hover:text-red-600 shrink-0 cursor-pointer p-1 rounded-[6px] transition-colors"
                                aria-label="Remove question"
                              >
                                <SvgIcon name="trash" className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Pinned Modal Footer */}
                <div className="shrink-0 px-6 py-3.5 bg-white border-t border-[#E4E7F3] flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    {modalErrorMessage && (
                      <p className="text-xs font-semibold text-rose-600 truncate">
                        {modalErrorMessage}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseQuestionModal}
                    className="rounded-[8px] bg-[#3D4DF2] hover:bg-[#323FD1] text-white text-xs font-semibold px-5 py-2.5 transition-colors cursor-pointer shadow-xs focus:ring-2 focus:ring-[#3D4DF2]/40 focus:outline-hidden shrink-0"
                  >
                    {editingQuestionId ? "Close" : "Done adding questions"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* GETTING STARTED TUTORIAL MODAL                                            */}
      {/* ========================================================================= */}
      {showTutorialModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fadeInUp">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  Teacher Guide
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Hosting Live Classroom Games
                </h3>
              </div>
              <button
                onClick={() => setShowTutorialModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <SvgIcon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3.5 rounded-2xl bg-violet-50/60 p-3.5 border border-violet-100">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xs font-black text-white">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Create or pick a Question Set</h4>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Enter your trivia questions manually, generate with AI, or import from files using the Question Bank.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-cyan-50/60 p-3.5 border border-cyan-100">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-xs font-black text-white">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Choose a Live Game Arena</h4>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Host a <strong>Palosebo Race</strong> or a 2-team <strong>Tug of War</strong> battle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-emerald-50/60 p-3.5 border border-emerald-100">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xs font-black text-white">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Students join with Room Code</h4>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Project the arena on your classroom screen. Students answer questions from their devices in real time.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTutorialModal(false)}
                className="rounded-2xl bg-violet-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-violet-700 cursor-pointer"
              >
                Got It, Let&apos;s Play
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTEGRATED LIVE GAME ARENAS (Palosebo & Tug of War)                       */}
      {/* ========================================================================= */}
      {showPalosebo && (
        <PaloseboRaceGame
          onClose={handleCloseLiveGame}
          configuredTeams={hostingSet?.teams || activeTeams}
          initialTargetScore={hostingSet?.winningScore || activeTargetScore}
          initialQuestions={
            (hostingSet?.questions && hostingSet.questions.length > 0)
              ? hostingSet.questions
              : activeSet?.questions && activeSet.questions.length > 0
              ? activeSet.questions
              : undefined
          }
          initialStage="setup"
        />
      )}
      {showTugOfWar && (
        <TugOfWarGame
          onClose={handleCloseLiveGame}
          configuredTeams={hostingSet?.teams || activeTeams}
          initialTargetWinTugs={hostingSet?.winningScore || activeTargetScore}
          initialQuestions={
            (hostingSet?.questions && hostingSet.questions.length > 0)
              ? hostingSet.questions.map((q) => ({ id: q.id, question: q.question, answer: q.answer, category: "Live Battle" }))
              : activeSet?.questions && activeSet.questions.length > 0
              ? activeSet.questions.map((q) => ({ id: q.id, question: q.question, answer: q.answer, category: "Live Battle" }))
              : undefined
          }
          initialStage="setup"
        />
      )}


      {/* ========================================================================= */}
      {/* VIEW 4: INTERACTIVE CLASSROOM GAMES PICKER (Directly opened upon Host)    */}
      {/* ========================================================================= */}
      {currentView === "pick-game" && (
        <div className="space-y-6 animate-fadeInUp">
          {/* Top Header & Navigation */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Live Class Activities
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {hostChoiceSet && (
                <div className="flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-200 px-3.5 py-2 text-xs">
                  <span className="font-semibold text-slate-500">Hosting Deck:</span>
                  <span className="font-extrabold text-violet-700 truncate max-w-[200px]">
                    {hostChoiceSet.title}
                  </span>
                  <span className="rounded-md bg-violet-200/70 px-2 py-0.5 text-[11px] font-black text-violet-800">
                    {hostChoiceSet.questions.length} Cards
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentView(pickerSource)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                <SvgIcon name="arrow-left" className="w-4 h-4" />
                <span>{pickerSource === "editor" ? "Back to Set Editor" : "Back to My Sets"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Classroom Games Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            {/* Card Header matching screenshot */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1edff] px-3 py-1 text-xs font-bold text-[#6f55cf]">
                  <span className="h-2 w-2 rounded-full bg-[#6f55cf]" />
                  Game Center
                </span>
                <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-slate-900">
                  Interactive Classroom Games
                </h2>
              </div>

              {/* Search activities... Input */}
              <div className="relative w-full sm:w-72">
                <SvgIcon
                  name="search"
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={gameActivitySearch}
                  onChange={(e) => setGameActivitySearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                {gameActivitySearch && (
                  <button
                    type="button"
                    onClick={() => setGameActivitySearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Clear activity search"
                  >
                    <SvgIcon name="x" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Activities Grid matching screenshot */}
            {visibleGameActivities.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
                <p className="text-sm font-bold text-slate-600">
                  No activities found matching &ldquo;{gameActivitySearch}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => setGameActivitySearch("")}
                  className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {visibleGameActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      {/* Card Image Banner */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={activity.image}
                          alt={activity.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                          {activity.category}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        <h3 className="font-heading text-xl font-bold text-slate-900">
                          {activity.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Button */}
                    <div className="px-6 pb-6 pt-0">
                      <button
                        type="button"
                        onClick={() => handleLaunchChosenGame(hostChoiceSet, activity.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.99] py-3 text-sm font-bold text-white transition-all cursor-pointer shadow-xs"
                      >
                        <span>Launch Game</span>
                        <span aria-hidden="true">&rarr;</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
