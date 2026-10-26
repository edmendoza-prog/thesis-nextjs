import Image from 'next/image';
import Reveal from './Reveal';
import { SectionHeading, StatusTag } from './ui';

type Activity = {
  icon: string;
  emoji: string;
  title: string;
  text: string;
  tint: string;
  iconTone: string;
  status: 'available' | 'concept';
};

const ACTIVITIES: Activity[] = [
  {
    icon: 'ri-question-answer-line',
    emoji: '🧩',
    title: 'Interactive Quizzes',
    text: 'Short, colorful questions with big buttons and friendly feedback after every answer.',
    tint: 'from-sky-50 to-sky-100/60',
    iconTone: 'bg-sky-500',
    status: 'available',
  },
  {
    icon: 'ri-team-line',
    emoji: '🎉',
    title: 'Live Classroom Games',
    text: 'Play together as a class in team games like Palosebo Race and Tug of War.',
    tint: 'from-amber-50 to-amber-100/60',
    iconTone: 'bg-amber-400',
    status: 'available',
  },
  {
    icon: 'ri-user-smile-line',
    emoji: '🦁',
    title: 'Student Avatars',
    text: 'Pick a fun animal avatar that shows up on your profile and in class.',
    tint: 'from-teal-50 to-teal-100/60',
    iconTone: 'bg-teal-500',
    status: 'available',
  },
  {
    icon: 'ri-map-2-line',
    emoji: '🗺️',
    title: 'Learning Quests',
    text: 'Follow a path of lessons step by step, like an adventure map.',
    tint: 'from-indigo-50 to-indigo-100/50',
    iconTone: 'bg-indigo-400',
    status: 'concept',
  },
  {
    icon: 'ri-medal-line',
    emoji: '🏅',
    title: 'Achievement Badges',
    text: 'Collect badges for trying hard, practicing, and finishing lessons.',
    tint: 'from-rose-50 to-rose-100/50',
    iconTone: 'bg-rose-400',
    status: 'concept',
  },
  {
    icon: 'ri-flag-2-line',
    emoji: '🚩',
    title: 'Learning Challenges',
    text: 'Small goals that invite you to practice one more time and grow.',
    tint: 'from-lime-50 to-lime-100/50',
    iconTone: 'bg-lime-500',
    status: 'concept',
  },
];

export default function StudentAdventure() {
  return (
    <section aria-labelledby="adventure-heading" className="relative scroll-mt-20 overflow-hidden bg-white py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="adventure-heading"
            eyebrow="For young learners"
            eyebrowIcon="ri-rocket-2-line"
            tone="amber"
            title={
              <>
                Every Lesson Is an{' '}
                <span className="bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">Adventure</span>
              </>
            }
            description="Grade 1–3 learners explore lessons with friendly animal guides, simple words, and playful activities — every game is built around what they need to learn."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5" delay={80}>
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-28px_rgba(11,37,69,0.45)] ring-8 ring-amber-50">
                <Image
                  src="/images/home/learning-quest-map.jpg"
                  alt="Illustrated learning path where the fox, owl, and lion mascots travel from step 1 to a treasure chest of stars"
                  width={1200}
                  height={896}
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="h-auto w-full"
                />
              </div>
              <div className="gl-bob absolute -bottom-6 left-6 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-lg ring-1 ring-slate-200">
                <span className="text-2xl" aria-hidden="true">🌟</span>
                <div>
                  <p className="font-nunito text-sm font-extrabold text-[#0B2545]">You can do it!</p>
                  <p className="text-[11px] font-semibold text-slate-500">Encouraging words, every step</p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {ACTIVITIES.map((a, i) => (
              <Reveal key={a.title} delay={i * 70} as="article" className="h-full">
                <div
                  className={`group relative flex h-full flex-col rounded-3xl bg-gradient-to-br ${a.tint} p-5 ring-1 ring-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(11,37,69,0.35)]`}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${a.iconTone} text-white shadow-md transition-transform group-hover:-rotate-6 group-hover:scale-110`}>
                      <i className={`${a.icon} text-xl`} aria-hidden="true" />
                    </span>
                    <StatusTag status={a.status} />
                  </div>
                  <h3 className="flex items-center gap-1.5 font-nunito text-[17px] font-extrabold text-[#0B2545]">
                    {a.title} <span aria-hidden="true">{a.emoji}</span>
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{a.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={100}>
          <ul className="mx-auto mt-14 flex max-w-4xl flex-wrap justify-center gap-3">
            {[
              { icon: 'ri-text', label: 'Simple, readable labels' },
              { icon: 'ri-cursor-line', label: 'Big, easy-to-tap buttons' },
              { icon: 'ri-emotion-happy-line', label: 'Encouraging feedback' },
              { icon: 'ri-shield-check-line', label: 'Learning goals first' },
            ].map((x) => (
              <li
                key={x.label}
                className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
              >
                <i className={`${x.icon} text-teal-500`} aria-hidden="true" /> {x.label}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
