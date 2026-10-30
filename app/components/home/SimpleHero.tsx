import Link from 'next/link';

export default function SimpleHero() {
  return (
    <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Simple Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-6 ring-1 ring-sky-200">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span>Elementary Teacher Platform · Grades 1–3</span>
        </div>

        {/* Central Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] mb-6">
          Make Learning Fun.<br />
          <span className="text-sky-600">Make Teaching Easier.</span>
        </h1>

        {/* Clear, Simple Value Proposition */}
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
          GO Learning is an educational management platform built for Grade 1–3 teachers. Engage young learners through interactive quizzes and live team games, while keeping lesson preparation and grading records simple.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <Link
            href="/login/teacher"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-all"
          >
            <span>Get Started as Teacher</span>
            <span>→</span>
          </Link>
          <Link
            href="/login/student"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all"
          >
            Student Portal
          </Link>
        </div>

        {/* Trust & Compliance Pills */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <i className="ri-check-line text-teal-600 font-bold text-base" />
            <span>100% Ad-Free &amp; Child Safe</span>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ri-check-line text-teal-600 font-bold text-base" />
            <span>DepEd K-to-12 Aligned</span>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ri-check-line text-teal-600 font-bold text-base" />
            <span>Interactive Live Games</span>
          </span>
        </div>
      </div>
    </section>
  );
}
