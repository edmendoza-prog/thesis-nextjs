'use client';

import { useEffect, useRef, useState } from 'react';
import { MdOutlineBolt } from 'react-icons/md';

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/base-ui/alert';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/base-ui/avatar';
import { getBadge, type BadgeId } from '@/data/badges';

export type BadgeToastProps = {
  badgeId: BadgeId;
  open: boolean;
  onClose: () => void;
  description?: string;
  /** XP gained for this badge, e.g. 50 shows "+50 XP" */
  xp?: number;
  /** ms before it hides itself */
  duration?: number;
};

/**
 * Play Store / Play Games style achievement pop-up:
 * drops in from the top with a little bounce, the badge pops in a beat
 * later, then it slides back up on its own.
 */
const BadgeToast = ({
  badgeId,
  open,
  onClose,
  description = 'Achievement unlocked',
  xp,
  duration = 4000,
}: BadgeToastProps) => {
  const badge = getBadge(badgeId);
  const resolvedXp = xp ?? badge.xp;
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [count, setCount] = useState(0);

  // keep the latest onClose without restarting the timer
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Step 1: mount / unmount container
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 350);
    return () => clearTimeout(t);
  }, [open]);

  // Step 2: once mounted in the DOM, trigger the drop-in bounce animation
  useEffect(() => {
    if (!open || !mounted) return;
    setShown(false);
    let raf1 = 0;
    let raf2 = 0;
    const timer = setTimeout(() => {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShown(true));
      });
    }, 20);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open, mounted, badgeId]);

  // auto-dismiss
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onCloseRef.current(), duration);
    return () => clearTimeout(t);
  }, [open, duration, badgeId]);

  // XP count-up, starts just after the badge pops in
  useEffect(() => {
    if (!shown || !resolvedXp) {
      setCount(0);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(resolvedXp);
      return;
    }
    let raf = 0;
    const start = performance.now() + 400;
    const dur = 800;
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - start) / dur, 0), 1);
      setCount(Math.round(resolvedXp * (1 - Math.pow(1 - t, 3)))); // ease-out
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, resolvedXp, badgeId]);

  if (!mounted) return null;

  return (
    <div
      style={{ zIndex: 9999 }}
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <Alert
        role="status"
        aria-live="polite"
        onClick={() => onCloseRef.current()}
        className={`pointer-events-auto flex w-full max-w-md cursor-pointer items-center justify-between gap-3 rounded-2xl border-neutral-700 bg-neutral-900 p-3 pr-4 text-white shadow-xl motion-reduce:transition-none ${
          shown
            ? 'translate-y-0 scale-100 opacity-100 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
            : '-translate-y-24 scale-90 opacity-0 transition-all duration-300 ease-in'
        }`}
      >
        {/* full badge image, no cropping */}
        <Avatar
          className={`h-24 w-[74px] shrink-0 rounded-none transition-transform duration-500 delay-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
            shown ? 'scale-100 rotate-0' : 'scale-0 -rotate-12'
          }`}
        >
          <AvatarImage
            src={badge.image}
            alt={badge.name}
            className="rounded-none object-contain"
          />
          <AvatarFallback className="rounded-none bg-transparent text-xs">
            {badge.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col justify-center leading-4">
          <AlertTitle className="truncate text-white">{badge.name}</AlertTitle>
          <AlertDescription className="leading-4 text-white/70">
            {description}
          </AlertDescription>
        </div>

        {resolvedXp ? (
          <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-400 tabular-nums">
            <MdOutlineBolt className="size-3.5" />+{count} XP
          </div>
        ) : null}
      </Alert>
    </div>
  );
};

export default BadgeToast;
