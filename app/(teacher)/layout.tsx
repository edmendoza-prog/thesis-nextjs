'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', icon: 'home', bg: 'bg-primary-500 hover:bg-primary-600', href: '/dashboard' },
  { label: 'Create Activity', icon: 'plus', bg: 'bg-accent-500 hover:bg-accent-600', href: '/create-activity' },
  { label: 'Grades', icon: 'layers', bg: 'bg-secondary-400 hover:bg-secondary-500', href: '/grades' },
  { label: 'Enroll Students', icon: 'users', bg: 'bg-[#4f46e5] hover:bg-[#4338ca]', href: '/student-enrollment' },
  { label: 'Attendance', icon: 'check', bg: 'bg-accent-700 hover:bg-accent-800', href: '/attendance-management' },
  { label: 'Recorder', icon: 'mic', bg: 'bg-[#ef4444] hover:bg-[#dc2626]', href: '/activity-recorder-grading' },
  { label: 'Live Games', icon: 'gamepad', bg: 'bg-[#f97316] hover:bg-[#ea580c]', href: '/live-class-activities' },
];

function Icon({ type, className = "h-5 w-5" }: { type: string; className?: string }) {
  switch (type) {
    case 'home':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>;
    case 'plus':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14M5 12h14" /></svg>;
    case 'layers':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5" /></svg>;
    case 'users':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" /><circle cx="9.5" cy="7" r="3.5" /><path d="M22 19v-1a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'check':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5" /></svg>;
    case 'mic':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>;
    case 'gamepad':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="6" x2="10" y1="11" y2="11" /><line x1="8" x2="8" y1="9" y2="13" /><line x1="15" x2="15.01" y1="12" y2="12" /><line x1="18" x2="18.01" y1="10" y2="10" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5Z" /></svg>;
    case 'school':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m4 6 8-4 8 4" /><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" /><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" /><path d="M18 5v17" /><path d="M6 5v17" /><circle cx="12" cy="9" r="2" /></svg>;
    case 'logout':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>;
    default:
      return null;
  }
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-primary-100">
      {/* Fixed Floating Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-primary-50 rounded-r-3xl border-r border-primary-200/50 z-50 flex flex-col shadow-sm">
        {/* Logo & Brand */}
        <div className="p-6 pb-4 animate-fadeInUp">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary-500 flex items-center justify-center">
              <Icon type="school" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg text-foreground-900 leading-tight">
                Teacher Dashboard
              </h1>
            </div>
          </div>
          <p className="text-sm text-foreground-600 ml-[52px]">Welcome back</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl text-white font-body font-semibold text-sm
                  transition-all duration-300 whitespace-nowrap
                  ${item.bg}
                  hover:opacity-90 hover:scale-[1.02]
                  ${isActive ? 'ring-2 ring-primary-300 shadow-sm scale-[1.02]' : ''}
                  animate-fadeInUp
                `}
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                <Icon type={item.icon} className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div 
          className="mx-4 border-t border-primary-200/50 animate-fadeInUp" 
          style={{ animationDelay: '800ms' }}
        />

        {/* User Info & Sign Out */}
        <div 
          className="p-4 space-y-3 animate-fadeInUp" 
          style={{ animationDelay: '900ms' }}
        >
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center">
              <span className="font-heading font-bold text-primary-800 text-lg">E</span>
            </div>
            <div>
              <p className="font-body font-semibold text-sm text-foreground-900">Ed</p>
              <p className="font-body text-xs text-foreground-600">Teacher</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 w-full rounded-xl text-foreground-700 hover:bg-primary-100 transition-colors duration-200 font-body text-sm">
            <Icon type="logout" className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 p-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}
