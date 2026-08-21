'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [role, setRole] = useState<'student' | 'teacher'>('teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match!');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    // Redirect to appropriate dashboard
    if (role === 'teacher') {
      router.push('/dashboard');
    } else {
      router.push('/student-dashboard');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
    setError('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary-500 relative overflow-hidden flex-col p-12">
        {/* Decorative circles */}
        <div 
          className={`absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ transitionDelay: '300ms' }}
        ></div>
        <div 
          className={`absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ transitionDelay: '500ms' }}
        ></div>
        <div 
          className={`absolute top-1/2 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ transitionDelay: '700ms' }}
        ></div>

        {/* Logo */}
        <div 
          className={`flex items-center gap-3 mb-auto transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Go Learning LMS
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 my-auto">
          <h1 
            className={`text-4xl font-bold text-white mb-6 transition-all duration-700 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ fontFamily: 'var(--font-heading)', transitionDelay: '200ms' }}
          >
            Learning that feels like playtime!
          </h1>
          <p 
            className={`text-white/75 text-lg leading-relaxed mb-8 transition-all duration-700 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            Earn points, collect badges, and climb the leaderboard while mastering Grade 1 to 3 lessons at Go Learning.
          </p>
          
          {/* Classroom image placeholder */}
          <div 
            className={`rounded-2xl border-2 border-white/20 overflow-hidden transition-all duration-700 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <img 
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop" 
              alt="Happy elementary students in classroom"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>

        {/* Copyright */}
        <p 
          className={`text-white/45 text-sm mt-auto transition-opacity duration-700 ease-out ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '700ms' }}
        >
          © 2026 Go Learning. All rights reserved.
        </p>
      </div>

      {/* Right Panel */}
      <div 
        className={`flex-1 bg-background-50 flex items-center justify-center p-6 lg:p-12 transition-opacity duration-700 ease-out ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-foreground-900 text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Go Learning LMS
          </span>
        </div>

        {/* Sliding container */}
        <div className="w-full max-w-md overflow-hidden">
          <div 
            className="flex w-[200%] transition-transform duration-500 ease-out"
            style={{ 
              transform: mode === 'signup' ? 'translateX(0%)' : 'translateX(-50%)',
              transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Sign Up Form */}
            <div className="w-1/2 px-2">
              <h2 
                className="text-3xl font-bold text-foreground-900 mb-2" 
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Create your account
              </h2>
              <p className="text-foreground-500 mb-6">
                Join the fun and start your learning adventure today!
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role selector */}
                <div>
                  <label className="block text-foreground-700 font-semibold mb-3 text-sm">
                    I am a...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${
                        role === 'student'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-background-200 text-foreground-500 hover:border-background-300'
                      }`}
                    >
                      <i className="ri-user-3-line text-xl"></i>
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${
                        role === 'teacher'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-background-200 text-foreground-500 hover:border-background-300'
                      }`}
                    >
                      <i className="ri-award-line text-xl"></i>
                      Teacher
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-foreground-700 font-semibold mb-2 text-sm">
                    Full Name
                  </label>
                  <div className="relative">
                    <i className="ri-user-line absolute left-4 top-1/2 -translate-y-1/2 text-foreground-400 text-lg"></i>
                    <input
                      type="text"
                      placeholder="e.g. Maria Santos"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-background-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100/50 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-foreground-700 font-semibold mb-2 text-sm">
                    Email Address
                  </label>
                  <div className="relative">
                    <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-foreground-400 text-lg"></i>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-background-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100/50 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-foreground-700 font-semibold mb-2 text-sm">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 pr-11 py-3 rounded-xl border-2 border-background-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100/50 focus:outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-600 transition-colors"
                      >
                        <i className={showPassword ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'}></i>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-foreground-700 font-semibold mb-2 text-sm">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repeat password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 pr-11 py-3 rounded-xl border-2 border-background-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100/50 focus:outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-600 transition-colors"
                      >
                        <i className={showConfirmPassword ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'}></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold py-4 rounded-xl transition-colors duration-200"
                >
                  Create Account
                </button>

                {/* Toggle to login */}
                <p className="text-center text-foreground-600 text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
                  >
                    Log in
                  </button>
                </p>

                {/* Back to Home */}
                <div className="text-center pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-foreground-500 hover:text-primary-500 font-semibold text-sm transition-colors"
                  >
                    <i className="ri-arrow-left-line"></i>
                    Back to Home
                  </Link>
                </div>
              </form>
            </div>

            {/* Login Form */}
            <div className="w-1/2 px-2">
              <h2 
                className="text-3xl font-bold text-foreground-900 mb-2" 
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Welcome back!
              </h2>
              <p className="text-foreground-500 mb-6">
                Log in to continue your learning journey.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-foreground-700 font-semibold mb-2 text-sm">
                    Email Address
                  </label>
                  <div className="relative">
                    <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-foreground-400 text-lg"></i>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-background-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100/50 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-foreground-700 font-semibold mb-2 text-sm">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 pr-11 py-3 rounded-xl border-2 border-background-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100/50 focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-600 transition-colors"
                    >
                      <i className={showPassword ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'}></i>
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-background-300 rounded focus:ring-2 focus:ring-primary-100"
                    />
                    <span className="ml-2 text-foreground-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold py-4 rounded-xl transition-colors duration-200"
                >
                  Log In
                </button>

                {/* Toggle to signup */}
                <p className="text-center text-foreground-600 text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

