export default function SimpleFeatures() {
  const features = [
    {
      icon: 'ri-question-answer-line',
      iconColor: 'bg-sky-50 text-sky-600',
      title: 'Interactive Quizzes',
      description:
        'Create colorful quizzes with Multiple Choice, True or False, and Matching questions tailored for early elementary learners.',
    },
    {
      icon: 'ri-gamepad-line',
      iconColor: 'bg-amber-50 text-amber-600',
      title: 'Live Classroom Games',
      description:
        'Host exciting multiplayer team activities like Palosebo Race and Tug of War on the classroom screen to boost engagement.',
    },
    {
      icon: 'ri-table-line',
      iconColor: 'bg-teal-50 text-teal-600',
      title: 'Simplified Grading Sheets',
      description:
        'Manage scores, compute quarterly averages automatically, and record attendance in one clear, easy-to-use digital gradebook.',
    },
    {
      icon: 'ri-bar-chart-box-line',
      iconColor: 'bg-indigo-50 text-indigo-600',
      title: 'Student Progress Analytics',
      description:
        'View visual performance summaries to identify struggling learners early and plan targeted lesson reinforcement.',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-100/60 px-3 py-1 rounded-full">
            Teacher Tools
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-3">
            Spend Less Time Preparing.<br />
            <span className="text-sky-600">Spend More Time Teaching.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Everything elementary teachers need to run active classroom lessons and manage class records efficiently.
          </p>
        </div>

        {/* 4 Clean Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${f.iconColor}`}>
                  <i className={f.icon} />
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
