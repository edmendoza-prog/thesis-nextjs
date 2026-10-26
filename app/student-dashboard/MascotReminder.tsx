"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";

export type MascotPose =
  | "calendar"
  | "alarm"
  | "megaphone"
  | "sign"
  | "bell"
  | "checkmark"
  | "cheering"
  | "lightbulb"
  | "clipboard"
  | "thinking";

export type BubbleTheme = "white" | "red" | "yellow";

export type ReminderMessage = {
  id: string;
  pose: MascotPose;
  theme: BubbleTheme;
  tag: string;
  tagColor?: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  isNotification?: boolean;
};

const POSE_IMAGES: Record<MascotPose, string> = {
  calendar: "/mascot/reminder_08.png",
  alarm: "/mascot/reminder_04.png",
  megaphone: "/mascot/reminder_01.png",
  sign: "/mascot/reminder_05.png",
  bell: "/mascot/reminder_09.png",
  checkmark: "/mascot/reminder_10.png",
  cheering: "/mascot/reminder_06.png",
  lightbulb: "/mascot/reminder_02.png",
  clipboard: "/mascot/reminder_03.png",
  thinking: "/mascot/reminder_07.png",
};

const BUBBLE_IMAGES: Record<BubbleTheme, string> = {
  white: "/mascot/bubble_white.png",
  red: "/mascot/bubble_red.png",
  yellow: "/mascot/bubble_yellow.png",
};

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function extractNames(rawName: string) {
  const cleaned = (rawName || "").trim();
  if (!cleaned || cleaned.toLowerCase() === "student") {
    return { fullName: "Student", firstName: "Student" };
  }
  const parts = cleaned.split(/\s+/);
  let firstName = parts[0] || "Student";
  if (parts.length >= 2) {
    const firstTwo = `${parts[0]} ${parts[1]}`;
    if (
      ["ed ryan", "mary grace", "john paul", "mark anthony", "anne marie", "edward ryan", "mary jane"].includes(firstTwo.toLowerCase()) ||
      (parts[0].length <= 3 && parts.length >= 3)
    ) {
      firstName = firstTwo;
    }
  }
  return {
    fullName: cleaned,
    firstName,
  };
}

interface MascotReminderProps {
  studentName?: string;
  pendingCount?: number;
  notifications?: ReminderMessage[];
  isPaused?: boolean;
  compact?: boolean;
}

