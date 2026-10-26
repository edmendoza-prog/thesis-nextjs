'use client';

import Link from 'next/link';

export default function FeaturesSection() {
  const systemCapabilities = [
    {
      code: 'CAP-01',
      title: 'Foundational Literacy & Numeracy',
      description: 'Structured, step-by-step reading and mathematics modules developed for Grade 1–3 developmental stages.',
      icon: (
        <svg className="w-5 h-5 text-[#881337]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      tag: 'Curriculum Delivery'
    },
    {
      code: 'CAP-02',
      title: 'Formative & Summative Quizzes',
      description: 'Curriculum-aligned diagnostic assessments with immediate feedback, error analysis, and reinforcement exercises.',
      icon: (
        <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      tag: 'Academic Evaluation'
    },
    {
      code: 'CAP-03',
      title: 'Digital Gradebook & SF9 Records',
      description: 'Automated calculation of student quarterly scores, DepEd competency checklists, and printable progress cards.',
      icon: (
        <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      tag: 'Institutional Analytics'
    },
    {
      code: 'CAP-04',
      title: 'Educator Authoring Workspace',
      description: 'Centralized teacher portal to author questions, assign reading homework, and monitor active class sessions.',
      icon: (
        <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      tag: 'Faculty Controls'
    }
  ];

  return (
    <section id="features" className="py-20 lg:py-24 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-200 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span>System Capabilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Institutional Learning &amp; Management Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Designed specifically for the academic environment of GO Learning—empowering teachers with classroom tools and providing young students an intuitive portal.
            </p>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemCapabilities.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl p-6 border border-slate-200 hover:border-slate-300 bg-white shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                    {item.icon}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    {item.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Domain:</span>
                <span className="text-slate-800 font-bold">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Institutional Callout Banner */}
        <div className="mt-12 rounded-xl bg-slate-900 text-white p-8 lg:p-10 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <span>GO Learning LMS</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Ready to access your classroom environment?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Log in with your school-issued student ID or faculty credentials to review ongoing syllabi, submit assignments, and view grading records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/login?role=student">
              <button className="bg-[#881337] hover:bg-[#9F1239] text-white font-bold py-3 px-6 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer shadow-xs">
                Student Portal
              </button>
            </Link>
            <Link href="/login?role=teacher">
              <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 px-6 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer">
                Teacher Workspace
              </button>
            </Link>
          </div>
        </div>

        {/* Institutional Statistics */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            {
              value: '500+',
              label: 'Enrolled Pupils',
              desc: 'Grades 1 through 3'
            },
            {
              value: '100%',
              label: 'DepEd Aligned',
              desc: 'K-12 & Matatag Curriculum'
            },
            {
              value: '6',
              label: 'Core Subjects',
              desc: 'Math, Reading, Science, etc.'
            },
            {
              value: '24/7',
              label: 'Cloud Availability',
              desc: 'Secure institutional access'
            }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-xl p-5"
            >
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight">
                {stat.value}
              </div>
              <div className="text-slate-800 text-xs font-bold uppercase tracking-wider mb-1">
                {stat.label}
              </div>
              <div className="text-slate-500 text-[11px]">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
