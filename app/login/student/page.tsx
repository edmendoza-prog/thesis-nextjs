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
  { id: '1', label: 'Grade 1' },
  { id: '2', label: 'Grade 2' },
  { id: '3', label: 'Grade 3' },
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

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [parentGuardian, setParentGuardian] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
          studentNumber: gradeLevel.replace(/\s+/g, ''),
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
    <div className="min-h-screen w-full bg-white flex flex-col justify-between selection:bg-[#0bc2cf]/20 selection:text-[#0bc2cf]">
      {/* Top Bar: Full-width Header with Logo on left and Toggle on right */}
      <header className="w-full px-6 sm:px-10 lg:px-12 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-black text-[#1a1a1a] tracking-tight hover:opacity-90 transition-opacity font-[family-name:var(--font-titan),system-ui]"
          aria-label="GO Learning Home"
        >
          GO Learning
        </Link>

        <div>
          {mode === 'signup' ? (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className="bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] text-[#1a1a1a] font-bold text-sm px-4 py-2 hover:border-[#0bc2cf] hover:text-[#0bc2cf] hover:bg-[#0bc2cf]/5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-2"
            >
              Log in
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className="bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] text-[#1a1a1a] font-bold text-sm px-4 py-2 hover:border-[#0bc2cf] hover:text-[#0bc2cf] hover:bg-[#0bc2cf]/5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-2"
            >
              Sign Up
            </button>
          )}
        </div>
      </header>

      {/* Centered Form Area */}
      <main className="w-full max-w-[580px] sm:max-w-[640px] mx-auto my-auto px-5 sm:px-8 py-8">

        {mode === 'signup' && (
          /* 3 Thin Progress Bars above the form that turn teal as user advances */
          <div className="flex gap-2.5 w-full mb-9" aria-label="Sign-up Progress">
            <div
              className={`flex-1 h-1.5 rounded-full transition-colors duration-250 ${step >= 1 ? 'bg-[#0bc2cf]' : 'bg-[#e5e7eb]'
                }`}
              title="Step 1: About You"
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-colors duration-250 ${step >= 2 ? 'bg-[#0bc2cf]' : 'bg-[#e5e7eb]'
                }`}
              title="Step 2: Account"
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-colors duration-250 ${step >= 3 ? 'bg-[#0bc2cf]' : 'bg-[#e5e7eb]'
                }`}
              title="Step 3: Ready"
            />
          </div>
        )}

        {/* Error Message Box */}
        {error && (
          <div
            className="bg-[#fef2f2] border-[1.5px] border-[#fecaca] text-[#991b1b] px-4 py-3.5 rounded-xl mb-6 text-base font-semibold flex items-center gap-2.5 animate-shake"
            role="alert"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {mode === 'login' ? (
          /* ==================== LOGIN VIEW ==================== */
          <div className="space-y-7">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
                Welcome Back!
              </h1>
              <p className="text-base font-medium text-[#6f6f6f] mt-2">
                Enter your student handle or email to sign in.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. sammy or sammy@school.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] text-base font-medium placeholder-[#9ca3af] focus:border-[#0bc2cf] focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-1 transition-colors"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-[#1a1a1a]">
                    Password
                  </label>
                  <span className="text-xs text-[#6f6f6f]">
                    Ask your teacher if you forgot
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter your secret password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] text-base font-medium placeholder-[#9ca3af] focus:border-[#0bc2cf] focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-1 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6f6f6f] hover:text-[#1a1a1a] cursor-pointer text-sm font-semibold"
                  >
                    {showLoginPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-[#1a1a1a]">
                  <input
                    type="checkbox"
                    checked={loginRemember}
                    onChange={(e) => setLoginRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-[1.5px] border-[#e5e7eb] accent-[#0bc2cf] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0bc2cf] hover:bg-[#0aa9b5] text-white font-bold py-3.5 rounded-xl border-[1.5px] border-[#0bc2cf] transition-colors cursor-pointer text-base flex items-center justify-center gap-2 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-2"
                >
                  {loading ? 'Signing in...' : 'Log in to GO Learning'}
                </button>
              </div>
            </form>

            <div className="pt-2 text-center text-sm font-medium text-[#6f6f6f]">
              Don’t have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="font-bold text-[#0bc2cf] hover:underline cursor-pointer"
              >
                Create student account
              </button>
            </div>
          </div>
        ) : (
          /* ==================== 3-STEP SIGN-UP WORKFLOW ==================== */
          <div>
            {/* ----------------- STEP 1: ABOUT YOU ----------------- */}
            {step === 1 && (
              <form onSubmit={handleStep1Next} className="space-y-7">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
                    Who are you?
                  </h1>
                  <p className="text-base font-medium text-[#6f6f6f] mt-2">
                    Choose your cartoon avatar and grade level.
                  </p>
                </div>

                {/* Avatar Selection Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">
                      Choose Avatar
                    </label>
                    <button
                      type="button"
                      onClick={handleRandomizeAvatar}
                      className="text-sm font-bold text-[#0bc2cf] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🎲</span> Random
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3 sm:gap-3.5">
                    {CHIBI_AVATARS.map((avatar) => {
                      const isSelected = selectedAvatar === avatar.seed;
                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar.seed)}
                          className={`p-3 sm:p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${isSelected
                              ? 'border-[#0bc2cf] bg-[#0bc2cf]/10 text-[#0bc2cf]'
                              : 'border-[#e5e7eb] bg-white hover:border-[#0bc2cf]/60 text-[#1a1a1a]'
                            }`}
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center overflow-hidden">
                            <UserAvatar seed={avatar.seed} size={60} />
                          </div>
                          <span className="text-xs font-bold mt-2 truncate w-full text-center">
                            {avatar.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Display Name Input */}
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider">
                    Full Name or Nickname
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sam Rivera"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] text-base font-medium placeholder-[#9ca3af] focus:border-[#0bc2cf] focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-1 transition-colors"
                    required
                  />
                </div>

                {/* Grade Level Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider">
                    Grade Level
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] text-base font-medium focus:border-[#0bc2cf] focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-1 transition-colors cursor-pointer"
                  >
                    {GRADE_LEVELS.map((g) => (
                      <option key={g.id} value={g.label}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Navigation Buttons */}
                <div className="pt-2 flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="flex-1 bg-white border-[1.5px] border-[#e5e7eb] rounded-xl text-[#1a1a1a] font-bold text-base py-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-center"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-[#0bc2cf] hover:bg-[#0aa9b5] text-white font-bold text-base py-3.5 rounded-xl border-[1.5px] border-[#0bc2cf] transition-colors cursor-pointer text-center"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* ----------------- STEP 2: CREATE ACCOUNT ----------------- */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
                    Tell us about you
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0bc2cf]/10 text-[#0bc2cf] border border-[#0bc2cf]/25">
                      Student Account
                    </span>
                  </div>
                </div>

                {/* Chosen Identity Summary */}
                <div className="flex items-center justify-between p-4 rounded-xl border-[1.5px] border-[#e5e7eb] bg-[#f9fafb]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden border border-[#e5e7eb]">
                      <UserAvatar seed={selectedAvatar} size={44} />
                    </div>
                    <div className="truncate text-sm font-bold text-[#1a1a1a]">
                      {displayName} • {gradeLevel}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-bold text-[#0bc2cf] hover:underline cursor-pointer shrink-0 ml-2"
                  >
                    Edit
                  </button>
                </div>

                {/* Username or Email */}
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. sam2026 or sam@example.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] text-base font-medium placeholder-[#9ca3af] focus:border-[#0bc2cf] focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-1 transition-colors"
                    required
                  />
                </div>

                {/* Password Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3.5 rounded-xl border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] text-base font-medium placeholder-[#9ca3af] focus:border-[#0bc2cf] focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-1 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6f6f6f] hover:text-[#1a1a1a] cursor-pointer text-sm font-semibold"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-type password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3.5 rounded-xl border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] text-base font-medium placeholder-[#9ca3af] focus:border-[#0bc2cf] focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-1 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6f6f6f] hover:text-[#1a1a1a] cursor-pointer text-sm font-semibold"
                      >
                        {showConfirmPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional Parent / Guardian */}
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Parent or Guardian Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maria Rivera"
                    value={parentGuardian}
                    onChange={(e) => setParentGuardian(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] text-base font-medium placeholder-[#9ca3af] focus:border-[#0bc2cf] focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-1 transition-colors"
                  />
                </div>

                {/* Confirmation Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-3 cursor-pointer text-sm font-medium text-[#1a1a1a] leading-snug">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 w-4 h-4 rounded border-[1.5px] border-[#e5e7eb] accent-[#0bc2cf] cursor-pointer"
                      required
                    />
                    <span>A parent or guardian knows I am signing up for GO Learning.</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                    className="flex-1 bg-white border-[1.5px] border-[#e5e7eb] rounded-xl text-[#1a1a1a] font-bold text-base py-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-center"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-[#0bc2cf] hover:bg-[#0aa9b5] text-white font-bold text-base py-3.5 rounded-xl border-[1.5px] border-[#0bc2cf] transition-colors cursor-pointer text-center disabled:opacity-60"
                  >
                    {loading ? 'Creating...' : 'Finish'}
                  </button>
                </div>
              </form>
            )}

            {/* ----------------- STEP 3: READY ----------------- */}
            {step === 3 && (
              <div className="text-center py-6 space-y-7">
                <div className="w-24 h-24 rounded-full bg-[#0bc2cf]/10 border-2 border-[#0bc2cf] flex items-center justify-center overflow-hidden mx-auto">
                  <UserAvatar seed={selectedAvatar} size={96} className="w-full h-full object-cover" />
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
                    Welcome, {displayName}!
                  </h1>
                  <p className="text-base font-semibold text-[#0bc2cf] mt-1.5">
                    Your student account is ready for {gradeLevel}.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="border-[1.5px] border-[#e5e7eb] rounded-xl p-5 bg-white text-left text-sm space-y-3">
                  <div className="flex justify-between pb-3 border-b border-[#f3f4f6]">
                    <span className="text-[#6f6f6f] font-medium">Account Type</span>
                    <span className="text-[#1a1a1a] font-bold">Student</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-[#f3f4f6]">
                    <span className="text-[#6f6f6f] font-medium">Grade Level</span>
                    <span className="text-[#1a1a1a] font-bold">
                      {gradeLevel}
                    </span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-[#f3f4f6]">
                    <span className="text-[#6f6f6f] font-medium">Student Handle</span>
                    <span className="text-[#1a1a1a] font-bold">@{username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6f6f6f] font-medium">Full Name</span>
                    <span className="text-[#1a1a1a] font-bold">{displayName}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/student-dashboard')}
                  className="w-full bg-[#0bc2cf] hover:bg-[#0aa9b5] text-white font-bold py-4 rounded-xl border-[1.5px] border-[#0bc2cf] transition-colors cursor-pointer text-base"
                >
                  Start Learning
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full text-center text-[11px] font-medium text-[#6f6f6f] pt-4">
        GO Learning &copy; {new Date().getFullYear()} &bull; Safe, interactive learning for every kid
      </footer>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center p-6 text-sm font-semibold text-[#0bc2cf]">Loading GO Learning...</div>}>
      <StudentAuthContent />
    </Suspense>
  );
}
