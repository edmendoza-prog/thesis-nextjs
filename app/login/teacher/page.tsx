'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import UserAvatar from '@/app/components/UserAvatar';

// 8 Curated Educator Avatars
const TEACHER_AVATARS = [
  { id: 'maria', name: 'Teacher Maria', seed: 'avataaars:TeacherMaria', bg: 'bg-amber-100 border-amber-300' },
  { id: 'liam', name: 'Prof. Liam', seed: 'avataaars:ProfLiam', bg: 'bg-blue-100 border-blue-300' },
  { id: 'clara', name: 'Ms. Clara', seed: 'avataaars:MsClara', bg: 'bg-pink-100 border-pink-300' },
  { id: 'david', name: 'Sir David', seed: 'avataaars:MrDavid', bg: 'bg-indigo-100 border-indigo-300' },
  { id: 'sunny', name: 'Coach Sunny', seed: 'lorelei:Sunny', bg: 'bg-yellow-100 border-yellow-300' },
  { id: 'wonder', name: 'Mentor Grace', seed: 'lorelei:Wonder', bg: 'bg-purple-100 border-purple-300' },
  { id: 'alex', name: 'Guide Alex', seed: 'adventurer:Alex', bg: 'bg-emerald-100 border-emerald-300' },
  { id: 'sparky', name: 'Bot Helper', seed: 'bottts:Sparky', bg: 'bg-cyan-100 border-cyan-300' },
];

const DEPARTMENTS = [
  { id: 'elem', label: 'Elementary Department' },
  { id: 'g1', label: 'Grade 1 Faculty' },
  { id: 'g2', label: 'Grade 2 Faculty' },
  { id: 'g3', label: 'Grade 3 Faculty' },
  { id: 'reading', label: 'Reading & Literacy' },
];

const DESIGNATIONS = [
  { id: 'grade-teacher', label: 'Grade Level Teacher' },
  { id: 'subject-teacher', label: 'Subject Teacher' },
  { id: 'adviser', label: 'Class Adviser' },
  { id: 'master-teacher', label: 'Master Teacher' },
  { id: 'coordinator', label: 'Academic Coordinator' },
];

function TeacherAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: 'login' or 'signup'
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Registration step: 1 (Educator Profile), 2 (Faculty Credentials), 3 (Ready!)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign up state across all 3 steps
  const [fullName, setFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avataaars:TeacherMaria');
  const [department, setDepartment] = useState('Elementary Department');
  const [designation, setDesignation] = useState('Grade Level Teacher');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
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

    if (!fullName.trim()) {
      setError('Please enter your full name and title.');
      return;
    }
    if (!selectedAvatar) {
      setError('Please choose your faculty avatar.');
      return;
    }
    if (!department) {
      setError('Please select your department.');
      return;
    }

    setStep(2);
  };

  // Submission on Step 2
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid institutional email address.');
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
          fullName: fullName.trim(),
          email: cleanEmail,
          password: password,
          role: 'teacher',
          avatarSeed: selectedAvatar,
          employeeId: employeeId.trim() || null,
          department,
          designation,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unable to register faculty account. Please try a different email.');
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

    const cleanEmail = loginEmail.trim().toLowerCase();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: loginPassword,
          role: 'teacher',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Invalid email or password. Please try again!');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in');
      setLoading(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const randomAvatar = TEACHER_AVATARS[Math.floor(Math.random() * TEACHER_AVATARS.length)];
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
              className={`flex-1 h-1.5 rounded-full transition-colors duration-250 ${
                step >= 1 ? 'bg-[#0bc2cf]' : 'bg-[#e5e7eb]'
              }`}
              title="Step 1: Educator Profile"
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-colors duration-250 ${
                step >= 2 ? 'bg-[#0bc2cf]' : 'bg-[#e5e7eb]'
              }`}
              title="Step 2: Faculty Credentials"
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-colors duration-250 ${
                step >= 3 ? 'bg-[#0bc2cf]' : 'bg-[#e5e7eb]'
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
                Welcome Back, Educator!
              </h1>
              <p className="text-base font-medium text-[#6f6f6f] mt-2">
                Enter your institutional email and password to access your faculty workspace.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                  Institutional Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. teacher@school.edu"
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
                  <button
                    type="button"
                    onClick={() =>
                      alert('Please contact the School IT Administrator to reset your faculty credentials.')
                    }
                    className="text-xs font-semibold text-[#6f6f6f] hover:text-[#0bc2cf] transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter your account password"
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
                  {loading ? 'Signing in...' : 'Log in to Workspace'}
                </button>
              </div>
            </form>

            <div className="pt-2 text-center text-sm font-medium text-[#6f6f6f]">
              Don’t have a faculty account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="font-bold text-[#0bc2cf] hover:underline cursor-pointer"
              >
                Create teacher account
              </button>
            </div>
          </div>
        ) : (
          /* ==================== 3-STEP SIGN-UP WORKFLOW ==================== */
          <div>
            {/* ----------------- STEP 1: EDUCATOR PROFILE ----------------- */}
            {step === 1 && (
              <form onSubmit={handleStep1Next} className="space-y-7">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
                    Set up your educator profile
                  </h1>
                  <p className="text-base font-medium text-[#6f6f6f] mt-2">
                    Choose your faculty avatar, display name, and department.
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
                    {TEACHER_AVATARS.map((avatar) => {
                      const isSelected = selectedAvatar === avatar.seed;
                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar.seed)}
                          className={`p-3 sm:p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'border-[#0bc2cf] bg-[#0bc2cf]/10 text-[#0bc2cf]'
                              : 'border-[#e5e7eb] bg-white hover:border-[#0bc2cf]/60 text-[#1a1a1a]'
                          }`}
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center overflow-hidden">
                            <UserAvatar seed={avatar.seed} size={60} />
                          </div>
                          <span className="text-xs font-bold mt-2 truncate w-full text-center">
                            {avatar.name.split(' ')[1] || avatar.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider">
                    Full Name with Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maria Santos, LPT"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] text-base font-medium placeholder-[#9ca3af] focus:border-[#0bc2cf] focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-1 transition-colors"
                    required
                  />
                </div>

                {/* Department & Designation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] text-base font-medium focus:border-[#0bc2cf] focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-1 transition-colors cursor-pointer"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept.id} value={dept.label}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider">
                      Designation
                    </label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] text-base font-medium focus:border-[#0bc2cf] focus-visible:outline-2 focus-visible:outline-[#0bc2cf] focus-visible:outline-offset-1 transition-colors cursor-pointer"
                    >
                      {DESIGNATIONS.map((role) => (
                        <option key={role.id} value={role.label}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
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

            {/* ----------------- STEP 2: CREATE FACULTY ACCOUNT ----------------- */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
                    Create your faculty account
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0bc2cf]/10 text-[#0bc2cf] border border-[#0bc2cf]/25">
                      Faculty Account
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
                      {fullName} • {department}
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

                {/* Institutional Email */}
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. maria.santos@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                {/* Optional Employee ID */}
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Employee ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. T-1001"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
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
                    <span>I confirm that I am an authorized educator or faculty member at GO Learning.</span>
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
                    Welcome, {fullName}!
                  </h1>
                  <p className="text-base font-semibold text-[#0bc2cf] mt-1.5">
                    Your faculty account is ready for {department}.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="border-[1.5px] border-[#e5e7eb] rounded-xl p-5 bg-white text-left text-sm space-y-3">
                  <div className="flex justify-between pb-3 border-b border-[#f3f4f6]">
                    <span className="text-[#6f6f6f] font-medium">Account Type</span>
                    <span className="text-[#1a1a1a] font-bold">Teacher / Faculty</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-[#f3f4f6]">
                    <span className="text-[#6f6f6f] font-medium">Department</span>
                    <span className="text-[#1a1a1a] font-bold">{department}</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-[#f3f4f6]">
                    <span className="text-[#6f6f6f] font-medium">Designation</span>
                    <span className="text-[#1a1a1a] font-bold">{designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6f6f6f] font-medium">Institutional Email</span>
                    <span className="text-[#1a1a1a] font-bold">{email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-[#0bc2cf] hover:bg-[#0aa9b5] text-white font-bold py-4 rounded-xl border-[1.5px] border-[#0bc2cf] transition-colors cursor-pointer text-base"
                >
                  Go to Teacher Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full text-center text-[11px] font-medium text-[#6f6f6f] pt-4 pb-4">
        GO Learning &copy; {new Date().getFullYear()} &bull; Educator &amp; Classroom Management Workspace
      </footer>
    </div>
  );
}

export default function TeacherLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-sm font-semibold text-[#0bc2cf]">
          Loading GO Learning...
        </div>
      }
    >
      <TeacherAuthContent />
    </Suspense>
  );
}
