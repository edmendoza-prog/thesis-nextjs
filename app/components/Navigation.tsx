'use client';

import Link from 'next/link';

export function GoLearningLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-tight">
        <span className={`text-lg font-bold tracking-tight ${inverted ? 'text-white' : 'text-slate-900'}`}>
          GO Learning
        </span>
        <span className={`text-[11px] font-medium ${inverted ? 'text-slate-300' : 'text-slate-500'}`}>
          Teacher Workspace
        </span>
      </span>
    </span>
  );
}

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Simple Brand */}
        <Link href="/" aria-label="GO Learning home">
          <GoLearningLogo />
        </Link>

        {/* Simple Navbar Actions: Log in & Sign Up */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            id="nav-login"
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login/teacher"
            id="nav-signup"
            className="text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
