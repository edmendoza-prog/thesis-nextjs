'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface CourseModule {
  id: number;
  title: string;
  grade: 'Grade 1' | 'Grade 2' | 'Grade 3';
  code: string;
  category: string;
  description: string;
  image: string;
  lessons: number;
  units: number;
  competencies: string[];
  syllabus: { title: string; duration: string }[];
}

const coursesData: CourseModule[] = [
  {
    id: 1,
    title: 'Elementary Mathematics',
    grade: 'Grade 1',
    code: 'MATH-101',
    category: 'Mathematics & Numeracy',
    description: 'Foundational numeracy covering number sense, whole number operations, basic geometry, and visual problem-solving.',
    image: '/images/courses/math_image.jpg',
    lessons: 24,
    units: 4,
    competencies: ['Number Sense', 'Basic Operations', '2D/3D Shapes', 'Pattern Recognition'],
    syllabus: [
      { title: 'Unit 1: Whole Numbers & Counting (1 to 100)', duration: '6 Lessons' },
      { title: 'Unit 2: Basic Addition & Subtraction Concepts', duration: '6 Lessons' },
      { title: 'Unit 3: 2D Geometric Shapes & Spatial Sense', duration: '6 Lessons' },
      { title: 'Unit 4: Measurement, Time & Visual Problems', duration: '6 Lessons' },
    ]
  },
  {
    id: 2,
    title: 'Foundational English & Reading',
    grade: 'Grade 1',
    code: 'ENG-101',
    category: 'Language & Literacy',
    description: 'Early literacy development focused on systematic phonics, sight words, reading comprehension, and oral communication.',
    image: '/images/courses/reading_image.jpg',
    lessons: 30,
    units: 4,
    competencies: ['Phonics Mastery', 'Sight Vocabulary', 'Oral Fluency', 'Story Comprehension'],
    syllabus: [
      { title: 'Unit 1: Alphabet Sounds & Phonemic Awareness', duration: '8 Lessons' },
      { title: 'Unit 2: Sight Words & Guided Reading Drills', duration: '8 Lessons' },
      { title: 'Unit 3: Simple Sentence Reading & Vocabulary', duration: '7 Lessons' },
      { title: 'Unit 4: Story Comprehension & Character Recognition', duration: '7 Lessons' },
    ]
  },
  {
    id: 3,
    title: 'General Science & Nature Study',
    grade: 'Grade 2',
    code: 'SCI-201',
    category: 'Natural Sciences',
    description: 'Introductory scientific inquiry exploring living organisms, plant cycles, earth environments, and weather patterns.',
    image: '/images/courses/science_image.jpg',
    lessons: 20,
    units: 4,
    competencies: ['Living Things', 'Plant Growth', 'Earth & Weather', 'Scientific Observation'],
    syllabus: [
      { title: 'Unit 1: Living and Non-Living Things in Nature', duration: '5 Lessons' },
      { title: 'Unit 2: Plant Life Cycles & Animal Habitats', duration: '5 Lessons' },
      { title: 'Unit 3: Earth, Weather Patterns & the Four Seasons', duration: '5 Lessons' },
      { title: 'Unit 4: Five Senses & Scientific Exploration', duration: '5 Lessons' },
    ]
  },
  {
    id: 4,
    title: 'Language Arts & Penmanship',
    grade: 'Grade 2',
    code: 'LANG-201',
    category: 'Language Arts',
    description: 'Sentence construction, grammar conventions, vocabulary expansion, and structured paragraph composition.',
    image: '/images/courses/writing_image.jpg',
    lessons: 28,
    units: 4,
    competencies: ['Sentence Structure', 'Grammar Conventions', 'Punctuation', 'Handwriting & Syntax'],
    syllabus: [
      { title: 'Unit 1: Nouns, Pronouns, and Action Verbs', duration: '7 Lessons' },
      { title: 'Unit 2: Capitalization, Periods & Question Marks', duration: '7 Lessons' },
      { title: 'Unit 3: Descriptive Adjectives & Vocabulary Building', duration: '7 Lessons' },
      { title: 'Unit 4: Guided Short Paragraph Writing', duration: '7 Lessons' },
    ]
  },
  {
    id: 5,
    title: 'Araling Panlipunan (Social Studies)',
    grade: 'Grade 3',
    code: 'AP-301',
    category: 'Social Sciences',
    description: 'Community life, cultural heritage, regional Philippine geography, and civics education aligned with DepEd standards.',
    image: '/images/courses/social_image.jpg',
    lessons: 22,
    units: 4,
    competencies: ['Community Helpers', 'Cultural Heritage', 'Philippine Geography', 'Civic Duties'],
    syllabus: [
      { title: 'Unit 1: Ang Ating Komunidad at mga Kasapi Nito', duration: '6 Lessons' },
      { title: 'Unit 2: Kultura, Tradisyon at Pamana ng Pilipinas', duration: '5 Lessons' },
      { title: 'Unit 3: Heograpiya at Likas na Yaman ng Rehiyon', duration: '6 Lessons' },
      { title: 'Unit 4: Mga Karapatan at Tungkulin ng Mamamayan', duration: '5 Lessons' },
    ]
  },
  {
    id: 6,
    title: 'MAPEH: Arts & Music Appreciation',
    grade: 'Grade 3',
    code: 'MAPEH-301',
    category: 'Arts & Physical Education',
    description: 'Creative expression through visual color harmony, rhythmic patterns, elementary melodies, and physical movement.',
    image: '/images/courses/arts_image.jpg',
    lessons: 18,
    units: 4,
    competencies: ['Color & Form', 'Rhythm & Melody', 'Movement Coordination', 'Creative Expression'],
    syllabus: [
      { title: 'Unit 1: Color Wheels, Lines, and Visual Art Shapes', duration: '5 Lessons' },
      { title: 'Unit 2: Musical Rhythms, Beat & Elementary Melodies', duration: '5 Lessons' },
      { title: 'Unit 3: Physical Fitness & Coordination Games', duration: '4 Lessons' },
      { title: 'Unit 4: Cultural Folk Arts & Creative Projects', duration: '4 Lessons' },
    ]
  }
];

