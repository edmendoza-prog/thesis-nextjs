'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Dashboard', icon: 'home', href: '/dashboard' },
  { label: 'Library', icon: 'book', href: '/library' },
  { label: 'Class Record', icon: 'folder', href: '/grades' },
  { label: 'Live Games', icon: 'gamepad', href: '/live-class-activities' },
];

function Icon({ type, className = "h-5 w-5" }: { type: string; className?: string }) {
  switch (type) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case 'folder':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l1.5 2H18.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z" />
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
    case 'school':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m4 6 8-4 8 4" />
          <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" />
          <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
          <path d="M18 5v17" />
          <path d="M6 5v17" />
          <circle cx="12" cy="9" r="2" />
        </svg>
      );
    case 'logout':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [teacherName, setTeacherName] = useState('Teacher');

  useEffect(() => {
    async function loadTeacherProfile() {
      try {
        const response = await fetch('/api/teacher/profile');
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        if (response.ok && data.profile?.name) {
          setTeacherName(data.profile.name);
        }
      } catch {
        // Fallback to default
      }
    }
    loadTeacherProfile();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/login');
  };

  const initials = teacherName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'T';

  return (
    <div className="flex min-h-screen bg-primary-100">
      {/* Fixed Floating Dark Indigo Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 z-50 hidden w-64 flex-col rounded-r-3xl bg-[#1e173e] text-white shadow-xl lg:flex">
        {/* Logo & Brand */}
        <div className="p-6 pb-6 animate-fadeInUp">
          <div className="mb-1.5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4f46e5] text-white shadow-md">
              <Icon type="school" className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading text-base font-bold leading-tight text-white">
                Teacher Dashboard
              </h1>
            </div>
          </div>
          <p className="ml-[52px] text-xs font-medium text-[#a69fc4]">Welcome back</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4">
          {navItems.map((item, idx) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/library' && pathname.startsWith('/create-activity'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold
                  whitespace-nowrap transition-all duration-200
                  ${
                    isActive
                      ? 'bg-[#fff8e7] text-[#1e173e] shadow-sm font-bold scale-[1.01]'
                      : 'text-[#a69fc4] hover:bg-white/10 hover:text-white'
                  }
                  animate-fadeInUp
                `}
                style={{ animationDelay: `${(idx + 1) * 60}ms` }}
              >
                <Icon
                  type={item.icon}
                  className={`h-5 w-5 ${
                    isActive
                      ? 'text-[#1e173e]'
                      : item.icon === 'home'
                      ? 'text-emerald-400'
                      : item.icon === 'book'
                      ? 'text-amber-300'
                      : item.icon === 'folder'
                      ? 'text-purple-300'
                      : 'text-orange-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Sign Out */}
        <div className="border-t border-white/10 p-4 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <Link
              href="/profile"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-white shadow-inner font-heading text-sm font-bold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{teacherName}</p>
                <p className="text-xs text-[#a69fc4]">Teacher</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#a69fc4] transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              <Icon type="logout" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-screen w-full p-4 lg:ml-64 lg:p-6">
        {children}
      </main>
    </div>
  );
}