export default function MascotReminder({
  studentName = "Student",
  pendingCount = 0,
  notifications = [],
  isPaused = false,
  compact = false,
}: MascotReminderProps) {
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<ReminderMessage | null>(null);
  const [isFading, setIsFading] = useState(false);
  const [fontSize, setFontSize] = useState<number>(13);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const textRef = useRef<HTMLParagraphElement>(null);
  const bubbleBodyRef = useRef<HTMLDivElement>(null);
  const lastMsgIdRef = useRef<string>("");
  const notificationIdxRef = useRef<number>(0);
  const nextIsNotificationRef = useRef<boolean>(notifications.length > 0);

  const { fullName, firstName } = useMemo(() => extractNames(studentName), [studentName]);
  const greeting = useMemo(() => getTimeGreeting(), []);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  // Track tab visibility
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Define general tips pool (12 total, first 4 only if pending > 0)
  const generalTips = useMemo(() => {
    const tips: { id: string; pose: MascotPose; text: string; requiresPending?: boolean }[] = [
      // 4 pending homework tips
      {
        id: "tip_calendar",
        pose: "calendar",
        text: "Hey there! Don't forget to submit your assignments before the deadline! Let's get that A+!",
        requiresPending: true,
      },
      {
        id: "tip_alarm",
        pose: "alarm",
        text: "Psst! You have pending homework due soon. Let's finish it early so you can relax later!",
        requiresPending: true,
      },
      {
        id: "tip_megaphone",
        pose: "megaphone",
        text: "Oras na para mag-aral! Huwag kalimutang tapusin ang iyong takdang-aralin bago ang takdang araw.",
        requiresPending: true,
      },
      {
        id: "tip_sign",
        pose: "sign",
        text: "Double-check your tasks tab! A finished homework is a stress-free day.",
        requiresPending: true,
      },
      // 8 always available general tips
      {
        id: "tip_bell",
        pose: "bell",
        text: "Keep your streak alive! Complete at least one activity today to earn bonus points!",
      },
      {
        id: "tip_checkmark",
        pose: "checkmark",
        text: "Great job logging in today! You're one step closer to topping the leaderboard! 🏆",
      },
      {
        id: "tip_cheering",
        pose: "cheering",
        text: "Galing mo! Ipagpatuloy ang iyong daily streak para sa mas maraming badges at XP!",
      },
      {
        id: "tip_lightbulb",
        pose: "lightbulb",
        text: "Every question you practice makes you smarter and levels up your brain!",
      },
      {
        id: "tip_clipboard_1",
        pose: "clipboard",
        text: "Take your time! Read each question and choices carefully before clicking your answer.",
      },
      {
        id: "tip_clipboard_2",
        pose: "clipboard",
        text: "For Identification questions, check your spelling carefully before hitting Submit ↵!",
      },
      {
        id: "tip_thinking_1",
        pose: "thinking",
        text: "Need help understanding the question? Try clicking the language translator button (🌐) at the top!",
      },
      {
        id: "tip_thinking_2",
        pose: "thinking",
        text: "Huwag magmadali! Basahing mabuti ang bawat tanong bago sumagot.",
      },
    ];

    return tips.filter((t) => !t.requiresPending || pendingCount > 0);
  }, [pendingCount]);

  // Initial welcome message
  const welcomeMessage: ReminderMessage = useMemo(() => {
    const displayName = firstName && firstName !== "Student" ? firstName : (fullName && fullName !== "Student" ? fullName : "there");
    let text = `${greeting}, ${displayName}! 👋 Welcome back to Go Learning. `;
    if (pendingCount > 0) {
      text += `You have ${pendingCount} ${pendingCount === 1 ? "task" : "tasks"} to finish.`;
    } else {
      text += "You are all caught up!";
    }

    return {
      id: "welcome_initial",
      pose: "cheering",
      theme: "white",
      tag: "Go Learning",
      text,
      isNotification: false,
    };
  }, [greeting, firstName, fullName, pendingCount]);

  // Set initial welcome message on mount and update when studentName/pendingCount changes
  useEffect(() => {
    if (!currentMessage || currentMessage.id === "welcome_initial") {
      setCurrentMessage(welcomeMessage);
      lastMsgIdRef.current = welcomeMessage.id;
    }
  }, [welcomeMessage, currentMessage]);

  // Helper to pick next random tip
  const pickNextTip = useCallback((): ReminderMessage => {
    const available = generalTips.filter((t) => t.id !== lastMsgIdRef.current);
    const candidate = available[Math.floor(Math.random() * (available.length || 1))] || generalTips[0];

    // About 4 in 10 random tips (40%) start with "Hi {first name}!"
    let messageText = candidate.text;
    const shouldAddGreeting = Math.random() < 0.4 && !messageText.startsWith("Hi ") && !messageText.startsWith("Hey ") && !messageText.startsWith("Psst ");
    if (shouldAddGreeting) {
      messageText = `Hi ${firstName}! ${messageText}`;
    }

    return {
      id: candidate.id,
      pose: candidate.pose,
      theme: "white",
      tag: "Study Tip",
      text: messageText,
      isNotification: false,
    };
  }, [generalTips, firstName]);

  // Helper to pick next notification
  const pickNextNotification = useCallback((): ReminderMessage | null => {
    if (!notifications || notifications.length === 0) return null;
    const idx = notificationIdxRef.current % notifications.length;
    notificationIdxRef.current = (notificationIdxRef.current + 1) % notifications.length;
    return notifications[idx];
  }, [notifications]);

  // Rotate to next message
  const rotateNext = useCallback(() => {
    let nextMsg: ReminderMessage | null = null;

    if (notifications && notifications.length > 0) {
      if (nextIsNotificationRef.current) {
        nextMsg = pickNextNotification();
        nextIsNotificationRef.current = false;
      } else {
        nextMsg = pickNextTip();
        nextIsNotificationRef.current = true;
      }
    } else {
      nextMsg = pickNextTip();
    }

    if (!nextMsg) {
      nextMsg = pickNextTip();
    }

    // Never show exact same message twice
    if (nextMsg.id === lastMsgIdRef.current) {
      nextMsg = pickNextTip();
    }

    lastMsgIdRef.current = nextMsg.id;

    if (prefersReducedMotion) {
      setCurrentMessage(nextMsg);
    } else {
      setIsFading(true);
      setTimeout(() => {
        setCurrentMessage(nextMsg);
        setIsFading(false);
      }, 250);
    }
  }, [notifications, pickNextNotification, pickNextTip, prefersReducedMotion]);

  // 9-second Rotation Timer
  useEffect(() => {
    if (isPaused || isHovered || isTabHidden || !isBubbleVisible) {
      return;
    }

    const interval = setInterval(() => {
      rotateNext();
    }, 9000);

    return () => clearInterval(interval);
  }, [isPaused, isHovered, isTabHidden, isBubbleVisible, rotateNext]);

  // Text shrink-to-fit algorithm (13.5px down to 10.5px)
  const adjustFontSize = useCallback(() => {
    if (typeof window === "undefined") return;
    const textEl = textRef.current;
    const containerEl = bubbleBodyRef.current;
    if (!textEl || !containerEl) return;

    const fontSizes = [13.5, 13, 12.5, 12, 11.5, 11, 10.5];
    let bestSize = 13.5;

    for (const size of fontSizes) {
      textEl.style.fontSize = `${size}px`;
      const availableHeight = Math.max(35, containerEl.clientHeight - 60);
      if (textEl.scrollHeight <= availableHeight || size === 10.5) {
        bestSize = size;
        break;
      }
    }
    setFontSize(bestSize);
  }, []);

  useEffect(() => {
    adjustFontSize();
    const handleResize = () => adjustFontSize();
    window.addEventListener("resize", handleResize);

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => adjustFontSize());
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [currentMessage, adjustFontSize]);

  if (!currentMessage) return null;

  const currentPoseImg = POSE_IMAGES[currentMessage.pose] || POSE_IMAGES.cheering;
  const currentBubbleImg = BUBBLE_IMAGES[currentMessage.theme] || BUBBLE_IMAGES.white;

  // Tag styling based on theme
  let tagStyle = "bg-indigo-100 text-indigo-800 border-indigo-200";
  if (currentMessage.theme === "red") {
    tagStyle = "bg-rose-100 text-rose-800 border-rose-300 font-extrabold";
  } else if (currentMessage.theme === "yellow") {
    tagStyle = "bg-amber-100 text-amber-900 border-amber-300 font-extrabold";
  }

  // Action Button styling
  let actionBtnStyle = "bg-[#4255FF] text-white hover:bg-[#3444D9] shadow-xs shadow-[#4255FF]/30";
  if (currentMessage.theme === "red") {
    actionBtnStyle = "bg-rose-600 text-white hover:bg-rose-700 shadow-xs shadow-rose-600/30";
  } else if (currentMessage.theme === "yellow") {
    actionBtnStyle = "bg-amber-500 text-slate-950 font-black hover:bg-amber-400 shadow-xs shadow-amber-500/30";
  }

  if (compact) {
    // Mobile Top Row Layout
    return (
      <div
        className="relative flex items-center gap-3 p-2 rounded-2xl bg-white/10 border border-white/15 my-2 backdrop-blur-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          type="button"
          onClick={() => setIsBubbleVisible((prev) => !prev)}
          aria-label="Show or hide reminder"
          className="relative shrink-0 flex items-center justify-center p-1 rounded-xl hover:scale-105 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4255FF]"
        >
          <Image
            src={currentPoseImg}
            alt={`Mascot reminder: ${currentMessage.pose}`}
            width={60}
            height={70}
            priority
            className="h-[60px] w-auto object-contain drop-shadow-md"
          />
        </button>

        {isBubbleVisible && (
          <div
            className={`relative flex-1 min-h-[75px] flex flex-col justify-center px-4 py-2.5 rounded-2xl border transition-opacity duration-300 ${
              isFading && !prefersReducedMotion ? "opacity-0" : "opacity-100"
            } ${
              currentMessage.theme === "red"
                ? "bg-rose-50 border-rose-200 text-rose-950"
                : currentMessage.theme === "yellow"
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${tagStyle}`}>
                {currentMessage.tag}
              </span>
              {currentMessage.actionLabel && currentMessage.onAction && (
                <button
                  type="button"
                  onClick={currentMessage.onAction}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition ${actionBtnStyle}`}
                >
                  {currentMessage.actionLabel} →
                </button>
              )}
            </div>
            <p
              className="font-medium text-xs leading-snug line-clamp-2"
              aria-live="polite"
              tabIndex={-1}
            >
              {currentMessage.text}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Desktop Sidebar Layout (Placed in the empty space between Navigation and Sign Out)
  return (
    <div
      className="relative flex-1 flex flex-col justify-end items-start w-full my-auto pt-2 pb-1 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Speech Bubble Container placed overlapping to the right */}
      <div
        className={`relative z-20 w-[270px] self-start ml-3.5 transition-all duration-300 origin-bottom-left -mb-1 ${
          isBubbleVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 pointer-events-none -translate-y-2 h-0 overflow-hidden"
        }`}
      >
        <div
          className={`relative w-full min-h-[142px] transition-opacity duration-300 ${
            isFading && !prefersReducedMotion ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Transparent stretched speech bubble graphic with shadow for overlap depth */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentBubbleImg}
            alt="Speech bubble"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none drop-shadow-2xl"
            aria-hidden="true"
          />

          {/* Bubble Inner Content - Padded safely inside body, strictly above bottom-left tail */}
          <div
            ref={bubbleBodyRef}
            className="relative z-10 flex flex-col justify-between pt-5 pb-10 px-5 text-slate-900 min-h-[142px]"
          >
            {/* Top Chip & Start Action */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span
                style={{ fontSize: `${Math.max(9, fontSize * 0.82)}px` }}
                className={`inline-block px-2.5 py-0.5 rounded-md font-bold tracking-wide border uppercase shadow-2xs ${tagStyle}`}
              >
                {currentMessage.tag}
              </span>

              {currentMessage.actionLabel && currentMessage.onAction && (
                <button
                  type="button"
                  onClick={currentMessage.onAction}
                  style={{ fontSize: `${Math.max(9.5, fontSize * 0.85)}px` }}
                  className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-0.5 rounded-lg transition-transform active:scale-95 cursor-pointer shadow-xs ${actionBtnStyle}`}
                >
                  {currentMessage.actionLabel} →
                </button>
              )}
            </div>

            {/* Message Body with Auto-fit shrinking font and proper spacing */}
            <p
              ref={textRef}
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.35 }}
              className="font-semibold text-slate-800 leading-snug tracking-tight my-auto text-left"
              aria-live="polite"
              tabIndex={-1}
            >
              {currentMessage.text}
            </p>
          </div>
        </div>
      </div>

      {/* Mascot Character standing directly below the bubble tail */}
      <div className="relative z-10 flex flex-col items-start self-start ml-2 sm:ml-2.5">
        <button
          type="button"
          onClick={() => setIsBubbleVisible((prev) => !prev)}
          aria-label="Show or hide reminder"
          title={isBubbleVisible ? "Click to hide mascot reminder" : "Click to show mascot reminder"}
          className={`group relative flex items-center justify-center p-1 rounded-2xl transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4255FF] ${
            isFading && !prefersReducedMotion ? "opacity-30" : "opacity-100"
          }`}
        >
          {/* Subtle glow underneath mascot */}
          <div className="pointer-events-none absolute -bottom-1 left-2 h-4 w-28 rounded-full bg-black/40 blur-xs" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPoseImg}
            alt={`Go Learning Mascot: ${currentMessage.pose}`}
            className="relative z-10 h-[138px] w-auto object-contain drop-shadow-xl transition-all duration-300"
          />

          {/* Toggle pill indicator on hover */}
          <span className="pointer-events-none absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-[#1E2340] border border-[#2E3856] px-2 py-0.5 text-[9px] font-bold text-slate-300 shadow-md">
            {isBubbleVisible ? "Tap to hide" : "Tap to show"}
          </span>
        </button>
      </div>
    </div>
  );
}
