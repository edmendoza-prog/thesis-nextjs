import Link from 'next/link';
import { GoLearningLogo } from './Navigation';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <Link href="/" aria-label="GO Learning home">
              <GoLearningLogo inverted />
            </Link>
            <p className="text-xs text-slate-400 mt-2 max-w-sm">
              Elementary Learning Management System for Grade 1–3 educators.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold">
            <Link href="/login" className="hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/login/teacher" className="hover:text-white transition-colors">
              Teacher Workspace
            </Link>
            <Link href="/login/student" className="hover:text-white transition-colors">
              Student Portal
            </Link>
            <Link
              href="/login"
              className="text-sky-400 hover:text-white transition-colors"
            >
              Help &amp; Support
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} GO Learning. All rights reserved.</p>
          <p>Ad-Free · Child Safe · Grade 1–3 Elementary Education</p>
        </div>
      </div>
    </footer>
  );
}
