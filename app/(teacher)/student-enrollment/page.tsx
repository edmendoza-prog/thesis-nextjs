'use client';

import { useEffect, useState } from 'react';

type StudentItem = { id: number; name: string; email: string; emoji: string };

function Icon({ type, className = "h-5 w-5" }: { type: string; className?: string }) {
  switch (type) {
    case 'user-plus':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>;
    case 'search':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
    case 'plus-circle':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>;
    case 'x-circle':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></svg>;
    case 'save':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>;
    case 'users':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'arrow-right':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    default:
      return null;
  }
}

export default function EnrollStudentsPage() {
  const [enrolled, setEnrolled] = useState<StudentItem[]>([]);
  const [available, setAvailable] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<Array<{ id: number; name: string; section: string }>>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newSectionName, setNewSectionName] = useState('Section A');
  const [addingClass, setAddingClass] = useState(false);

  const loadClasses = async () => {
    try {
      const response = await fetch('/api/teacher/grades');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load classes');

      const list = data.grades ?? [];
      setClasses(list);
      if (list.length > 0) {
        setSelectedClassId((prev) => (prev && list.some((c: any) => c.id === prev) ? prev : list[0].id));
      }
    } catch (error) {
      console.error('Classes fetch error:', error);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleAddClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      setAddingClass(true);
      const response = await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName.trim(), section: newSectionName.trim() || 'Section A' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create class');
      setShowAddClassModal(false);
      setNewClassName('');
      setNewSectionName('Section A');
      await loadClasses();
      if (data.grade?.id) {
        setSelectedClassId(data.grade.id);
      }
    } catch (err: any) {
      alert(err.message || 'Unable to create class');
    } finally {
      setAddingClass(false);
    }
  };

  useEffect(() => {
    if (!selectedClassId) return;

    async function loadEnrollmentData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/teacher/enrollment?classId=${selectedClassId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load enrollment data');
        setEnrolled(data.enrolled ?? []);
        setAvailable(data.available ?? []);
      } catch (error) {
        console.error('Enrollment fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEnrollmentData();
  }, [selectedClassId]);

  const enrollStudent = (student: StudentItem) => {
    setEnrolled((current) => [...current, student]);
    setAvailable((current) => current.filter((s) => s.id !== student.id));
    setSelectedStudentIds((current) => current.filter((id) => id !== student.id));
  };

  const removeStudent = (student: StudentItem) => {
    setAvailable((current) => [...current, student]);
    setEnrolled((current) => current.filter((s) => s.id !== student.id));
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudentIds((current) => current.includes(studentId)
      ? current.filter((id) => id !== studentId)
      : [...current, studentId]);
  };

  const enrollSelectedStudents = () => {
    const selectedStudents = available.filter((student) => selectedStudentIds.includes(student.id));
    setEnrolled((current) => [...current, ...selectedStudents]);
    setAvailable((current) => current.filter((student) => !selectedStudentIds.includes(student.id)));
    setSelectedStudentIds([]);
  };

  const saveEnrollment = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/teacher/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          classId: selectedClassId,
          enrolledIds: enrolled.map((student) => student.id),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save enrollment');
      alert('Enrollment saved successfully');
    } catch (error) {
      console.error('Save enrollment error:', error);
      alert(error instanceof Error ? error.message : 'Unable to save enrollment');
    } finally {
      setSaving(false);
    }
  };

  const filteredAvailable = available.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="mb-7 flex flex-col gap-5 border-b border-primary-200/70 pb-6 animate-fadeInUp lg:flex-row lg:items-end lg:justify-between">
        <div><p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-accent-700">Teacher workspace</p><h1 className="font-heading text-4xl font-bold text-foreground-900">Student enrollment</h1></div>
        <div className="flex items-center gap-3">
          <label className="rounded-xl border border-primary-200 bg-background-50 px-3 py-2 shadow-sm"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-foreground-500">Active class</span><select value={selectedClassId || ''} onChange={(event) => { setSelectedClassId(Number(event.target.value)); setSelectedStudentIds([]); }} className="min-w-56 bg-transparent text-sm font-bold text-foreground-900 outline-none">{classes.length === 0 ? <option value="">No classes available</option> : classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.name}</option>)}</select></label>
          <button type="button" onClick={() => setShowAddClassModal(true)} className="flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-accent-700 shadow-sm">
            <Icon type="user-plus" className="h-4 w-4" /> + Add Class
          </button>
        </div>
      </header>

      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#241d2d]/45 px-4" role="dialog" aria-modal="true">
          <form onSubmit={handleAddClassSubmit} className="w-full max-w-md rounded-2xl border border-primary-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-foreground-900">Add New Class</h2>
            <p className="mt-1 text-sm text-foreground-500">Create a new class and section for student enrollment.</p>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-bold text-foreground-700">Class Name
                <input required autoFocus value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="e.g. Grade 1" className="mt-1 w-full rounded-xl border border-background-300 px-3 py-2.5 text-sm text-foreground-900 outline-none focus:ring-2 focus:ring-accent-300" />
              </label>
              <label className="block text-sm font-bold text-foreground-700">Section Name
                <input required value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="e.g. Section A" className="mt-1 w-full rounded-xl border border-background-300 px-3 py-2.5 text-sm text-foreground-900 outline-none focus:ring-2 focus:ring-accent-300" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddClassModal(false)} className="rounded-xl border border-background-300 px-4 py-2.5 text-sm font-bold text-foreground-600 hover:bg-background-100">Cancel</button>
              <button type="submit" disabled={addingClass || !newClassName.trim()} className="rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-700 disabled:opacity-50">{addingClass ? 'Creating...' : 'Create Class'}</button>
            </div>
          </form>
        </div>
      )}

      <section className="mb-6 grid overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm sm:grid-cols-3">
        <div className="border-b border-primary-100 p-4 sm:border-b-0 sm:border-r"><p className="text-xs font-bold uppercase tracking-wide text-foreground-500">Enrolled</p><p className="mt-1 font-heading text-3xl font-bold text-accent-700">{enrolled.length}</p></div>
        <div className="border-b border-primary-100 p-4 sm:border-b-0 sm:border-r"><p className="text-xs font-bold uppercase tracking-wide text-foreground-500">Available</p><p className="mt-1 font-heading text-3xl font-bold text-foreground-900">{available.length}</p></div>
        <div className="p-4"><p className="text-xs font-bold uppercase tracking-wide text-foreground-500">Selected to enroll</p><p className="mt-1 font-heading text-3xl font-bold text-primary-600">{selectedStudentIds.length}</p></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="border-b border-primary-200 p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-heading text-2xl font-bold text-foreground-900">Available students</h2><p className="mt-1 text-sm text-foreground-500">Choose students to add to this class.</p></div><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700"><Icon type="users" /></span></div><div className="relative mt-4"><Icon type="search" className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-400" /><input type="text" placeholder="Search by name or email" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-background-300 bg-background-50 py-2.5 pl-10 pr-4 font-body text-sm outline-none focus:ring-2 focus:ring-accent-300" /></div></div>
          {loading ? <div className="p-6 text-sm text-foreground-500">Loading students...</div> : <div className="max-h-105 overflow-y-auto">{filteredAvailable.length === 0 ? <p className="p-8 text-center text-sm text-foreground-500">No students match this search.</p> : filteredAvailable.map((student) => <label key={student.id} className="flex cursor-pointer items-center gap-3 border-b border-primary-100 px-5 py-3.5 last:border-b-0 hover:bg-accent-50"><input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => toggleStudentSelection(student.id)} className="h-4 w-4 rounded border-primary-300 text-accent-600 focus:ring-accent-500" /><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-lg">{student.emoji}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-foreground-900">{student.name}</span><span className="block truncate text-xs text-foreground-500">{student.email}</span></span><button type="button" onClick={(event) => { event.preventDefault(); enrollStudent(student); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-accent-700 transition hover:bg-accent-100" title={`Enroll ${student.name}`} aria-label={`Enroll ${student.name}`}><Icon type="plus-circle" className="h-5 w-5" /></button></label>)}</div>}
          <div className="border-t border-primary-200 bg-background-100 p-4"><button type="button" onClick={enrollSelectedStudents} disabled={selectedStudentIds.length === 0} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">Enroll selected ({selectedStudentIds.length}) <Icon type="arrow-right" className="h-4 w-4" /></button></div>
        </section>

        <section className="overflow-hidden rounded-xl border border-primary-200 bg-background-50 shadow-sm animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between border-b border-primary-200 p-5"><div><h2 className="font-heading text-2xl font-bold text-foreground-900">Class roster</h2><p className="mt-1 text-sm text-foreground-500">Students enrolled in this class.</p></div><span className="rounded-full bg-accent-100 px-3 py-1 text-sm font-bold text-accent-700">{enrolled.length} enrolled</span></div>
          {loading ? <div className="p-6 text-sm text-foreground-500">Loading roster...</div> : <div className="max-h-125 overflow-y-auto">{enrolled.length === 0 ? <div className="p-10 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-foreground-400"><Icon type="users" /></span><p className="mt-4 font-bold text-foreground-700">This class has no students yet.</p><p className="mt-1 text-sm text-foreground-500">Select students from the available list to begin.</p></div> : enrolled.map((student, index) => <div key={student.id} className="flex items-center gap-3 border-b border-primary-100 px-5 py-3.5 last:border-b-0 hover:bg-accent-50"><span className="w-6 text-xs font-bold text-foreground-400">{String(index + 1).padStart(2, '0')}</span><span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-lg">{student.emoji}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-foreground-900">{student.name}</span><span className="block truncate text-xs text-foreground-500">{student.email}</span></span><button type="button" onClick={() => removeStudent(student)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#dc2626] transition hover:bg-[#fee2e2]" title={`Remove ${student.name}`} aria-label={`Remove ${student.name}`}><Icon type="x-circle" className="h-5 w-5" /></button></div>)}</div>}
          <div className="flex justify-end border-t border-primary-200 bg-background-100 p-4"><button type="button" onClick={saveEnrollment} disabled={saving || !selectedClassId} className="flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"><Icon type="save" className="h-5 w-5" />{saving ? 'Saving roster...' : 'Save roster'}</button></div>
        </section>
      </div>
    </div>
  );
}
