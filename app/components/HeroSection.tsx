'use client';

import { useState } from 'react';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 4;

  return (
    <section className="relative bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-100 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 rounded-full -translate-x-20 -translate-y-20"></div>
      <div className="absolute top-10 left-32 w-3 h-16 bg-blue-600 rounded-full transform -rotate-45 opacity-40"></div>
      <div className="absolute top-32 left-16">
        <svg className="w-16 h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 2L3 6h4v4l4-4V2z"/>
        </svg>
      </div>
      
      {/* Dotted Pattern */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
        <div className="grid grid-cols-12 gap-4 p-8">
          {[...Array(60)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-400 rounded-full"></div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Decorative Icons */}
            <div className="flex space-x-4">
              <div className="text-gray-400 opacity-50">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="text-blue-600">Best Education</span>
              <br />
              <span className="text-yellow-400">For Your Kids.</span>
            </h1>

            {/* Promotional Badge */}
            <div className="inline-block">
              <div className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg">
                20% off for early bird
              </div>
            </div>

            <p className="text-gray-700 text-lg max-w-md">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl">
                Register Now
              </button>
              <button className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-4 px-10 rounded-full transition-all duration-300">
                Know More
              </button>
            </div>

            {/* Carousel Indicators */}
            <div className="flex space-x-3 pt-4">
              {[...Array(totalSlides)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Content - Feature Badges */}
          <div className="relative h-[500px] lg:h-[600px]">
            {/* Main Image Placeholder */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gray-200 shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <div className="text-center text-gray-500 p-8">
                  <svg className="w-32 h-32 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-sm">Kids Learning Together</p>
                </div>
              </div>
            </div>

            {/* Feature Badges */}
            {/* Activities Badge */}
            <div className="absolute top-8 right-24 bg-yellow-400 w-40 h-40 rounded-full shadow-xl flex flex-col items-center justify-center transform hover:scale-110 transition-transform duration-300 z-20">
              <svg className="w-16 h-16 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-bold text-lg">Activities</span>
              <span className="text-white text-xs">Motivate to study</span>
            </div>

            {/* Education Badge */}
            <div className="absolute top-56 right-48 bg-yellow-400 w-40 h-40 rounded-full shadow-xl flex flex-col items-center justify-center transform hover:scale-110 transition-transform duration-300 z-10">
              <svg className="w-16 h-16 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-white font-bold text-lg">Education</span>
              <span className="text-white text-xs">Motivate to study</span>
            </div>

            {/* Creativity Badge */}
            <div className="absolute bottom-16 right-32 bg-yellow-400 w-40 h-40 rounded-full shadow-xl flex flex-col items-center justify-center transform hover:scale-110 transition-transform duration-300 z-20">
              <svg className="w-16 h-16 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-white font-bold text-lg">Creativity</span>
              <span className="text-white text-xs">Motivate to study</span>
            </div>

            {/* Decorative ruler */}
            <div className="absolute bottom-32 left-8 text-gray-400 opacity-40">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
              </svg>
            </div>

            {/* Decorative lightbulb */}
            <div className="absolute bottom-8 left-32 text-gray-400 opacity-40">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-16 text-yellow-200" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  );
}
