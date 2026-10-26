import Reveal from './Reveal';
import { SectionHeading } from './ui';

function UploadPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 ring-1 ring-slate-200">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
          <i className="ri-file-pdf-2-line" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold text-slate-700">Lesson 4 – Plants Around Us.pdf</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full rounded-full bg-teal-400" />
          </div>
        </div>
        <i className="ri-checkbox-circle-fill text-teal-500" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-sky-300 bg-sky-50/60 p-2.5 text-[11px] font-semibold text-sky-700">
        <i className="ri-upload-cloud-2-line text-base" aria-hidden="true" /> Drop a PDF or Word file
      </div>
    </div>
  );
}

function QuestionAuthoringPreview() {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-700">
          <i className="ri-edit-2-line" aria-hidden="true" /> Item Editor
        </span>
        <span className="text-[10px] font-bold text-teal-600">Grade 1–3</span>
      </div>
      <p className="text-[11.5px] font-bold leading-snug text-slate-700">Which shape has 3 sides and 3 corners?</p>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-800">
          <span>🔺 Triangle</span>
          <i className="ri-check-line text-teal-600" aria-hidden="true" />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
          <span>🟦 Square</span>
        </div>
      </div>
    </div>
  );
}

function QuestionTypesPreview() {
  const types = [
    { label: 'Multiple Choice', weight: 40, color: 'bg-sky-500' },
    { label: 'True or False', weight: 20, color: 'bg-teal-500' },
    { label: 'Identification', weight: 20, color: 'bg-amber-400' },
    { label: 'Matching Type', weight: 20, color: 'bg-indigo-400' },
  ];
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <div className="mb-2 flex h-2 overflow-hidden rounded-full" aria-hidden="true">
        {types.map((t) => (
          <span key={t.label} className={t.color} style={{ width: `${t.weight}%` }} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
        {types.map((t) => (
          <li key={t.label} className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-600">
            <span className={`h-2 w-2 rounded-full ${t.color}`} aria-hidden="true" />
            <span className="truncate">{t.label}</span>
            <span className="ml-auto font-bold text-slate-800">{t.weight}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GradingPreview() {
  const rows = [
    { name: 'Ana', q1: 9, q2: 10, status: 'Excellent', tone: 'text-teal-700 bg-teal-50' },
    { name: 'Ben', q1: 7, q2: 8, status: 'Good', tone: 'text-sky-700 bg-sky-50' },
    { name: 'Carlo', q1: 5, q2: 6, status: 'Needs help', tone: 'text-amber-800 bg-amber-50' },
  ];
  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
      <table className="w-full text-left text-[10.5px]">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-2.5 py-1.5 font-bold">Learner</th>
            <th className="px-1 py-1.5 font-bold">Q1</th>
            <th className="px-1 py-1.5 font-bold">Q2</th>
            <th className="px-2.5 py-1.5 font-bold">Status</th>
          </tr>
        </thead>
        <tbody className="font-semibold text-slate-700">
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-slate-100">
              <td className="px-2.5 py-1.5">{r.name}</td>
              <td className="px-1 py-1.5">{r.q1}</td>
              <td className="px-1 py-1.5">{r.q2}</td>
              <td className="px-2.5 py-1.5">
                <span className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold ${r.tone}`}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CARDS = [
  {
    icon: 'ri-upload-cloud-2-line',
    iconBg: 'bg-sky-100 text-sky-600',
    step: 'Upload',
    title: 'Upload lesson materials',
    description:
      'Bring in the lessons you already use. Upload a PDF or Word file and GO Learning extracts the text so you can edit it before building an activity.',
    preview: <UploadPreview />,
  },
  {
    icon: 'ri-edit-box-line',
    iconBg: 'bg-amber-100 text-amber-600',
    step: 'Author',
    title: 'Author & customize questions',
    description:
      'Quickly create and customize assessment items. Build multiple-choice, true/false, identification, and matching quizzes tailored to your lesson objectives.',
    preview: <QuestionAuthoringPreview />,
  },
  {
    icon: 'ri-list-check-3',
    iconBg: 'bg-teal-100 text-teal-600',
    step: 'Organize',
    title: 'Organize quizzes by question type',
    description:
      'Set how many Multiple Choice, True or False, Identification, and Matching Type items you need, and how much each part is worth.',
    preview: <QuestionTypesPreview />,
  },
  {
    icon: 'ri-file-list-3-line',
    iconBg: 'bg-indigo-100 text-indigo-600',
    step: 'Record',
    title: 'Simplified grading sheets & class records',
    description:
      'Keep scores and attendance together in one clear class record. Totals and class averages are calculated from the scores you enter.',
    preview: <GradingPreview />,
  },
];

export default function TeacherWorkload() {
  return (
    <section aria-labelledby="workload-heading" className="relative scroll-mt-20 bg-white py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="workload-heading"
            eyebrow="Teacher Workspace Suite"
            eyebrowIcon="ri-tools-line"
            tone="sky"
            title={
              <>
                Spend Less Time Preparing.{' '}
                <span className="bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
                  Spend More Time Teaching.
                </span>
              </>
            }
            description="GO Learning provides dedicated tools that handle repetitive classroom preparation and record keeping, so you can focus on your learners."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 90} as="article" className="h-full">
              <div className="group flex h-full flex-col rounded-3xl bg-slate-50/70 p-6 ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white hover:shadow-[0_24px_50px_-24px_rgba(11,37,69,0.35)]">
                <div className="mb-5 flex items-center justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg} transition-transform group-hover:scale-110 group-hover:-rotate-6`}>
                    <i className={`${card.icon} text-2xl`} aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                    0{i + 1} · {card.step}
                  </span>
                </div>
                <h3 className="font-nunito text-lg font-extrabold leading-snug text-[#0B2545]">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{card.description}</p>
                <div className="mt-5 rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50/60 p-3" aria-hidden="true">
                  {card.preview}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150}>
          <div className="mt-10 flex flex-col items-start gap-4 rounded-3xl bg-gradient-to-r from-[#0B2545] to-[#123a63] p-6 text-white sm:flex-row sm:items-center sm:p-7">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-[#0B2545]">
              <i className="ri-shield-user-line text-2xl" aria-hidden="true" />
            </span>
            <div>
              <p className="font-nunito text-lg font-extrabold">Complete teacher ownership & classroom control.</p>
              <p className="mt-1 text-sm leading-relaxed text-sky-100/90">
                Designed specifically as a teacher tool: every assessment, grading record, and live game session is managed directly by you.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
