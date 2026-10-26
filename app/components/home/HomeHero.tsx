'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { DemoTag } from './ui';

const BENEFITS = [
  { icon: 'ri-gamepad-line', label: 'Gamified quizzes & live games', color: 'text-amber-500' },
  { icon: 'ri-edit-2-line', label: 'Flexible question authoring', color: 'text-sky-500' },
  { icon: 'ri-table-line', label: 'Simplified grading sheets', color: 'text-teal-500' },
  { icon: 'ri-bar-chart-box-line', label: 'Visual student analytics', color: 'text-sky-600' },
];

const QUIZ_OPTIONS = [
  { id: 'a', label: 'Square', icon: 'ri-square-fill', correct: false },
  { id: 'b', label: 'Triangle', icon: 'ri-triangle-fill', correct: true },
  { id: 'c', label: 'Circle', icon: 'ri-checkbox-blank-circle-fill', correct: false },
];

function QuizPreviewCard() {
  const [picked, setPicked] = useState<string | null>(null);
  const choice = QUIZ_OPTIONS.find((o) => o.id === picked);

  return (
    <div className="w-full rounded-2xl bg-white p-4 shadow-[0_20px_45px_-18px_rgba(11,37,69,0.35)] ring-1 ring-slate-200/80">
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-sky-700">
          <i className="ri-question-answer-line" aria-hidden="true" /> Try a quiz
        </span>
        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">Math · Grade 1</span>
      </div>
      <p id="hero-quiz-question" className="mb-3 font-nunito text-[15px] font-extrabold text-[#0B2545]">
        Which shape has 3 sides?
      </p>
      <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="hero-quiz-question">
        {QUIZ_OPTIONS.map((opt) => {
          const isPicked = picked === opt.id;
          const state = isPicked ? (opt.correct ? 'correct' : 'wrong') : 'idle';
          return (
            <button
              key={opt.id}
              id={`hero-quiz-option-${opt.label.toLowerCase()}`}
              type="button"
              onClick={() => setPicked(opt.id)}
              aria-pressed={isPicked}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-extrabold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                state === 'correct'
                  ? 'scale-[1.03] bg-teal-500 text-white shadow-md'
                  : state === 'wrong'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:-translate-y-0.5 hover:bg-sky-50 hover:ring-sky-300'
              }`}
            >
              <i className={`${opt.icon} text-lg ${state === 'idle' ? 'text-sky-500' : ''}`} aria-hidden="true" />
              {opt.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 min-h-[18px] text-center text-[12px] font-bold" aria-live="polite">
        {choice?.correct && <span className="text-teal-700">Great job! A triangle has 3 sides. ⭐</span>}
        {choice && !choice.correct && <span className="text-rose-600">Good try! Count the sides again.</span>}
      </p>
    </div>
  );
}

function ProgressPreviewCard() {
  return (
    <div className="w-full rounded-2xl bg-white p-4 shadow-[0_20px_45px_-18px_rgba(11,37,69,0.35)] ring-1 ring-slate-200/80">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-lg" aria-hidden="true">
          🦊
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-extrabold text-[#0B2545]">My Progress</p>
          <p className="text-[11px] font-semibold text-slate-500">Keep going, explorer!</p>
        </div>
      </div>
      {[
        { label: 'Reading', value: 80, bar: 'bg-sky-500' },
        { label: 'Math', value: 65, bar: 'bg-teal-500' },
      ].map((s) => (
        <div key={s.label} className="mb-2 last:mb-0">
          <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-600">
            <span>{s.label}</span>
            <span>{s.value}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${s.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPreviewCard() {
  const bars = [52, 68, 61, 79, 74, 86];
  return (
    <div className="w-full rounded-2xl bg-white p-4 shadow-[0_20px_45px_-18px_rgba(11,37,69,0.35)] ring-1 ring-slate-200/80">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[13px] font-extrabold text-[#0B2545]">Class Average</span>
        <DemoTag />
      </div>
      <div className="flex items-end gap-3">
        <div>
          <p className="font-nunito text-2xl font-black text-[#0B2545]">78%</p>
          <p className="text-[11px] font-bold text-teal-600">
            <i className="ri-arrow-up-line" aria-hidden="true" /> Quiz 6 vs Quiz 1
          </p>
        </div>
        <div className="flex h-14 flex-1 items-end gap-1.5" aria-hidden="true">
          {bars.map((h, i) => (
            <span
              key={i}
              className={`gl-bar flex-1 rounded-t-md ${i === bars.length - 1 ? 'bg-teal-500' : 'bg-sky-200'}`}
              style={{ height: `${h}%`, animationDelay: `${300 + i * 90}ms` }}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] font-bold text-amber-800">
        <i className="ri-lightbulb-flash-line" aria-hidden="true" /> 3 learners may need help with subtraction
      </p>
    </div>
  );
}

export default function HomeHero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white"
    >
      {/* Ambient background */}
      <div aria-hidden="true" className="gl-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-sky-200/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-40 h-[26rem] w-[26rem] rounded-full bg-teal-200/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pb-28 lg:pt-16">
        {/* Copy column */}
        <div className="lg:col-span-6">
          <span className="animate-fadeInUp inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-sky-800 shadow-sm ring-1 ring-sky-200">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-300 text-[11px]" aria-hidden="true">
              ⭐
            </span>
            Teacher Workspace · Grades 1–3
          </span>

          <h1
            id="hero-heading"
            className="animate-fadeInUp mt-6 font-nunito text-[2.6rem] font-black leading-[1.05] tracking-tight text-[#0B2545] sm:text-6xl lg:text-[4.1rem]"
          >
            Make Learning{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">Fun.</span>
              <svg aria-hidden="true" viewBox="0 0 200 20" className="absolute -bottom-1.5 left-0 z-0 h-3 w-full text-amber-300" preserveAspectRatio="none">
                <path d="M2 14 C 50 4, 150 4, 198 12" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            <br />
            Make Teaching{' '}
            <span className="bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">Easier.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            A dedicated teacher workspace that brings interactive classroom activities, question authoring, simplified grading sheets, and student performance analytics together in one platform — designed specifically for early elementary educators.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login/teacher"
              id="hero-get-started"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 px-7 py-4 text-base font-extrabold text-white shadow-[0_14px_30px_-10px_rgba(14,165,233,0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-10px_rgba(20,184,166,0.75)]"
            >
              Get Started
              <i className="ri-arrow-right-line text-lg transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <a
              href="#features"
              id="hero-explore-features"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-extrabold text-[#0B2545] shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:ring-sky-300"
            >
              <i className="ri-compass-3-line text-lg text-sky-500" aria-hidden="true" />
              Explore Features
            </a>
          </div>

          <ul className="mt-9 grid max-w-xl grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <li key={b.label} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                  <i className={`${b.icon} text-base ${b.color}`} aria-hidden="true" />
                </span>
                {b.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual column: illustrated scene + product preview */}
        <div className="relative lg:col-span-6">
          <div className="relative mx-auto max-w-xl lg:mr-0">
            <div className="relative overflow-hidden rounded-[2rem] bg-sky-100 shadow-[0_30px_70px_-25px_rgba(11,37,69,0.45)] ring-8 ring-white">
              <Image
                src="/images/go_learning_hero_mascot.jpg"
                alt="GO Learning mascots — a fox, an owl, and a lion — learning together on a floating island of books and stars"
                width={1024}
                height={1024}
                preload
                sizes="(max-width: 1024px) 90vw, 560px"
                className="aspect-[5/4] h-auto w-full object-cover object-[50%_60%]"
              />
            </div>

            {/* Floating product preview cards (desktop) */}
            <div className="gl-bob absolute -left-10 top-6 hidden w-60 xl:-left-16 lg:block">
              <ProgressPreviewCard />
            </div>
            <div className="gl-bob-delay absolute -bottom-12 -left-6 hidden w-72 lg:block xl:-left-12">
              <QuizPreviewCard />
            </div>
            <div className="gl-bob absolute -bottom-16 -right-4 hidden w-64 lg:block xl:-right-8">
              <AnalyticsPreviewCard />
            </div>

            <i aria-hidden="true" className="ri-star-fill gl-twinkle absolute -right-3 -top-4 text-3xl text-amber-300" />
            <i aria-hidden="true" className="ri-sparkling-fill gl-twinkle absolute right-16 -top-7 text-xl text-sky-400 [animation-delay:1.2s]" />
          </div>

          {/* Stacked preview cards (mobile/tablet) */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            <div className="sm:col-span-2">
              <QuizPreviewCard />
            </div>
            <ProgressPreviewCard />
            <AnalyticsPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}
