'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Slide {
  id: number;
  image: string;
  alt: string;
  badge: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/images/slideshow/slide-1.jpg',
    alt: 'Students actively participating in classroom discussion',
    badge: 'Interactive Learning',
    title: 'Active Classroom Participation',
    description: 'Empowering young minds through active participation, curiosity, and joyful engagement.'
  },
  {
    id: 2,
    image: '/images/slideshow/slide-2.jpg',
    alt: 'Children focused on writing and study activities',
    badge: 'Focused Growth',
    title: 'Foundational Skill Building',
    description: 'Nurturing essential reading, writing, and analytical skills in a supportive environment.'
  },
  {
    id: 3,
    image: '/images/slideshow/slide-3.jpg',
    alt: 'Students collaborating with tablets and notebooks',
    badge: 'Modern Education',
    title: 'Collaborative & Smart Learning',
    description: 'Combining traditional warmth with modern digital tools for Grade 1 to 3 learners.'
  },
  {
    id: 4,
    image: '/images/slideshow/slide-4.jpg',
    alt: 'Teacher guiding students in an organized classroom',
    badge: 'Passionate Mentors',
    title: 'Dedicated Teacher Guidance',
    description: 'Compassionate educators devoted to guiding every child towards academic excellence.'
  },
  {
    id: 5,
    image: '/images/slideshow/slide-5.jpg',
    alt: 'Attentive students listening to classroom instruction',
    badge: 'Inspiring Environment',
    title: 'Nurturing Every Potential',
    description: 'A vibrant, positive learning atmosphere that turns daily lessons into memorable discoveries.'
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slideshow interval (4 seconds)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section className="relative bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-100 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 rounded-full -translate-x-20 -translate-y-20 opacity-90"></div>
      <div className="absolute top-10 left-32 w-3 h-16 bg-blue-600 rounded-full transform -rotate-45 opacity-40"></div>
      <div className="absolute top-32 left-16">
        <svg className="w-16 h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 2L3 6h4v4l4-4V2z" />
        </svg>
      </div>

      {/* Dotted Pattern */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
        <div className="grid grid-cols-12 gap-4 p-8">
          {[...Array(60)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-400 rounded-full"></div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Decorative Icon */}
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-semibold tracking-wider text-blue-800 uppercase">
                Sacred Heart School of Butuan
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              <span className="text-blue-600">Best Education</span>
              <br />
              <span className="text-yellow-500 drop-shadow-sm">For Your Kids.</span>
            </h1>

            <p className="text-gray-700 text-lg md:text-xl max-w-lg leading-relaxed">
              {slides[currentSlide].description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/login">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
                  Get Started
                </button>
              </Link>
              <Link href="/courses">
                <button className="bg-white/80 hover:bg-white text-blue-600 border-2 border-blue-600 font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-sm hover:shadow cursor-pointer">
                  Explore Courses
                </button>
              </Link>
            </div>

            {/* Carousel Indicators */}
            <div className="flex items-center space-x-3 pt-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-3 rounded-full transition-all duration-500 cursor-pointer ${
                    currentSlide === idx
                      ? 'bg-blue-600 w-10 shadow-sm'
                      : 'bg-gray-300/80 hover:bg-gray-400 w-3'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Content - Interactive Image Slideshow Showcase */}
          <div
            className="relative h-[460px] sm:h-[520px] lg:h-[580px] flex items-center justify-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Ambient Background Glow */}
            <div className="absolute w-80 h-80 sm:w-96 sm:h-96 bg-yellow-400/40 rounded-full filter blur-3xl -z-10 animate-pulse"></div>

            {/* Main Slideshow Frame */}
            <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] lg:w-[450px] lg:h-[450px] rounded-[2.5rem] p-3 bg-white/70 backdrop-blur-md shadow-2xl border-4 border-white">
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-gray-900">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      index === currentSlide
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 pointer-events-none z-0'
                    }`}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 320px, (max-width: 1024px) 400px, 450px"
                      className="object-cover object-center"
                    />

                    {/* Gradient Overlay & Caption */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6 text-white">
                      <span className="inline-block self-start text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white px-3 py-1 rounded-full mb-1">
                        {slide.badge}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold leading-snug drop-shadow">
                        {slide.title}
                      </h3>
                    </div>
                  </div>
                ))}

                {/* Slideshow Progress Bar */}
                <div className="absolute top-0 left-0 right-0 z-20 h-1.5 bg-black/20 overflow-hidden">
                  <div
                    key={currentSlide}
                    className={`h-full bg-yellow-400 ${!isPaused ? 'animate-progress' : 'w-full'}`}
                  />
                </div>
              </div>
            </div>

            {/* Feature Badges floating around */}
            {/* Education Badge - Moved to Top Left */}
            <div className="absolute top-2 -left-2 sm:top-4 sm:-left-6 bg-blue-600 w-28 h-28 sm:w-36 sm:h-36 rounded-full shadow-xl flex flex-col items-center justify-center transform hover:scale-110 transition-transform duration-300 z-30 border-4 border-white text-center p-2">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-white font-bold text-sm sm:text-base leading-tight">Education</span>
              <span className="text-blue-100 text-[10px] font-semibold hidden sm:inline">Grade 1 - 3</span>
            </div>

            {/* Activities Badge - Top Right */}
            <div className="absolute top-2 -right-2 sm:top-4 sm:-right-6 bg-yellow-400 w-28 h-28 sm:w-36 sm:h-36 rounded-full shadow-xl flex flex-col items-center justify-center transform hover:scale-110 transition-transform duration-300 z-30 border-4 border-white text-center p-2">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-bold text-sm sm:text-base leading-tight">Activities</span>
              <span className="text-yellow-900 text-[10px] font-semibold hidden sm:inline">Interactive Fun</span>
            </div>

            {/* Creativity Badge - Bottom Right */}
            <div className="absolute bottom-2 -right-2 sm:bottom-4 sm:-right-6 bg-green-500 w-24 h-24 sm:w-32 sm:h-32 rounded-full shadow-xl flex flex-col items-center justify-center transform hover:scale-110 transition-transform duration-300 z-30 border-4 border-white text-center p-2">
              <svg className="w-7 h-7 sm:w-9 sm:h-9 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-white font-bold text-xs sm:text-sm leading-tight">Creativity</span>
              <span className="text-green-100 text-[10px] font-semibold hidden sm:inline">Inspire Ideas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Wave */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none">
        <svg className="w-full h-12 md:h-16 text-white" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  );
}
