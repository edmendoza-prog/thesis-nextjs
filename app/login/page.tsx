'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'student' ? 'student' : 'teacher';

  const [role, setRole] = useState<'student' | 'teacher'>(initialRole);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const paramRole = searchParams.get('role');
    if (paramRole === 'student' || paramRole === 'teacher') {
      setRole(paramRole);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match. Please verify.');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Unable to register account. Please check your information.');
          setLoading(false);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to create account');
        setLoading(false);
        return;
      }
    }

    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role,
        }),
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        setError(loginData.error || 'Invalid credentials. Please check your username and password.');
        setLoading(false);
        return;
      }

      if (role === 'teacher') {
        router.push('/dashboard');
      } else {
        router.push('/student-dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication service unavailable');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Left Institutional Showcase Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-slate-950 text-white flex-col justify-between p-12 border-r border-slate-800">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#881337] rounded-lg flex items-center justify-center text-white shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block">
                GO Learning
              </span>
              <span className="text-xs text-slate-400 block">
                Basic Education LMS Portal
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 bg-slate-900 px-3 py-1.5 rounded transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Central Institutional Briefing */}
        <div className="my-auto py-8 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Official Academic Authentication</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {role === 'student'
              ? 'Elementary Student Learning Portal'
              : 'Faculty & Teacher Management Workspace'}
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            {role === 'student'
              ? 'Access your daily curriculum modules, interactive quizzes, homework tasks, and academic achievement records for Grades 1 to 3.'
              : 'Access classroom management tools, student grading records (DepEd SF9), quiz generation utilities, and live session controls.'}
          </p>

          {/* Quick System Indicators */}
          <div className="border-t border-slate-800 pt-5 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>DepEd K-to-12 and MATATAG Curriculum Standards</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Secure Single Sign-On for Enrolled Pupils &amp; Faculty</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Automated Gradebook &amp; Competency Tracking</span>
            </div>
          </div>
        </div>

        {/* Institutional Footer */}
        <div className="text-xs text-slate-500 border-t border-slate-800 pt-4 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} GO Learning</span>
          <span>GO Learning LMS v2.4</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#881337] rounded-lg flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 text-sm">GO Learning LMS</span>
            </Link>
            <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
              ← Home
            </Link>
          </div>

          {/* Role Switcher Tabs */}
          <div className="mb-6 p-1 rounded-lg bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setError('');
              }}
              className={`py-2 px-3 rounded-md font-bold text-xs transition-colors cursor-pointer ${
                role === 'student'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setError('');
              }}
              className={`py-2 px-3 rounded-md font-bold text-xs transition-colors cursor-pointer ${
                role === 'teacher'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teacher Workspace
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'signup'
                ? `Register ${role === 'student' ? 'Student' : 'Faculty'} Account`
                : `${role === 'student' ? 'Student' : 'Faculty'} Sign In`}
            </h2>
            <p className="text-slate-600 text-xs mt-1">
              {role === 'student'
                ? 'Enter your student credentials to access active courses and activities.'
                : 'Enter your teacher credentials to access classroom and gradebook tools.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-lg mb-5 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-xs">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder={role === 'student' ? 'e.g. Juan dela Cruz' : 'e.g. Maria Santos, LPT'}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:border-[#881337] focus:ring-1 focus:ring-[#881337] focus:outline-none transition-colors text-xs text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">
                {role === 'student' ? 'Student ID or Email Address' : 'Institutional Email Address'}
              </label>
              <input
                type="text"
                placeholder={role === 'student' ? 'student@school.edu' : 'teacher@school.edu'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:border-[#881337] focus:ring-1 focus:ring-[#881337] focus:outline-none transition-colors text-xs text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold text-xs">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Minimum 6 characters' : 'Enter account password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:border-[#881337] focus:ring-1 focus:ring-[#881337] focus:outline-none transition-colors text-xs text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-xs">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:border-[#881337] focus:ring-1 focus:ring-[#881337] focus:outline-none transition-colors text-xs text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#881337] border-slate-300 rounded focus:ring-1 focus:ring-[#881337]"
                  />
                  <span className="ml-2 font-medium">Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Please contact the School LMS Administrator or Faculty Advisor to reset your credentials.')}
                  className="text-[#881337] hover:text-[#9F1239] font-bold transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#881337] hover:bg-[#9F1239] active:bg-[#701a35] text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-xs cursor-pointer text-xs sm:text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <span>{mode === 'signup' ? 'Complete Registration' : `Sign In to ${role === 'student' ? 'Student Portal' : 'Teacher Workspace'}`}</span>
              )}
            </button>

            {/* Toggle Mode */}
            <p className="text-center text-slate-600 text-xs pt-2">
              {mode === 'signup' ? 'Already have an institutional account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signup' ? 'login' : 'signup');
                  setError('');
                }}
                className="text-[#881337] hover:text-[#9F1239] font-bold transition-colors cursor-pointer"
              >
                {mode === 'signup' ? 'Sign In' : 'Create Account'}
              </button>
            </p>

            {/* Support info */}
            <div className="pt-4 border-t border-slate-200 text-center">
              <p className="text-[11px] text-slate-500">
                GO Learning LMS • Basic Education Department
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-xs font-semibold text-slate-600">Loading portal...</div>}>
      <LoginPortalContent />
    </Suspense>
  );
}
