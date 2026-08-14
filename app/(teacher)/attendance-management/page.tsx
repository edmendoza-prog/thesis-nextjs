'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

type Student = {
  id: number;
  name: string;
  emoji: string;
  studentId: number;
};

const students: Student[] = [
  { id: 1, name: 'Ava Carter', emoji: '🦊', studentId: 101 },
  { id: 2, name: 'Leo Martin', emoji: '🦁', studentId: 102 },
  { id: 3, name: 'Mila Patel', emoji: '🐸', studentId: 103 },
  { id: 4, name: 'Noah Kim', emoji: '🐼', studentId: 104 },
  { id: 5, name: 'Sophia Reed', emoji: '🦄', studentId: 105 },
  { id: 6, name: 'Ethan Ross', emoji: '🐻', studentId: 106 },
];

const statusMeta = {
  present: { label: 'Present', color: 'bg-[#22c55e]', active: 'bg-[#22c55e] text-white border-[#22c55e]', inactive: 'border-[#d1d5db] bg-white text-[#6b7280]' },
  absent: { label: 'Absent', color: 'bg-[#ef4444]', active: 'bg-[#ef4444] text-white border-[#ef4444]', inactive: 'border-[#d1d5db] bg-white text-[#6b7280]' },
  late: { label: 'Late', color: 'bg-[#f59e0b]', active: 'bg-[#f59e0b] text-white border-[#f59e0b]', inactive: 'border-[#d1d5db] bg-white text-[#6b7280]' },
  excused: { label: 'Excused', color: 'bg-[#3b82f6]', active: 'bg-[#3b82f6] text-white border-[#3b82f6]', inactive: 'border-[#d1d5db] bg-white text-[#6b7280]' },
} as const;

const today = new Date();
const defaultDate = today.toISOString().slice(0, 10);

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
    case 'clipboard':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M9 3h6" />
          <path d="M9 3a2 2 0 0 0-2 2v1h8V5a2 2 0 0 0-2-2" />
          <rect x="5" y="5" width="14" height="16" rx="2" />
          <path d="M9 10h6M9 14h6" />
        </svg>
      );
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M8 2v4M16 2v4M3 10h18" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 5 5" />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="m7.5 12.5 3 3 6-7" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 8 8 8M16 8l-8 8" />
        </svg>
      );
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'file':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M9 13h6M9 17h6" />
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
    default:
      return null;
  }
}

