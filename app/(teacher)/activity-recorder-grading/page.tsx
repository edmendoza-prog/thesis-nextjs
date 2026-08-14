'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type GradeStatus = 'PASSED' | 'FAILED';

type StudentScore = {
  id: number;
  name: string;
  emoji: string;
  studentId: number;
  quiz1: number;
  quiz2: number;
  activity: number;
  exam: number;
};

const initialScores: StudentScore[] = [
  { id: 1, name: 'Ava Carter', emoji: '🦊', studentId: 101, quiz1: 42, quiz2: 45, activity: 34, exam: 88 },
  { id: 2, name: 'Leo Martin', emoji: '🦁', studentId: 102, quiz1: 36, quiz2: 38, activity: 30, exam: 72 },
  { id: 3, name: 'Mila Patel', emoji: '🐸', studentId: 103, quiz1: 44, quiz2: 40, activity: 35, exam: 90 },
  { id: 4, name: 'Noah Kim', emoji: '🐼', studentId: 104, quiz1: 30, quiz2: 28, activity: 26, exam: 65 },
];

function Icon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  switch (type) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M9 20v-7h6v7" />
        </svg>
      );
    case 'pencil':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
        </svg>
      );
    case 'save':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2Z" />
          <path d="M17 21v-8H7v8" />
          <path d="M7 3v5h8" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 5 5" />
        </svg>
      );
    case 'trending-up':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 17 9 11l4 4 8-10" />
          <path d="M14 5h7v7" />
        </svg>
      );
    case 'trending-down':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 7 9 13l4-4 8 10" />
          <path d="M14 19h7v-7" />
        </svg>
      );
    default:
      return null;
  }
}

const clampValue = (value: number) => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

