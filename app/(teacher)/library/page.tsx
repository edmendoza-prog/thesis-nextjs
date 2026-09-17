'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

type SectionItem = {
  id: number;
  name: string;
  section: string;
  displayName: string;
  gradeLevel: number;
  studentCount: number;
  activityCount: number;
};

type ActivityItem = {
  id: number;
  title: string;
  description: string | null;
  classId: number;
  sectionName: string;
  type: 'Quiz' | 'Exam' | 'Assignment' | 'Game' | string;
  rawType: string;
  totalPoints: number;
  dueDate: string | null;
  dateCreated: string;
  createdAtRaw: string;
  status: 'Published' | 'Draft' | 'Archived';
};

function Icon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  switch (type) {
    case 'folder':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l1.5 2H18.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
      );
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case 'dots':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      );
    case 'edit':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      );
    case 'trash':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'question':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'file-text':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'gamepad':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <line x1="6" x2="10" y1="11" y2="11" />
          <line x1="8" x2="8" y1="9" y2="13" />
          <line x1="15" x2="15.01" y1="12" y2="12" />
          <line x1="18" x2="18.01" y1="10" y2="10" />
          <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5Z" />
        </svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    default:
      return null;
  }
}

function ActivityTypeIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t === 'quiz') {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        <Icon type="question" className="h-5 w-5" />
      </div>
    );
  }
  if (t === 'exam') {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
        <Icon type="file-text" className="h-5 w-5" />
      </div>
    );
  }
  if (t === 'game') {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
        <Icon type="gamepad" className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
      <Icon type="file-text" className="h-5 w-5" />
    </div>
  );
}

