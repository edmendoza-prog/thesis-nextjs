export default function SimpleHowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Prepare Questions',
      desc: 'Upload your lesson notes or create quiz questions with custom answer keys, points, and question types.',
      icon: 'ri-edit-line',
    },
    {
      step: '2',
      title: 'Students Play in Class',
      desc: 'Launch live team games like Palosebo Race and Tug of War or interactive quizzes on the classroom screen.',
      icon: 'ri-gamepad-line',
    },
    {
      step: '3',
      title: 'Review Results',
      desc: 'View automated grading summaries, class attendance, and performance analytics to guide your next lesson.',
      icon: 'ri-line-chart-line',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3 mb-2">
            Three Simple Steps
          </h2>
          <p className="text-sm text-slate-600">
            A straightforward flow built to keep classroom management and assessment smooth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-start"
            >
              <div className="flex items-center justify-between w-full mb-4">
                <span className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                  <i className={s.icon} />
                </span>
                <span className="text-2xl font-black text-slate-300">
                  0{s.step}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {s.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
