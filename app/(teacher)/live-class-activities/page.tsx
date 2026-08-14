'use client';

import Link from 'next/link';

const activities = [
  {
    id: 'spin-wheel',
    title: 'Spin the Wheel',
    description: 'Random student selector with rewards',
    emoji: '🎡',
    banner: 'from-[#a855f7] to-[#ec4899]',
    button: 'from-[#a855f7] to-[#ec4899]',
  },
  {
    id: 'racing-game',
    title: 'Racing Game',
    description: 'Fast-paced team competition challenge',
    emoji: '🏁',
    banner: 'from-[#3b82f6] to-[#22d3ee]',
    button: 'from-[#3b82f6] to-[#22d3ee]',
  },
];

const steps = [
  { number: 1, color: 'bg-[#60a5fa]', text: 'Choose an activity - Click on any game card above' },
  { number: 2, color: 'bg-[#4ade80]', text: 'Prepare the class - Set the game rules and participants' },
  { number: 3, color: 'bg-[#a78bfa]', text: 'Launch the session - Start and display it for the class' },
  { number: 4, color: 'bg-[#fbbf24]', text: 'Track results - Celebrate winners and review progress' },
];

function Icon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  switch (type) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M9 20v-7h6v7" />
        </svg>
      );
    case 'gamepad':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M6 14V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" />
          <path d="M8 11h2M9 10v2M15 11h.01M18 10v2" />
          <path d="M8 15h8" />
        </svg>
      );
    case 'play':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m8 5 11 7-11 7V5Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LiveClassActivitiesPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7a35d_0%,#f67d4e_32%,#ee5d89_100%)] px-3 py-5 sm:px-4 lg:px-6">
      <div className="mx-auto w-full max-w-[820px]">
        <header className="mb-5 flex items-center gap-3 text-white">
          <Link
            href="/dashboard"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1f2937] shadow-[0_10px_20px_rgba(123,52,25,0.18)] transition-transform hover:-translate-y-0.5"
            aria-label="Back to dashboard"
          >
            <Icon type="home" className="h-6 w-6 text-[#1f2937]" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3a2b7d] shadow-md">
              <Icon type="gamepad" className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-[2.2rem] font-extrabold leading-none tracking-tight text-white sm:text-[2.7rem]">Live Class Activities</h1>
          </div>
        </header>

        <section className="mb-7 rounded-[18px] border border-white/10 bg-[#f4c9c1]/40 p-4 text-white shadow-[0_14px_26px_rgba(127,52,15,0.12)] backdrop-blur-sm sm:p-5">
          <h2 className="text-[1.7rem] font-extrabold leading-none sm:text-[1.9rem]">Teacher-Controlled Activities</h2>
          <p className="mt-2 text-[0.92rem] text-white/90 sm:text-[1rem]">
            These activities are designed for live classroom presentation. You control the game while students participate together!
          </p>
        </section>

        <section className="mb-7 grid gap-6 md:grid-cols-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="overflow-hidden rounded-[24px] bg-white shadow-[0_16px_28px_rgba(127,52,15,0.12)]"
            >
              <div className={`flex h-[138px] items-center justify-center bg-gradient-to-r ${activity.banner} text-[3.8rem]`}>
                <span>{activity.emoji}</span>
              </div>

              <div className="px-5 pb-5 pt-4">
                <h3 className="text-[1.8rem] font-extrabold leading-none tracking-[-0.03em] text-[#1f2937]">{activity.title}</h3>
                <p className="mt-2 text-[0.98rem] text-[#6b7280]">{activity.description}</p>

                <button
                  type="button"
                  className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r ${activity.button} px-4 py-3 text-[1rem] font-extrabold text-white shadow-[0_10px_18px_rgba(112,65,170,0.18)]`}
                >
                  Start Activity
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-[22px] bg-white p-5 shadow-[0_16px_28px_rgba(127,52,15,0.12)] sm:p-6">
          <div className="mb-5 flex items-center gap-3 text-[#1f2937]">
            <span className="text-[2rem]">💡</span>
            <h3 className="text-[1.8rem] font-extrabold leading-none">How to Use Live Activities</h3>
          </div>

          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${step.color} text-[1.05rem] font-extrabold text-white`}>
                  {step.number}
                </div>
                <div className="text-[1rem] leading-normal text-[#1f2937]">
                  <span className="font-extrabold">{step.text.split(' - ')[0]}</span>
                  <span className="text-[#6b7280]"> - {step.text.split(' - ')[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
