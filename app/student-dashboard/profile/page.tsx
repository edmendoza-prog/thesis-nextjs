'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/app/components/UserAvatar';
import AvatarPickerModal from '@/app/components/AvatarPickerModal';

// Clean SVG Line Icons (No emojis)
function CalendarIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UserIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CameraIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function EditIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function SaveIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function ChevronDownIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MedalIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 3 4 5 4-5" />
      <circle cx="12" cy="15" r="6" />
      <path d="m12 12 1 2 2 .3-1.5 1.45.35 2.05L12 16.7l-1.85 1.1.35-2.05L9 14.3l2-.3 1-2Z" />
    </svg>
  );
}

function HomeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" />
      <path d="M9 21v-7h6v7" />
    </svg>
  );
}

function BookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

function LogoutIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  );
}

function SparkleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
    </svg>
  );
}

function MenuIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

type Profile = {
  id?: number;
  name: string;
  email: string;
  studentNumber: string;
  guardianName: string;
  guardianContact: string;
  birthDate: string;
  avatarSeed?: string;
};

// Default sample profile values
const sampleProfile: Profile = {
  name: 'Rodel Apit',
  email: 'rodel.apit@student.golearning.edu',
  studentNumber: 'LRN-2026-8941',
  guardianName: 'Maria Elena Apit',
  guardianContact: '+63 917 555 4321',
  birthDate: '2010-04-18',
  avatarSeed: 'adventurer:Oliver',
};

