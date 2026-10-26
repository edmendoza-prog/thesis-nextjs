'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserAvatar from '@/app/components/UserAvatar';

type Student = {
  id: number;
  name: string;
  email: string;
  studentNumber: string | null;
  avatarSeed: string;
  createdAt: string | null;
  hearts: number;
  stars?: number;
  lifeSpan: number;
  enrolledClasses: string;
  enrolledClassesCount: number;
};

type Stats = {
  totalRegistered: number;
  totalEnrolled: number;
  notEnrolled: number;
  averageLifeSpan: number;
  averageHearts: number;
  averageStars?: number;
};

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRegistered: 0,
    totalEnrolled: 0,
    notEnrolled: 0,
    averageLifeSpan: 100,
    averageHearts: 5,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStanding, setFilterStanding] = useState<'all' | '5' | '4' | '3' | 'low'>('all');
  const [filterEnrollment, setFilterEnrollment] = useState<'all' | 'enrolled' | 'not-enrolled'>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeMenuStudentId, setActiveMenuStudentId] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuStudentId(null);
    if (activeMenuStudentId !== null) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenuStudentId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/students', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        setStudents(
          (data.students || []).map((s: any) => {
            const hVal = typeof s.hearts === 'number' ? s.hearts : typeof s.stars === 'number' ? s.stars : s.lifeSpan ? Math.max(1, Math.min(5, Math.round(s.lifeSpan / 20))) : 5;
            return {
              ...s,
              hearts: hVal,
              stars: hVal,
            };
          })
        );
        if (data.stats) {
          const avgH = data.stats.averageHearts ?? data.stats.averageStars ?? (data.stats.averageLifeSpan ? Math.round((data.stats.averageLifeSpan / 20) * 10) / 10 : 5);
          setStats({
            ...data.stats,
            averageHearts: avgH,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleUpdateHearts = async (studentId: number, delta: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const oldHearts = student.hearts ?? 5;
    const newHearts = Math.max(1, Math.min(5, oldHearts + delta));
    if (newHearts === oldHearts) return;

    // Optimistic UI update
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, hearts: newHearts, stars: newHearts, lifeSpan: newHearts * 20 } : s))
    );

    try {
      setUpdatingId(studentId);
      const res = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, stars: newHearts }),
      });
      if (res.status === 401) {
        showToast('Your session has expired. Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login/teacher';
        }, 1200);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        // Refresh average stat silently without popup toast
        setStats((prev) => {
          const totalHearts = students.reduce(
            (acc, curr) => (curr.id === studentId ? acc + newHearts : acc + (curr.hearts ?? 5)),
            0
          );
          return {
            ...prev,
            averageHearts: students.length ? Math.round((totalHearts / students.length) * 10) / 10 : 5,
          };
        });
      } else {
        // Rollback
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, hearts: oldHearts, stars: oldHearts } : s))
        );
        showToast(data.error || 'Failed to update student hearts');
      }
    } catch (err) {
      // Rollback
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, hearts: oldHearts, stars: oldHearts } : s))
      );
      console.error('Update hearts error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetExactHearts = async (studentId: number, heartCount: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const clamped = Math.max(1, Math.min(5, Math.round(heartCount)));
    const oldHearts = student.hearts ?? 5;
    if (clamped === oldHearts) return;

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, hearts: clamped, stars: clamped, lifeSpan: clamped * 20 } : s))
    );

    try {
      setUpdatingId(studentId);
      const res = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, stars: clamped }),
      });
      if (res.status === 401) {
        showToast('Your session has expired. Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login/teacher';
        }, 1200);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, hearts: oldHearts, stars: oldHearts } : s))
        );
        showToast(data.error || 'Failed to update student hearts');
      }
    } catch (err) {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, hearts: oldHearts, stars: oldHearts } : s))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentNumber && s.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.enrolledClasses.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEnrollment =
      filterEnrollment === 'all' ||
      (filterEnrollment === 'enrolled' && s.enrolledClassesCount > 0) ||
      (filterEnrollment === 'not-enrolled' && s.enrolledClassesCount === 0);

    const heartsVal = s.hearts ?? 5;
    const matchesStanding =
      filterStanding === 'all' ||
      (filterStanding === '5' && heartsVal === 5) ||
      (filterStanding === '4' && heartsVal === 4) ||
      (filterStanding === '3' && heartsVal === 3) ||
      (filterStanding === 'low' && heartsVal <= 2);

    return matchesSearch && matchesEnrollment && matchesStanding;
  });

  const getHeartBadgeInfo = (hearts: number) => {
    if (hearts >= 5) {
      return {
        text: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        status: '5 Hearts • Full Life',
        icon: 'ri-heart-fill text-rose-500',
      };
    }
    if (hearts === 4) {
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        status: '4 Hearts • High Life',
        icon: 'ri-heart-fill text-emerald-500',
      };
    }
    if (hearts === 3) {
      return {
        text: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        status: '3 Hearts • Normal Life',
        icon: 'ri-heart-fill text-blue-500',
      };
    }
    if (hearts === 2) {
      return {
        text: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        status: '2 Hearts • Low Life',
        icon: 'ri-heart-line text-orange-500',
      };
    }
    return {
      text: 'text-rose-700',
      bg: 'bg-rose-100',
      border: 'border-rose-300',
      status: '1 Heart • Critical Life',
      icon: 'ri-heart-broken-line text-rose-600',
    };
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-fadeInUp">
          <i className="ri-information-line text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-600">
            Student Management
          </p>
          <h1 className="font-heading text-3xl font-bold text-foreground-900 flex items-center gap-2">
            <span>Students & Life</span>
            <span className="text-rose-500 text-2xl">❤️</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/student-enrollment"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-accent-700"
          >
            <i className="ri-user-add-line" />
            Enroll in Classes
          </Link>
          <button
            type="button"
            onClick={fetchStudents}
            className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-sm font-bold text-foreground-700 shadow-xs transition hover:bg-background-100"
          >
            <i className="ri-refresh-line" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-primary-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground-500">
              Accounts Created
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <i className="ri-user-star-line text-lg" />
            </span>
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-foreground-900">
            {stats.totalRegistered}
          </p>
          <p className="mt-1 text-xs text-foreground-500">Total registered students</p>
        </div>

        <div className="rounded-2xl border border-primary-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground-500">
              Enrolled in Classes
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <i className="ri-school-line text-lg" />
            </span>
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-foreground-900">
            {stats.totalEnrolled}
          </p>
          <p className="mt-1 text-xs text-foreground-500">Actively assigned to classes</p>
        </div>

        <div className="rounded-2xl border border-primary-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground-500">
              Not Enrolled Yet
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <i className="ri-user-unfollow-line text-lg" />
            </span>
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-foreground-900">
            {stats.notEnrolled}
          </p>
          <p className="mt-1 text-xs text-foreground-500">Awaiting class assignment</p>
        </div>

        <div className="rounded-2xl border border-primary-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground-500">
              Avg. Life (Hearts)
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <i className="ri-heart-fill text-lg" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold text-foreground-900 flex items-center gap-1">
              <span>{stats.averageHearts ?? 5.0}</span>
              <span className="text-base text-slate-400 font-normal">/ 5.0</span>
            </span>
            <span className="text-xs font-bold text-rose-600">Hearts</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-rose-500 text-sm">
            {[1, 2, 3, 4, 5].map((hIdx) => (
              <i
                key={hIdx}
                className={
                  hIdx <= Math.round(stats.averageHearts ?? 5)
                    ? 'ri-heart-fill text-rose-500'
                    : 'ri-heart-line text-slate-300'
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, email, student number, or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Enrollment Filter */}
          <select
            value={filterEnrollment}
            onChange={(e) => setFilterEnrollment(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 focus:border-indigo-500"
          >
            <option value="all">All Enrollment ({students.length})</option>
            <option value="enrolled">Enrolled Only ({students.filter((s) => s.enrolledClassesCount > 0).length})</option>
            <option value="not-enrolled">Not Enrolled ({students.filter((s) => s.enrolledClassesCount === 0).length})</option>
          </select>

          {/* Life Hearts Filter */}
          <select
            value={filterStanding}
            onChange={(e) => setFilterStanding(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 focus:border-indigo-500"
          >
            <option value="all">All Life (1–5 ❤️)</option>
            <option value="5">5 Hearts • Full Life ({students.filter((s) => (s.hearts ?? 5) === 5).length})</option>
            <option value="4">4 Hearts • High Life ({students.filter((s) => (s.hearts ?? 5) === 4).length})</option>
            <option value="3">3 Hearts • Normal Life ({students.filter((s) => (s.hearts ?? 5) === 3).length})</option>
            <option value="low">1–2 Hearts • Low / Critical ({students.filter((s) => (s.hearts ?? 5) <= 2).length})</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-sm font-semibold text-slate-400">
            <i className="ri-loader-4-line mr-2 inline-block animate-spin text-lg text-accent-600" />
            Loading student accounts...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <i className="ri-user-search-line text-2xl" />
            </div>
            <p className="mt-3 font-heading text-lg font-bold text-foreground-800">
              No students found
            </p>
            <p className="mt-1 text-sm text-foreground-500">
              {searchTerm || filterStanding !== 'all' || filterEnrollment !== 'all'
                ? 'Try adjusting your search query or filters.'
                : 'No student accounts have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-primary-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Enrolled Class</th>
                  <th className="px-6 py-4 min-w-[240px]">Life (Max 5 ❤️)</th>
                  <th className="px-6 py-4 text-right font-bold tracking-widest text-sm">...</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-foreground-800">
                {filteredStudents.map((student) => {
                  const studentHearts = student.hearts ?? 5;
                  const badge = getHeartBadgeInfo(studentHearts);
                  const isUpdating = updatingId === student.id;

                  return (
                    <tr
                      key={student.id}
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      {/* Student Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-2xs">
                            <UserAvatar seed={student.avatarSeed} size={40} className="h-full w-full" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground-900 truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-foreground-500 truncate">
                              {student.email}
                            </p>
                            {student.studentNumber && (
                              <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                                ID: {student.studentNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Enrolled Classes */}
                      <td className="px-6 py-4">
                        {student.enrolledClassesCount > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                              <i className="ri-book-read-line text-accent-600" />
                              {student.enrolledClasses}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600">
                              ✓ Enrolled ({student.enrolledClassesCount} {student.enrolledClassesCount === 1 ? 'class' : 'classes'})
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                            <i className="ri-indeterminate-circle-line" />
                            Not enrolled yet
                          </span>
                        )}
                      </td>

                      {/* Life Hearts Display & Direct Heart Rating Click */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            {/* Clickable 5 Hearts */}
                            <div className="inline-flex items-center gap-1 rounded-xl bg-rose-50/80 px-2.5 py-1 border border-rose-200/60 shadow-xs">
                              {[1, 2, 3, 4, 5].map((heartNum) => (
                                <button
                                  key={heartNum}
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleSetExactHearts(student.id, heartNum)}
                                  title={`Set life to ${heartNum} Hearts`}
                                  className="group p-0.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                                >
                                  <i
                                    className={`text-lg transition-colors ${
                                      heartNum <= studentHearts
                                        ? 'ri-heart-fill text-rose-500 drop-shadow-xs'
                                        : 'ri-heart-line text-slate-300 group-hover:text-rose-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>

                            <span className="ml-1 text-xs font-bold text-slate-800">
                              {studentHearts} / 5 ❤️
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
                              <i className={badge.icon} />
                              {badge.status}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action Column: Minus and Plus Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Minus Button */}
                          <button
                            type="button"
                            disabled={isUpdating || studentHearts <= 1}
                            onClick={() => handleUpdateHearts(student.id, -1)}
                            title="Deduct 1 Life Heart"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-base font-bold text-rose-600 shadow-2xs transition hover:bg-rose-100 hover:border-rose-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            −
                          </button>

                          {/* Plus Button */}
                          <button
                            type="button"
                            disabled={isUpdating || studentHearts >= 5}
                            onClick={() => handleUpdateHearts(student.id, 1)}
                            title="Add 1 Life Heart"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-base font-bold text-emerald-600 shadow-2xs transition hover:bg-emerald-100 hover:border-emerald-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