export default function CoursesPage() {
  const [selectedGrade, setSelectedGrade] = useState<'All' | 'Grade 1' | 'Grade 2' | 'Grade 3'>('All');

  const filteredCourses = selectedGrade === 'All'
    ? coursesData
    : coursesData.filter((c) => c.grade === selectedGrade);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      {/* Hero Header Section */}
      <section className="bg-slate-950 text-white py-16 lg:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>GO Learning • Academic Curriculum</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Elementary Curriculum &amp; Subject Directory
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Official DepEd K-to-12 and MATATAG standards-compliant syllabus catalog for Grades 1 through 3. Explore structured competencies, learning units, and diagnostic assessments.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Content Area */}
      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 mb-10 border-b border-slate-200 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Active Courses ({filteredCourses.length} Subjects)
              </h2>
              <p className="text-xs text-slate-500">
                Filter by elementary grade level to review specific course outlines
              </p>
            </div>

            {/* Segmented Filter */}
            <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-lg border border-slate-300">
              {(['All', 'Grade 1', 'Grade 2', 'Grade 3'] as const).map((tab) => {
                const isSelected = selectedGrade === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedGrade(tab)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    {tab === 'All' ? 'All Grades' : tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Courses Catalog Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Image */}
                  <div className="relative w-full h-48 bg-slate-100 overflow-hidden border-b border-slate-200">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-bold tracking-wide border border-white/10">
                        {course.code}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-[#881337] text-white text-[11px] font-bold tracking-wide">
                        {course.grade}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="text-white text-xs font-semibold">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900">
                        {course.title}
                      </h3>
                    </div>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                      {course.description}
                    </p>

                    {/* Competencies */}
                    <div className="mb-5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Core DepEd Competencies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {course.competencies.map((comp, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Syllabus Outline */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Curriculum Structure
                      </span>
                      <div className="space-y-1.5">
                        {course.syllabus.map((unit, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/80 text-xs"
                          >
                            <span className="font-semibold text-slate-800 truncate pr-2">
                              {unit.title}
                            </span>
                            <span className="text-slate-500 text-[11px] shrink-0 font-medium">
                              {unit.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <span>{course.lessons} Modules</span>
                    <span>•</span>
                    <span>{course.units} Quarterly Units</span>
                  </div>

                  <Link href="/login/student">
                    <button className="bg-[#881337] hover:bg-[#9F1239] text-white font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer">
                      Enter Subject Portal
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom DepEd Compliance Banner */}
          <div className="mt-12 bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-[#881337] border border-rose-200 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  DepEd MATATAG Curriculum Alignment
                </h4>
                <p className="text-xs text-slate-500">
                  All GO Learning modules, formative quizzes, and competencies strictly comply with the Department of Education basic education requirements.
                </p>
              </div>
            </div>
            <Link
              href="/login/teacher"
              className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg transition-colors shrink-0"
            >
              Teacher Curriculum Editor
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