export default function ActivityRecorderGradingPage() {
  const [scores, setScores] = useState<StudentScore[]>(initialScores);
  const [search, setSearch] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const visibleScores = useMemo(() => {
    return scores.filter((student) => student.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, scores]);

  const adjustedRows = useMemo(() => {
    return scores.map((student) => ({
      ...student,
      total: student.quiz1 + student.quiz2 + student.activity + student.exam,
      gpa: (student.quiz1 + student.quiz2 + student.activity + student.exam) / 240 * 100,
      status: (student.quiz1 + student.quiz2 + student.activity + student.exam) / 240 * 100 >= 75 ? 'PASSED' : 'FAILED',
    }));
  }, [scores]);

  const classAverage = adjustedRows.length ? adjustedRows.reduce((sum, row) => sum + row.gpa, 0) / adjustedRows.length : 0;
  const passedCount = adjustedRows.filter((row) => row.status === 'PASSED').length;
  const failedCount = adjustedRows.filter((row) => row.status === 'FAILED').length;

  const updateScore = (id: number, field: 'quiz1' | 'quiz2' | 'activity' | 'exam', value: string) => {
    const numericValue = clampValue(Number(value) || 0);
    setScores((prev) =>
      prev.map((student) =>
        student.id === id
          ? {
              ...student,
              [field]: numericValue,
            }
          : student,
      ),
    );
    setSaveMessage('');
  };

  const saveAll = () => {
    setSaveMessage('All grading changes saved successfully.');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#a855f7_0%,#ec4899_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1280px]">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-white">
            <Link
              href="/dashboard"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1f2937] shadow-[0_12px_25px_rgba(120,66,147,0.18)] transition-transform hover:-translate-y-0.5"
              aria-label="Back to dashboard"
            >
              <Icon type="home" className="h-5 w-5 text-[#1f2937]" />
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-3xl">📝</span>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">Activity Recorder & Grading</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={saveAll}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(34,197,94,0.25)] transition-transform hover:-translate-y-0.5"
          >
            <Icon type="save" className="h-4 w-4" />
            Save All Changes
          </button>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[14px] bg-white p-4 text-center shadow-[0_12px_25px_rgba(79,45,103,0.12)]">
            <div className="text-3xl font-extrabold text-[#1f2937]">{scores.length}</div>
            <div className="mt-2 text-sm font-semibold text-[#4b5563]">Total Students</div>
          </div>

          <div className="rounded-[14px] bg-gradient-to-r from-[#3b82f6] to-[#38bdf8] p-4 text-center text-white shadow-[0_12px_25px_rgba(59,130,246,0.25)]">
            <div className="mb-2 flex justify-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <Icon type="trending-up" className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold">{classAverage.toFixed(2)}%</div>
            <div className="mt-2 text-sm font-semibold text-white/90">Class Average</div>
          </div>

          <div className="rounded-[14px] bg-gradient-to-r from-[#22c55e] to-[#10b981] p-4 text-center text-white shadow-[0_12px_25px_rgba(34,197,94,0.25)]">
            <div className="mb-2 flex justify-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <Icon type="trending-up" className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold">{passedCount}</div>
            <div className="mt-2 text-sm font-semibold text-white/90">Passed</div>
          </div>

          <div className="rounded-[14px] bg-gradient-to-r from-[#ef4444] to-[#f43f5e] p-4 text-center text-white shadow-[0_12px_25px_rgba(239,68,68,0.25)]">
            <div className="mb-2 flex justify-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <Icon type="trending-down" className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold">{failedCount}</div>
            <div className="mt-2 text-sm font-semibold text-white/90">Failed</div>
          </div>
        </section>

        <section className="mb-6 rounded-[16px] bg-white p-4 shadow-[0_12px_25px_rgba(79,45,103,0.12)]">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]">
              <Icon type="search" className="h-5 w-5" />
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students..."
              className="w-full rounded-[12px] border border-[#d5b5fa] bg-[#f8f5ff] py-3 pl-11 pr-3 text-base text-[#1f2937] outline-none transition focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
            />
          </div>
        </section>

        <section className="rounded-[18px] bg-white p-4 shadow-[0_16px_32px_rgba(79,45,103,0.12)] sm:p-5">
          <h2 className="mb-4 text-2xl font-extrabold text-[#1f2937]">Score Recording Sheet</h2>

          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full border-separate border-spacing-0 overflow-hidden rounded-[12px] border border-[#f0e7ff]">
              <thead>
                <tr className="bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white">
                  <th className="px-3 py-3 text-left text-sm font-extrabold">Student</th>
                  <th className="px-3 py-3 text-center text-sm font-extrabold">Quiz 1 (/50)</th>
                  <th className="px-3 py-3 text-center text-sm font-extrabold">Quiz 2 (/50)</th>
                  <th className="px-3 py-3 text-center text-sm font-extrabold">Activity (/40)</th>
                  <th className="px-3 py-3 text-center text-sm font-extrabold">Exam (/100)</th>
                  <th className="px-3 py-3 text-center text-sm font-extrabold">Total (/240)</th>
                  <th className="px-3 py-3 text-center text-sm font-extrabold">GPA (%)</th>
                  <th className="px-3 py-3 text-center text-sm font-extrabold">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleScores.map((student, index) => {
                  const row = adjustedRows.find((rowData) => rowData.id === student.id) ?? {
                    ...student,
                    total: student.quiz1 + student.quiz2 + student.activity + student.exam,
                    gpa: ((student.quiz1 + student.quiz2 + student.activity + student.exam) / 240) * 100,
                    status: 'FAILED' as GradeStatus,
                  };

                  return (
                    <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#faf7ff]'}>
                      <td className="border-t border-[#f1e7ff] px-3 py-3 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ebff] text-xl shadow-sm">{student.emoji}</div>
                          <div>
                            <div className="text-sm font-bold text-[#1f2937]">{student.name}</div>
                            <div className="text-[11px] text-[#6b7280]">ID: {student.studentId}</div>
                          </div>
                        </div>
                      </td>

                      {(['quiz1', 'quiz2', 'activity', 'exam'] as const).map((field) => (
                        <td key={field} className="border-t border-[#f1e7ff] px-2 py-3 text-center align-middle">
                          <input
                            type="number"
                            min={0}
                            max={field === 'exam' ? 100 : field === 'activity' ? 40 : 50}
                            value={student[field]}
                            onChange={(event) => updateScore(student.id, field, event.target.value)}
                            className="w-[68px] rounded-[8px] border border-[#d9d4e8] bg-[#f9fafb] px-2 py-1.5 text-center text-sm font-semibold text-[#1f2937] outline-none transition focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
                          />
                        </td>
                      ))}

                      <td className="border-t border-[#f1e7ff] px-3 py-3 text-center align-middle">
                        <span className="text-lg font-extrabold text-[#7c3aed]">{row.total}</span>
                      </td>

                      <td className="border-t border-[#f1e7ff] px-3 py-3 text-center align-middle">
                        <span className={`text-lg font-extrabold ${row.gpa >= 75 ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>{row.gpa.toFixed(2)}%</span>
                      </td>

                      <td className="border-t border-[#f1e7ff] px-3 py-3 text-center align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-extrabold ${
                            row.status === 'PASSED' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-[12px] bg-[#f3f4f6] p-3">
            <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-[#1f2937]">
              <span className="inline-flex items-center gap-2">
                <span className="text-base">📊</span> Grading System
              </span>
              <span className="inline-flex items-center gap-2 text-[#166534]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" /> PASSED: 75% and above
              </span>
              <span className="inline-flex items-center gap-2 text-[#991b1b]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" /> FAILED: Below 75%
              </span>
            </div>
          </div>

          {saveMessage && (
            <div className="mt-4 rounded-[10px] border border-[#d0f4db] bg-[#ebfff2] px-3 py-2 text-sm font-semibold text-[#166534]">
              {saveMessage}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
