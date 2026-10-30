'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import UserAvatar from '@/app/components/UserAvatar';

const navItems = [
  { label: 'Dashboard', icon: 'home', href: '/dashboard' },
  { label: 'Class Record', icon: 'folder', href: '/classes' },
  { label: 'Library', icon: 'book', href: '/library' },
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
    case 'users':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    case 'user':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'lock':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
    case 'chevron-down':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
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
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherAvatar, setTeacherAvatar] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Instant optimistic load from localStorage to prevent layout flicker
    try {
      const cached = localStorage.getItem('teacher_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.name) setTeacherName(parsed.name);
        if (parsed.email) setTeacherEmail(parsed.email);
        if (parsed.avatarSeed) setTeacherAvatar(parsed.avatarSeed);
      }
    } catch {}

    async function loadTeacherProfile() {
      try {
        const response = await fetch('/api/teacher/profile');
        if (response.status === 401) {
          // Graceful fallback for local development & preview
          setTeacherName('Teacher');
          return;
        }
        const data = await response.json();
        if (response.ok && data.profile?.name) {
          setTeacherName(data.profile.name);
          if (data.profile.email) {
            setTeacherEmail(data.profile.email);
          }
          if (data.profile.avatarSeed) {
            setTeacherAvatar(data.profile.avatarSeed);
          }
          try {
            localStorage.setItem(
              'teacher_profile',
              JSON.stringify({
                name: data.profile.name,
                email: data.profile.email,
                avatarSeed: data.profile.avatarSeed,
              })
            );
          } catch {}
        }
      } catch {
        // Fallback to default
      }
    }

    loadTeacherProfile();

    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.name) setTeacherName(customEvent.detail.name);
        if (customEvent.detail.email) setTeacherEmail(customEvent.detail.email);
        if (customEvent.detail.avatarSeed) setTeacherAvatar(customEvent.detail.avatarSeed);
      }
      loadTeacherProfile();
    };

    window.addEventListener('teacher-profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('teacher-profile-updated', handleProfileUpdate);
    };
  }, [pathname]);

  // Click outside and escape key listeners for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileSidebarOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    const handleOpenMobileSidebar = () => setIsMobileSidebarOpen(true);
    window.addEventListener('open-teacher-sidebar', handleOpenMobileSidebar);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-teacher-sidebar', handleOpenMobileSidebar);
    };
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/login/teacher');
  };

  const initials = teacherName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'T';

  const isLiveActivities = pathname === '/live-class-activities';

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo & Brand */}
      <div className="p-5 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Icon type="school" className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-extrabold leading-tight tracking-tight text-white">
              Go Learning
            </h1>
            <p className="text-[11px] font-medium tracking-wide uppercase text-slate-400">Teacher Workspace</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {navItems.map((item, idx) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/classes' && pathname.startsWith('/grades')) ||
            (item.href === '/library' && pathname.startsWith('/create-activity'));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`
                flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium
                whitespace-nowrap transition-all duration-150
                ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold shadow-indigo-600/25'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }
              `}
              style={{ animationDelay: `${(idx + 1) * 60}ms` }}
            >
              <Icon
                type={item.icon}
                className={`h-4.5 w-4.5 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className={`flex min-h-screen font-sans ${isLiveActivities ? 'bg-white' : 'bg-slate-50/70'}`}>
      {/* Desktop Fixed Dark Navy Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-64 flex-col bg-slate-950 text-white shadow-lg lg:flex border-r border-slate-800/80">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white shadow-2xl animate-fadeInUp flex flex-col border-r border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Icon type="school" className="h-5 w-5" />
                </div>
                <span className="font-bold text-sm text-white">Go Learning</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Close sidebar"
              >
                <Icon type="x" className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Column with Top Navbar */}
      <div className="flex flex-1 flex-col min-h-screen w-full lg:ml-64">
        {/* TOP NAVBAR */}
        <header className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 sm:px-6 lg:px-8 ${isLiveActivities ? 'bg-white border-[#E4E7F3]' : 'border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs'}`}>
          {/* Left Side: Mobile Toggle + LMS / Teacher Workspace Branding */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`p-2 rounded-xl lg:hidden focus:outline-hidden ${isLiveActivities ? 'text-[#1B2559] hover:bg-[#EEF0FA]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              aria-label="Open sidebar menu"
            >
              <Icon type="menu" className="h-6 w-6" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  <span className={isLiveActivities ? 'text-[#1B2559]' : 'text-slate-900'}>Go </span>
                  <span className={isLiveActivities ? 'text-[#3D4DF2]' : 'text-indigo-600'}>Learning</span>
                </span>
                <span className={`hidden sm:inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${isLiveActivities ? 'bg-[#E6EAFF] text-[#3D4DF2] border-[#E6EAFF]' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                  Teacher Suite
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Teacher Profile Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Teacher Profile with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="group flex items-center gap-2.5 rounded-full sm:rounded-xl p-1 sm:py-1.5 sm:px-2.5 transition-colors hover:bg-slate-100 focus:outline-hidden cursor-pointer"
                aria-label="Teacher profile menu"
                aria-expanded={isDropdownOpen}
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-xs">
                  <UserAvatar seed={teacherAvatar || teacherName || 'Teacher'} size={36} className="w-full h-full" />
                </div>

                {/* Name & Role */}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight max-w-[120px] truncate">
                    {teacherName}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 leading-none mt-0.5">
                    Teacher
                  </span>
                </div>

                {/* Dropdown Chevron */}
                <div className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  <Icon type="chevron-down" className="h-4 w-4" />
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 ring-1 ring-black/5 z-50 animate-fadeInUp">
                  {/* Header: User Summary */}
                  <div className="flex items-center gap-3 p-3 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-xs">
                      <UserAvatar seed={teacherAvatar || teacherName || 'Teacher'} size={40} className="w-full h-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{teacherName}</p>
                      <p className="text-xs text-[#4255FF] font-semibold">Teacher Account</p>
                      {teacherEmail && (
                        <p className="text-[11px] text-slate-500 truncate">{teacherEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="space-y-0.5">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-[#EDF0FF] hover:text-[#4255FF] transition-colors"
                    >
                      <Icon type="user" className="h-4 w-4 text-[#4255FF]" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-[#EDF0FF] hover:text-[#4255FF] transition-colors"
                    >
                      <Icon type="settings" className="h-4 w-4 text-slate-500" />
                      <span>Settings</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-[#EDF0FF] hover:text-[#4255FF] transition-colors"
                    >
                      <Icon type="lock" className="h-4 w-4 text-slate-500" />
                      <span>Change Password</span>
                    </Link>
                  </div>

                  {/* Divider & Log out */}
                  <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      <Icon type="logout" className="h-4 w-4 text-red-500" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard / Teacher Workspace Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
