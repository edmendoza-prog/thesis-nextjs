'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Student = {
  id: number;
  name: string;
  email: string;
  emoji: string;
  classId: string;
};

const classOptions = [
  { id: 'grade-1-a', label: 'Grade 1 - Section A' },
  { id: 'grade-1-b', label: 'Grade 1 - Section B' },
  { id: 'grade-2-a', label: 'Grade 2 - Section A' },
  { id: 'grade-2-b', label: 'Grade 2 - Section B' },
  { id: 'grade-3-a', label: 'Grade 3 - Section A' },
];

const allStudents: Student[] = [
  { id: 1, name: 'Ava Carter', email: 'ava.carter@school.com', emoji: '🦊', classId: 'grade-1-a' },
  { id: 2, name: 'Leo Martin', email: 'leo.martin@school.com', emoji: '🦁', classId: 'grade-1-a' },
  { id: 3, name: 'Mila Patel', email: 'mila.patel@school.com', emoji: '🐸', classId: 'grade-1-a' },
  { id: 4, name: 'Noah Kim', email: 'noah.kim@school.com', emoji: '🐼', classId: 'grade-1-a' },
  { id: 5, name: 'Sophia Reed', email: 'sophia.reed@school.com', emoji: '🦄', classId: 'grade-1-b' },
  { id: 6, name: 'Ethan Ross', email: 'ethan.ross@school.com', emoji: '🐻', classId: 'grade-1-b' },
  { id: 7, name: 'Chloe Lee', email: 'chloe.lee@school.com', emoji: '🐰', classId: 'grade-1-b' },
  { id: 8, name: 'Lucas Hall', email: 'lucas.hall@school.com', emoji: '🦊', classId: 'grade-1-b' },
  { id: 9, name: 'Harper Cruz', email: 'harper.cruz@school.com', emoji: '🐼', classId: 'grade-2-a' },
  { id: 10, name: 'Jack Moore', email: 'jack.moore@school.com', emoji: '🦁', classId: 'grade-2-a' },
  { id: 11, name: 'Ella Scott', email: 'ella.scott@school.com', emoji: '🐸', classId: 'grade-2-a' },
  { id: 12, name: 'Owen Reed', email: 'owen.reed@school.com', emoji: '🦄', classId: 'grade-2-a' },
  { id: 13, name: 'Luna Brooks', email: 'luna.brooks@school.com', emoji: '🦊', classId: 'grade-2-b' },
  { id: 14, name: 'Mason Woods', email: 'mason.woods@school.com', emoji: '🐻', classId: 'grade-2-b' },
  { id: 15, name: 'Grace Young', email: 'grace.young@school.com', emoji: '🐰', classId: 'grade-2-b' },
  { id: 16, name: 'Daniel Price', email: 'daniel.price@school.com', emoji: '🦁', classId: 'grade-2-b' },
  { id: 17, name: 'Zoe Flores', email: 'zoe.flores@school.com', emoji: '🐸', classId: 'grade-3-a' },
  { id: 18, name: 'Henry Ward', email: 'henry.ward@school.com', emoji: '🦊', classId: 'grade-3-a' },
  { id: 19, name: 'Layla Stone', email: 'layla.stone@school.com', emoji: '🦄', classId: 'grade-3-a' },
  { id: 20, name: 'Wyatt Hunt', email: 'wyatt.hunt@school.com', emoji: '🐼', classId: 'grade-3-a' },
];

const initialEnrolled: Record<string, number[]> = {
  'grade-1-a': [1, 2],
  'grade-1-b': [5],
  'grade-2-a': [9, 10],
  'grade-2-b': [13],
  'grade-3-a': [17],
};