export default function AttendanceManagementPage() {
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [search, setSearch] = useState('');
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({
    1: 'present',
    2: 'absent',
    3: 'late',
    4: 'present',
    5: 'excused',
    6: 'absent',
  });
  const [saveMessage, setSaveMessage] = useState('');

  const visibleStudents = useMemo(() => {
    return students.filter((student) => student.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const totalStudents = students.length;
  const presentCount = students.filter((student) => attendance[student.id] === 'present').length;
  const absentCount = students.filter((student) => attendance[student.id] === 'absent').length;
  const lateCount = students.filter((student) => attendance[student.id] === 'late').length;
  const excusedCount = students.filter((student) => attendance[student.id] === 'excused').length;
  const attendanceRate = totalStudents === 0 ? 0 : (presentCount / totalStudents) * 100;

  const updateStatus = (studentId: number, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setSaveMessage('');
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    setAttendance({
      1: 'present',
      2: 'absent',
      3: 'late',
      4: 'present',
      5: 'excused',
      6: 'absent',
    });
    setSaveMessage('');
  };

  const saveAttendance = () => {
    const dateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    setSaveMessage(`Attendance saved for ${dateLabel}.`);
  };

  const statCards = [
    { label: 'Total Students', value: totalStudents.toString(), tone: 'white', text: 'text-[#1f2937]', icon: null },
    { label: 'Present', value: presentCount.toString(), tone: 'bg-gradient-to-br from-[#22c55e] to-[#16a34a]', icon: 'check' },
    { label: 'Absent', value: absentCount.toString(), tone: 'bg-gradient-to-br from-[#ef4444] to-[#dc2626]', icon: 'x' },
    { label: 'Late', value: lateCount.toString(), tone: 'bg-gradient-to-br from-[#f97316] to-[#ea580c]', icon: 'clock' },
    { label: 'Excused', value: excusedCount.toString(), tone: 'bg-gradient-to-br from-[#3b82f6] to-[#2563eb]', icon: 'file' },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#38bdf8_0%,#3b82f6_52%,#6366f1_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1250px]">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-white">
            <Link
              href="/dashboard"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1f2937] shadow-[0_10px_25px_rgba(19,76,116,0.18)] transition-transform hover:-translate-y-0.5"
              aria-label="Back to dashboard"
            >
              <Icon type="home" className="h-6 w-6 text-[#1f2937]" />
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Attendance Management</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full bg-white/95 px-3 py-2 shadow-[0_10px_25px_rgba(15,35,82,0.15)]">
            <Icon type="calendar" className="h-5 w-5 text-[#1f2937]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => handleDateChange(event.target.value)}
              className="w-[170px] border-0 bg-transparent text-base font-semibold text-[#1f2937] outline-none"
              aria-label="Attendance date"
            />
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-5">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`flex min-h-[128px] flex-col items-center justify-center rounded-[16px] p-4 text-center shadow-[0_12px_25px_rgba(15,35,82,0.12)] ${card.tone} ${card.label === 'Total Students' ? 'bg-white text-[#1f2937]' : 'text-white'}`}
            >
              {card.icon && (
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Icon type={card.icon} className="h-4 w-4" />
                </div>
              )}
              <div className={`text-4xl font-extrabold leading-none ${card.label === 'Total Students' ? 'text-[#1f2937]' : 'text-white'}`}>
                {card.value}
              </div>
              <div className={`mt-2 text-sm font-semibold ${card.label === 'Total Students' ? 'text-[#374151]' : 'text-white/90'}`}>
                {card.label}
              </div>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-[20px] bg-white p-5 shadow-[0_14px_30px_rgba(15,35,82,0.12)]">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xl font-extrabold text-[#1f2937]">Attendance Rate</div>
            <div className="text-3xl font-extrabold text-[#16a34a]">{attendanceRate.toFixed(1)}%</div>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
            <div className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a]" style={{ width: `${attendanceRate}%` }} />
          </div>
        </section>

        <section className="mb-6 rounded-[20px] bg-white p-5 shadow-[0_14px_30px_rgba(15,35,82,0.12)]">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]">
              <Icon type="search" className="h-5 w-5" />
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students..."
              className="w-full rounded-[12px] border border-[#dfe7e3] bg-[#f8faf9] py-3 pl-11 pr-3 text-base text-[#1f2937] outline-none transition focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20"
            />
          </div>
        </section>

        <section className="rounded-[22px] bg-white p-5 shadow-[0_18px_36px_rgba(15,35,82,0.12)] sm:p-6">
          <h2 className="mb-5 text-3xl font-extrabold text-[#1f2937]">Mark Attendance</h2>

          <div className="space-y-3">
            {visibleStudents.map((student) => {
              const selectedStatus = attendance[student.id] ?? null;

              return (
                <div key={student.id} className="flex items-center justify-between gap-3 rounded-[12px] bg-[#f3f4f6] p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6eef9] text-2xl shadow-sm">
                      {student.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-bold text-[#1f2937]">{student.name}</div>
                      <div className="truncate text-xs text-[#6b7280]">ID: {student.studentId}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {Object.entries(statusMeta).map(([status, meta]) => {
                      const statusKey = status as AttendanceStatus;
                      const active = selectedStatus === statusKey;

                      return (
                        <button
                          key={status}
                          type="button"
                          aria-label={`${statusKey} for ${student.name}`}
                          onClick={() => updateStatus(student.id, statusKey)}
                          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                            active ? meta.active : meta.inactive
                          } hover:scale-105`}
                        >
                          <Icon
                            type={status === 'present' ? 'check' : status === 'absent' ? 'x' : status === 'late' ? 'clock' : 'file'}
                            className="h-4 w-4"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={saveAttendance}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#16a34a] to-[#10d88a] px-4 py-3 text-base font-extrabold text-white shadow-[0_14px_24px_rgba(22,163,74,0.25)] transition-transform hover:-translate-y-0.5"
          >
            <Icon type="save" className="h-4 w-4" />
            Save Attendance
          </button>

          {saveMessage && (
            <div className="mt-3 rounded-[12px] border border-[#b7e7ca] bg-[#ebfff2] px-3 py-2 text-sm font-semibold text-[#0f6b43]">
              {saveMessage}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
