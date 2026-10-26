import type { ReactNode } from 'react';

/** Small pill shown above section headings. */
export function Eyebrow({
  icon,
  children,
  tone = 'sky',
}: {
  icon?: string;
  children: ReactNode;
  tone?: 'sky' | 'teal' | 'amber';
}) {
  const tones = {
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    teal: 'bg-teal-50 text-teal-700 ring-teal-200',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ring-1 ${tones[tone]}`}
    >
      {icon && <i className={`${icon} text-sm`} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  tone,
  title,
  description,
  align = 'center',
  id,
}: {
  eyebrow: string;
  eyebrowIcon?: string;
  tone?: 'sky' | 'teal' | 'amber';
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  id?: string;
}) {
  const alignment = align === 'center' ? 'mx-auto text-center items-center' : 'text-left items-start';
  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${alignment}`}>
      <Eyebrow icon={eyebrowIcon} tone={tone}>
        {eyebrow}
      </Eyebrow>
      <h2
        id={id}
        className="font-nunito text-3xl font-extrabold leading-[1.15] tracking-tight text-[#0B2545] sm:text-4xl lg:text-[2.75rem]"
      >
        {title}
      </h2>
      {description && <p className="text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>}
    </div>
  );
}

/** Clearly marks any sample numbers so visitors never mistake them for real results. */
export function DemoTag({ label = 'Demo data', className = '' }: { label?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 ring-1 ring-amber-300/70 ${className}`}
    >
      <i className="ri-flask-line" aria-hidden="true" />
      {label}
    </span>
  );
}

/** Availability label for product previews. */
export function StatusTag({ status }: { status: 'available' | 'concept' }) {
  return status === 'available' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 ring-1 ring-teal-200">
      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />
      Available now
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-300">
      <i className="ri-draft-line" aria-hidden="true" />
      Concept preview
    </span>
  );
}

/** Browser-style frame used around UI previews. */
export function AppFrame({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(11,37,69,0.28)] ring-1 ring-slate-200/80 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-teal-300" aria-hidden="true" />
        <span className="ml-2 truncate text-[11px] font-semibold text-slate-500">{title}</span>
      </div>
      {children}
    </div>
  );
}
