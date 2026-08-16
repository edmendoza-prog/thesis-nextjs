'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>

      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full p-4 shadow-2xl mb-4">
            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Sacred Heart LMS</h1>
          <p className="text-white/80">Welcome to your learning adventure!</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* User Type Selector */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setUserType('student')}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
                userType === 'student'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setUserType('teacher')}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
                userType === 'teacher'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Teacher
            </button>
          </div>

          <form className="space-y-5">
            {/* Email/Username */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {userType === 'student' ? 'Student ID' : 'Email'}
              </label>
              <input
                type="text"
                placeholder={userType === 'student' ? 'Enter your student ID' : 'Enter your email'}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>

          </form>

          {/* Quick Access for Students */}
          {userType === 'student' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-3">Quick Demo Access</p>
              <Link
                href="/student-dashboard"
                className="block w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-xl text-center transition-colors"
              >
                Try Student Dashboard 🎮
              </Link>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-white hover:text-white/80 font-semibold transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
