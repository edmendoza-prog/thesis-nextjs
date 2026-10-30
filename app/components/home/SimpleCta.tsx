import Link from 'next/link';

export default function SimpleCta() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-gradient-to-br from-[#0B2545] to-[#123a63] rounded-3xl p-8 sm:p-12 text-white shadow-md">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/15">
            Classroom Ready
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            A Better Learning Experience Starts Here.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Join educators using GO Learning to combine engaging classroom activities with simplified grading and learner progress tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login/teacher"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition-all shadow-sm"
            >
              Get Started as Teacher →
            </Link>
            <Link
              href="/login/teacher"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20"
            >
              Sign In
            </Link>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            GO Learning · Elementary Teacher Workspace (Grades 1–3)
          </p>
        </div>
      </div>
    </section>
  );
}
