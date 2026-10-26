'use client';

import Image from 'next/image';
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import Reveal from './Reveal';
import { AppFrame, DemoTag, SectionHeading, StatusTag } from './ui';

/* ---------------- Preview panes (sample data only) ---------------- */

function TeacherDashboardPane() {
  return (
    <AppFrame title="GO Learning · Teacher Dashboard">
      <div className="space-y-3 bg-slate-50 p-4">
        <div className="rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 p-4 text-white">
          <p className="text-[11px] font-semibold opacity-90">Good morning, Teacher!</p>
          <p className="font-nunito text-lg font-extrabold">Here’s your classroom today</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200 sm:col-span-2">
            <p className="mb-2 text-xs font-extrabold text-[#0B2545]">Learner Activity</p>
            <div className="flex h-20 items-end gap-1.5" aria-hidden="true">
              {[40, 65, 50, 80, 70, 90, 60].map((h, i) => (
                <span key={i} className="gl-bar flex-1 rounded-t bg-sky-300" style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <p className="mb-2 text-xs font-extrabold text-[#0B2545]">Needs Attention</p>
            <ul className="space-y-1.5 text-[10.5px] font-semibold text-slate-600">
              <li className="rounded-lg bg-amber-50 px-2 py-1.5">2 quizzes to review</li>
              <li className="rounded-lg bg-sky-50 px-2 py-1.5">New lesson uploaded</li>
            </ul>
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <p className="mb-2 text-xs font-extrabold text-[#0B2545]">Scheduled Activities</p>
          {['Math Quiz · Addition', 'Live Game · Tug of War'].map((a, i) => (
            <div key={a} className="flex items-center gap-2 border-t border-slate-100 py-1.5 text-[11px] font-semibold text-slate-600 first:border-0">
              <i className={i ? 'ri-gamepad-line text-amber-500' : 'ri-file-list-3-line text-sky-500'} aria-hidden="true" /> {a}
            </div>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}

function ActivityBuilderPane() {
  return (
    <AppFrame title="Teacher Workspace · Activity & Question Builder">
      <div className="grid grid-cols-1 gap-3 bg-slate-50 p-4 sm:grid-cols-5">
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200 sm:col-span-2">
          <p className="mb-2 flex items-center gap-1 text-xs font-extrabold text-[#0B2545]">
            <i className="ri-settings-4-line text-sky-500" aria-hidden="true" /> Activity Setup
          </p>
          <div className="space-y-2 text-[10.5px] font-semibold text-slate-700">
            <div>
              <span className="text-slate-400 block text-[9.5px]">Title</span>
              <span className="font-bold">Science Quarter 1 Quiz</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9.5px]">Section</span>
              <span>Grade 2 - Sampaguita</span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-[10px] font-semibold text-slate-600">
            <p className="flex justify-between"><span>Multiple Choice</span><span className="font-bold text-slate-900">5 items (50 pts)</span></p>
            <p className="flex justify-between"><span>True or False</span><span className="font-bold text-slate-900">5 items (50 pts)</span></p>
          </div>
          <span className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 py-1.5 text-[11px] font-bold text-white shadow-xs">
            <i className="ri-add-line" aria-hidden="true" /> Add Question Item
          </span>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200 sm:col-span-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-extrabold text-[#0B2545]">Questions in Activity (10 Items)</p>
            <span className="rounded bg-teal-50 px-2 py-0.5 text-[9.5px] font-bold text-teal-700">Ready</span>
          </div>
          <p className="mb-2.5 text-[10px] font-semibold text-slate-500">Edit, reorder, or customize points for each question item.</p>
          {[
            { q: 'Which plant part grows underground and drinks water?', a: 'Roots', type: 'Multiple Choice' },
            { q: 'Living things need sunlight and water to grow.', a: 'True', type: 'True / False' }
          ].map((item, i) => (
            <div key={item.q} className="mb-2 rounded-lg bg-slate-50 p-2.5 ring-1 ring-slate-200 last:mb-0">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                <span>Item {i + 1} · {item.type}</span>
                <span className="text-teal-700 font-bold">Answer: {item.a}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-800">{item.q}</p>
              <div className="mt-2 flex gap-1.5 text-[9.5px] font-bold">
                <span className="rounded bg-white px-2 py-0.5 text-slate-700 ring-1 ring-slate-200 flex items-center gap-1">
                  <i className="ri-edit-2-line" aria-hidden="true" /> Edit
                </span>
                <span className="rounded bg-white px-2 py-0.5 text-slate-700 ring-1 ring-slate-200 flex items-center gap-1">
                  <i className="ri-file-copy-line" aria-hidden="true" /> Duplicate
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}

function ClassRecordsPane() {
  const rows = [
    { n: 'Ana Reyes', a: '✓✓✓✓', p: 92, s: 'Excellent', t: 'bg-teal-50 text-teal-700' },
    { n: 'Ben Torres', a: '✓✓•✓', p: 84, s: 'Good', t: 'bg-sky-50 text-sky-700' },
    { n: 'Carlo Mendoza', a: '✓•✓✓', p: 68, s: 'Needs Improvement', t: 'bg-amber-50 text-amber-800' },
    { n: 'Dina Santos', a: '✓✓✓✓', p: 88, s: 'Good', t: 'bg-sky-50 text-sky-700' },
  ];
  return (
    <AppFrame title="Grades · Class Record">
      <div className="bg-slate-50 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg bg-white p-0.5 text-[11px] font-bold ring-1 ring-slate-200">
            <span className="rounded-md px-2.5 py-1 text-slate-500">Attendance</span>
            <span className="rounded-md bg-sky-500 px-2.5 py-1 text-white">Assessments</span>
          </div>
          <div className="flex gap-1.5 text-[11px] font-bold text-slate-600">
            <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200"><i className="ri-printer-line" aria-hidden="true" /> Print</span>
            <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200"><i className="ri-download-2-line" aria-hidden="true" /> Export</span>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
          <table className="w-full min-w-[420px] text-left text-[11px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-bold">Learner</th>
                <th className="px-3 py-2 font-bold">Attendance</th>
                <th className="px-3 py-2 font-bold">Average</th>
                <th className="px-3 py-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-slate-700">
              {rows.map((r) => (
                <tr key={r.n} className="border-t border-slate-100">
                  <td className="px-3 py-2">{r.n}</td>
                  <td className="px-3 py-2 tracking-widest text-teal-600">{r.a}</td>
                  <td className="px-3 py-2">{r.p}%</td>
                  <td className="px-3 py-2"><span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${r.t}`}>{r.s}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppFrame>
  );
}

function AnalyticsPane() {
  return (
    <AppFrame title="Student Analytics · Concept">
      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4">
        {[
          { l: 'Reading', v: 82, c: 'bg-sky-500' },
          { l: 'Math', v: 74, c: 'bg-teal-500' },
          { l: 'Science', v: 69, c: 'bg-amber-400' },
          { l: 'Filipino', v: 88, c: 'bg-indigo-400' },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">{s.l}</p>
            <p className="font-nunito text-xl font-black text-[#0B2545]">{s.v}%</p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${s.c}`} style={{ width: `${s.v}%` }} />
            </div>
          </div>
        ))}
        <div className="col-span-2 rounded-xl border-2 border-dashed border-slate-300 bg-white/60 p-3 text-center text-[11px] font-semibold text-slate-500">
          <i className="ri-draft-line mr-1" aria-hidden="true" />
          Per-student analytics are in development — this layout is a concept.
        </div>
      </div>
    </AppFrame>
  );
}

function StudentDashboardPane() {
  return (
    <AppFrame title="Student Dashboard">
      <div className="space-y-3 bg-gradient-to-b from-sky-50 to-white p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xl" aria-hidden="true">🦁</span>
          <div className="flex-1">
            <p className="font-nunito text-sm font-extrabold text-[#0B2545]">Hi, Explorer!</p>
            <p className="text-[11px] font-semibold text-slate-500">Ready to learn something new today?</p>
          </div>
          <Image src="/mascot/reminder_06-removebg-preview.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: 'Lessons', i: 'ri-book-open-line', c: 'bg-sky-500' },
            { l: 'Quizzes', i: 'ri-question-answer-line', c: 'bg-teal-500' },
            { l: 'Live Games', i: 'ri-gamepad-line', c: 'bg-amber-400' },
          ].map((x) => (
            <div key={x.l} className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${x.c} text-white`}><i className={x.i} aria-hidden="true" /></span>
              <span className="text-[11px] font-bold text-slate-700">{x.l}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <p className="mb-1.5 text-xs font-extrabold text-[#0B2545]">Up next</p>
          <p className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
            <i className="ri-play-circle-fill text-lg text-teal-500" aria-hidden="true" /> Science · Living and Non-living Things
          </p>
        </div>
      </div>
    </AppFrame>
  );
}

function LiveGamesPane() {
  const games = [
    { t: 'Palosebo Race', d: 'Teams climb the pole with every correct answer.', img: '/images/palosebo_race_cover.jpg' },
    { t: 'Tug of War', d: 'Correct answers pull the rope for your team.', img: '/images/tug_of_war_cover.jpg' },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {games.map((g) => (
        <div key={g.t} className="group overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-22px_rgba(11,37,69,0.45)] ring-1 ring-slate-200">
          <div className="relative overflow-hidden aspect-[16/10]">
            <Image src={g.img} alt={`${g.t} live classroom game cover art`} fill sizes="(max-width: 640px) 90vw, 520px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="p-3.5">
            <p className="font-nunito text-[15px] font-extrabold text-[#0B2545]">{g.t}</p>
            <p className="text-xs font-medium text-slate-600">{g.d}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Tabs ---------------- */

type Tab = {
  id: string;
  label: string;
  icon: string;
  status: 'available' | 'concept';
  title: string;
  description: string;
  points: string[];
  pane: ReactNode;
  demo?: boolean;
};

const TABS: Tab[] = [
  {
    id: 'dashboard',
    label: 'Teacher Dashboard',
    icon: 'ri-dashboard-3-line',
    status: 'available',
    title: 'Your classroom at a glance',
    description: 'See learner activity, items that need your attention, and upcoming activities as soon as you sign in.',
    points: ['Learner activity overview', 'Needs-attention reminders', 'Scheduled activities list'],
    pane: <TeacherDashboardPane />,
    demo: true,
  },
  {
    id: 'builder',
    label: 'Activity & Question Builder',
    icon: 'ri-edit-box-line',
    status: 'available',
    title: 'Customize assessments for your lessons',
    description: 'Build and organize quizzes, formative exercises, and exams with customized question formats, points, and answer keys.',
    points: ['Multiple Choice, True/False, Identification, Matching', 'Customize points and weights per item', 'Reorder and edit questions anytime'],
    pane: <ActivityBuilderPane />,
    demo: true,
  },
  {
    id: 'records',
    label: 'Class Records',
    icon: 'ri-table-line',
    status: 'available',
    title: 'Grading sheets without the spreadsheet stress',
    description: 'Keep attendance and assessment scores side by side, with learner status shown at a glance.',
    points: ['Attendance and assessment views', 'Excellent / Good / Needs Improvement status', 'Print and export class records'],
    pane: <ClassRecordsPane />,
    demo: true,
  },
  {
    id: 'analytics',
    label: 'Assessment Analytics',
    icon: 'ri-bar-chart-box-line',
    status: 'concept',
    title: 'Deeper per-student analytics',
    description: 'A planned view for subject-level progress and learning trends for each student. Shown here as a concept.',
    points: ['Subject progress per learner', 'Trends across assessments', 'Still in development'],
    pane: <AnalyticsPane />,
    demo: true,
  },
  {
    id: 'student',
    label: 'Student Dashboard',
    icon: 'ri-user-smile-line',
    status: 'available',
    title: 'A friendly home base for young learners',
    description: 'Students find their lessons, quizzes, and live games in one simple, colorful space with mascot reminders.',
    points: ['Lessons and assessments', 'Join live classroom games', 'Mascot reminders and avatars'],
    pane: <StudentDashboardPane />,
    demo: true,
  },
  {
    id: 'games',
    label: 'Live Games',
    icon: 'ri-gamepad-line',
    status: 'available',
    title: 'Whole-class games powered by your questions',
    description: 'Turn a question set into a live team game that the whole class can play together.',
    points: ['Palosebo Race', 'Tug of War', 'Live Trivia Clashes'],
    pane: <LiveGamesPane />,
  },
];

export default function ProductShowcase() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tab = TABS[active];

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | null = null;
    if (e.key in keys) next = (active + keys[e.key] + TABS.length) % TABS.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="product" aria-labelledby="showcase-heading" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-white to-sky-50/70 py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="showcase-heading"
            eyebrow="Product tour"
            eyebrowIcon="ri-macbook-line"
            tone="sky"
            title="Take a Look Inside GO Learning"
            description="Previews of the tools teachers and students use today. Features still being built are clearly marked as concept previews."
          />
        </Reveal>

        <Reveal delay={100}>
          <div
            role="tablist"
            aria-label="GO Learning features"
            onKeyDown={onKeyDown}
            className="mx-auto mt-12 flex max-w-5xl snap-x gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:justify-center lg:overflow-visible"
          >
            {TABS.map((t, i) => {
              const selected = i === active;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`showcase-tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`showcase-panel-${t.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`inline-flex shrink-0 snap-start items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                    selected
                      ? 'bg-[#0B2545] text-white shadow-lg'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-[#0B2545] hover:ring-sky-300'
                  }`}
                >
                  <i className={`${t.icon} text-base`} aria-hidden="true" />
                  {t.label}
                  {t.status === 'concept' && (
                    <span className={`rounded-full px-1.5 py-px text-[9px] font-extrabold uppercase ${selected ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                      Concept
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div
          key={tab.id}
          id={`showcase-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`showcase-tab-${tab.id}`}
          className="animate-fadeInUp mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12"
        >
          <div className="lg:col-span-4">
            <StatusTag status={tab.status} />
            <h3 className="mt-4 font-nunito text-2xl font-extrabold leading-tight text-[#0B2545] sm:text-3xl">{tab.title}</h3>
            <p className="mt-3 leading-relaxed text-slate-600">{tab.description}</p>
            <ul className="mt-5 space-y-2.5">
              {tab.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm font-semibold text-slate-700">
                  <i className="ri-check-line mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs text-teal-700" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
            {tab.demo && <DemoTag label="Preview uses sample data" className="mt-6" />}
          </div>
          <div className="lg:col-span-8">{tab.pane}</div>
        </div>
      </div>
    </section>
  );
}
