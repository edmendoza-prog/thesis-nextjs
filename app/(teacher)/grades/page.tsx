'use client';

import { useEffect, useState } from 'react';

type GradeRecord = {
  id: number;
  name: string;
  section: string;
  students: number;
  activities: number;
};

function Icon({ type, className = "h-5 w-5" }: { type: string; className?: string }) {
  switch (type) {
    case 'folder':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>;
    case 'users':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" /><circle cx="9.5" cy="7" r="3.5" /><path d="M22 19v-1a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'activity':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;
    case 'chevron-down':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>;
    case 'plus':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14M5 12h14" /></svg>;
    case 'edit':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>;
    case 'trash':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
    case 'school':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m4 6 8-4 8 4" /><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" /><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" /><path d="M18 5v17" /><path d="M6 5v17" /><circle cx="12" cy="9" r="2" /></svg>;
    default:
      return null;
  }
}

export default function GradesPage() {
  const [gradesData, setGradesData] = useState<GradeRecord[]>([]);
  const [expandedGrade, setExpandedGrade] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', section: '' });
  const [saving, setSaving] = useState(false);

  async function loadGrades() {
    try {
      setLoading(true);
      const response = await fetch('/api/teacher/grades');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load grades');
      const records = data.grades ?? [];
      setGradesData(records);
      if (records.length > 0) setExpandedGrade(records[0].id);
    } catch (error) {
      console.error('Grades fetch error:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGrades();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.section.trim()) return;

    try {
      setSaving(true);
      const response = await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          section: form.section.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create grade');

      setForm({ name: '', section: '' });
      setShowAddForm(false);
      await loadGrades();
    } catch (error) {
      console.error('Create grade error:', error);
      alert(error instanceof Error ? error.message : 'Unable to create grade');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGrade = async (gradeId: number) => {
    const confirmed = window.confirm('Delete this grade and its section from the database?');
    if (!confirmed) return;

    try {
      const response = await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: gradeId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete grade');

      await loadGrades();
    } catch (error) {
      console.error('Delete grade error:', error);
      alert(error instanceof Error ? error.message : 'Unable to delete grade');
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary-400 flex items-center justify-center">
            <Icon type="school" className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground-900">Grade & Section Management</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-[#16a34a] text-white font-bold rounded-2xl transition-all duration-300 hover:bg-[#15803d] hover:scale-[1.02] font-body flex items-center gap-2 whitespace-nowrap"
        >
          <Icon type="plus" className="h-5 w-5" />
          Add Grade
        </button>
      </header>

      {showAddForm && (
        <div className="mb-6 rounded-2xl border border-background-200 bg-background-50 p-5 shadow-sm animate-fadeInUp">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-foreground-900">Create a new grade</h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-sm font-medium text-foreground-600 hover:text-foreground-900"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground-700">
              Grade name
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Grade 4"
                className="rounded-xl border border-background-200 bg-white px-3 py-2.5 outline-none ring-0 transition focus:border-primary-400"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-foreground-700">
              Section
              <input
                value={form.section}
                onChange={(event) => setForm((current) => ({ ...current, section: event.target.value }))}
                placeholder="A"
                className="rounded-xl border border-background-200 bg-white px-3 py-2.5 outline-none ring-0 transition focus:border-primary-400"
              />
            </label>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary-500 px-5 py-2.5 font-bold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Grade'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grades List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-foreground-500 font-body">Loading grades...</div>
        ) : gradesData.length === 0 ? (
          <div className="text-sm text-foreground-500 font-body">No grade records found.</div>
        ) : (
          gradesData.map((grade, idx) => (
            <div
              key={grade.id}
              className="bg-background-50 rounded-2xl border border-background-200/70 overflow-hidden animate-fadeInUp"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              {/* Grade Header */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedGrade(expandedGrade === grade.id ? 0 : grade.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setExpandedGrade(expandedGrade === grade.id ? 0 : grade.id);
                  }
                }}
                className="w-full px-6 py-5 bg-primary-200 hover:bg-primary-300 transition-colors duration-200 flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedGrade(expandedGrade === grade.id ? 0 : grade.id);
                    }}
                  >
                    <Icon 
                      type="chevron-down" 
                      className={`h-5 w-5 text-foreground-800 transition-transform duration-300 ${
                        expandedGrade === grade.id ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <Icon type="folder" className="h-6 w-6 text-primary-700" />
                  <div className="text-left">
                    <h2 className="font-heading font-bold text-xl text-foreground-900">{grade.name}</h2>
                    <p className="text-sm text-foreground-600 font-body">
                      {grade.section} • {grade.students} students • {grade.activities} activities
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-[#8b5cf6] p-2 shadow-sm">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddForm(true);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6] text-white transition hover:bg-[#7c3aed]"
                    aria-label="Add grade"
                  >
                    <Icon type="plus" className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6] text-white transition hover:bg-[#7c3aed]"
                    aria-label="Edit grade"
                  >
                    <Icon type="edit" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGrade(grade.id);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e11d48] text-white transition hover:bg-[#be123c]"
                    aria-label="Delete grade"
                  >
                    <Icon type="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Sections - Expanded */}
              {expandedGrade === grade.id && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeInUp">
                  <div className="bg-background-100 rounded-xl p-5 border border-background-200 hover:border-primary-300 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Icon type="folder" className="h-5 w-5 text-primary-600" />
                        <h3 className="font-heading font-bold text-lg text-foreground-900">{grade.section}</h3>
                      </div>
                      <div className="flex gap-1">
                        <button className="w-8 h-8 rounded-lg bg-background-200 hover:bg-background-300 flex items-center justify-center transition-colors">
                          <Icon type="edit" className="h-3.5 w-3.5 text-foreground-700" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-[#fee2e2] hover:bg-[#fecaca] flex items-center justify-center transition-colors">
                          <Icon type="trash" className="h-3.5 w-3.5 text-[#dc2626]" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-50">
                        <Icon type="users" className="h-4 w-4 text-accent-600" />
                        <div>
                          <div className="text-xl font-heading font-bold text-foreground-900">{grade.students}</div>
                          <div className="text-xs text-foreground-600 font-body">Students</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary-50">
                        <Icon type="activity" className="h-4 w-4 text-secondary-600" />
                        <div>
                          <div className="text-xl font-heading font-bold text-foreground-900">{grade.activities}</div>
                          <div className="text-xs text-foreground-600 font-body">Activities</div>
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors font-body whitespace-nowrap">
                      Open Section
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
