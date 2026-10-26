import Reveal from './Reveal';
import { AppFrame, DemoTag, SectionHeading } from './ui';

const POINTS = [
  {
    icon: 'ri-line-chart-line',
    title: 'Visual analytics',
    text: 'See class and individual performance as simple charts instead of long score lists.',
  },
  {
    icon: 'ri-history-line',
    title: 'Assessment histories',
    text: 'Follow how each learner performs from one quiz or activity to the next.',
  },
  {
    icon: 'ri-focus-3-line',
    title: 'Question-level performance',
    text: 'Spot the items most learners missed to find what needs another look.',
  },
  {
    icon: 'ri-error-warning-line',
    title: 'Potential learning gaps',
    text: 'Surface learners and topics that may need extra support, early.',
  },
];

const OUTCOMES = [
  'Identify struggling learners earlier',
  'Adjust teaching strategies with evidence',
  'Provide more targeted support',
];

// Illustrative demo data only — not real student results.
const HISTORY = [62, 66, 64, 71, 75, 78];
const QUESTIONS = [92, 88, 54, 81, 47, 85, 90, 76];
const STUDENTS = [
  { name: 'Ana R.', avatar: '🦁', score: 94, trend: 'up' },
  { name: 'Ben T.', avatar: '🦉', score: 81, trend: 'up' },
  { name: 'Carlo M.', avatar: '🐢', score: 63, trend: 'down' },
  { name: 'Dina S.', avatar: '🦊', score: 72, trend: 'up' },
];

function HistoryChart() {
  const w = 300;
  const h = 110;
  const max = 100;
  const min = 40;
  const step = w / (HISTORY.length - 1);
  const pts = HISTORY.map((v, i) => [i * step, h - ((v - min) / (max - min)) * h] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h + 4}`} className="h-28 w-full" role="img" aria-label="Demo line chart: class average rising from 62% to 78% across six assessments">
      <defs>
        <linearGradient id="gl-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#e2e8f0" strokeDasharray="4 4" />
      ))}
      <path d={area} fill="url(#gl-area)" />
      <path d={line} fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 5 : 3.5} fill="#fff" stroke="#0d9488" strokeWidth="2.5" />
      ))}
    </svg>
  );
}

function DashboardPreview() {
  return (
    <AppFrame title="Teacher Dashboard · Grade 2 – Sampaguita">
      <div className="space-y-4 bg-slate-50/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-nunito text-base font-extrabold text-[#0B2545]">Science · Quarter 1</p>
            <p className="text-[11px] font-semibold text-slate-500">6 assessments · 28 learners</p>
          </div>
          <DemoTag label="Illustrative demo data" />
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Class average', value: '78%', icon: 'ri-pie-chart-2-line', tone: 'text-sky-600 bg-sky-50' },
            { label: 'Completed', value: '26/28', icon: 'ri-checkbox-circle-line', tone: 'text-teal-600 bg-teal-50' },
            { label: 'Need support', value: '4', icon: 'ri-hand-heart-line', tone: 'text-amber-700 bg-amber-50' },
          ].map((t) => (
            <div key={t.label} className="rounded-xl bg-white p-2.5 ring-1 ring-slate-200/80">
              <span className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg ${t.tone}`}>
                <i className={t.icon} aria-hidden="true" />
              </span>
              <p className="font-nunito text-lg font-black leading-none text-[#0B2545]">{t.value}</p>
              <p className="mt-1 text-[10px] font-semibold text-slate-500">{t.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {/* Assessment history */}
          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200/80 sm:col-span-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[12px] font-extrabold text-[#0B2545]">Assessment history</p>
              <span className="text-[10px] font-bold text-teal-600">
                <i className="ri-arrow-up-line" aria-hidden="true" /> +16 pts
              </span>
            </div>
            <HistoryChart />
            <div className="mt-1 flex justify-between text-[9.5px] font-semibold text-slate-400">
              {HISTORY.map((_, i) => (
                <span key={i}>Q{i + 1}</span>
              ))}
            </div>
          </div>

          {/* Student progress */}
          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200/80 sm:col-span-2">
            <p className="mb-2 text-[12px] font-extrabold text-[#0B2545]">Learner progress</p>
            <ul className="space-y-2">
              {STUDENTS.map((s) => (
                <li key={s.name} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs" aria-hidden="true">
                    {s.avatar}
                  </span>
                  <span className="w-14 truncate text-[10.5px] font-bold text-slate-700">{s.name}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className={`block h-full rounded-full ${s.score < 70 ? 'bg-amber-400' : 'bg-teal-500'}`}
                      style={{ width: `${s.score}%` }}
                    />
                  </span>
                  <i
                    className={`${s.trend === 'up' ? 'ri-arrow-right-up-line text-teal-500' : 'ri-arrow-right-down-line text-amber-600'} text-xs`}
                    aria-label={s.trend === 'up' ? 'improving' : 'declining'}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {/* Question-level */}
          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200/80 sm:col-span-3">
            <p className="mb-2 text-[12px] font-extrabold text-[#0B2545]">Question-level results · Quiz 6</p>
            <div className="flex h-20 items-end gap-1.5" role="img" aria-label="Demo bar chart: questions 3 and 5 had the lowest percentage of correct answers">
              {QUESTIONS.map((v, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span
                    className={`gl-bar w-full rounded-t-md ${v < 60 ? 'bg-amber-400' : 'bg-sky-400'}`}
                    style={{ height: `${v}%`, animationDelay: `${i * 70}ms` }}
                  />
                  <span className="text-[9px] font-bold text-slate-400">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning gaps */}
          <div className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200 sm:col-span-2">
            <p className="mb-2 flex items-center gap-1 text-[12px] font-extrabold text-amber-900">
              <i className="ri-lightbulb-flash-line" aria-hidden="true" /> May need re-teaching
            </p>
            <ul className="space-y-1.5 text-[10.5px] font-semibold text-amber-900/90">
              <li className="rounded-lg bg-white/80 px-2 py-1.5">Parts of a plant — Q3 (54% correct)</li>
              <li className="rounded-lg bg-white/80 px-2 py-1.5">Living vs. non-living — Q5 (47% correct)</li>
            </ul>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

export default function DataInsights() {
  return (
    <section aria-labelledby="insights-heading" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-sky-50/70 to-white py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionHeading
              id="insights-heading"
              align="left"
              eyebrow="Data-driven feedback"
              eyebrowIcon="ri-bar-chart-2-line"
              tone="teal"
              title="Understand Every Student’s Learning Progress"
              description="Turn quiz and activity results into clear, visual insights that show where each learner is thriving — and where they may need a little more help."
            />
          </Reveal>

          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {POINTS.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 80}>
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm ring-1 ring-slate-200">
                    <i className={`${p.icon} text-lg`} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#0B2545]">{p.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{p.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={200}>
            <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Insights that help you</p>
              <ul className="mt-3 space-y-2">
                {OUTCOMES.map((o) => (
                  <li key={o} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <i className="ri-checkbox-circle-fill text-lg text-teal-500" aria-hidden="true" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={120}>
            <DashboardPreview />
            <p className="mt-3 text-center text-xs text-slate-500">
              Names, classes, and scores above are sample values for illustration only. Some analytics views are still
              being expanded.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
