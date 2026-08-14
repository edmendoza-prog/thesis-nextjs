'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Sacred Heart LMS
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-800 hover:text-blue-600 font-semibold transition-colors">
              Home
            </Link>
            <Link href="/courses" className="text-gray-800 hover:text-blue-600 font-semibold transition-colors">
              Courses
            </Link>
            <Link href="/location" className="text-gray-800 hover:text-blue-600 font-semibold transition-colors">
              Location
            </Link>
            <Link href="/contact" className="text-gray-800 hover:text-blue-600 font-semibold transition-colors">
              Contact
            </Link>
            <Link href="/blog" className="text-gray-800 hover:text-blue-600 font-semibold transition-colors">
              Blog
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sign up | Log in
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-800 hover:text-blue-600 font-semibold py-2">Home</Link>
              <Link href="/courses" className="text-gray-800 hover:text-blue-600 font-semibold py-2">Courses</Link>
              <Link href="/location" className="text-gray-800 hover:text-blue-600 font-semibold py-2">Location</Link>
              <Link href="/contact" className="text-gray-800 hover:text-blue-600 font-semibold py-2">Contact</Link>
              <Link href="/blog" className="text-gray-800 hover:text-blue-600 font-semibold py-2">Blog</Link>
              <Link href="/login">
                <button className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-full mt-2 w-full">
                  Sign up | Log in
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
