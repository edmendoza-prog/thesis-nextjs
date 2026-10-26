'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  grade: string;
  gradeLevel: 'Grade 1' | 'Grade 2' | 'Grade 3';
  description: string;
  image: string;
  alt: string;
  category: string;
  code: string;
  lessons: number;
  units: number;
  competencies: string[];
}

const coursesData: Course[] = [
  {
    id: 1,
    title: 'Elementary Mathematics',
    grade: 'Grade 1',
    gradeLevel: 'Grade 1',
    code: 'MATH-101',
    description: 'Foundational numeracy covering number sense, whole number operations, basic geometry, and visual problem-solving.',
    image: '/images/courses/math_image.jpg',
    alt: 'Elementary students learning mathematics and geometric shapes',
    category: 'Mathematics & Numeracy',
    lessons: 24,
    units: 4,
    competencies: ['Number Sense', 'Basic Operations', '2D/3D Shapes']
  },
  {
    id: 2,
    title: 'Foundational English & Reading',
    grade: 'Grade 1',
    gradeLevel: 'Grade 1',
    code: 'ENG-101',
    description: 'Early literacy development focused on systematic phonics, sight words, reading comprehension, and oral communication.',
    image: '/images/courses/reading_image.jpg',
    alt: 'Elementary students reading books in a classroom',
    category: 'Language & Literacy',
    lessons: 30,
    units: 4,
    competencies: ['Phonics Mastery', 'Sight Vocabulary', 'Reading Comprehension']
  },
  {
    id: 3,
    title: 'General Science & Nature Study',
    grade: 'Grade 2',
    gradeLevel: 'Grade 2',
    code: 'SCI-201',
    description: 'Introductory scientific inquiry exploring living organisms, plant cycles, earth environments, and weather patterns.',
    image: '/images/courses/science_image.jpg',
    alt: 'Students conducting a plant science activity',
    category: 'Natural Sciences',
    lessons: 20,
    units: 4,
    competencies: ['Living Things', 'Earth & Weather', 'Observational Science']
  },
  {
    id: 4,
    title: 'Language Arts & Penmanship',
    grade: 'Grade 2',
    gradeLevel: 'Grade 2',
    code: 'LANG-201',
    description: 'Sentence construction, grammar conventions, vocabulary expansion, and structured paragraph composition.',
    image: '/images/courses/writing_image.jpg',
    alt: 'Elementary students practicing writing in notebooks',
    category: 'Language Arts',
    lessons: 28,
    units: 4,
    competencies: ['Sentence Structure', 'Grammar Rules', 'Handwriting & Syntax']
  },
  {
    id: 5,
    title: 'Araling Panlipunan (Social Studies)',
    grade: 'Grade 3',
    gradeLevel: 'Grade 3',
    code: 'AP-301',
    description: 'Community life, cultural heritage, regional Philippine geography, and civics education aligned with DepEd standards.',
    image: '/images/courses/social_image.jpg',
    alt: 'Students learning geography with a globe',
    category: 'Social Sciences',
    lessons: 22,
    units: 4,
    competencies: ['Community & Culture', 'Philippine Geography', 'Civic Duties']
  },
  {
    id: 6,
    title: 'MAPEH: Arts & Music Appreciation',
    grade: 'Grade 3',
    gradeLevel: 'Grade 3',
    code: 'MAPEH-301',
    description: 'Creative expression through visual color harmony, rhythmic patterns, elementary melodies, and physical movement.',
    image: '/images/courses/arts_image.jpg',
    alt: 'Children creating art and crafts in a classroom',
    category: 'Arts & Physical Education',
    lessons: 18,
    units: 4,
    competencies: ['Color & Form', 'Rhythm & Melody', 'Creative Expression']
  }
];

export default function CoursesSection() {
  const [selectedGrade, setSelectedGrade] = useState<'All' | 'Grade 1' | 'Grade 2' | 'Grade 3'>('All');

  const filteredCourses = selectedGrade === 'All'
    ? coursesData
    : coursesData.filter((c) => c.gradeLevel === selectedGrade);

  return (
    <section id="courses" className="py-20 lg:py-24 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-200 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-50 border border-rose-200 text-[#881337] text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#881337]" />
              <span>Academic Curriculum</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Grade 1 to 3 Subject Syllabi
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed">
              DepEd K-to-12 and MATATAG curriculum-aligned subject modules built with structured learning objectives, formative assessments, and competency mastery tracking.
            </p>
          </div>

          {/* Grade Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-lg border border-slate-300 self-start md:self-auto shrink-0">
            {(['All', 'Grade 1', 'Grade 2', 'Grade 3'] as const).map((tab) => {
              const isSelected = selectedGrade === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedGrade(tab)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-300/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
                >
                  {tab === 'All' ? 'All Subjects' : tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Course Image Banner */}
                <div className="relative w-full h-44 bg-slate-100 overflow-hidden border-b border-slate-200">
                  <Image
                    src={course.image}
                    alt={course.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Top Bar inside image */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-bold tracking-wide border border-white/10">
                      {course.code}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-[#881337] text-white text-[11px] font-bold tracking-wide">
                      {course.grade}
                    </span>
                  </div>

                  {/* Bottom Category */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-white text-xs font-semibold drop-shadow-xs">
                      {course.category}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#881337] transition-colors mb-2">
                    {course.title}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {course.description}
                  </p>

                  {/* Competencies */}
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Core Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {course.competencies.map((comp, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500 font-medium">
                  <span>{course.lessons} Modules</span>
                  <span>•</span>
                  <span>{course.units} Grading Units</span>
                </div>
                <Link
                  href="/courses"
                  className="font-bold text-[#881337] hover:text-[#9F1239] flex items-center gap-1 transition-colors"
                >
                  <span>View Syllabus</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Curriculum Information Banner */}
        <div className="mt-12 bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-[#881337] border border-rose-200 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Department of Education (DepEd) Curriculum Compliance
              </h4>
              <p className="text-xs text-slate-500">
                All course modules, learning competencies, and grading rubrics align strictly with official basic education standards.
              </p>
            </div>
          </div>
          <Link
            href="/courses"
            className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg transition-colors shrink-0"
          >
            Access Full Course Directory
          </Link>
        </div>
      </div>
    </section>
  );
}
