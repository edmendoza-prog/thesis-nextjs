'use client';

import { useState } from 'react';

const availableStudents = [
  { id: 102, name: 'Leo Martin', email: 'leomartin@school.com', emoji: '🦁' },
  { id: 103, name: 'Mila Patel', email: 'mila.patel@school.com', emoji: '🐸' },
  { id: 104, name: 'Noah Kim', email: 'noah.kim@school.com', emoji: '🐼' },
  { id: 105, name: 'Sophia Reed', email: 'sophia.reed@school.com', emoji: '🐨' },
  { id: 106, name: 'Ethan Ross', email: 'ethan.ross@school.com', emoji: '🦊' },
  { id: 107, name: 'Lily Chen', email: 'lily.chen@school.com', emoji: '🐰' },
];

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
    default:
      return null;
  }
}

export default function EnrollStudentsPage() {
  const [enrolled, setEnrolled] = useState([{ id: 101, name: 'Ava Carter', email: 'ava.carter@school.com', emoji: '🐱' }]);
  const [available, setAvailable] = useState(availableStudents);
  const [searchTerm, setSearchTerm] = useState('');

  const enrollStudent = (student: typeof availableStudents[0]) => {
    setEnrolled([...enrolled, student]);
    setAvailable(available.filter(s => s.id !== student.id));
  };

  const removeStudent = (student: typeof enrolled[0]) => {
    setAvailable([...available, student]);
    setEnrolled(enrolled.filter(s => s.id !== student.id));
  };

  const filteredAvailable = available.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <header className="mb-6 animate-fadeInUp">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46e5] flex items-center justify-center">
            <Icon type="user-plus" className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground-900">Student Enrollment</h1>
        </div>

        {/* Class Selector */}
        <div className="bg-background-50 rounded-2xl border border-background-200/70 p-5">
          <label className="block text-sm font-semibold text-foreground-700 mb-2 font-body">SELECT CLASS/SECTION</label>
          <select className="w-full px-4 py-3 rounded-xl border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body text-foreground-900">
            <option>Grade 1 - Section A</option>
            <option>Grade 1 - Section B</option>
            <option>Grade 2 - Section A</option>
            <option>Grade 2 - Section B</option>
            <option>Grade 3 - Section A</option>
            <option>Grade 3 - Section B</option>
          </select>
        </div>
      </header>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Students */}
        <div className="bg-background-50 rounded-2xl border border-background-200/70 p-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <h2 className="font-heading font-bold text-xl text-foreground-900 mb-4">Available Students</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Icon type="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body"
            />
          </div>

          {/* Student List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredAvailable.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-background-100 hover:bg-background-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xl">
                    {student.emoji}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground-900 font-body">{student.name}</div>
                    <div className="text-xs text-foreground-600 font-body">{student.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => enrollStudent(student)}
                  className="w-8 h-8 rounded-full bg-accent-500 hover:bg-accent-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <Icon type="plus-circle" className="h-5 w-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="bg-background-50 rounded-2xl border border-background-200/70 p-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <h2 className="font-heading font-bold text-xl text-foreground-900 mb-4">
            Enrolled Students ({enrolled.length})
          </h2>
          
          {/* Student List */}
          <div className="space-y-2 mb-6 max-h-[500px] overflow-y-auto">
            {enrolled.length === 0 ? (
              <div className="text-center py-12 text-foreground-500 font-body">
                No students enrolled yet. Add students from the left panel.
              </div>
            ) : (
              enrolled.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-accent-50 border border-accent-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-xl">
                      {student.emoji}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground-900 font-body">{student.name}</div>
                      <div className="text-xs text-foreground-600 font-body">{student.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStudent(student)}
                    className="w-8 h-8 rounded-full bg-[#ef4444] hover:bg-[#dc2626] flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <Icon type="x-circle" className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Save Button */}
          <button className="w-full py-4 bg-accent-500 text-white font-bold rounded-2xl transition-all duration-300 hover:bg-accent-600 hover:scale-[1.01] font-body flex items-center justify-center gap-3 whitespace-nowrap">
            <Icon type="save" className="h-5 w-5" />
            Save Enrollment
          </button>
        </div>
      </div>
    </div>
  );
}
