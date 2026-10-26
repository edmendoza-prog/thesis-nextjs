'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import UserAvatar from '@/app/components/UserAvatar';

// 8 Curated Chibi Student Avatars
const CHIBI_AVATARS = [
  { id: 'sammy', name: 'Sunny Sam', seed: 'avataaars:Sammy', bg: 'bg-amber-100 border-amber-300' },
  { id: 'lily', name: 'Star Lily', seed: 'avataaars:Lily', bg: 'bg-pink-100 border-pink-300' },
  { id: 'max', name: 'Super Max', seed: 'avataaars:Max', bg: 'bg-blue-100 border-blue-300' },
  { id: 'zoe', name: 'Clever Zoe', seed: 'avataaars:Zoe', bg: 'bg-purple-100 border-purple-300' },
  { id: 'alex', name: 'Dino Alex', seed: 'adventurer:Alex', bg: 'bg-emerald-100 border-emerald-300' },
  { id: 'oliver', name: 'Brave Oliver', seed: 'adventurer:Oliver', bg: 'bg-indigo-100 border-indigo-300' },
  { id: 'sparky', name: 'Sparky Bot', seed: 'bottts:Sparky', bg: 'bg-cyan-100 border-cyan-300' },
  { id: 'happystar', name: 'Happy Star', seed: 'fun-emoji:HappyStar', bg: 'bg-yellow-100 border-yellow-300' },
];

const GRADE_LEVELS = [
  { id: '1', label: 'Grade 1', icon: '🌟', tagline: 'First Steps & Phonics' },
  { id: '2', label: 'Grade 2', icon: '🚀', tagline: 'Reading & Math Quests' },
  { id: '3', label: 'Grade 3', icon: '🏆', tagline: 'Master Explorers' },
];

const SECTION_OPTIONS = [
  'Section A - Emerald',
  'Section B - Diamond',
  'Section C - Ruby',
  'Section D - Sapphire',
  'Section 1 - Sampaguita',
];

function StudentAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: 'login' or 'signup'
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Registration step: 1 (About You), 2 (Create Account), 3 (Ready!)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign up state across all 3 steps
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avataaars:Sammy');
  const [gradeLevel, setGradeLevel] = useState('Grade 1');
  const [section, setSection] = useState(SECTION_OPTIONS[0]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [parentGuardian, setParentGuardian] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('mode') === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  // Validation for Step 1
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please tell us your name or nickname!');
      return;
    }
    if (!selectedAvatar) {
      setError('Please choose your favorite cartoon avatar!');
      return;
    }
    if (!gradeLevel) {
      setError('Please choose your Grade Level!');
      return;
    }

    setStep(2);
  };

  // Submission on Step 2
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Please choose a username or email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match! Please check again.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: displayName.trim(),
          email: cleanUsername,
          password: password,
          role: 'student',
          avatarSeed: selectedAvatar,
          guardianName: parentGuardian.trim() || null,
          studentNumber: `${gradeLevel.replace(/\s+/g, '')}-${section.split(' ')[0]}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unable to create your account. Please try a different username.');
        setLoading(false);
        return;
      }

      // Move to celebration step 3!
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Standard Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail.replace(/[^a-z0-9._-]/g, '')}@student.golearning.edu`;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: loginPassword,
          role: 'student',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Invalid username/email or password. Please try again!');
        setLoading(false);
        return;
      }

      router.push('/student-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in');
      setLoading(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const randomAvatar = CHIBI_AVATARS[Math.floor(Math.random() * CHIBI_AVATARS.length)];
    setSelectedAvatar(randomAvatar.seed);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 py-3.5 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E11D48] to-[#9F1239] rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <span className="text-slate-900 text-lg font-black tracking-tight">
              Go <span className="text-[#E11D48]">Learning</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[#881337] text-[10px] font-extrabold uppercase tracking-wider">
              🎒 Student Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-900 hidden sm:inline-block transition-colors"
          >
            ← Home
          </Link>
          <Link
            href="/login/teacher"
            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>🎓 Teacher Portal</span>
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* Main Form Center Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-2xl">
          {mode === 'login' ? (
            /* ==================== LOGIN VIEW ==================== */
            <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-xl border border-slate-200/80 animate-fadeIn">
              <div className="text-center max-w-sm mx-auto mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[#881337] text-xs font-bold uppercase tracking-wider mb-3">
                  <span>⭐</span>
                  <span>Student Sign In</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Welcome Back!
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Ready to continue your learning adventure?
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-2">
                  <i className="ri-error-warning-line text-lg shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-[#881337] font-bold mb-1.5 text-xs">
                    Username or Student Email
                  </label>
                  <div className="relative">
                    <i className="ri-user-smile-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type="text"
                      placeholder="e.g. maya or maya@student.golearning.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#E11D48] focus:ring-3 focus:ring-[#FCE7F0] focus:outline-none transition-all text-sm text-slate-900 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#881337] font-bold mb-1.5 text-xs">
                    Password
                  </label>
                  <div className="relative">
                    <i className="ri-lock-password-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter your secret password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#E11D48] focus:ring-3 focus:ring-[#FCE7F0] focus:outline-none transition-all text-sm text-slate-900 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <i className={showLoginPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center cursor-pointer text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={loginRemember}
                      onChange={(e) => setLoginRemember(e.target.checked)}
                      className="w-4 h-4 text-[#E11D48] border-slate-300 rounded focus:ring-2 focus:ring-[#FCE7F0]"
                    />
                    <span className="ml-2">Remember me</span>
                  </label>
                  <span className="text-slate-400 text-[11px]">Ask your teacher if you forgot your password</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E11D48] hover:bg-[#BE123C] active:bg-[#9F1239] text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-md shadow-[#E11D48]/25 hover:shadow-lg hover:shadow-[#E11D48]/35 cursor-pointer text-base disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <i className="ri-loader-4-line animate-spin" /> : '🚀'}
                  <span>Log In to Dashboard</span>
                </button>
              </form>
            </div>
          ) : (
            /* ==================== 3-STEP REGISTRATION FLOW ==================== */
            <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-xl border border-[#FBCFE8]/60 animate-fadeIn">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between max-w-md mx-auto">
                  {/* Step 1 Pill */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl font-extrabold text-sm transition-all ${
                        step === 1
                          ? 'bg-[#E11D48] text-white shadow-md shadow-[#E11D48]/30 scale-105 ring-4 ring-[#FCE7F0]'
                          : step > 1
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step > 1 ? '✓' : '1'}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        step === 1 ? 'text-[#E11D48]' : step > 1 ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      About You
                    </span>
                  </div>

                  {/* Divider Line 1-2 */}
                  <div
                    className={`h-1 flex-1 mx-2 rounded-full transition-colors ${
                      step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />

                  {/* Step 2 Pill */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl font-extrabold text-sm transition-all ${
                        step === 2
                          ? 'bg-[#E11D48] text-white shadow-md shadow-[#E11D48]/30 scale-105 ring-4 ring-[#FCE7F0]'
                          : step > 2
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step > 2 ? '✓' : '2'}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        step === 2 ? 'text-[#E11D48]' : step > 2 ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      Account
                    </span>
                  </div>

                  {/* Divider Line 2-3 */}
                  <div
                    className={`h-1 flex-1 mx-2 rounded-full transition-colors ${
                      step === 3 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />

                  {/* Step 3 Pill */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl font-extrabold text-sm transition-all ${
                        step === 3
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-400/30 scale-105 ring-4 ring-emerald-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      3
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        step === 3 ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      Ready!
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-2">
                  <i className="ri-error-warning-line text-lg shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* ----------------- STEP 1: ABOUT YOU ----------------- */}
              {step === 1 && (
                <form onSubmit={handleStep1Next} className="space-y-6 animate-fadeIn">
                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#881337] tracking-tight">
                      Let’s Get Started! 👋
                    </h2>
                    <p className="text-[#4C1D2C]/70 text-sm mt-1">
                      Tell us a little about you and pick your avatar.
                    </p>
                  </div>

                  {/* 1. Avatar Selection Area */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[#881337] font-extrabold text-xs uppercase tracking-wider">
                        Pick Your Chibi Avatar
                      </label>
                      <button
                        type="button"
                        onClick={handleRandomizeAvatar}
                        className="text-xs font-bold text-[#E11D48] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>🎲</span> Surprise Me!
                      </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                      {CHIBI_AVATARS.map((avatar) => {
                        const isSelected = selectedAvatar === avatar.seed;
                        return (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar.seed)}
                            className={`group relative flex flex-col items-center p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#E11D48] bg-[#FCE7F0] shadow-md ring-2 ring-[#E11D48]/25 scale-105'
                                : 'border-slate-100 bg-white hover:border-[#FBCFE8] hover:bg-[#FFF1F5]'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center p-1 overflow-hidden transition-transform group-hover:scale-105 ${avatar.bg}`}>
                              <UserAvatar seed={avatar.seed} size={44} className="w-full h-full" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 mt-1 truncate w-full text-center">
                              {avatar.name.split(' ')[0]}
                            </span>
                            {isSelected && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E11D48] text-white text-[9px] font-bold shadow-xs">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Display Name */}
                  <div>
                    <label className="block text-[#881337] font-extrabold mb-1.5 text-xs uppercase tracking-wider">
                      Your Name or Nickname
                    </label>
                    <div className="relative">
                      <i className="ri-pencil-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                      <input
                        type="text"
                        placeholder="e.g. Maya, Toby, Leo, Lily"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#E11D48] focus:ring-3 focus:ring-[#FCE7F0] focus:outline-none transition-all text-sm text-slate-900 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* 3. Grade Level Selection */}
                  <div>
                    <label className="block text-[#881337] font-extrabold mb-2 text-xs uppercase tracking-wider">
                      Select Your Grade Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {GRADE_LEVELS.map((g) => {
                        const isSelected = gradeLevel === g.label;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setGradeLevel(g.label)}
                            className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? 'border-[#E11D48] bg-[#FCE7F0] shadow-md ring-2 ring-[#E11D48]/20 text-[#881337]'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-[#FBCFE8]'
                            }`}
                          >
                            <span className="text-2xl mb-1">{g.icon}</span>
                            <span className="font-extrabold text-sm">{g.label}</span>
                            <span className="text-[10px] text-slate-500 font-medium mt-0.5">{g.tagline}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Section Selection */}
                  <div>
                    <label className="block text-[#881337] font-extrabold mb-1.5 text-xs uppercase tracking-wider">
                      Class Section
                    </label>
                    <div className="relative">
                      <select
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#E11D48] focus:ring-3 focus:ring-[#FCE7F0] focus:outline-none transition-all text-sm text-slate-900 font-medium cursor-pointer"
                      >
                        {SECTION_OPTIONS.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      ← Back to Log In
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#E11D48] px-8 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-md shadow-[#E11D48]/25 hover:bg-[#BE123C] hover:shadow-lg transition cursor-pointer"
                    >
                      <span>Next Step</span>
                      <span>→</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ----------------- STEP 2: CREATE YOUR ACCOUNT ----------------- */}
              {step === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-5 animate-fadeIn">
                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#881337] tracking-tight">
                      Create Your Account 🔐
                    </h2>
                    <p className="text-[#4C1D2C]/70 text-sm mt-1">
                      Choose your username and password.
                    </p>
                  </div>

                  {/* Chosen Identity Badge */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FCE7F0] border border-[#FBCFE8]">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs overflow-hidden">
                      <UserAvatar seed={selectedAvatar} size={40} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#E11D48] uppercase tracking-wider">
                        Learning Explorer
                      </p>
                      <p className="text-sm font-extrabold text-[#881337] truncate">
                        {displayName} • {gradeLevel} ({section.split(' - ')[0]})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-[#E11D48] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-[#881337] font-extrabold mb-1.5 text-xs uppercase tracking-wider">
                      Username or Email
                    </label>
                    <div className="relative">
                      <i className="ri-user-star-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                      <input
                        type="text"
                        placeholder="e.g. maya2026 or maya@school.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#E11D48] focus:ring-3 focus:ring-[#FCE7F0] focus:outline-none transition-all text-sm text-slate-900 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#881337] font-extrabold mb-1.5 text-xs uppercase tracking-wider">
                        Password
                      </label>
                      <div className="relative">
                        <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#E11D48] focus:ring-3 focus:ring-[#FCE7F0] focus:outline-none transition-all text-sm text-slate-900 font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#881337] font-extrabold mb-1.5 text-xs uppercase tracking-wider">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <i className="ri-lock-check-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repeat password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#E11D48] focus:ring-3 focus:ring-[#FCE7F0] focus:outline-none transition-all text-sm text-slate-900 font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Checklist */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${
                        password.length >= 6
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {password.length >= 6 ? '✓' : '•'} 6+ Characters
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${
                        password && password === confirmPassword
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {password && password === confirmPassword ? '✓' : '•'} Passwords Match
                    </span>
                  </div>

                  {/* Optional Parent / Guardian Field */}
                  <div>
                    <label className="block text-[#881337] font-bold mb-1 text-xs">
                      Parent or Guardian Name (Optional)
                    </label>
                    <div className="relative">
                      <i className="ri-parent-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                      <input
                        type="text"
                        placeholder="e.g. Maria Santos"
                        value={parentGuardian}
                        onChange={(e) => setParentGuardian(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#E11D48] focus:ring-3 focus:ring-[#FCE7F0] focus:outline-none transition-all text-xs sm:text-sm text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setError('');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                    >
                      <span>←</span>
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#E11D48] px-8 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-md shadow-[#E11D48]/25 hover:bg-[#BE123C] hover:shadow-lg transition cursor-pointer disabled:opacity-60"
                    >
                      {loading ? <i className="ri-loader-4-line animate-spin" /> : '🚀'}
                      <span>Create Account &amp; Continue</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ----------------- STEP 3: READY TO LEARN ----------------- */}
              {step === 3 && (
                <div className="text-center py-4 space-y-6 animate-fadeIn">
                  {/* Confetti Celebration Stars */}
                  <div className="flex items-center justify-center gap-3 text-3xl animate-bounce">
                    <span>🎉</span>
                    <span>⭐</span>
                    <span>🎊</span>
                    <span>🌟</span>
                  </div>

                  {/* Prominent Avatar Display with Halo */}
                  <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-linear-to-tr from-pink-300 via-[#E11D48] to-rose-400 animate-spin blur-xs opacity-75" />
                    <div className="relative w-28 h-28 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden p-1">
                      <UserAvatar seed={selectedAvatar} size={110} className="w-full h-full" />
                    </div>
                    <span className="absolute bottom-0 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-base shadow-md border-2 border-white">
                      ✓
                    </span>
                  </div>

                  <div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#881337] tracking-tight">
                      You’re All Set! 🎉
                    </h2>
                    <p className="text-lg font-bold text-[#E11D48] mt-2">
                      Welcome to Go-Learning, {displayName}!
                    </p>
                    <p className="text-[#4C1D2C]/80 text-sm max-w-md mx-auto mt-1 leading-relaxed">
                      Your learning adventure is ready. You are enrolled in {gradeLevel} ({section.split(' - ')[0]}). Let’s start learning!
                    </p>
                  </div>

                  {/* Highlights Pill Box */}
                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto p-4 rounded-2xl bg-[#FFF1F5] border border-[#FBCFE8] text-xs">
                    <div>
                      <p className="text-base">🏆</p>
                      <p className="font-extrabold text-[#881337] mt-1">Earn Points</p>
                      <p className="text-[10px] text-slate-500">Finish quests</p>
                    </div>
                    <div>
                      <p className="text-base">🎨</p>
                      <p className="font-extrabold text-[#881337] mt-1">My Avatar</p>
                      <p className="text-[10px] text-slate-500">Customized</p>
                    </div>
                    <div>
                      <p className="text-base">📚</p>
                      <p className="font-extrabold text-[#881337] mt-1">Fun Quizzes</p>
                      <p className="text-[10px] text-slate-500">Learn & play</p>
                    </div>
                  </div>

                  {/* Big Primary Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => router.push('/student-dashboard')}
                      className="w-full max-w-md bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold py-4 px-8 rounded-2xl transition-all duration-200 shadow-xl shadow-[#E11D48]/30 hover:shadow-2xl hover:scale-102 cursor-pointer text-lg flex items-center justify-center gap-2 mx-auto"
                    >
                      <span>Start Learning</span>
                      <span>🚀</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white">
        &copy; {new Date().getFullYear()} GO Learning LMS • Elementary Student Workspace
      </footer>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-sm font-semibold text-[#E11D48]">Loading student portal...</div>}>
      <StudentAuthContent />
    </Suspense>
  );
}
