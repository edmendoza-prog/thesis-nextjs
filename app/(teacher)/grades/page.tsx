'use client';

import Link from 'next/link';
import { useState } from 'react';

type Section = {
  name: string;
  students: number;
  activities: number;
};

type Grade = {
  id: number;
  title: string;
  sections: Section[];
};

const initialGrades: Grade[] = [
  {
    id: 1,
    title: 'Grade 1',
    sections: [
      { name: 'Section A', students: 25, activities: 8 },
      { name: 'Section B', students: 23, activities: 7 },
    ],
  },
  {
    id: 2,
    title: 'Grade 2',
    sections: [
      { name: 'Section A', students: 30, activities: 9 },
      { name: 'Section B', students: 27, activities: 6 },
    ],
  },
  {
    id: 3,
    title: 'Grade 3',
    sections: [
      { name: 'Section A', students: 21, activities: 5 },
      { name: 'Section B', students: 18, activities: 4 },
    ],
  },
];

function Icon({ type }: { type: string }) {
  const common = 'h-5 w-5';

  switch (type) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M9 20v-7h6v7" />
        </svg>
      );
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case 'folder':
      return <span className="text-xl">📁</span>;
    case 'pencil':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
        </svg>
      );
    case 'trash':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
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
    case 'sheet':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [expandedId, setExpandedId] = useState<number>(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newGradeName, setNewGradeName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [activeGradeId, setActiveGradeId] = useState<number | null>(null);

  const closeAddGradeModal = () => {
    setShowAddGradeModal(false);
    setNewGradeName('');
  };

  const closeAddSectionModal = () => {
    setShowAddSectionModal(false);
    setNewSectionName('');
    setActiveGradeId(null);
  };

  const handleAddGrade = () => {
    const trimmed = newGradeName.trim();
    if (!trimmed) return;

    const nextId = grades.length ? Math.max(...grades.map((g) => g.id)) + 1 : 1;
    setGrades((prev) => [
      {
        id: nextId,
        title: trimmed,
        sections: [{ name: 'Section A', students: 18, activities: 6 }],
      },
      ...prev,
    ]);
    setExpandedId(nextId);
    closeAddGradeModal();
  };

  const openAddSectionModal = (gradeId: number) => {
    setActiveGradeId(gradeId);
    setNewSectionName('');
    setShowAddSectionModal(true);
  };

  const handleAddSection = () => {
    const trimmed = newSectionName.trim();
    if (!trimmed || activeGradeId === null) return;

    setGrades((prev) =>
      prev.map((grade) =>
        grade.id === activeGradeId
          ? {
              ...grade,
              sections: [...grade.sections, { name: trimmed, students: 18, activities: 5 }],
            }
          : grade,
      ),
    );
    setExpandedId(activeGradeId);
    closeAddSectionModal();
  };

  const renameGrade = (gradeId: number) => {
    const grade = grades.find((g) => g.id === gradeId);
    if (!grade) return;

    const nextTitle = window.prompt('Rename grade', grade.title);
    if (!nextTitle) return;

    setGrades((prev) =>
      prev.map((item) =>
        item.id === gradeId
          ? { ...item, title: nextTitle.trim() || item.title }
          : item,
      ),
    );
  };

  const deleteGrade = (gradeId: number) => {
    if (pendingDeleteId !== gradeId) {
      setPendingDeleteId(gradeId);
      return;
    }

    setGrades((prev) => prev.filter((grade) => grade.id !== gradeId));
    setPendingDeleteId(null);
    if (expandedId === gradeId) setExpandedId(0);
  };

  const getActionButton = (label: string, onClick: () => void, accent: string, icon: string) => (
    <button
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full ${accent} text-white transition-transform duration-200 hover:scale-105`}
      aria-label={label}
      type="button"
    >
      {icon === 'plus' ? <Icon type="plus" /> : icon === 'pencil' ? <Icon type="pencil" /> : <Icon type="trash" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#a855f7_0%,#ec4899_52%,#fb923c_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[780px]">
        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-white">
            <Link
              href="/dashboard"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7b2ec7] text-white shadow-[0_10px_18px_rgba(60,18,110,0.28)] transition-transform hover:-translate-y-0.5"
              aria-label="Back to dashboard"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f0ecf8] shadow-inner">
                <div className="absolute left-1/2 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#7b2ec7]" />
                <div className="absolute bottom-1.5 h-3.5 w-5 rounded-full bg-[#7b2ec7]" />
                <div className="absolute top-1.5 h-2.5 w-2.5 rounded-full bg-[#f0ecf8]" />
                <div className="absolute bottom-0 h-1.5 w-6 rounded-t-[10px] bg-[#f4c986]" />
                <div className="absolute bottom-1.5 left-2 h-1.5 w-1.5 rounded-sm bg-[#f4c986]" />
                <div className="absolute bottom-1.5 right-2 h-1.5 w-1.5 rounded-sm bg-[#f4c986]" />
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">🏫</span>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2.1rem]">Grade & Section Management</h1>
            </div>
          </div>

          <button
            onClick={() => setShowAddGradeModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:-translate-y-0.5"
            type="button"
          >
            <span className="flex h-4 w-4 items-center justify-center">
              <Icon type="plus" />
            </span>
            Add Grade
          </button>
        </header>

        <div className="space-y-4">
          {grades.map((grade) => {
            const isExpanded = expandedId === grade.id;
            const isDeleting = pendingDeleteId === grade.id;

            return (
              <div
                key={grade.id}
                className="mx-auto w-full max-w-[760px] overflow-hidden rounded-[18px] bg-gradient-to-r from-[#8d3cf2] to-[#d946aa] p-3 text-white shadow-[0_14px_26px_rgba(97,44,155,0.22)] sm:p-4"
              >
                <div
                  className="flex cursor-pointer items-center gap-3"
                  onClick={() => setExpandedId(isExpanded ? 0 : grade.id)}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-md ${isExpanded ? 'border border-white/80 bg-white/10' : ''}`}>
                    <span className="text-white">
                      {isExpanded ? <Icon type="chevron-down" /> : <Icon type="chevron-right" />}
                    </span>
                  </div>

                  <span className="text-xl leading-none">📁</span>

                  <div className="min-w-0 flex-1">
                    <div className="text-[1.5rem] font-extrabold leading-[1.1] sm:text-[1.8rem]">{grade.title}</div>
                    <div className="mt-0.5 text-sm text-white/85">{grade.sections.length} section{grade.sections.length === 1 ? '' : 's'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        openAddSectionModal(grade.id);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white transition-transform duration-200 hover:scale-105"
                      aria-label={`Add section to ${grade.title}`}
                      type="button"
                    >
                      <Icon type="plus" />
                    </button>

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        renameGrade(grade.id);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white transition-transform duration-200 hover:scale-105"
                      aria-label={`Edit ${grade.title}`}
                      type="button"
                    >
                      <Icon type="pencil" />
                    </button>

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteGrade(grade.id);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f43f5e] text-white transition-transform duration-200 hover:scale-105"
                      aria-label={`Delete ${grade.title}`}
                      type="button"
                    >
                      <Icon type="trash" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 rounded-[14px] bg-white/10 p-3 backdrop-blur-sm">
                    <div className="grid gap-3 md:grid-cols-2">
                      {grade.sections.map((section) => (
                        <div key={`${grade.id}-${section.name}`} className="rounded-[12px] bg-[#f5f2f7] p-3 text-[#1f2937] shadow-sm">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📁</span>
                              <h3 className="text-[1.05rem] font-black text-[#2a2a2a] sm:text-[1.35rem]">{section.name}</h3>
                            </div>
                            <div className="flex gap-2">
                              <button className="rounded-md border border-[#d1d5db] bg-white/80 p-1.5 text-[#4b5563]" type="button" aria-label={`Edit ${section.name}`}>
                                <Icon type="pencil" />
                              </button>
                              <button className="rounded-md border border-[#d1d5db] bg-white/80 p-1.5 text-[#4b5563]" type="button" aria-label={`Delete ${section.name}`}>
                                <Icon type="trash" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-[#e6f6f4] p-2.5 text-center">
                              <div className="flex items-center justify-center gap-2 text-[#1f9d9c]">
                                <Icon type="users" />
                                <span className="text-2xl font-extrabold text-[#2a2a2a]">{section.students}</span>
                              </div>
                              <div className="mt-1 text-xs font-medium text-[#4b5563]">Students</div>
                            </div>
                            <div className="rounded-xl bg-[#f2e8ff] p-2.5 text-center">
                              <div className="flex items-center justify-center gap-2 text-[#8b3df0]">
                                <Icon type="sheet" />
                                <span className="text-2xl font-extrabold text-[#2a2a2a]">{section.activities}</span>
                              </div>
                              <div className="mt-1 text-xs font-medium text-[#4b5563]">Activities</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#a855f7] to-[#d946ef] px-3 py-2.5 text-base font-extrabold text-white shadow-[0_8px_18px_rgba(161,90,247,0.2)] transition-transform hover:-translate-y-0.5"
                          >
                            Open Section
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isDeleting && (
                  <div className="mt-3 flex flex-col gap-3 rounded-[12px] bg-[#fff1f2] p-3 text-[#7f1d1d] sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold">Delete this grade and all its sections?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPendingDeleteId(null)}
                        className="rounded-full bg-white px-3 py-1.5 font-semibold text-[#374151]"
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteGrade(grade.id)}
                        className="rounded-full bg-[#f43f5e] px-3 py-1.5 font-semibold text-white"
                        type="button"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showAddGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <div className="w-full max-w-[560px] rounded-[28px] bg-white p-8 shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
            <h2 className="text-center text-[2.3rem] font-black text-[#1f2937]">Add New Grade</h2>

            <div className="mt-7">
              <label className="mb-2 block text-left text-[1.2rem] font-bold text-[#1f2937]">Grade Name</label>
              <input
                value={newGradeName}
                onChange={(event) => setNewGradeName(event.target.value)}
                placeholder="e.g., Grade 4"
                className="w-full rounded-[14px] border border-[#d1d5db] bg-[#f8fafc] px-4 py-4 text-[1.05rem] text-[#1f2937] shadow-inner outline-none transition focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
              />
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <button
                onClick={closeAddGradeModal}
                className="rounded-[14px] bg-[#e5e7eb] px-4 py-3 text-xl font-bold text-[#374151] transition hover:bg-[#d1d5db]"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGrade}
                className="rounded-[14px] bg-gradient-to-r from-[#a855f7] to-[#d946ef] px-4 py-3 text-xl font-bold text-white shadow-[0_10px_20px_rgba(168,85,247,0.25)] transition hover:brightness-105"
                type="button"
              >
                Add Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <div className="w-full max-w-[560px] rounded-[28px] bg-white p-8 shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
            <h2 className="text-center text-[2.3rem] font-black text-[#1f2937]">Add New Section</h2>

            <div className="mt-7">
              <label className="mb-2 block text-left text-[1.2rem] font-bold text-[#1f2937]">Section Name</label>
              <input
                value={newSectionName}
                onChange={(event) => setNewSectionName(event.target.value)}
                placeholder="e.g., Section C or Section Einstein"
                className="w-full rounded-[14px] border border-[#d1d5db] bg-[#f8fafc] px-4 py-4 text-[1.05rem] text-[#1f2937] shadow-inner outline-none transition focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20"
              />
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <button
                onClick={closeAddSectionModal}
                className="rounded-[14px] bg-[#e5e7eb] px-4 py-3 text-xl font-bold text-[#374151] transition hover:bg-[#d1d5db]"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSection}
                className="rounded-[14px] bg-gradient-to-r from-[#a855f7] to-[#d946ef] px-4 py-3 text-xl font-bold text-white shadow-[0_10px_20px_rgba(168,85,247,0.25)] transition hover:brightness-105"
                type="button"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
