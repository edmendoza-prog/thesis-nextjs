'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  const [quizAnswered, setQuizAnswered] = useState<boolean | null>(null);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-slate-50/60 py-12 lg:py-16 w-full">
      
      {/* Background Soft Ambient Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full bg-sky-200/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-teal-200/20 blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Professional Branding & Role Gateway Cards */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* School / LMS Credential Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 shadow-xs mb-5">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span className="text-xs font-bold text-sky-800 tracking-wide">
                GO Learning • Elementary LMS (Grades 1–3)
              </span>
            </div>

            {/* Bold, Professional Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] mb-5">
              Where Classroom Learning Becomes an{' '}
              <span className="bg-gradient-to-r from-sky-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">
                Adventure.
              </span>
            </h1>

            {/* Clear, Professional Value Proposition */}
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mb-8">
              A comprehensive gamified learning management platform designed for early elementary education. Empower teachers with live multiplayer quizzes, AI-assisted authoring, and real-time academic records.
            </p>

            {/* Two Professional Gateway Cards (Student vs Teacher) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
              
              {/* Card 1: Student Portal */}
              <div className="group rounded-2xl bg-white p-5 border-2 border-slate-200 hover:border-sky-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shadow-xs">
                      🎮
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      Students
                    </span>
                  </div>

                  <h2 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-sky-600 transition-colors">
                    Student Learning Portal
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Join live team battles (Palosebo &amp; Tug of War), complete lesson quests, and earn star badges.
                  </p>
                </div>

                <Link href="/login?role=student">
                  <button
                    type="button"
                    className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-amber-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Enter Student Portal</span>
                    <span>→</span>
                  </button>
                </Link>
              </div>

              {/* Card 2: Teacher Workspace */}
              <div className="group rounded-2xl bg-white p-5 border-2 border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-xl shadow-xs">
                      🦉
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                      Educators
                    </span>
                  </div>

                  <h2 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">
                    Teacher Workspace
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Host live classroom games, author AI-simplified quizzes, and manage class grading sheets.
                  </p>
                </div>

                <Link href="/login?role=teacher">
                  <button
                    type="button"
                    className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700 transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Teacher Suite</span>
                    <span>→</span>
                  </button>
                </Link>
              </div>

            </div>

            {/* Bottom Institutional Highlights */}
            <div className="pt-4 border-t border-slate-200 w-full flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="text-teal-600 font-bold">✓</span>
                <span>100% Ad-Free &amp; Child-Safe</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-teal-600 font-bold">✓</span>
                <span>DepEd-Aligned Competencies</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-teal-600 font-bold">✓</span>
                <span>Real-Time Classroom Sync</span>
              </span>
            </div>

          </div>

          {/* Right Column: High-End Mascot Frame with Live Sample Question */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            
            <div className="relative w-full max-w-md">
              
              {/* Outer Card Frame */}
              <div className="relative rounded-3xl p-3 bg-white border-2 border-slate-200 shadow-xl">
                
                {/* Mascot Image */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-sky-50 border border-slate-100">
                  <Image
                    src="/images/go_learning_hero_mascot.jpg"
                    alt="GO Learning animal mascots on floating educational island"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="object-cover object-center"
                  />
                </div>

                {/* Floating Achievement Badge 1 */}
                <div className="absolute -top-3 -right-2 bg-white/95 backdrop-blur-md border border-amber-200 shadow-md rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                  <span className="text-amber-500 font-black">⭐</span>
                  <span className="text-xs font-extrabold text-slate-800">+100 EXP Combo</span>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute -bottom-3 -left-2 bg-white/95 backdrop-blur-md border border-sky-200 shadow-md rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                  <span className="text-sky-600 font-black">🏆</span>
                  <span className="text-xs font-extrabold text-slate-800">Grade 1–3 Champion</span>
                </div>

              </div>

              {/* Integrated Mini Interactive Question Demo */}
              <div className="w-full mt-5 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-700">
                    Interactive Sample Question
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Instant Play
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800 mb-3">
                  Which friendly shape has 3 sides and 3 corners?
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setQuizAnswered(false)}
                    className="py-2 px-2 rounded-xl text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-center"
                  >
                    🟦 Square
                  </button>
                  <button
                    onClick={() => setQuizAnswered(true)}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer text-center ${
                      quizAnswered === true
                        ? 'bg-teal-500 text-white shadow-xs'
                        : 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs'
                    }`}
                  >
                    🔺 Triangle
                  </button>
                  <button
                    onClick={() => setQuizAnswered(false)}
                    className="py-2 px-2 rounded-xl text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-center"
                  >
                    🟡 Circle
                  </button>
                </div>

                {quizAnswered === true && (
                  <p className="text-[11px] font-extrabold text-teal-700 text-center mt-2.5 animate-fadeIn">
                    🎉 Correct! Triangles have 3 corners. +100 Points!
                  </p>
                )}
                {quizAnswered === false && (
                  <p className="text-[11px] font-extrabold text-rose-600 text-center mt-2.5 animate-fadeIn">
                    💡 Almost! A triangle has 3 sides. Try again!
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
