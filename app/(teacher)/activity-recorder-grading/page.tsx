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
    default:
      return null;
  }
}

export default function ActivityRecorderGradingPage() {
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
    const classAverage = withScores.reduce((sum, s) => sum + s.gpa, 0) / totalStudents;
    const passedCount = withScores.filter(s => s.passed).length;
    const failedCount = totalStudents - passedCount;

    return { totalStudents, classAverage: classAverage.toFixed(2), passedCount, failedCount, withScores };
  }, [students]);

  const filteredStudents = stats.withScores.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateScore = (id: number, field: keyof StudentScore, value: string) => {
    const numValue = parseInt(value) || 0;
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: numValue } : s));
  };

  return (
    <div className="max-w-[1600px]">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ef4444] flex items-center justify-center">
            <Icon type="mic" className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground-900">Activity Recorder & Grading</h1>
        </div>
        <button className="px-6 py-3 bg-accent-500 text-white font-bold rounded-2xl transition-all duration-300 hover:bg-accent-600 hover:scale-[1.02] font-body flex items-center gap-2 whitespace-nowrap">
          <Icon type="save" className="h-5 w-5" />
          Save All Changes
        </button>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-4 gap-5 mb-6">
        <div className="bg-background-50 rounded-2xl border border-background-200/70 p-5 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="text-4xl font-bold text-foreground-900 font-heading mb-1">{stats.totalStudents}</div>
          <div className="text-sm text-foreground-600 font-body">Total Students</div>
        </div>
        <div className="bg-gradient-to-br from-primary-300 to-primary-500 rounded-2xl p-5 text-white animate-fadeInUp" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Icon type="arrow-up" className="h-4 w-4" />
            </div>
          </div>
          <div className="text-4xl font-bold font-heading mb-1">{stats.classAverage}%</div>
          <div className="text-sm font-body">Class Average</div>
        </div>
        <div className="bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl p-5 text-white animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Icon type="arrow-up" className="h-4 w-4" />
            </div>
          </div>
          <div className="text-4xl font-bold font-heading mb-1">{stats.passedCount}</div>
          <div className="text-sm font-body">Passed</div>
        </div>
        <div className="bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-2xl p-5 text-white animate-fadeInUp" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Icon type="arrow-down" className="h-4 w-4" />
            </div>
          </div>
          <div className="text-4xl font-bold font-heading mb-1">{stats.failedCount}</div>
          <div className="text-sm font-body">Failed</div>
        </div>
      </section>

      {/* Search */}
      <section className="bg-background-50 rounded-2xl border border-background-200/70 p-4 mb-6 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
        <div className="relative">
          <Icon type="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body"
          />
        </div>
      </section>

      {/* Score Recording Sheet */}
      <section className="bg-background-50 rounded-2xl border border-background-200/70 p-6 animate-fadeInUp" style={{ animationDelay: '350ms' }}>
        <h2 className="font-heading font-bold text-2xl text-foreground-900 mb-5">Score Recording Sheet</h2>
        
        {loading ? (
          <div className="text-sm text-foreground-500 font-body">Loading scores...</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-primary-200">
                <th className="text-left py-4 px-3 font-heading font-bold text-sm text-foreground-900">Student</th>
                <th className="text-center py-4 px-3 font-heading font-bold text-sm text-foreground-900">Quiz 1 (/50)</th>
                <th className="text-center py-4 px-3 font-heading font-bold text-sm text-foreground-900">Quiz 2 (/50)</th>
                <th className="text-center py-4 px-3 font-heading font-bold text-sm text-foreground-900">Activity (/40)</th>
                <th className="text-center py-4 px-3 font-heading font-bold text-sm text-foreground-900">Exam (/100)</th>
                <th className="text-center py-4 px-3 font-heading font-bold text-sm text-foreground-900">Total (/240)</th>
                <th className="text-center py-4 px-3 font-heading font-bold text-sm text-foreground-900">GPA (%)</th>
                <th className="text-center py-4 px-3 font-heading font-bold text-sm text-foreground-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-background-200 hover:bg-background-100 transition-colors">
                  <td className="py-4 px-3">
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
                  <td className="py-4 px-3 text-center">
                    <input
                      type="number"
                      value={student.quiz1}
                      onChange={(e) => updateScore(student.id, 'quiz1', e.target.value)}
                      className="w-16 px-2 py-1.5 text-center rounded-lg border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body font-semibold"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td className="py-4 px-3 text-center">
                    <input
                      type="number"
                      value={student.quiz2}
                      onChange={(e) => updateScore(student.id, 'quiz2', e.target.value)}
                      className="w-16 px-2 py-1.5 text-center rounded-lg border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body font-semibold"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td className="py-4 px-3 text-center">
                    <input
                      type="number"
                      value={student.activity}
                      onChange={(e) => updateScore(student.id, 'activity', e.target.value)}
                      className="w-16 px-2 py-1.5 text-center rounded-lg border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body font-semibold"
                      min="0"
                      max="40"
                    />
                  </td>
                  <td className="py-4 px-3 text-center">
                    <input
                      type="number"
                      value={student.exam}
                      onChange={(e) => updateScore(student.id, 'exam', e.target.value)}
                      className="w-16 px-2 py-1.5 text-center rounded-lg border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body font-semibold"
                      min="0"
                      max="100"
                    />
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className="font-bold text-foreground-900 font-heading">{student.total}</div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className={`font-bold font-heading ${student.gpa >= 75 ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>
                      {student.gpa.toFixed(2)}%
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    {student.passed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16a34a] text-white text-xs font-bold font-body whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        PASSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ef4444] text-white text-xs font-bold font-body whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        FAILED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Grading Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm font-body">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#16a34a]"></span>
            <span className="text-foreground-700"><strong className="font-bold">PASSED:</strong> 75% and above</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
            <span className="text-foreground-700"><strong className="font-bold">FAILED:</strong> Below 75%</span>
          </div>
        </div>
      </section>
    </div>
  );
}