function StatusBadge({ status }: { status: 'Published' | 'Draft' | 'Archived' }) {
  if (status === 'Published') {
    return (
      <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#15803d]">
        Published
      </span>
    );
  }
  if (status === 'Draft') {
    return (
      <span className="inline-flex items-center rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-semibold text-[#b45309]">
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-background-200 px-3 py-1 text-xs font-semibold text-foreground-600">
      Archived
    </span>
  );
}

function LibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSectionId = searchParams.get('sectionId');

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    urlSectionId ? Number(urlSectionId) : null
  );

  // New Library / Section modal state
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [newGradeName, setNewGradeName] = useState('Grade 1');
  const [newSectionName, setNewSectionName] = useState('Section A');
  const [newGradeLevel, setNewGradeLevel] = useState(1);
  const [isSubmittingSection, setIsSubmittingSection] = useState(false);
  const [activeMenuSectionId, setActiveMenuSectionId] = useState<number | null>(null);

  // Filter inside drill-down
  const [innerFilterType, setInnerFilterType] = useState<string>('All');
  const [innerFilterStatus, setInnerFilterStatus] = useState<string>('All');

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/library');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setSections(data.sections || []);
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  useEffect(() => {
    if (urlSectionId) {
      setSelectedSectionId(Number(urlSectionId));
    } else {
      setSelectedSectionId(null);
    }
  }, [urlSectionId]);

  const handleSelectSection = (id: number) => {
    setSelectedSectionId(id);
    router.push(`/library?sectionId=${id}`);
  };

  const handleBackToMain = () => {
    setSelectedSectionId(null);
    router.push('/library');
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeName.trim() || !newSectionName.trim()) return;

    setIsSubmittingSection(true);
    try {
      const res = await fetch('/api/teacher/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_section',
          name: newGradeName.trim(),
          section: newSectionName.trim(),
          gradeLevel: Number(newGradeLevel || 1),
        }),
      });

      const data = await res.json();
      if (res.ok && data.section) {
        setSections((prev) => [...prev, data.section]);
        setShowNewSectionModal(false);
        setNewGradeName('Grade 1');
        setNewSectionName('Section A');
      } else {
        alert(data.error || 'Failed to create section');
      }
    } catch (err) {
      console.error('Error creating section:', err);
    } finally {
      setIsSubmittingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this class section folder?')) return;

    try {
      const res = await fetch('/api/teacher/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_section', id: sectionId }),
      });
      if (res.ok) {
        setSections((prev) => prev.filter((s) => s.id !== sectionId));
        setActivities((prev) => prev.filter((a) => a.classId !== sectionId));
        if (selectedSectionId === sectionId) {
          handleBackToMain();
        }
      }
    } catch (err) {
      console.error('Delete section failed:', err);
    }
  };

  const handleToggleStatus = async (activityId: number, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = currentStatus === 'Published' ? 'Draft' : currentStatus === 'Draft' ? 'Archived' : 'Published';

    try {
      const res = await fetch('/api/teacher/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_activity_status',
          id: activityId,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        setActivities((prev) =>
          prev.map((a) => (a.id === activityId ? { ...a, status: nextStatus as any } : a))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Filtered sections and activities for Level 1
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter((s) => s.displayName.toLowerCase().includes(q));
  }, [sections, searchQuery]);

  const filteredGlobalActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    const q = searchQuery.toLowerCase();
    return activities.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.sectionName.toLowerCase().includes(q)
    );
  }, [activities, searchQuery]);

  // Selected Section Object for Level 2
  const currentSection = useMemo(() => {
    if (!selectedSectionId) return null;
    return sections.find((s) => s.id === selectedSectionId) || null;
  }, [sections, selectedSectionId]);

  // Activities scoped to the selected section for Level 2
  const sectionActivities = useMemo(() => {
    if (!selectedSectionId) return [];
    return activities.filter((a) => a.classId === selectedSectionId);
  }, [activities, selectedSectionId]);

  const filteredSectionActivities = useMemo(() => {
    return sectionActivities.filter((a) => {
      const matchesSearch =
        !searchQuery.trim() ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = innerFilterType === 'All' || a.type === innerFilterType;
      const matchesStatus = innerFilterStatus === 'All' || a.status === innerFilterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [sectionActivities, searchQuery, innerFilterType, innerFilterStatus]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl pb-12 animate-pulse">
        <div className="mb-6 h-8 w-48 rounded bg-background-200" />
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-background-200" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-background-200" />
      </div>
    );
  }

  // ==========================================
  // LEVEL 2: DRILL-DOWN VIEW (NEO LMS STYLE)
  // ==========================================
  if (selectedSectionId && currentSection) {
    return (
      <div className="mx-auto max-w-7xl pb-12 animate-fadeInUp">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={handleBackToMain}
            className="group flex items-center gap-2 text-sm font-bold text-foreground-600 transition hover:text-primary-700"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-background-50 border border-primary-200 shadow-sm transition group-hover:bg-primary-50 group-hover:border-primary-300">
              <Icon type="arrow-left" className="h-4 w-4" />
            </span>
            <span>Back to Library</span>
          </button>

          <div className="flex items-center gap-3">
            <Link
              href={`/create-activity?classId=${currentSection.id}`}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
            >
              <Icon type="plus" className="h-4 w-4" />
              <span>Create Activity</span>
            </Link>
          </div>
        </div>

        {/* Section Header Banner */}
        <div className="mb-6 rounded-2xl border border-primary-200/80 bg-background-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                <Icon type="folder" className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary-700">
                    Section Library
                  </span>
                  <span className="text-xs text-foreground-500 font-medium">
                    Grade {currentSection.gradeLevel || 1}
                  </span>
                </div>
                <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-foreground-900">
                  {currentSection.displayName}
                </h1>
                <p className="text-sm text-foreground-600">
                  Manage quizzes, exams, assignments, and learning materials for this section.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-primary-100 bg-primary-50/50 px-4 py-2 text-center">
                <p className="text-xs font-semibold text-foreground-500">Total Activities</p>
                <p className="font-heading text-xl font-bold text-primary-700">{sectionActivities.length}</p>
              </div>
              <div className="rounded-xl border border-primary-100 bg-primary-50/50 px-4 py-2 text-center">
                <p className="text-xs font-semibold text-foreground-500">Enrolled Students</p>
                <p className="font-heading text-xl font-bold text-foreground-800">{currentSection.studentCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Controls & Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-primary-200/80 bg-background-50 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Icon type="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-400" />
            <input
              type="text"
              placeholder={`Search activities in ${currentSection.displayName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-primary-200 bg-background-50 pl-10 pr-4 py-2.5 text-sm text-foreground-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={innerFilterType}
              onChange={(e) => setInnerFilterType(e.target.value)}
              className="rounded-xl border border-primary-200 bg-background-50 px-3.5 py-2.5 text-xs font-bold text-foreground-700 outline-none transition hover:border-primary-300 focus:border-primary-400"
            >
              <option value="All">All Types</option>
              <option value="Quiz">Quizzes</option>
              <option value="Exam">Exams</option>
              <option value="Assignment">Assignments</option>
              <option value="Game">Games</option>
            </select>

            <select
              value={innerFilterStatus}
              onChange={(e) => setInnerFilterStatus(e.target.value)}
              className="rounded-xl border border-primary-200 bg-background-50 px-3.5 py-2.5 text-xs font-bold text-foreground-700 outline-none transition hover:border-primary-300 focus:border-primary-400"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* NEO LMS-like Section Activities Table */}
        <div className="overflow-hidden rounded-2xl border border-primary-200/80 bg-background-50 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground-700">
              <thead className="border-b border-primary-100 bg-primary-50/40 text-[11px] font-bold uppercase tracking-wider text-foreground-500">
                <tr>
                  <th className="px-6 py-4">Activity Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Date Created</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {filteredSectionActivities.length > 0 ? (
                  filteredSectionActivities.map((act) => (
                    <tr key={act.id} className="transition-colors hover:bg-primary-50/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <ActivityTypeIcon type={act.type} />
                          <div>
                            <p className="font-bold text-foreground-900">{act.title}</p>
                            {act.dueDate && (
                              <p className="text-xs text-foreground-500">Due: {act.dueDate}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground-600">{act.type}</td>
                      <td className="px-6 py-4 font-semibold text-foreground-800">{act.totalPoints} pts</td>
                      <td className="px-6 py-4 text-foreground-500">{act.dateCreated}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => handleToggleStatus(act.id, act.status, e)}
                          title="Click to cycle status (Published -> Draft -> Archived)"
                          className="transition hover:opacity-80 active:scale-95"
                        >
                          <StatusBadge status={act.status} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/create-activity?id=${act.id}&classId=${currentSection.id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-400 transition hover:bg-primary-100 hover:text-primary-700"
                            title="Edit Activity"
                          >
                            <Icon type="edit" className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete activity "${act.title}"?`)) {
                                fetch('/api/teacher/library', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'delete_activity', id: act.id }),
                                }).then(() => {
                                  setActivities((prev) => prev.filter((a) => a.id !== act.id));
                                });
                              }
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-400 transition hover:bg-rose-100 hover:text-rose-600"
                            title="Delete Activity"
                          >
                            <Icon type="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <div className="mx-auto max-w-sm">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                          <Icon type="book" className="h-6 w-6" />
                        </div>
                        <p className="font-heading font-bold text-foreground-800">No activities found</p>
                        <p className="mt-1 text-xs text-foreground-500">
                          {searchQuery
                            ? 'No activities match your search criteria.'
                            : `There are no activities created for ${currentSection.displayName} yet.`}
                        </p>
                        <Link
                          href={`/create-activity?classId=${currentSection.id}`}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-700"
                        >
                          <Icon type="plus" className="h-3.5 w-3.5" />
                          <span>Create First Activity</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // LEVEL 1: MAIN LIBRARY (SECTIONS + OVERVIEW)
  // ==========================================
  return (
    <div className="mx-auto max-w-7xl pb-12 animate-fadeInUp">
      {/* Top Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-primary-600">Library</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground-900">My Library</h1>
          <p className="mt-1 text-sm text-foreground-600">
            Browse and manage activities organized by section.
          </p>
        </div>

        {/* Top-Right Action Button: + New Library / + Library */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewSectionModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
          >
            <Icon type="plus" className="h-4 w-4" />
            <span>New Library</span>
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Icon type="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-primary-200 bg-background-50 pl-11 pr-4 py-3 text-sm text-foreground-900 shadow-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      {/* Class Sections (Folders Grid) */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-foreground-900">Class Sections</h2>
          <span className="text-xs font-semibold text-foreground-500">
            {filteredSections.length} {filteredSections.length === 1 ? 'Section' : 'Sections'}
          </span>
        </div>

        {filteredSections.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredSections.map((sec) => (
              <div
                key={sec.id}
                onClick={() => handleSelectSection(sec.id)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-primary-200/90 bg-background-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary-400 hover:shadow-md cursor-pointer"
              >
                {/* Top Section Tab Badge */}
                <div className="absolute left-0 top-0">
                  <span className="inline-block rounded-br-xl bg-primary-600 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                    SECTION TAB
                  </span>
                </div>

                {/* Top Folder Icon & Menu */}
                <div className="mb-4 mt-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
                    <Icon type="folder" className="h-6 w-6" />
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuSectionId(activeMenuSectionId === sec.id ? null : sec.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-400 transition hover:bg-primary-100 hover:text-foreground-700"
                    >
                      <Icon type="dots" className="h-4 w-4" />
                    </button>

                    {/* Context Dropdown */}
                    {activeMenuSectionId === sec.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-primary-200 bg-background-50 p-1.5 shadow-lg animate-fadeIn"
                      >
                        <button
                          onClick={() => {
                            setActiveMenuSectionId(null);
                            handleSelectSection(sec.id);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-foreground-700 hover:bg-primary-50 hover:text-primary-700"
                        >
                          <Icon type="folder" className="h-3.5 w-3.5" />
                          <span>Open Library</span>
                        </button>
                        <Link
                          href={`/create-activity?classId=${sec.id}`}
                          onClick={() => setActiveMenuSectionId(null)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-foreground-700 hover:bg-primary-50 hover:text-primary-700"
                        >
                          <Icon type="plus" className="h-3.5 w-3.5" />
                          <span>Create Activity</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            setActiveMenuSectionId(null);
                            handleDeleteSection(sec.id, e);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50"
                        >
                          <Icon type="trash" className="h-3.5 w-3.5" />
                          <span>Delete Section</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Info */}
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground-900 group-hover:text-primary-700 transition-colors">
                    {sec.displayName}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-foreground-500">
                    {sec.activityCount} {sec.activityCount === 1 ? 'Activity' : 'Activities'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary-200 bg-background-50/50 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              <Icon type="folder" className="h-6 w-6" />
            </div>
            <h3 className="font-heading font-bold text-foreground-800">No class sections found</h3>
            <p className="mt-1 text-xs text-foreground-500">
              Create your first class section folder to organize your library activities.
            </p>
            <button
              onClick={() => setShowNewSectionModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-700"
            >
              <Icon type="plus" className="h-3.5 w-3.5" />
              <span>Create Section Folder</span>
            </button>
          </div>
        )}
      </section>

      {/* Recent Activities Table (Global Overview) */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-foreground-900">Recent Activities</h2>
          <span className="text-xs font-semibold text-foreground-500">
            {filteredGlobalActivities.length} {filteredGlobalActivities.length === 1 ? 'Activity' : 'Activities'}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-primary-200/80 bg-background-50 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground-700">
              <thead className="border-b border-primary-100 bg-primary-50/40 text-[11px] font-bold uppercase tracking-wider text-foreground-500">
                <tr>
                  <th className="px-6 py-4">Activity Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Section</th>
                  <th className="px-6 py-4">Date Created</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {filteredGlobalActivities.length > 0 ? (
                  filteredGlobalActivities.map((act) => (
                    <tr key={act.id} className="transition-colors hover:bg-primary-50/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <ActivityTypeIcon type={act.type} />
                          <span className="font-bold text-foreground-900">{act.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground-600">{act.type}</td>
                      <td className="px-6 py-4">
                        {/* Clickable section jumping directly to Level 2 drill-down */}
                        <button
                          onClick={() => handleSelectSection(act.classId)}
                          className="font-semibold text-primary-700 hover:text-primary-900 hover:underline transition"
                        >
                          {act.sectionName}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-foreground-500">{act.dateCreated}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => handleToggleStatus(act.id, act.status, e)}
                          title="Click to toggle status"
                          className="transition hover:opacity-80 active:scale-95"
                        >
                          <StatusBadge status={act.status} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/create-activity?id=${act.id}&classId=${act.classId}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground-400 transition hover:bg-primary-100 hover:text-primary-700"
                          title="Edit Activity"
                        >
                          <Icon type="edit" className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-foreground-500">
                      <p className="font-semibold">No recent activities found.</p>
                      <p className="mt-1 text-xs text-foreground-400">
                        Create an activity inside any section folder above.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal: Create New Section / Library Folder */}
      {showNewSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-primary-200 bg-background-50 p-6 shadow-xl animate-scaleUp">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <Icon type="folder" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground-900">New Class Section</h3>
                  <p className="text-xs text-foreground-500">Create a folder for organizing activities</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewSectionModal(false)}
                className="rounded-lg p-1 text-foreground-400 hover:bg-primary-100 hover:text-foreground-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-foreground-700">
                  Grade / Class Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 1, Math 101, Science Club"
                  value={newGradeName}
                  onChange={(e) => setNewGradeName(e.target.value)}
                  className="w-full rounded-xl border border-primary-200 bg-background-50 px-4 py-2.5 text-sm text-foreground-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-foreground-700">
                    Section Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section A, Diamond"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="w-full rounded-xl border border-primary-200 bg-background-50 px-4 py-2.5 text-sm text-foreground-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-foreground-700">
                    Grade Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(Number(e.target.value))}
                    className="w-full rounded-xl border border-primary-200 bg-background-50 px-4 py-2.5 text-sm text-foreground-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSectionModal(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-foreground-600 transition hover:bg-primary-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSection}
                  className="rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmittingSection ? 'Creating...' : 'Create Section Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl pb-12 animate-pulse">
          <div className="mb-6 h-8 w-48 rounded bg-background-200" />
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-background-200" />
            ))}
          </div>
        </div>
      }
    >
      <LibraryContent />
    </Suspense>
  );
}
