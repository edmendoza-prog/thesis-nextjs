import Reveal from './Reveal';

const STEPS = [
  {
    who: 'Teacher',
    icon: 'ri-upload-cloud-2-line',
    title: 'Prepare lessons & questions',
    text: 'Upload lesson materials or build custom question sets with flexible question formats and point weights.',
    color: 'from-sky-400 to-sky-600',
    ring: 'ring-sky-100',
    chips: ['Upload PDF/DOCX', 'Question Builder', 'Answer Keys'],
  },
  {
    who: 'Students',
    icon: 'ri-gamepad-line',
    title: 'Learn through play',
    text: 'Learners answer interactive quizzes, complete activities, and join live classroom games together.',
    color: 'from-amber-300 to-amber-500',
    ring: 'ring-amber-100',
    chips: ['Quizzes', 'Activities', 'Live games'],
  },
  {
    who: 'Teacher',
    icon: 'ri-bar-chart-box-line',
    title: 'Review results & plan ahead',
    text: 'Check assessment results and visual analytics to find learning gaps and guide your next lesson.',
    color: 'from-teal-400 to-teal-600',
    ring: 'ring-teal-100',
    chips: ['Class records', 'Analytics', 'Next steps'],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="relative scroll-mt-20 overflow-hidden bg-[#0B2545] py-24 text-white lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(125,211,252,0.18)_1.2px,transparent_1.2px)] [background-size:24px_24px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-sky-200 ring-1 ring-white/15">
              <i className="ri-route-line text-sm" aria-hidden="true" /> How GO Learning works
            </span>
            <h2 id="how-heading" className="font-nunito text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              Three simple steps, one connected classroom
            </h2>
            <p className="text-base leading-relaxed text-sky-100/80 sm:text-lg">
              From lesson preparation to learning insights, every step feeds the next.
            </p>
          </div>
        </Reveal>

        <ol className="relative mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
          {/* Connector line (desktop) */}
          <span aria-hidden="true" className="absolute left-[16.6%] right-[16.6%] top-10 hidden h-1 rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-teal-400 opacity-60 lg:block" />
          {/* Connector line (mobile) */}
          <span aria-hidden="true" className="absolute bottom-10 left-10 top-10 w-1 rounded-full bg-gradient-to-b from-sky-400 via-amber-300 to-teal-400 opacity-50 lg:hidden" />

          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 140} className="relative">
              <div className="flex gap-5 lg:flex-col lg:items-center lg:text-center">
                <div className={`relative z-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ${s.color} shadow-xl ring-8 ${s.ring}/10`}>
                  <i className={`${s.icon} text-3xl text-white`} aria-hidden="true" />
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white font-nunito text-sm font-black text-[#0B2545] shadow-md">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/[0.09] lg:mt-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-sky-300">{s.who}</span>
                  <h3 className="mt-1 font-nunito text-xl font-extrabold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-sky-100/80">{s.text}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5 lg:justify-center">
                    {s.chips.map((c) => (
                      <span key={c} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