function Icon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  const common = className;

  switch (type) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M9 20v-7h6v7" />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
          <circle cx="9.5" cy="7" r="3.5" />
          <path d="M22 19v-1a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 5 5" />
        </svg>
      );
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'minus':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M5 12h14" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case 'save':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2Z" />
          <path d="M17 21v-8H7v8" />
          <path d="M7 3v5h8" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function StudentEnrollmentPage() {
  const [selectedClass, setSelectedClass] = useState('grade-1-a');
  const [search, setSearch] = useState('');
  const [enrolledMap, setEnrolledMap] = useState<Record<string, number[]>>(initialEnrolled);
  const [saveMessage, setSaveMessage] = useState('');

  const classLabel = classOptions.find((item) => item.id === selectedClass)?.label ?? 'Choose a class...';

  const currentAvailable = useMemo(() => {
    const enrolledIds = new Set(enrolledMap[selectedClass] ?? []);
    return allStudents.filter(
      (student) =>
        student.classId === selectedClass &&
        !enrolledIds.has(student.id) &&
        student.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [enrolledMap, search, selectedClass]);

  const currentEnrolled = useMemo(() => {
    const enrolledIds = new Set(enrolledMap[selectedClass] ?? []);
    return allStudents.filter(
      (student) => student.classId === selectedClass && enrolledIds.has(student.id),
    );
  }, [enrolledMap, selectedClass]);

  const handleAddStudent = (studentId: number) => {
    setEnrolledMap((prev) => ({
      ...prev,
      [selectedClass]: Array.from(new Set([...(prev[selectedClass] ?? []), studentId])),
    }));
    setSaveMessage('');
  };

  const handleRemoveStudent = (studentId: number) => {
    setEnrolledMap((prev) => ({
      ...prev,
      [selectedClass]: (prev[selectedClass] ?? []).filter((id) => id !== studentId),
    }));
    setSaveMessage('');
  };

  const handleSaveEnrollment = () => {
    setSaveMessage(`Enrollment saved for ${classLabel}.`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0ea86e_0%,#10d88a_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mb-6 flex items-center gap-3 text-white">
          <Link
            href="/dashboard"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1f2937] shadow-[0_10px_25px_rgba(7,83,53,0.2)] transition-transform hover:-translate-y-0.5"
            aria-label="Back to dashboard"
          >
            <Icon type="home" className="h-6 w-6 text-[#1f2937]" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f2348] text-white shadow-md">
              <Icon type="users" className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Student Enrollment</h1>
          </div>
        </header>

        <section className="mb-6 rounded-[20px] bg-white p-5 shadow-[0_18px_36px_rgba(10,108,77,0.15)] sm:p-6">
          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.08em] text-[#1f2937]">Select Class/Section</label>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(event) => {
                setSelectedClass(event.target.value);
                setSearch('');
                setSaveMessage('');
              }}
              className="w-full appearance-none rounded-[14px] border border-[#dfe7e3] bg-[#f8faf9] px-4 py-4 pr-12 text-base font-medium text-[#1f2937] shadow-inner outline-none transition focus:border-[#0ea86e] focus:ring-2 focus:ring-[#10d88a]/20"
            >
              {classOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#374151]">
              <Icon type="chevron-down" className="h-5 w-5" />
            </span>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[22px] bg-white p-5 shadow-[0_18px_36px_rgba(10,108,77,0.15)] sm:p-6">
            <h2 className="mb-4 text-2xl font-extrabold text-[#1f2937]">Available Students</h2>

            <div className="relative mb-4">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]">
                <Icon type="search" className="h-5 w-5" />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students..."
                className="w-full rounded-[12px] border border-[#dfe7e3] bg-[#f8faf9] py-3 pl-11 pr-3 text-base text-[#1f2937] outline-none transition focus:border-[#0ea86e] focus:ring-2 focus:ring-[#10d88a]/20"
              />
            </div>

            <div className="space-y-3">
              {currentAvailable.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-[#c7d7cf] bg-[#f6faf8] p-4 text-center text-[#4b5563]">
                  No available students match this search.
                </div>
              ) : (
                currentAvailable.map((student) => (
                  <div key={student.id} className="flex items-center justify-between gap-3 rounded-[12px] bg-[#f5f5f5] p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f4ff] text-2xl shadow-sm">
                        {student.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-bold text-[#1f2937]">{student.name}</div>
                        <div className="truncate text-xs text-[#6b7280]">{student.email}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddStudent(student.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e] text-white shadow-[0_8px_15px_rgba(34,197,94,0.25)] transition-transform hover:scale-105"
                      aria-label={`Add ${student.name}`}
                    >
                      <Icon type="plus" className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[22px] bg-white p-5 shadow-[0_18px_36px_rgba(10,108,77,0.15)] sm:p-6">
            <h2 className="mb-4 text-2xl font-extrabold text-[#1f2937]">Enrolled Students ({currentEnrolled.length})</h2>

            <div className="space-y-3">
              {currentEnrolled.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-[#bfe7d2] bg-[#f3fff7] p-4 text-center text-[#4b5563]">
                  No students enrolled in this class yet.
                </div>
              ) : (
                currentEnrolled.map((student) => (
                  <div key={student.id} className="flex items-center justify-between gap-3 rounded-[12px] border border-[#b7e7ca] bg-[#effdf5] p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f9ee] text-2xl shadow-sm">
                        {student.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-bold text-[#1f2937]">{student.name}</div>
                        <div className="truncate text-xs text-[#6b7280]">{student.email}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(student.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ef4444] text-white shadow-[0_8px_15px_rgba(239,68,68,0.25)] transition-transform hover:scale-105"
                      aria-label={`Remove ${student.name}`}
                    >
                      <Icon type="x" className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveEnrollment}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#16a34a] to-[#10d88a] px-4 py-3 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(34,197,94,0.25)] transition-transform hover:-translate-y-0.5"
            >
              <Icon type="save" className="h-4 w-4" />
              Save Enrollment
            </button>

            {saveMessage && (
              <div className="mt-3 rounded-[12px] border border-[#b7e7ca] bg-[#ebfff2] px-3 py-2 text-sm font-semibold text-[#0f6b43]">
                {saveMessage}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
