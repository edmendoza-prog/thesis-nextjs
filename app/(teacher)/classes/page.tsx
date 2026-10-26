'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AttendanceCell = {
  date?: string;
  status?: string;
  attended: boolean;
};

type AssessmentCell = {
  id: number;
  title: string;
  percentage?: number;
  score?: number;
  maxScore?: number;
};

type StudentRecord = {
  id: string;
  userId?: number;
  name: string;
  percentage: number;
  status: 'Good' | 'Needs Improvement' | 'Excellent';
  attendance: AttendanceCell[];
  assessments: AssessmentCell[];
};

type SectionItem = {
  id: string;
  name: string;
  count: number;
  lessonCount?: number;
  homeworkCount?: number;
  students: StudentRecord[];
  activities: AssessmentCell[];
};

type ClassGroup = {
  name: string;
  totalCount: number;
  sections: SectionItem[];
};

type ModalState = {
  kind: 'class' | 'section' | 'student';
  action: 'add' | 'edit' | 'delete';
  className?: string;
  sectionId?: string;
  studentId?: string;
  studentUserId?: number;
  currentName?: string;
  currentSection?: string;
};

function Icon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  switch (type) {
    case 'users':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'folder':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l1.5 2H18.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z" />
        </svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10M6 10h10" />
        </svg>
      );
    case 'target':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'edit':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      );
    case 'trash':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      );
    case 'table':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
      );
    case 'award':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      );
    case 'check-circle':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ClassesAndSectionsPage() {
  const router = useRouter();
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [availableStudentDirectory, setAvailableStudentDirectory] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modal, setModal] = useState<ModalState | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalSection, setModalSection] = useState('Section A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async (preferredClassName?: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/teacher/grades', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.grades)) return;

      const groupMap = new Map<string, ClassGroup>();
      for (const grade of data.grades) {
        const cName = String(grade.name || 'Grade 1').trim();
        const sName = String(grade.section || grade.sections?.[0]?.name || 'Main Section').trim();
        const studentList: StudentRecord[] = Array.isArray(grade.sections?.[0]?.studentList)
          ? grade.sections[0].studentList
          : [];
        const activities: AssessmentCell[] = Array.isArray(grade.sections?.[0]?.activities)
          ? grade.sections[0].activities
          : [];
        const sectionItem: SectionItem = {
          id: String(grade.id),
          name: sName,
          count: Number(grade.students ?? studentList.length ?? 0),
          lessonCount: Number(grade.sections?.[0]?.lessonCount ?? 0),
          homeworkCount: Number(grade.sections?.[0]?.homeworkCount ?? activities.length ?? 0),
          students: studentList,
          activities,
        };

        if (!groupMap.has(cName)) {
          groupMap.set(cName, {
            name: cName,
            totalCount: 0,
            sections: [],
          });
        }
        const group = groupMap.get(cName)!;
        group.sections.push(sectionItem);
        group.totalCount += sectionItem.count;
      }

      const groups = Array.from(groupMap.values());
      setClassGroups(groups);
      setAvailableStudentDirectory(Array.isArray(data.availableStudents) ? data.availableStudents : []);
    } catch (error) {
      console.error('Failed to load class groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalClasses = classGroups.length;
  const totalSections = classGroups.reduce((acc, g) => acc + g.sections.length, 0);
  const totalStudents = classGroups.reduce((acc, g) => acc + g.totalCount, 0);
  const totalActivitiesCount = classGroups.reduce((acc, g) => {
    return acc + g.sections.reduce((sAcc, sec) => sAcc + (sec.activities?.length || 0), 0);
  }, 0);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return classGroups;
    const query = searchTerm.toLowerCase();
    return classGroups
      .map((g) => {
        const matchesGroupName = g.name.toLowerCase().includes(query);
        const matchingSections = g.sections.filter(
          (s) => s.name.toLowerCase().includes(query) || matchesGroupName
        );
        if (matchesGroupName || matchingSections.length > 0) {
          return {
            ...g,
            sections: matchesGroupName ? g.sections : matchingSections,
          };
        }
        return null;
      })
      .filter((g): g is ClassGroup => g !== null);
  }, [classGroups, searchTerm]);

  const openModal = (nextModal: ModalState) => {
    setModal(nextModal);
    if (nextModal.action === 'edit') {
      setModalName(nextModal.currentName || '');
    } else {
      setModalName('');
      setModalSection('Section A');
    }
  };

  const handleModalSubmit = async () => {
    if (!modal) return;
    setIsSubmitting(true);

    try {
      if (modal.action === 'delete') {
        if (modal.kind === 'class' && modal.className) {
          const res = await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete-class-group', name: modal.className }),
          });
          const data = await res.json();
          if (!res.ok) {
            alert(data.error || 'Failed to delete class');
            return;
          }
          await loadData();
          setModal(null);
          return;
        }

        if (modal.kind === 'section' && modal.sectionId) {
          const res = await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete-class', id: Number(modal.sectionId) }),
          });
          const data = await res.json();
          if (!res.ok) {
            alert(data.error || 'Failed to delete section');
            return;
          }
          await loadData(modal.className);
          setModal(null);
          return;
        }
      }

      if (!modalName.trim()) return;

      if (modal.kind === 'class') {
        if (modal.action === 'add') {
          const sectionVal = modalSection.trim() || 'Section A';
          const res = await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create-class',
              name: modalName.trim(),
              section: sectionVal,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            alert(data.error || 'Failed to create class');
            return;
          }
          await loadData(modalName.trim());
        } else if (modal.className) {
          const res = await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update-class-name', oldName: modal.className, name: modalName.trim() }),
          });
          const data = await res.json();
          if (!res.ok) {
            alert(data.error || 'Failed to update class name');
            return;
          }
          await loadData(modalName.trim());
        }
      } else if (modal.kind === 'section') {
        if (modal.action === 'add' && modal.className) {
          const res = await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add-section', name: modal.className, section: modalName.trim() }),
          });
          const data = await res.json();
          if (!res.ok) {
            alert(data.error || 'Failed to add section');
            return;
          }
          await loadData(modal.className);
        } else if (modal.action === 'edit' && modal.sectionId) {
          const res = await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update-section', id: Number(modal.sectionId), section: modalName.trim() }),
          });
          const data = await res.json();
          if (!res.ok) {
            alert(data.error || 'Failed to update section');
            return;
          }
          await loadData(modal.className);
        }
      }
      setModal(null);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenClassRecord = (className: string, sectionId: string) => {
    router.push(`/grades?class=${encodeURIComponent(className)}&section=${encodeURIComponent(sectionId)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Executive Header */}
        <header className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 h-48 w-48 bg-gradient-to-bl from-indigo-100/60 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  Official Grading &amp; Academic Records
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
                  AY 2025–2026
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Class Record Workspace
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Icon type="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search class or section..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition shadow-2xs"
                />
              </div>

              {/* Add Class Button */}
              <button
                type="button"
                onClick={() => openModal({ kind: 'class', action: 'add' })}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Icon type="plus" className="h-4 w-4" />
                <span>Add Class Level</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3.5 p-2 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Icon type="folder" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Class Levels</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{totalClasses}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Icon type="table" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Section Folders</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{totalSections}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Icon type="users" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Enrolled Learners</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{totalStudents}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs">
                <Icon type="award" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Grading Items</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{totalActivitiesCount}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Classes Groups and Section Folders Grid */}
        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent mb-3" />
            <p className="text-sm font-bold text-slate-700">Loading Class Record Workspace...</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving official sections, rosters, and activity logs</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-xs">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Icon type="folder" className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {classGroups.length === 0 ? 'No Classes Created Yet' : 'No Matching Sections Found'}
            </h3>
            <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed">
              {classGroups.length === 0
                ? 'Create your first classroom grade level to begin setting up section folders, enrolling learners, and entering marks.'
                : 'No sections or classes match your search query. Try typing another class or section name.'}
            </p>
            {classGroups.length === 0 && (
              <button
                type="button"
                onClick={() => openModal({ kind: 'class', action: 'add' })}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition cursor-pointer"
              >
                <Icon type="plus" className="h-4 w-4" />
                <span>Create First Class Level</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {filteredGroups.map((group) => (
              <section key={group.name} className="space-y-5 rounded-3xl border border-slate-200/90 bg-white/70 backdrop-blur-xs p-6 sm:p-7 shadow-xs">
                {/* Class Group Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-base shadow-sm">
                      <Icon type="folder" className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {group.name}
                        </h2>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                          {group.sections.length} {group.sections.length === 1 ? 'Section' : 'Sections'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {group.totalCount} Total Enrolled Learners in this Level
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openModal({ kind: 'section', action: 'add', className: group.name })}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100/80 transition cursor-pointer"
                    >
                      <Icon type="plus" className="h-3.5 w-3.5" />
                      <span>Add Section</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => openModal({ kind: 'class', action: 'edit', className: group.name, currentName: group.name })}
                      title="Edit class level name"
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
                    >
                      <Icon type="edit" className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openModal({ kind: 'class', action: 'delete', className: group.name })}
                      title="Delete class level"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer border border-transparent hover:border-rose-100"
                    >
                      <Icon type="trash" className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Section Folder Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.sections.map((section) => (
                    <div
                      key={section.id}
                      onClick={() => handleOpenClassRecord(group.name, section.id)}
                      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer"
                    >
                      {/* Top Header Row */}
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50/90 border border-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            {section.name}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                              <Icon type="users" className="h-3.5 w-3.5 text-slate-400" />
                              <span>{section.count}</span>
                            </span>

                            {/* Section Menu Options */}
                            <div
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  openModal({
                                    kind: 'section',
                                    action: 'edit',
                                    className: group.name,
                                    sectionId: section.id,
                                    currentName: section.name,
                                  })
                                }
                                title="Edit section name"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                              >
                                <Icon type="edit" className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  openModal({
                                    kind: 'section',
                                    action: 'delete',
                                    className: group.name,
                                    sectionId: section.id,
                                    currentName: section.name,
                                  })
                                }
                                title="Delete section"
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              >
                                <Icon type="trash" className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Title & Section Subhead */}
                        <div className="mt-4">
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition tracking-tight">
                            {group.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 mt-1">
                            Official Class Record &amp; Grade Sheet
                          </p>
                        </div>
                      </div>

                      {/* Middle Details & Student preview */}
                      <div className="my-5 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-bold text-indigo-600 bg-indigo-50/60 px-2.5 py-1.5 rounded-xl">
                            <Icon type="book" className="h-4 w-4" />
                            <span>{section.lessonCount ?? 0} Lessons</span>
                          </div>

                          <div className="flex items-center gap-2 font-bold text-violet-600 bg-violet-50/60 px-2.5 py-1.5 rounded-xl">
                            <Icon type="target" className="h-4 w-4" />
                            <span>{section.homeworkCount ?? section.activities?.length ?? 0} Activities</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition">
                          Open Gradebook
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                          <Icon type="arrow-right" className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Section Quick Card */}
                  <div
                    onClick={() => openModal({ kind: 'section', action: 'add', className: group.name })}
                    className="flex flex-col items-center justify-center min-h-[220px] rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                      <Icon type="plus" className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-600 transition">
                      Add Section to {group.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400 max-w-[200px]">
                      Create new classroom section folder &amp; gradebook
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Modal Dialog */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    modal.action === 'delete' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <Icon type={modal.action === 'delete' ? 'trash' : 'folder'} className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    {modal.action === 'delete'
                      ? `Delete ${modal.kind === 'class' ? 'Class Level' : 'Section Folder'}`
                      : modal.action === 'edit'
                      ? `Edit ${modal.kind === 'class' ? 'Class Name' : 'Section Name'}`
                      : `Add ${modal.kind === 'class' ? 'New Class Level' : 'New Section Folder'}`}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <Icon type="x" className="h-4 w-4" />
                </button>
              </div>

              <div className="py-5 space-y-4">
                {modal.action === 'delete' ? (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Are you sure you want to permanently delete{' '}
                    <strong className="text-slate-900">
                      {modal.currentName || modal.className || 'this item'}
                    </strong>
                    ? This will remove all associated gradebook records and attendance logs.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        {modal.kind === 'class' ? 'Class Level Name' : 'Section Name'}
                      </label>
                      <input
                        type="text"
                        value={modalName}
                        onChange={(e) => setModalName(e.target.value)}
                        placeholder={modal.kind === 'class' ? 'e.g. Grade 1, Grade 7, Grade 11' : 'e.g. Section Emerald, Section A'}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                        autoFocus
                      />
                    </div>

                    {modal.kind === 'class' && modal.action === 'add' && (
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Initial Section Name
                        </label>
                        <input
                          type="text"
                          value={modalSection}
                          onChange={(e) => setModalSection(e.target.value)}
                          placeholder="e.g. Section Apple, Section 1"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleModalSubmit}
                  className={`rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-sm disabled:opacity-50 cursor-pointer ${
                    modal.action === 'delete'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : modal.action === 'delete' ? 'Confirm Delete' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
