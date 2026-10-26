import Image from 'next/image';
import Reveal from './Reveal';
import { SectionHeading } from './ui';

const PRINCIPLES = [
  {
    icon: 'ri-compasses-2-line',
    title: 'Evidence-Informed Instruction',
    description:
      'Activities and assessment formats are tailored to the developmental capabilities of Grade 1 to 3 pupils, promoting foundational literacy and numeracy.',
    tone: 'text-sky-600 bg-sky-50 ring-sky-200',
  },
  {
    icon: 'ri-book-read-line',
    title: 'DepEd Standards Alignment',
    description:
      'Learning competencies and subject structures support early basic education objectives across English, Mathematics, Science, and Filipino.',
    tone: 'text-teal-600 bg-teal-50 ring-teal-200',
  },
  {
    icon: 'ri-user-settings-line',
    title: 'Educator-Led Classroom Design',
    description:
      'Assessment preparation, grading records, and classroom game sessions remain entirely directed by the teacher to ensure pedagogical appropriateness.',
    tone: 'text-amber-600 bg-amber-50 ring-amber-200',
  },
  {
    icon: 'ri-shield-check-line',
    title: 'Safe & Ad-Free Learning Environment',
    description:
      'Purpose-built for schools and classrooms with zero third-party advertisements, distracted-free navigation, and respectful student privacy safeguards.',
    tone: 'text-indigo-600 bg-indigo-50 ring-indigo-200',
  },
];

export default function TrustCredibility() {
  return (
    <section
      id="about"
      aria-labelledby="trust-heading"
      className="relative scroll-mt-20 bg-white py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="trust-heading"
            eyebrow="Our Commitment"
            eyebrowIcon="ri-shield-star-line"
            tone="teal"
            title="Grounded in Purpose. Committed to Educational Excellence."
            description="GO Learning focuses on efficient teaching workflows, high pupil engagement, and research-backed instructional design without commercial distractions."
          />
        </Reveal>

        {/* Institution Affiliation Badge */}
        <Reveal delay={80}>
          <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-center gap-4 rounded-3xl bg-slate-50 p-6 text-center ring-1 ring-slate-200 sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-xs">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Elementary LMS</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>Teacher Workspace</span>
              </div>
              <h3 className="font-nunito text-lg font-extrabold text-[#0B2545]">
                GO Learning Elementary Platform
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Designed to support foundational elementary education, classroom interactivity, and digital grading stewardship for Grades 1 through 3.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Four Core Pillars */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((item, i) => (
            <Reveal key={item.title} delay={120 + i * 80} as="article" className="h-full">
              <div className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-xs ring-1 ring-slate-200/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <span
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${item.tone}`}
                >
                  <i className={`${item.icon} text-2xl`} aria-hidden="true" />
                </span>
                <h4 className="font-nunito text-base font-extrabold text-[#0B2545]">
                  {item.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
