import Link from 'next/link';
import Reveal from './Reveal';

export default function FinalCta() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B2545] via-[#0D3663] to-[#0A1F38] p-8 shadow-2xl sm:p-14 lg:p-20">
            {/* Background glowing decorations */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="gl-dots pointer-events-none absolute inset-0 opacity-20"
            />

            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-200 ring-1 ring-white/20 backdrop-blur-sm">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] text-slate-950" aria-hidden="true">
                  ⭐
                </span>
                Ready for the Classroom
              </span>

              <h2
                id="cta-heading"
                className="mt-6 font-nunito text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                A Better Learning Experience{' '}
                <span className="bg-gradient-to-r from-sky-300 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  Starts Here.
                </span>
              </h2>

              <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
                Explore a dedicated teacher workspace that pairs joyful, age-appropriate educational games with flexible question authoring, simplified grading sheets, and actionable student progress analytics.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/login/teacher"
                  id="final-cta-teacher"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-teal-400 px-8 py-4 text-base font-extrabold text-[#0B2545] shadow-[0_12px_28px_-6px_rgba(14,165,233,0.7)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-6px_rgba(20,184,166,0.7)] sm:w-auto"
                >
                  <i className="ri-user-star-line text-lg" aria-hidden="true" />
                  <span>Get Started as Teacher</span>
                  <i className="ri-arrow-right-line transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>

                <Link
                  href="/login/student"
                  id="final-cta-student"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-8 py-4 text-base font-extrabold text-white ring-1 ring-white/25 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 sm:w-auto"
                >
                  <i className="ri-gamepad-line text-lg text-amber-300" aria-hidden="true" />
                  <span>Student Portal</span>
                </Link>

                <Link
                  href="/login"
                  id="final-cta-login"
                  className="text-xs font-bold text-slate-300 transition-colors hover:text-white underline underline-offset-4"
                >
                  General Login →
                </Link>
              </div>

              {/* Reassurance pills */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-white/10 pt-8 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-2">
                  <i className="ri-check-line text-teal-300" aria-hidden="true" />
                  <span>Zero setup fees for school trials</span>
                </span>
                <span className="flex items-center gap-2">
                  <i className="ri-check-line text-teal-300" aria-hidden="true" />
                  <span>DepEd Grade 1–3 Aligned</span>
                </span>
                <span className="flex items-center gap-2">
                  <i className="ri-check-line text-teal-300" aria-hidden="true" />
                  <span>Ad-Free &amp; Child Safe</span>
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