const navigation = [
  { label: 'Overview', icon: HomeIcon, href: '/student-dashboard?tab=Overview' },
  { label: 'Classes', icon: BookIcon, href: '/student-dashboard?tab=Classes' },
];

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(sampleProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  // Fetch student profile from API
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/student/profile');
        const data = await response.json();
        if (response.ok && data.profile) {
          setProfile({
            id: data.profile.id,
            name: data.profile.name || sampleProfile.name,
            email: data.profile.email || sampleProfile.email,
            studentNumber: data.profile.studentNumber || sampleProfile.studentNumber,
            guardianName: data.profile.guardianName || sampleProfile.guardianName,
            guardianContact: data.profile.guardianContact || sampleProfile.guardianContact,
            birthDate: data.profile.birthDate || sampleProfile.birthDate,
            avatarSeed: data.profile.avatarSeed || sampleProfile.avatarSeed,
          });
        }
      } catch (error) {
        console.error('Student profile load error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const update = (field: keyof Profile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const handleAvatarSelect = async (newSeed: string) => {
    setProfile((current) => ({ ...current, avatarSeed: newSeed }));
    setSaved(false);

    try {
      setSaving(true);
      const payload = { ...profile, avatarSeed: newSeed };
      const response = await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setSaved(true);
      }
    } catch (err) {
      console.error('Failed to auto-save avatar:', err);
    } finally {
      setSaving(false);
    }
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      const response = await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save profile');
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFocusEdit = () => {
    fullNameInputRef.current?.focus();
    fullNameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login/student');
  };

  const effectiveAvatarSeed =
    profile.avatarSeed ||
    profile.studentNumber ||
    (profile.id ? String(profile.id) : '') ||
    profile.name ||
    sampleProfile.avatarSeed ||
    'Oliver';

  return (
    <div className="flex min-h-screen bg-[#edf2f0] text-slate-800 font-sans antialiased">
      {/* ==================== DESKTOP FIXED SIDEBAR ==================== */}
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-64 flex-col border-r border-[#1E2340] bg-[#0A092D] p-5 shadow-xl lg:flex text-white">
        {/* Branding */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4255FF] text-white shadow-md shadow-[#4255FF]/25">
            <SparkleIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-white leading-tight">
              Go Learning
            </p>
            <p className="text-xs text-slate-400">Student Portal</p>
          </div>
        </div>

        {/* Navigation Items (Overview & Classes) */}
        <nav className="mt-8 space-y-1.5" aria-label="Student navigation">
          {navigation.map((item) => {
            const NavIcon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.href)}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <NavIcon className="h-5 w-5 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 hover:bg-white/10 hover:text-rose-400 transition cursor-pointer"
        >
          <LogoutIcon className="h-5 w-5" />
          <span>Sign out</span>
        </button>
      </aside>

      {/* ==================== MOBILE DRAWER OVERLAY ==================== */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0A092D]/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0A092D] p-5 text-white shadow-2xl flex flex-col border-r border-[#1E2340]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2340]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4255FF] text-white shadow-md">
                  <SparkleIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-heading text-base font-bold text-white">Go Learning</p>
                  <p className="text-[11px] text-slate-400">Student Portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Close sidebar"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 space-y-1.5 flex-1" aria-label="Mobile student navigation">
              {navigation.map((item) => {
                const NavIcon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setIsMobileSidebarOpen(false);
                      router.push(item.href);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    <NavIcon className="h-5 w-5 text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 hover:bg-white/10 hover:text-rose-400 transition cursor-pointer"
            >
              <LogoutIcon className="h-5 w-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== MAIN CONTENT COLUMN (Offset for Sidebar) ==================== */}
      <div className="flex flex-1 flex-col min-h-screen w-full lg:ml-64">
        {/* Full-Width Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-2xs">
          {/* Left: Mobile Toggle + Branding / Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden focus:outline-none cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>

            {/* Mobile Branding */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4255FF] text-white shadow-sm">
                <SparkleIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading text-base font-extrabold text-slate-900">
                Go <span className="text-[#4255FF]">Learning</span>
              </span>
            </div>

            {/* Desktop Date (matching old navbar in Student Dashboard) */}
            <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-slate-400" />
                <span>{currentDate || 'Loading date...'}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <Link href="/student-dashboard" className="hover:text-[#4255FF] transition-colors">
                  Student Dashboard
                </Link>
                <span>/</span>
                <span className="text-slate-800 font-bold">Profile &amp; Settings</span>
              </div>
            </div>
          </div>

          {/* Right: Student Profile & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group flex items-center gap-2.5 rounded-full sm:rounded-xl p-1 sm:py-1.5 sm:px-2.5 transition-colors hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Student profile menu"
              aria-expanded={isDropdownOpen}
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-xs">
                <UserAvatar seed={effectiveAvatarSeed} size={36} className="w-full h-full object-cover" />
              </div>

              {/* Name & Role */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight max-w-[140px] truncate">
                  {profile.name || sampleProfile.name}
                </span>
                <span className="text-[11px] font-medium text-slate-500 leading-none mt-0.5">
                  Student Account
                </span>
              </div>

              {/* Dropdown Chevron */}
              <div className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 ring-1 ring-black/5 z-50 animate-fadeInUp">
                {/* Summary Header */}
                <div className="flex items-center gap-3 p-3 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-xs">
                    <UserAvatar seed={effectiveAvatarSeed} size={40} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{profile.name || sampleProfile.name}</p>
                    <p className="text-xs text-[#4255FF] font-semibold">Student Account</p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="space-y-0.5">
                  <Link
                    href="/student-dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-[#EDF0FF] hover:text-[#4255FF] transition-colors"
                  >
                    <HomeIcon className="h-4 w-4 text-[#4255FF]" />
                    <span>Dashboard Overview</span>
                  </Link>
                  <Link
                    href="/student-dashboard?tab=Classes"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-[#EDF0FF] hover:text-[#4255FF] transition-colors"
                  >
                    <BookIcon className="h-4 w-4 text-[#4255FF]" />
                    <span>My Classes</span>
                  </Link>
                </div>

                {/* Divider & Sign out */}
                <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <LogoutIcon className="h-4 w-4 text-red-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area constrained to ~1440px */}
        <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8 pb-16">
          {/* ==================== 2. IDENTITY BANNER (Full-Width Card) ==================== */}
          <section className="overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-sm">
            {/* Teal Banner Strip with Subtle Diamond Pattern */}
            <div
              className="h-32 sm:h-44 w-full relative"
              style={{
                backgroundColor: '#0f6b5a',
                backgroundImage: `
                  linear-gradient(135deg, rgba(255, 255, 255, 0.08) 25%, transparent 25%),
                  linear-gradient(225deg, rgba(255, 255, 255, 0.08) 25%, transparent 25%),
                  linear-gradient(45deg, rgba(255, 255, 255, 0.08) 25%, transparent 25%),
                  linear-gradient(315deg, rgba(255, 255, 255, 0.08) 25%, transparent 25%)
                `,
                backgroundPosition: '24px 0, 24px 0, 0 0, 0 0',
                backgroundSize: '48px 48px',
                backgroundRepeat: 'repeat',
              }}
            />

            {/* Banner Lower Area: Overlapping Avatar + Student Name & Grade */}
            <div className="relative px-6 sm:px-10 pb-7 pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              {/* Circular Avatar overlapping banner line */}
              <div className="relative -mt-16 sm:-mt-24 mb-2 sm:mb-0 shrink-0 self-start">
                <div
                  onClick={() => setIsAvatarModalOpen(true)}
                  title="Click to change your avatar"
                  className="group relative flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-102"
                >
                  <UserAvatar seed={effectiveAvatarSeed} size={144} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    Change
                  </div>
                </div>

                {/* Round Camera / Edit Button on lower-right */}
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  title="Change Avatar"
                  className="absolute bottom-1 right-1 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white hover:bg-slate-50 text-[#0f6b5a] border-2 border-white shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Change student avatar"
                >
                  <CameraIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f6b5a]" />
                </button>
              </div>

              {/* Student Full Name and Grade */}
              <div className="sm:ml-6 flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight truncate">
                  {profile.name || sampleProfile.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs sm:text-sm font-semibold text-slate-600">
                    Grade 10 · Active student
                  </span>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-xs" title="Active Account" />
                </div>
              </div>

              {/* Right side quick action */}
              <div className="flex items-center gap-2 self-start sm:self-end pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <CameraIcon className="w-4 h-4 text-[#0f6b5a]" />
                  <span>Change Avatar</span>
                </button>
              </div>
            </div>
          </section>

          {/* ==================== 3. RECENT BADGES (Empty State) ==================== */}
          <section className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
            {/* Header Row */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Recent badges
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Earned recognitions and skill milestones
                </p>
              </div>

              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200">
                Latest 0 of 0
              </span>
            </div>

            {/* Empty State Presentation */}
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 border-2 border-dashed border-slate-300 mb-3.5 shadow-2xs">
                <MedalIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No badges earned yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 leading-relaxed">
                Complete your classroom lessons, submit homework assignments, and participate in learning quests to unlock your first badges.
              </p>
            </div>

            {/* Dropdown Toggle: View all badges (0) */}
            <div className="pt-2 border-t border-slate-100 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setShowAllBadges(!showAllBadges)}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/60 transition-all cursor-pointer"
                aria-expanded={showAllBadges}
              >
                <span>{showAllBadges ? 'Hide all badges' : 'View all badges (0)'}</span>
                <div
                  className={`transition-transform duration-300 ${
                    showAllBadges ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  <ChevronDownIcon className="w-4 h-4 text-slate-500" />
                </div>
              </button>

              {/* Revealed Info when expanded */}
              {showAllBadges && (
                <div className="w-full text-center py-6 px-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 mt-4 animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-xs font-semibold text-slate-500">
                    0 badges unlocked so far. Check back after finishing your upcoming class activities!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ==================== 4. PERSONAL INFORMATION (Card) ==================== */}
          <section className="rounded-[20px] border border-slate-200/90 bg-white overflow-hidden shadow-sm">
            {/* Header Row */}
            <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Personal information
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  This information helps your teacher and school support you.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFocusEdit}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-slate-300 hover:border-[#0f6b5a] hover:text-[#0f6b5a] bg-white text-slate-700 font-bold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
              >
                <EditIcon className="w-4 h-4 text-[#0f6b5a]" />
                <span>Edit profile</span>
              </button>
            </div>

            {/* Two-Column Form */}
            <form onSubmit={save} className="flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 sm:p-8">
                {/* Field 1: Full name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full name
                  </label>
                  <input
                    ref={fullNameInputRef}
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="e.g. Rodel Apit"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-[#0f6b5a] focus:ring-2 focus:ring-[#0f6b5a]/15 placeholder:text-slate-400"
                  />
                </div>

                {/* Field 2: Email address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="e.g. rodel.apit@student.golearning.edu"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-[#0f6b5a] focus:ring-2 focus:ring-[#0f6b5a]/15 placeholder:text-slate-400"
                  />
                </div>

                {/* Field 3: Student number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Student number
                  </label>
                  <input
                    type="text"
                    value={profile.studentNumber}
                    onChange={(e) => update('studentNumber', e.target.value)}
                    placeholder="e.g. LRN-2026-8941"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-[#0f6b5a] focus:ring-2 focus:ring-[#0f6b5a]/15 placeholder:text-slate-400"
                  />
                </div>

                {/* Field 4: Birth date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Birth date
                  </label>
                  <input
                    type="date"
                    value={profile.birthDate}
                    onChange={(e) => update('birthDate', e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-[#0f6b5a] focus:ring-2 focus:ring-[#0f6b5a]/15"
                  />
                </div>

                {/* Field 5: Guardian name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Guardian name
                  </label>
                  <input
                    type="text"
                    value={profile.guardianName}
                    onChange={(e) => update('guardianName', e.target.value)}
                    placeholder="e.g. Maria Elena Apit"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-[#0f6b5a] focus:ring-2 focus:ring-[#0f6b5a]/15 placeholder:text-slate-400"
                  />
                </div>

                {/* Field 6: Guardian contact */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Guardian contact
                  </label>
                  <input
                    type="text"
                    value={profile.guardianContact}
                    onChange={(e) => update('guardianContact', e.target.value)}
                    placeholder="e.g. +63 917 555 4321"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-[#0f6b5a] focus:ring-2 focus:ring-[#0f6b5a]/15 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Footer Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:px-8 bg-[#f4f7f6] border-t border-slate-200/80 rounded-b-[20px]">
                <div className="flex items-center gap-2">
                  {saved ? (
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700">
                      <CheckIcon className="w-4 h-4 text-emerald-600" />
                      <span>Profile saved successfully.</span>
                    </span>
                  ) : (
                    <p className="text-xs sm:text-sm font-semibold text-slate-600">
                      Update your details, then save your profile.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-7 rounded-xl bg-[#0f6b5a] hover:bg-[#0c5547] active:bg-[#094136] text-white font-bold text-sm shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? (
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <SaveIcon className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Saving profile...' : 'Save profile'}</span>
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>

      {/* Avatar Customization Modal */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        currentSeed={effectiveAvatarSeed}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
        title="Choose Your Cartoon Avatar"
        description="Select a fun character style that represents you in your classes!"
      />
    </div>
  );
}
