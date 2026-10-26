import Image from 'next/image';
import Reveal from './Reveal';
import { SectionHeading } from './ui';

const TEACHER_BENEFITS = [
  { icon: 'ri-timer-flash-line', title: 'Less preparation work', text: 'Quickly create activities using structured question templates.' },
  { icon: 'ri-folders-line', title: 'Organized assessments', text: 'Quizzes and tests grouped by question type and weight.' },
  { icon: 'ri-table-line', title: 'Simplified grading records', text: 'Scores and attendance kept together in one class record.' },
  { icon: 'ri-lightbulb-flash-line', title: 'Actionable insights', text: 'See who may need help and which topics to revisit.' },
];

const STUDENT_BENEFITS = [
  { icon: 'ri-emotion-laugh-line', title: 'Enjoyable learning', text: 'Bright, friendly lessons made for young learners.' },
  { icon: 'ri-puzzle-2-line', title: 'Interactive challenges', text: 'Quizzes and class games that invite everyone to take part.' },
  { icon: 'ri-seedling-line', title: 'Stronger understanding', text: 'Practice and gentle feedback that help ideas stick.' },
  { icon: 'ri-heart-3-line', title: 'Confidence to try', text: 'Encouraging words that celebrate effort, not just scores.' },
];

function BenefitColumn({
  title,
  subtitle,
  emoji,
  items,
  tone,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  items: typeof TEACHER_BENEFITS;
  tone: 'sky' | 'amber';
}) {
  const t =
    tone === 'sky'
      ? { card: 'from-sky-50 via-white to-white ring-sky-200/70', icon: 'bg-sky-500', badge: 'bg-sky-100' }
      : { card: 'from-amber-50 via-white to-white ring-amber-200/70', icon: 'bg-amber-400', badge: 'bg-amber-100' };
  return (
    <div className={`h-full rounded-[2rem] bg-gradient-to-b ${t.card} p-7 ring-1 sm:p-9`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${t.badge} text-3xl`} aria-hidden="true">
          {emoji}
        </span>
        <div>
          <h3 className="font-nunito text-2xl font-extrabold text-[#0B2545]">{title}</h3>
          <p className="text-sm font-semibold text-slate-500">{subtitle}</p>
        </div>
      </div>
      <ul className="mt-7 space-y-5">
        {items.map((b) => (
          <li key={b.title} className="flex gap-3.5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.icon} text-white shadow-sm`}>
              <i className={`${b.icon} text-lg`} aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-[#0B2545]">{b.title}</p>
              <p className="text-sm leading-relaxed text-slate-600">{b.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Benefits() {
  return (
    <section id="for-teachers" aria-labelledby="benefits-heading" className="relative scroll-mt-20 bg-white py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionHeading
              id="benefits-heading"
              align="left"
              eyebrow="Built for both sides of the classroom"
              eyebrowIcon="ri-scales-3-line"
              tone="teal"
              title="Helpful for Teachers. Joyful for Students."
              description="GO Learning serves two goals at once: lighter workloads for teachers and meaningful, engaging practice for learners."
            />
          </Reveal>
          <Reveal className="hidden lg:col-span-5 lg:block" delay={100}>
            <Image
              src="/images/home/owl-teacher-mascot.jpg"
              alt="Owl teacher mascot pointing at a rising bar chart while the fox and lion mascots read and use a tablet"
              width={1024}
              height={1024}
              sizes="380px"
              className="ml-auto h-auto w-full max-w-[340px] mix-blend-multiply"
            />
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal delay={60} className="h-full">
            <BenefitColumn title="For Teachers" subtitle="Practical tools that save effort" emoji="🦉" items={TEACHER_BENEFITS} tone="sky" />
          </Reveal>
          <Reveal delay={160} className="h-full">
            <BenefitColumn title="For Students" subtitle="Fun that supports real learning" emoji="🦊" items={STUDENT_BENEFITS} tone="amber" />
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mx-auto mt-10 flex max-w-4xl items-start gap-3 rounded-2xl bg-teal-50 p-5 ring-1 ring-teal-200 sm:items-center">
            <i className="ri-compass-discover-line mt-0.5 text-2xl text-teal-600 sm:mt-0" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-teal-900 sm:text-[15px]">
              <strong className="font-extrabold">Games support learning — they don’t replace it.</strong> Every quiz and game in
              GO Learning is tied to lesson content, and teachers still lead instruction and assessment.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
