'use client';

import { useState } from 'react';

const gradesData = [
  {
    id: 1,
    name: 'Grade 1',
    sections: [
      { id: 'a', name: 'Section A', students: 25, activities: 8 },
      { id: 'b', name: 'Section B', students: 23, activities: 7 },
    ],
  },
  {
    id: 2,
    name: 'Grade 2',
    sections: [
      { id: 'a', name: 'Section A', students: 24, activities: 9 },
      { id: 'b', name: 'Section B', students: 22, activities: 8 },
    ],
  },
  {
    id: 3,
    name: 'Grade 3',
    sections: [
      { id: 'a', name: 'Section A', students: 26, activities: 10 },
      { id: 'b', name: 'Section B', students: 21, activities: 9 },
    ],
  },
];

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
  const [expandedGrade, setExpandedGrade] = useState<number>(1);

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
        <button className="px-6 py-3 bg-[#16a34a] text-white font-bold rounded-2xl transition-all duration-300 hover:bg-[#15803d] hover:scale-[1.02] font-body flex items-center gap-2 whitespace-nowrap">
          <Icon type="plus" className="h-5 w-5" />
          Add Grade
        </button>
      </header>

      {/* Grades List */}
      <div className="space-y-4">
        {gradesData.map((grade, idx) => (
          <div 
            key={grade.id}
            className="bg-background-50 rounded-2xl border border-background-200/70 overflow-hidden animate-fadeInUp"
            style={{ animationDelay: `${(idx + 1) * 100}ms` }}
          >
            {/* Grade Header */}
            <button
              onClick={() => setExpandedGrade(expandedGrade === grade.id ? 0 : grade.id)}
              className="w-full px-6 py-5 bg-primary-200 hover:bg-primary-300 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <button
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
                  <p className="text-sm text-foreground-600 font-body">{grade.sections.length} sections</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-xl bg-primary-400 hover:bg-primary-500 flex items-center justify-center transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Icon type="plus" className="h-4 w-4 text-white" />
                </button>
                <button className="w-9 h-9 rounded-xl bg-primary-400 hover:bg-primary-500 flex items-center justify-center transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Icon type="edit" className="h-4 w-4 text-white" />
                </button>
                <button className="w-9 h-9 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] flex items-center justify-center transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Icon type="trash" className="h-4 w-4 text-white" />
                </button>
              </div>
            </button>

            {/* Sections - Expanded */}
            {expandedGrade === grade.id && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeInUp">
                {grade.sections.map((section) => (
                  <div key={section.id} className="bg-background-100 rounded-xl p-5 border border-background-200 hover:border-primary-300 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Icon type="folder" className="h-5 w-5 text-primary-600" />
                        <h3 className="font-heading font-bold text-lg text-foreground-900">{section.name}</h3>
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
                          <div className="text-xl font-heading font-bold text-foreground-900">{section.students}</div>
                          <div className="text-xs text-foreground-600 font-body">Students</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary-50">
                        <Icon type="activity" className="h-4 w-4 text-secondary-600" />
                        <div>
                          <div className="text-xl font-heading font-bold text-foreground-900">{section.activities}</div>
                          <div className="text-xs text-foreground-600 font-body">Activities</div>
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors font-body whitespace-nowrap">
                      Open Section
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
