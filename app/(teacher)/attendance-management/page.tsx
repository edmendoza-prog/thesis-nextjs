'use client';

import { useState, useMemo, useEffect } from 'react';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | null;

type StudentRecord = { id: number; name: string; email?: string; emoji?: string };

function Icon({ type, className = "h-5 w-5" }: { type: string; className?: string }) {
  switch (type) {
    case 'calendar':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case 'search':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
    case 'check':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5" /></svg>;
    case 'x':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18M6 6l12 12" /></svg>;
    case 'clock':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
    case 'file':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>;
    case 'save':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>;
    default:
      return null;
  }
}

export default function AttendanceManagementPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAttendanceData() {
      try {
        const response = await fetch(`/api/teacher/attendance?classId=1&date=${selectedDate}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load attendance');
        setStudents((data.students ?? []).map((student: StudentRecord) => ({ ...student, emoji: student.emoji ?? '🎓' })));
        setAttendance(data.attendance ?? {});
      } catch (error) {
        console.error('Attendance fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAttendanceData();
  }, [selectedDate]);

  const stats = useMemo(() => {
    const present = Object.values(attendance).filter(s => s === 'present').length;
    const absent = Object.values(attendance).filter(s => s === 'absent').length;
    const late = Object.values(attendance).filter(s => s === 'late').length;
    const excused = Object.values(attendance).filter(s => s === 'excused').length;
    const rate = students.length > 0 ? ((present / students.length) * 100).toFixed(1) : '0.0';
    
    return { total: students.length, present, absent, late, excused, rate };
  }, [attendance, students]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = (studentId: number, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const payload = {
        action: 'save',
        classId: 1,
        date: selectedDate,
        attendance: students.map((student) => ({
          student_id: student.id,
          status: attendance[student.id] ?? 'present',
        })),
      };

      const response = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save attendance');
      alert('Attendance saved successfully');
    } catch (error) {
      console.error('Save attendance error:', error);
      alert(error instanceof Error ? error.message : 'Unable to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-700 flex items-center justify-center">
            <Icon type="calendar" className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground-900">Attendance Management</h1>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 rounded-xl border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body"
        />
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-background-50 rounded-2xl border border-background-200/70 p-5 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="text-4xl font-bold text-foreground-900 font-heading mb-1">{stats.total}</div>
          <div className="text-sm text-foreground-600 font-body">Total Students</div>
        </div>
        <div className="bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl p-5 text-white animate-fadeInUp" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Icon type="check" className="h-4 w-4" />
            </div>
          </div>
          <div className="text-4xl font-bold font-heading mb-1">{stats.present}</div>
          <div className="text-sm font-body">Present</div>
        </div>
        <div className="bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-2xl p-5 text-white animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Icon type="x" className="h-4 w-4" />
            </div>
          </div>
          <div className="text-4xl font-bold font-heading mb-1">{stats.absent}</div>
          <div className="text-sm font-body">Absent</div>
        </div>
        <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-2xl p-5 text-white animate-fadeInUp" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Icon type="clock" className="h-4 w-4" />
            </div>
          </div>
          <div className="text-4xl font-bold font-heading mb-1">{stats.late}</div>
          <div className="text-sm font-body">Late</div>
        </div>
        <div className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl p-5 text-white animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Icon type="file" className="h-4 w-4" />
            </div>
          </div>
          <div className="text-4xl font-bold font-heading mb-1">{stats.excused}</div>
          <div className="text-sm font-body">Excused</div>
        </div>
      </section>

      {/* Attendance Rate */}
      <section className="bg-background-50 rounded-2xl border border-background-200/70 p-5 mb-6 animate-fadeInUp" style={{ animationDelay: '350ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-lg text-foreground-900">Attendance Rate</h2>
          <span className="text-3xl font-heading font-bold text-accent-600">{stats.rate}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-background-200 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all duration-500"
            style={{ width: `${stats.rate}%` }}
          />
        </div>
      </section>

      {/* Search */}
      <section className="bg-background-50 rounded-2xl border border-background-200/70 p-4 mb-6 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
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

      {/* Student List */}
      <section className="bg-background-50 rounded-2xl border border-background-200/70 p-6 animate-fadeInUp" style={{ animationDelay: '450ms' }}>
        <h2 className="font-heading font-bold text-2xl text-foreground-900 mb-5">Mark Attendance</h2>
        {loading ? (
          <div className="text-sm text-foreground-500 font-body">Loading attendance...</div>
        ) : (
        <div className="space-y-3 mb-6">
          {filteredStudents.map((student) => {
            const status = attendance[student.id];
            return (
              <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-background-100 hover:bg-background-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-2xl">
                    {student.emoji}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground-900 font-body">{student.name}</div>
                    <div className="text-xs text-foreground-600 font-body">ID: {student.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(student.id, 'present')}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      status === 'present'
                        ? 'bg-[#16a34a] text-white ring-2 ring-[#16a34a]'
                        : 'bg-background-200 text-foreground-600 hover:bg-background-300'
                    }`}
                  >
                    <Icon type="check" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => updateStatus(student.id, 'absent')}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      status === 'absent'
                        ? 'bg-[#ef4444] text-white ring-2 ring-[#ef4444]'
                        : 'bg-background-200 text-foreground-600 hover:bg-background-300'
                    }`}
                  >
                    <Icon type="x" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => updateStatus(student.id, 'late')}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      status === 'late'
                        ? 'bg-[#f97316] text-white ring-2 ring-[#f97316]'
                        : 'bg-background-200 text-foreground-600 hover:bg-background-300'
                    }`}
                  >
                    <Icon type="clock" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => updateStatus(student.id, 'excused')}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      status === 'excused'
                        ? 'bg-primary-500 text-white ring-2 ring-primary-500'
                        : 'bg-background-200 text-foreground-600 hover:bg-background-300'
                    }`}
                  >
                    <Icon type="file" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
        <button
          type="button"
          onClick={saveAttendance}
          disabled={saving}
          className="w-full py-4 bg-accent-500 text-white font-bold rounded-2xl transition-all duration-300 hover:bg-accent-600 hover:scale-[1.01] font-body flex items-center justify-center gap-3 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon type="save" className="h-5 w-5" />
          {saving ? 'Saving Attendance...' : 'Save Attendance'}
        </button>
      </section>
    </div>
  );
}
