'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface LessonDetail {
  id: number;
  classId: number;
  className: string;
  sectionName: string;
  gradeLevel?: string;
  teacherName: string;
  title: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  pagesOrDuration: string;
  notes?: string;
  bgImage?: string;
  uploadDate: string;
  createdAt: string;
  isRead: boolean;
}

interface SiblingLesson {
  id: number;
  classId: number;
  title: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  pagesOrDuration: string;
  notes?: string;
  bgImage?: string;
  uploadDate: string;
  createdAt: string;
  isRead: boolean;
}

function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  switch (name) {
    case 'arrow-left':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      );
    case 'download':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      );
    case 'check':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      );
    case 'check-circle':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'book':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case 'play':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      );
    case 'external':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      );
    case 'list':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      );
    case 'copy':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125H4.125C3.504 21.75 3 21.246 3 20.625V8.625c0-.621.504-1.125 1.125-1.125H7.5m8.25 9.75H19.875c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H9.375C8.754 4.5 8.25 5.004 8.25 5.625V7.5m7.5 9.75H8.25" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      );
    default:
      return null;
  }
}

function FileTypeBadge({ type }: { type: string }) {
  const t = (type || 'pdf').toLowerCase();
  if (t === 'pdf') {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 border border-rose-200">
        📄 PDF
      </span>
    );
  }
  if (t === 'video') {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-600 border border-purple-200">
        🎥 Video
      </span>
    );
  }
  if (t === 'audio') {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-200">
        🎧 Audio
      </span>
    );
  }
  if (t === 'slides') {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600 border border-amber-200">
        📊 Slides
      </span>
    );
  }
  if (t === 'notes' || t === 'text' || t === 'manual') {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 border border-indigo-200">
        📝 Article
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 border border-blue-200">
      📁 {type?.toUpperCase() || 'FILE'}
    </span>
  );
}

function LessonReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonIdParam = searchParams.get('id');

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [classLessons, setClassLessons] = useState<SiblingLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const fetchLesson = async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/student/lessons/detail?id=${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load lesson');
      }

      setLesson(data.lesson);
      setClassLessons(data.classLessons || []);
    } catch (err: any) {
      console.error('Failed to load lesson:', err);
      setError(err.message || 'Could not load lesson');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonIdParam) {
      fetchLesson(lessonIdParam);
    } else {
      setError('No lesson specified');
      setLoading(false);
    }
  }, [lessonIdParam]);


  const handleCopyText = () => {
    if (!lesson?.notes) return;
    navigator.clipboard.writeText(lesson.notes);
    setCopied(true);
    showToast('Copied lesson text to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!lesson) return;
    if (lesson.fileUrl) {
      window.open(lesson.fileUrl, '_blank');
      showToast('Opening file download... 📥');
    } else if (lesson.notes) {
      const blob = new Blob([lesson.notes], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${lesson.title.replace(/[^a-zA-Z0-9]/g, '_')}_notes.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Downloaded lesson notes! 📥');
    } else {
      showToast('No downloadable file attached to this lesson.');
    }
  };

  // Sibling index calculation
  const currentIndex = classLessons.findIndex((l) => l.id === lesson?.id);
  const prevLesson = currentIndex > 0 ? classLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < classLessons.length - 1
      ? classLessons[currentIndex + 1]
      : null;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F7FB] p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#4255FF]/10 text-[#4255FF] animate-pulse mb-4">
          <Icon name="sparkle" className="h-8 w-8 animate-spin" />
        </div>
        <h2 className="font-heading text-lg font-bold text-[#2E3856]">Loading Lesson...</h2>
        <p className="text-xs text-slate-500 mt-1">Preparing your study materials</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F7FB] p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 mb-4">
          <Icon name="book" className="h-8 w-8" />
        </div>
        <h2 className="font-heading text-xl font-bold text-[#2E3856]">Unable to Load Lesson</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md">{error || 'Lesson not found'}</p>
        <button
          type="button"
          onClick={() => router.push('/student-dashboard')}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#4255FF] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#3444D9] transition cursor-pointer"
        >
          <Icon name="arrow-left" className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const fileExt = (lesson.fileName || '').split('.').pop()?.toLowerCase() || '';
  const rawType = (lesson.fileType || '').toLowerCase();
  const isPdf = rawType === 'pdf' || fileExt === 'pdf';
  const isVideo = rawType === 'video' || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(fileExt);
  const isAudio = rawType === 'audio' || ['mp3', 'wav', 'ogg', 'm4a'].includes(fileExt);
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(fileExt);
  const isSlides = rawType === 'slides' || ['ppt', 'pptx', 'key'].includes(fileExt);

  const fontSizeClass = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  }[fontSize];

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F7FB] text-[#2E3856] font-sans antialiased">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0A092D] px-5 py-3.5 text-sm font-bold text-white shadow-2xl animate-fadeInUp">
          <Icon name="sparkle" className="h-5 w-5 text-[#FFCD1F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: Back & Class Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push(`/student-dashboard?classId=${lesson.classId}`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-[#4255FF] transition cursor-pointer shrink-0"
              title="Return to Class Dashboard"
            >
              <Icon name="arrow-left" className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Class</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                <span className="font-bold text-slate-700 truncate">{lesson.className}</span>
                <span>•</span>
                <span className="truncate">{lesson.sectionName}</span>
                <span>•</span>
                <span className="hidden md:inline">Teacher: {lesson.teacherName}</span>
              </div>
              <h1 className="font-heading text-sm sm:text-base font-extrabold text-[#2E3856] truncate">
                {lesson.title}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          {classLessons.length > 1 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer ${
                  sidebarOpen
                    ? 'border-[#4255FF] bg-[#EDF0FF] text-[#4255FF]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
                title="View All Class Lessons"
              >
                <Icon name="list" className="h-4 w-4" />
                <span className="hidden md:inline">Lessons ({classLessons.length})</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Body Layout with Optional Lessons Sidebar */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 gap-6">
        {/* Main Content Viewer Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Lesson Info Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="pt-0.5 shrink-0">
                <FileTypeBadge type={lesson.fileType} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#2E3856]">
                  {lesson.title}
                </h2>
                {lesson.teacherName && (
                  <p className="mt-1 flex items-center gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
                    <span>Instructor: {lesson.teacherName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 1. PDF VIEWER */}
          {isPdf && lesson.fileUrl && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Icon name="book" className="h-4 w-4 text-rose-500" />
                  Embedded PDF Document
                </span>
                <a
                  href={lesson.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4255FF] hover:underline"
                >
                  <span>Open Fullscreen</span>
                  <Icon name="external" className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="w-full h-[720px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                <iframe
                  src={`${lesson.fileUrl}#toolbar=1&navpanes=0`}
                  className="w-full h-full border-0"
                  title={lesson.title}
                />
              </div>
            </div>
          )}

          {/* 2. VIDEO PLAYER */}
          {isVideo && lesson.fileUrl && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Icon name="play" className="h-4 w-4 text-purple-600" />
                  Lecture Video Recording
                </span>
              </div>
              <div className="w-full rounded-2xl overflow-hidden bg-black shadow-md border border-slate-800 flex items-center justify-center">
                <video
                  controls
                  playsInline
                  className="w-full max-h-[640px]"
                  src={lesson.fileUrl}
                >
                  Your browser does not support HTML5 video playback.
                </video>
              </div>
            </div>
          )}

          {/* 3. AUDIO PLAYER */}
          {isAudio && lesson.fileUrl && (
            <div className="rounded-3xl border border-indigo-100 bg-[#EDF0FF]/40 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4255FF] text-white shadow-md">
                  <Icon name="sparkle" className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#2E3856]">Audio Lecture Player</h3>
                  <p className="text-xs text-slate-500">{lesson.pagesOrDuration} • Listen carefully to the instructor</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-2xs border border-indigo-100">
                <audio controls className="w-full" src={lesson.fileUrl}>
                  Your browser does not support audio playback.
                </audio>
              </div>
            </div>
          )}

          {/* 4. IMAGE VIEWER */}
          {isImage && lesson.fileUrl && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-4 text-center">
                <img
                  src={lesson.fileUrl}
                  alt={lesson.title}
                  className="max-h-[640px] mx-auto object-contain rounded-xl shadow-xs"
                />
              </div>
            </div>
          )}

          {/* 5. SLIDES / PRESENTATION BANNER */}
          {isSlides && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white font-extrabold shadow-md text-sm">
                  SLIDES
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-amber-950">{lesson.fileName}</h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {lesson.pagesOrDuration} • Presentation slides deck for this lesson
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-amber-700 transition cursor-pointer shrink-0"
              >
                <Icon name="download" className="h-4 w-4" />
                <span>Download Slides Deck</span>
              </button>
            </div>
          )}

          {/* 6. READING PASSAGE / ARTICLE / TEACHER NOTES */}
          {lesson.notes && (
            <div
              className="relative overflow-hidden rounded-3xl border border-indigo-200/90 shadow-xl p-4 sm:p-8 space-y-6 bg-cover bg-center min-h-[500px]"
              style={{
                backgroundImage: `url('${lesson.bgImage || '/images/lesson_upload_bg.jpg'}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Subtle natural contrast gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-sky-950/15 via-transparent to-emerald-950/20 pointer-events-none" />

              {/* Reading Tool Header with 50% White Transparency */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/50 bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-[#4255FF] shadow-2xs">
                    <Icon name="book" className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#1E293B]">
                      Reading Material & Study Text
                    </h3>
                    <p className="text-[11px] text-slate-700 font-medium">Interactive reader with customizable typography</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Font Size Selector */}
                  <div className="flex items-center rounded-xl bg-white/60 backdrop-blur-xs p-1 text-xs font-bold text-slate-800 border border-white/50 shadow-2xs">
                    <span className="px-2 text-slate-600 text-[10px] font-semibold">Font:</span>
                    <button
                      type="button"
                      onClick={() => setFontSize('sm')}
                      className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                        fontSize === 'sm' ? 'bg-white text-[#4255FF] shadow-xs font-extrabold' : 'hover:text-slate-950'
                      }`}
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('base')}
                      className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                        fontSize === 'base' ? 'bg-white text-[#4255FF] shadow-xs font-extrabold' : 'hover:text-slate-950'
                      }`}
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('lg')}
                      className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                        fontSize === 'lg' ? 'bg-white text-[#4255FF] shadow-xs font-extrabold' : 'hover:text-slate-950'
                      }`}
                    >
                      A+
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('xl')}
                      className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                        fontSize === 'xl' ? 'bg-white text-[#4255FF] shadow-xs font-extrabold' : 'hover:text-slate-950'
                      }`}
                    >
                      A++
                    </button>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/70 px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-white hover:text-[#4255FF] transition cursor-pointer shadow-2xs"
                    title="Copy text"
                  >
                    <Icon name="copy" className="h-3.5 w-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Text Body: 50% White Transparency parchment floating card on landscape background */}
              <div
                className={`relative z-10 rounded-2xl border border-white/50 bg-white/50 backdrop-blur-md p-6 sm:p-10 shadow-lg text-[#0F172A] font-medium whitespace-pre-wrap font-sans selection:bg-[#BAC4FF] leading-relaxed ${fontSizeClass}`}
              >
                {lesson.notes}
              </div>
            </div>
          )}

          {/* Fallback if no media & no text */}
          {!isPdf && !isVideo && !isAudio && !isImage && !isSlides && !lesson.notes && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EDF0FF] text-[#4255FF]">
                <Icon name="book" className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#2E3856]">{lesson.title}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                File: {lesson.fileName} • {lesson.pagesOrDuration}
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#4255FF] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#3444D9] transition cursor-pointer"
              >
                <Icon name="download" className="h-4 w-4" />
                Download Attached File
              </button>
            </div>
          )}

          {/* Bottom Navigation: Previous / Next Lesson */}
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            {prevLesson ? (
              <button
                type="button"
                onClick={() => router.push(`/student-dashboard/lesson?id=${prevLesson.id}&classId=${lesson.classId}`)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#4255FF] transition cursor-pointer"
              >
                <Icon name="chevron-left" className="h-4 w-4" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Previous Lesson</div>
                  <div className="truncate max-w-[160px] sm:max-w-[200px]">{prevLesson.title}</div>
                </div>
              </button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <button
                type="button"
                onClick={() => router.push(`/student-dashboard/lesson?id=${nextLesson.id}&classId=${lesson.classId}`)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#4255FF] transition cursor-pointer"
              >
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Next Lesson</div>
                  <div className="truncate max-w-[160px] sm:max-w-[200px]">{nextLesson.title}</div>
                </div>
                <Icon name="chevron-right" className="h-4 w-4" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </main>

        {/* Lessons Playlist Sidebar (Collapsible / Drawer) */}
        {sidebarOpen && classLessons.length > 0 && (
          <aside className="w-80 shrink-0 hidden lg:block">
            <div className="sticky top-20 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-heading text-sm font-bold text-[#2E3856]">Class Lessons</h3>
                  <p className="text-[11px] text-slate-500">{lesson.className}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {classLessons.map((item, idx) => {
                  const isActive = item.id === lesson.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (!isActive) {
                          router.push(`/student-dashboard/lesson?id=${item.id}&classId=${lesson.classId}`);
                        }
                      }}
                      className={`w-full text-left rounded-2xl p-3 text-xs transition cursor-pointer border flex items-start gap-3 ${
                        isActive
                          ? 'border-[#4255FF] bg-[#EDF0FF] text-[#2E3856] font-bold shadow-2xs'
                          : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{item.title}</p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                          <span>{item.pagesOrDuration}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default function LessonReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F6F7FB] p-6 text-sm font-semibold text-[#4255FF]">
          Loading Lesson Reader...
        </div>
      }
    >
      <LessonReaderContent />
    </Suspense>
  );
}
