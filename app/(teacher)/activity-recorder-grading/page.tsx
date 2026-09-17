'use client';

import { useState, useMemo, useEffect } from 'react';

type StudentScore = {
  id: number;
  name: string;
  emoji: string;
  quiz1: number;
  quiz2: number;
  activity: number;
  exam: number;
};

function Icon({ type, className = "h-5 w-5" }: { type: string; className?: string }) {
  switch (type) {
    case 'mic':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>;
    case 'search':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
    case 'arrow-up':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m5 12 7-7 7 7M12 19V5" /></svg>;
    case 'arrow-down':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14m7-7-7 7-7-7" /></svg>;
    case 'save':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>;
    case 'clipboard':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3M8 12h8M8 16h5" /></svg>;
    default:
      return null;
  }
}

export default function ActivityRecorderGradingPage() {
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    async function loadScores() {
      try {
        const response = await fetch('/api/teacher/activity-recorder-grading');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load grading data');
        setStudents(data.students ?? []);
      } catch (error) {
        console.error('Grading fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadScores();
  }, []);

  const stats = useMemo(() => {
    const withScores = students.map(s => {
      const total = s.quiz1 + s.quiz2 + s.activity + s.exam;
      const gpa = (total / 240) * 100;
      const passed = gpa >= 75;
      return { ...s, total, gpa, passed };
    });

    const totalStudents = withScores.length;
    const classAverage = totalStudents === 0 ? 0 : withScores.reduce((sum, s) => sum + s.gpa, 0) / totalStudents;
    const passedCount = withScores.filter(s => s.passed).length;
    const failedCount = totalStudents - passedCount;

    return { totalStudents, classAverage: classAverage.toFixed(2), passedCount, failedCount, withScores };
  }, [students]);

  const filteredStudents = stats.withScores.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateScore = (id: number, field: keyof StudentScore, value: string) => {
    const limits: Partial<Record<keyof StudentScore, number>> = { quiz1: 50, quiz2: 50, activity: 40, exam: 100 };
    const numValue = Math.min(Math.max(parseInt(value) || 0, 0), limits[field] ?? 100);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: numValue } : s));
    setLastSaved(null);
  };

  const saveDraft = () => {
    setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <header className="mb-7 flex flex-col gap-4 border-b border-primary-200/70 pb-6 animate-fadeInUp lg:flex-row lg:items-end lg:justify-between">
        <div><p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-[#dc2626]">Teacher workspace</p><h1 className="font-heading text-4xl font-bold text-foreground-900">Gradebook</h1><p className="mt-2 text-foreground-600">Record assessment scores and review learner progress.</p></div>
        <div className="flex items-center gap-3"><span className="hidden text-xs font-bold text-foreground-500 sm:block">{lastSaved ? `Draft saved at ${lastSaved}` : 'Unsaved changes are kept in this session'}</span><button type="button" onClick={saveDraft} className="flex items-center gap-2 rounded-lg bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-700"><Icon type="save" className="h-5 w-5" />Save draft</button></div>
      </header>

      <section className="mb-6 grid overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm sm:grid-cols-4">
        {[['Students', stats.totalStudents, 'text-foreground-900'], ['Class average', `${stats.classAverage}%`, 'text-primary-600'], ['On track', stats.passedCount, 'text-[#168477]'], ['Needs support', stats.failedCount, 'text-[#dc2626]']].map(([label, value, color]) => <div key={label as string} className="border-b border-primary-100 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><p className="text-xs font-bold uppercase tracking-wide text-foreground-500">{label}</p><p className={`mt-1 font-heading text-3xl font-bold ${color}`}>{value}</p></div>)}
      </section>

      <section className="mb-4 flex flex-col gap-3 rounded-xl border border-primary-200 bg-background-50 p-4 shadow-sm animate-fadeInUp sm:flex-row sm:items-center sm:justify-between" style={{ animationDelay: '300ms' }}>
        <div className="relative max-w-md flex-1">
          <Icon type="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-background-300 bg-background-50 py-2.5 pl-10 pr-4 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent-300"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-foreground-600"><span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" />Passing grade: 75%</div>
      </section>

      <section className="overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm animate-fadeInUp" style={{ animationDelay: '350ms' }}>
        <div className="flex flex-col gap-4 border-b border-primary-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fee2e2] text-[#dc2626]"><Icon type="clipboard" /></span><div><h2 className="font-heading text-2xl font-bold text-foreground-900">Assessment record</h2><p className="mt-0.5 text-sm text-foreground-500">Total available points: 240</p></div></div></div><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-foreground-500"><span>Quiz 1 · 50</span><span>Quiz 2 · 50</span><span>Activity · 40</span><span>Exam · 100</span></div></div>
        {loading ? (
          <div className="p-6 text-sm text-foreground-500 font-body">Loading scores...</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead>
              <tr className="border-b border-primary-200 bg-background-100">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-foreground-500">Learner</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-foreground-500">Quiz 1</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-foreground-500">Quiz 2</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-foreground-500">Activity</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-foreground-500">Exam</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-foreground-500">Total</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-foreground-500">Final grade</th>
                <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wide text-foreground-500">Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-primary-100 transition-colors last:border-b-0 hover:bg-accent-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xl">
                        {student.emoji}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground-900 font-body">{student.name}</div>
                        <div className="text-xs text-foreground-600 font-body">ID: {student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <input
                      type="number"
                      value={student.quiz1}
                      onChange={(e) => updateScore(student.id, 'quiz1', e.target.value)}
                      className="w-16 rounded-md border border-background-300 bg-background-50 px-2 py-2 text-center font-body text-sm font-semibold outline-none focus:ring-2 focus:ring-accent-300"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <input
                      type="number"
                      value={student.quiz2}
                      onChange={(e) => updateScore(student.id, 'quiz2', e.target.value)}
                      className="w-16 rounded-md border border-background-300 bg-background-50 px-2 py-2 text-center font-body text-sm font-semibold outline-none focus:ring-2 focus:ring-accent-300"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <input
                      type="number"
                      value={student.activity}
                      onChange={(e) => updateScore(student.id, 'activity', e.target.value)}
                      className="w-16 rounded-md border border-background-300 bg-background-50 px-2 py-2 text-center font-body text-sm font-semibold outline-none focus:ring-2 focus:ring-accent-300"
                      min="0"
                      max="40"
                    />
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <input
                      type="number"
                      value={student.exam}
                      onChange={(e) => updateScore(student.id, 'exam', e.target.value)}
                      className="w-16 rounded-md border border-background-300 bg-background-50 px-2 py-2 text-center font-body text-sm font-semibold outline-none focus:ring-2 focus:ring-accent-300"
                      min="0"
                      max="100"
                    />
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <div className="font-bold text-foreground-900 font-heading">{student.total}</div>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <div className={`font-bold font-heading ${student.gpa >= 75 ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>
                      {student.gpa.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {student.passed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1.5 text-xs font-bold text-[#15803d] whitespace-nowrap">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]"></span>
                        On track
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fee2e2] px-3 py-1.5 text-xs font-bold text-[#b91c1c] whitespace-nowrap">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]"></span>
                        Needs support
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        <div className="flex flex-col gap-2 border-t border-primary-200 bg-background-100 px-5 py-4 text-xs text-foreground-600 sm:flex-row sm:items-center sm:justify-between"><span>Scores are calculated from 240 total points.</span><span className="font-bold">On track: 75% and above</span></div>
      </section>
    </div>
  );
}
