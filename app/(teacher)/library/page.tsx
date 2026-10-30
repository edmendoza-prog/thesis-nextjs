'use client';

import { Suspense, useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CreateActivityModal from '@/app/components/CreateActivityModal';

type SectionItem = {
  id: number;
  name: string;
  section: string;
  displayName: string;
  gradeLevel: number;
  studentCount: number;
  activityCount: number;
  lessonCount: number;
};

type LessonItem = {
  id: number;
  classId: number;
  sectionName: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'slides' | 'video' | 'doc' | string;
  fileUrl?: string;
  pagesOrDuration: string;
  notes?: string;
  bgImage?: string;
  isVisible: boolean;
  readCount: number;
  uploadDate: string;
  createdAt: string;
};

type HomeworkItem = {
  id: number;
  title: string;
  description: string | null;
  classId: number;
  sectionName: string;
  type: string;
  rawType: string;
  totalPoints: number;
  questionCount: number;
  submittedCount: number;
  totalStudents: number;
  submissionProgress: string;
  dueDate: string;
  dueDateRaw?: string | null;
  dateCreated: string;
  createdAtRaw: string;
  status: 'Published' | 'Draft' | 'Archived';
};

function Icon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  switch (type) {
    case 'folder':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l1.5 2H18.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z" />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
      );
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case 'trash':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
      );
    case 'target':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <path d="m17 7 4-4" />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case 'upload':
    case 'cloud-upload':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" />
          <path d="m16 16-4-4-4 4" />
        </svg>
      );
    case 'download':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case 'file':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case 'file-pdf':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 13v4M9 13h2a1.5 1.5 0 0 0 0-3H9M15 13v4M15 13h2a1.5 1.5 0 0 0 0-3h-2" />
        </svg>
      );
    case 'file-slides':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <path d="m10 9 4 3-4 3V9Z" />
        </svg>
      );
    case 'file-video':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    case 'file-doc':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'eye':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'eye-off':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      );
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
        </svg>
      );
    default:
      return null;
  }
}

function FileTypeBadge({ type }: { type: string }) {
  const t = (type || '').toLowerCase();
  if (t === 'pdf') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
        <Icon type="file-pdf" className="h-3.5 w-3.5 text-rose-600" />
        PDF
      </span>
    );
  }
  if (t === 'slides') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
        <Icon type="file-slides" className="h-3.5 w-3.5 text-amber-600" />
        Slides
      </span>
    );
  }
  if (t === 'video') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
        <Icon type="file-video" className="h-3.5 w-3.5 text-purple-600" />
        Video
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
      <Icon type="file-doc" className="h-3.5 w-3.5 text-blue-600" />
      Doc
    </span>
  );
}

function LibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSectionId = searchParams.get('sectionId');

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [activities, setActivities] = useState<HomeworkItem[]>([]);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    urlSectionId ? Number(urlSectionId) : null
  );

  // Section drill-down sub-tab: 'lessons' or 'homework'
  const [activeSectionTab, setActiveSectionTab] = useState<'lessons' | 'homework'>('lessons');

  // Create Activity modal state
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);
  const [createActivityClassId, setCreateActivityClassId] = useState<number | undefined>(undefined);

  // New Section modal state
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('Grade 8');
  const [newSectionCode, setNewSectionCode] = useState('Section A - Einstein');
  const [newGradeLevel, setNewGradeLevel] = useState(8);
  const [newStudentCount, setNewStudentCount] = useState(25);
  const [isSubmittingSection, setIsSubmittingSection] = useState(false);

  // Background Options for Lesson
  const LESSON_BG_OPTIONS = [
    {
      id: 'rolling-hills',
      name: 'Scenic Rolling Hills',
      url: '/images/lesson_upload_bg.jpg',
      tag: 'Default Scenic',
      previewColor: 'from-sky-400 to-emerald-400',
    },
    {
      id: 'classroom',
      name: 'Modern Classroom',
      url: '/images/classroom-hero.png',
      tag: 'Classroom',
      previewColor: 'from-blue-600 to-indigo-700',
    },
    {
      id: 'dashboard',
      name: 'Cosmic Sky',
      url: '/images/dashboard-hero.png',
      tag: 'Space',
      previewColor: 'from-violet-600 to-indigo-900',
    },
    {
      id: 'login-art',
      name: 'Blue Study Desk',
      url: '/images/login-bg.jpg',
      tag: 'Study Room',
      previewColor: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'minimal',
      name: 'Clean Plain White',
      url: '',
      tag: 'Minimal',
      previewColor: 'from-slate-100 to-slate-200',
    },
  ];

  // Upload Lesson modal state
  const [showUploadLessonModal, setShowUploadLessonModal] = useState(false);
  const [lessonSourceMode, setLessonSourceMode] = useState<'file' | 'manual'>('file');
  const [lessonManualContent, setLessonManualContent] = useState('');
  const [lessonClassId, setLessonClassId] = useState<number>(0);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonFileName, setLessonFileName] = useState('');
  const [lessonFileType, setLessonFileType] = useState<'pdf' | 'slides' | 'video' | 'doc'>('pdf');
  const [lessonPagesOrDuration, setLessonPagesOrDuration] = useState('');
  const [lessonNotes, setLessonNotes] = useState('');
  const [lessonBgImage, setLessonBgImage] = useState<string>('/images/lesson_upload_bg.jpg');
  const [customBgFile, setCustomBgFile] = useState<File | null>(null);
  const [customBgPreview, setCustomBgPreview] = useState<string | null>(null);
  const [lessonIsVisible, setLessonIsVisible] = useState(true);
  const [selectedLessonFile, setSelectedLessonFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const customBgInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelection = (file: File) => {
    setSelectedLessonFile(file);
    setLessonFileName(file.name);

    // Auto-detect file type
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let detectedType: 'pdf' | 'slides' | 'video' | 'doc' = 'doc';
    if (ext === 'pdf') detectedType = 'pdf';
    else if (['ppt', 'pptx', 'key'].includes(ext)) detectedType = 'slides';
    else if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) detectedType = 'video';
    else detectedType = 'doc';
    setLessonFileType(detectedType);

    // Format human-readable size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeInKB = Math.round(file.size / 1024);
    const displaySize = file.size >= 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;

    if (!lessonPagesOrDuration) {
      if (detectedType === 'pdf') setLessonPagesOrDuration(`PDF Document • ${displaySize}`);
      else if (detectedType === 'slides') setLessonPagesOrDuration(`Presentation • ${displaySize}`);
      else if (detectedType === 'video') setLessonPagesOrDuration(`Video Lecture • ${displaySize}`);
      else setLessonPagesOrDuration(`Document • ${displaySize}`);
    }

    // Auto-fill title if empty
    if (!lessonTitle.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .trim();
      if (cleanName) {
        setLessonTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleCustomBgFileSelected = (file: File) => {
    setCustomBgFile(file);
    const previewUrl = URL.createObjectURL(file);
    setCustomBgPreview(previewUrl);
    setLessonBgImage(previewUrl);
  };

  const handleOpenUploadLessonModal = (targetClassId?: number) => {
    if (targetClassId) {
      setLessonClassId(targetClassId);
    } else if (selectedSectionId) {
      setLessonClassId(selectedSectionId);
    } else if (sections.length > 0) {
      setLessonClassId(sections[0].id);
    }
    setLessonSourceMode('file');
    setLessonManualContent('');
    setSelectedLessonFile(null);
    setLessonTitle('');
    setLessonFileName('');
    setLessonFileType('pdf');
    setLessonPagesOrDuration('');
    setLessonNotes('');
    setLessonBgImage('/images/lesson_upload_bg.jpg');
    setCustomBgFile(null);
    setCustomBgPreview(null);
    setLessonIsVisible(true);
    setShowUploadLessonModal(true);
  };

  // Preview Lesson in-system reader modal state
  const [previewLesson, setPreviewLesson] = useState<LessonItem | null>(null);

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadLesson = (lesson: LessonItem) => {
    if (lesson.fileUrl) {
      const a = document.createElement('a');
      a.href = lesson.fileUrl;
      a.download = lesson.fileName || `${lesson.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloading ${lesson.fileName || 'lesson material'}...`);
      return;
    }

    if (lesson.notes) {
      const blob = new Blob([lesson.notes], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'lesson-material'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloading lesson text notes...');
      return;
    }

    showToast('No downloadable file attached.');
  };

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/library');
      if (res.status === 401) {
        router.push('/login/teacher');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setSections(data.sections || []);
        setActivities(data.activities || []);
        setLessons(data.lessons || []);
      }
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  useEffect(() => {
    if (urlSectionId) {
      setSelectedSectionId(Number(urlSectionId));
    } else {
      setSelectedSectionId(null);
    }
  }, [urlSectionId]);

  const handleSelectSection = (id: number) => {
    setSelectedSectionId(id);
    setActiveSectionTab('lessons');
    router.push(`/library?sectionId=${id}`);
  };

  const handleBackToMain = () => {
    setSelectedSectionId(null);
    router.push('/library');
  };

  // Section Creation Handler
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    setIsSubmittingSection(true);
    try {
      const res = await fetch('/api/teacher/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_section',
          name: newSectionName.trim(),
          section: newSectionCode.trim() || 'Section A',
          gradeLevel: Number(newGradeLevel || 1),
          studentCount: Number(newStudentCount || 0),
        }),
      });

      const data = await res.json();
      if (res.ok && data.section) {
        setSections((prev) => [...prev, data.section]);
        setShowNewSectionModal(false);
        setNewSectionName('Grade 8');
        setNewSectionCode('Section A - Einstein');
        showToast('Section created successfully');
      } else {
        alert(data.error || 'Failed to create section');
      }
    } catch (err) {
      console.error('Failed to create section:', err);
    } finally {
      setIsSubmittingSection(false);
    }
  };

  // Upload Lesson Handler
  const handleUploadLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClassId = lessonClassId || selectedSectionId || sections[0]?.id;
    if (!targetClassId || !lessonTitle.trim()) {
      alert('Please provide a lesson title and target section.');
      return;
    }

    if (lessonSourceMode === 'manual' && !lessonManualContent.trim() && !lessonNotes.trim()) {
      alert('Please enter or paste your lesson reading material.');
      return;
    }

    setIsSubmittingLesson(true);
    try {
      let res: Response;
      if ((lessonSourceMode === 'file' && selectedLessonFile) || customBgFile) {
        const formData = new FormData();
        formData.append('action', 'create_lesson');
        formData.append('classId', String(targetClassId));
        formData.append('title', lessonTitle.trim());
        formData.append('fileName', lessonFileName.trim() || (selectedLessonFile ? selectedLessonFile.name : `${lessonTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`));
        formData.append('fileType', lessonSourceMode === 'manual' ? 'doc' : lessonFileType);
        formData.append('pagesOrDuration', lessonPagesOrDuration.trim() || (selectedLessonFile ? `${Math.round(selectedLessonFile.size / 1024)} KB` : '10 pages'));
        formData.append('notes', lessonNotes.trim());
        formData.append('content', lessonManualContent.trim());
        formData.append('bgImage', lessonBgImage);
        formData.append('isVisible', lessonIsVisible ? 'true' : 'false');
        if (selectedLessonFile) {
          formData.append('file', selectedLessonFile);
        }
        if (customBgFile) {
          formData.append('bgFile', customBgFile);
        }

        res = await fetch('/api/teacher/library', {
          method: 'POST',
          body: formData,
        });
      } else {
        const fullContent = lessonSourceMode === 'manual' 
          ? lessonManualContent.trim() 
          : lessonNotes.trim();
        const fallbackFileName = lessonFileName.trim() || `${lessonTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'reading-material'}.txt`;
        const words = fullContent ? fullContent.split(/\s+/).length : 0;
        const fallbackPages = lessonPagesOrDuration.trim() || (words > 0 ? `${words} words • ~${Math.max(1, Math.ceil(words / 180))} min read` : '10 pages');

        res = await fetch('/api/teacher/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_lesson',
            classId: targetClassId,
            title: lessonTitle.trim(),
            fileName: fallbackFileName,
            fileType: lessonSourceMode === 'manual' ? 'doc' : lessonFileType,
            pagesOrDuration: fallbackPages,
            content: fullContent,
            notes: lessonNotes.trim() || fullContent,
            bgImage: lessonBgImage,
            isVisible: lessonIsVisible,
          }),
        });
      }

      const data = await res.json();
      if (res.ok && data.lesson) {
        setLessons((prev) => [data.lesson, ...prev]);
        setShowUploadLessonModal(false);
        setSelectedLessonFile(null);
        setLessonManualContent('');
        setLessonTitle('');
        setLessonFileName('');
        setLessonPagesOrDuration('');
        setLessonNotes('');
        showToast('Lesson material added successfully');
        fetchLibraryData();
      } else {
        alert(data.error || 'Failed to upload lesson');
      }
    } catch (err) {
      console.error('Failed to upload lesson:', err);
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  // Toggle Lesson Visibility
  const handleToggleLessonVisibility = async (lesson: LessonItem) => {
    const nextVis = !lesson.isVisible;
    try {
      const res = await fetch('/api/teacher/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_lesson_visibility',
          id: lesson.id,
          isVisible: nextVis,
        }),
      });

      if (res.ok) {
        setLessons((prev) =>
          prev.map((l) => (l.id === lesson.id ? { ...l, isVisible: nextVis } : l))
        );
        showToast(nextVis ? 'Lesson made visible to students' : 'Lesson set to hidden (draft)');
      }
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const res = await fetch('/api/teacher/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_lesson', id }),
      });
      if (res.ok) {
        setLessons((prev) => prev.filter((l) => l.id !== id));
        showToast('Lesson deleted');
      }
    } catch (err) {
      console.error('Failed to delete lesson:', err);
    }
  };

  // Delete Homework
  const handleDeleteHomework = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this homework?')) return;
    try {
      const res = await fetch('/api/teacher/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_homework', id }),
      });
      if (res.ok) {
        setActivities((prev) => prev.filter((a) => a.id !== id));
        showToast('Homework deleted');
      }
    } catch (err) {
      console.error('Failed to delete homework:', err);
    }
  };

  // Open Create Activity / Homework for a specific section
  const handleOpenCreateHomework = (sectionId?: number) => {
    setCreateActivityClassId(sectionId || selectedSectionId || undefined);
    setShowCreateActivityModal(true);
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.section.toLowerCase().includes(q) ||
        s.displayName.toLowerCase().includes(q)
    );
  }, [sections, searchQuery]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;
  const sectionLessons = lessons.filter((l) => l.classId === selectedSectionId);
  const sectionHomework = activities.filter((a) => a.classId === selectedSectionId);

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#0A092D] px-5 py-3 text-sm font-bold text-white shadow-2xl animate-fadeInUp">
          <Icon type="sparkle" className="h-4 w-4 text-[#FFCD1F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CREATE ACTIVITY MODAL (APPLIED TO CREATE HOMEWORK AS WELL) */}
      <CreateActivityModal
        isOpen={showCreateActivityModal}
        onClose={() => setShowCreateActivityModal(false)}
        initialClassId={createActivityClassId}
        onSaved={() => {
          fetchLibraryData();
          showToast('Homework assigned');
        }}
      />

      {/* New Section Modal */}
      {showNewSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-fadeInUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-heading text-lg font-bold text-[#2E3856]">Add New Section</h3>
              <button
                type="button"
                onClick={() => setShowNewSectionModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Class / Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science 8, Mathematics"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#4255FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Section Code / Room
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section A - Einstein"
                  value={newSectionCode}
                  onChange={(e) => setNewSectionCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#4255FF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Grade Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#4255FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Student Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newStudentCount}
                    onChange={(e) => setNewStudentCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#4255FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewSectionModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSection}
                  className="rounded-xl bg-[#4255FF] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#3444D9] cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingSection ? 'Creating...' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Lesson Modal */}
      {showUploadLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 animate-fadeInUp max-h-[92vh] overflow-y-auto flex flex-col">
            {/* Modal Header with Landscape Background */}
            <div
              className="relative overflow-hidden p-6 bg-cover bg-center border-b border-indigo-100"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(10, 9, 45, 0.82), rgba(66, 85, 255, 0.55)), url('/images/lesson_upload_bg.jpg')`,
              }}
            >
              <div className="relative z-10 flex items-center justify-between text-white">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-bold tracking-wide uppercase text-white mb-1.5">
                    <Icon type="book" className="h-3.5 w-3.5" />
                    <span>Learning Material Hub</span>
                  </div>
                  <h3 className="font-heading text-xl font-extrabold text-white drop-shadow-xs">Upload Lesson Material</h3>
                  <p className="text-xs text-white/90 mt-0.5 font-medium">Add study handouts, slides, videos, or reference documents.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadLessonModal(false);
                    setSelectedLessonFile(null);
                  }}
                  className="rounded-full bg-black/25 hover:bg-black/50 text-white/90 hover:text-white p-2 backdrop-blur-xs transition cursor-pointer"
                  title="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 pt-5">
              <form onSubmit={handleUploadLesson} className="space-y-4">
              {/* Mode Switcher: Upload File vs Manual Text */}
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setLessonSourceMode('file')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                    lessonSourceMode === 'file'
                      ? 'bg-white text-[#4255FF] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon type="cloud-upload" className="h-4 w-4" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLessonSourceMode('manual');
                    setLessonFileType('doc');
                    if (!lessonPagesOrDuration && lessonManualContent.trim()) {
                      const words = lessonManualContent.trim().split(/\s+/).length;
                      const mins = Math.max(1, Math.ceil(words / 180));
                      setLessonPagesOrDuration(`${words} words • ~${mins} min read`);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                    lessonSourceMode === 'manual'
                      ? 'bg-white text-[#4255FF] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon type="file-doc" className="h-4 w-4" />
                  <span>Manual Text</span>
                </button>
              </div>

              {/* Target Section */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Target Section
                </label>
                <select
                  value={lessonClassId || selectedSectionId || (sections[0]?.id ?? '')}
                  onChange={(e) => setLessonClassId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#4255FF] focus:outline-none bg-white font-medium"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName} (Grade {s.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Title */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  required
                  placeholder={lessonSourceMode === 'manual' ? 'e.g. Chapter 2: Plant Photosynthesis and Energy' : 'e.g. Chapter 1: Introduction to Cellular Biology'}
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#4255FF] focus:outline-none"
                />
              </div>

              {/* MODE 1: FILE UPLOAD */}
              {lessonSourceMode === 'file' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Lesson File Attachment
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelection(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.key,.txt,.mp4,.webm,.mov,.avi"
                  />

                  {selectedLessonFile ? (
                    <div className="rounded-2xl border border-indigo-200 bg-[#F6F7FB] p-4 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDF0FF] text-[#4255FF]">
                          <Icon type={lessonFileType === 'pdf' ? 'file-pdf' : lessonFileType === 'slides' ? 'file-slides' : lessonFileType === 'video' ? 'file-video' : 'file-doc'} className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[#2E3856] truncate">{selectedLessonFile.name}</p>
                          <p className="text-xs text-slate-500">
                            {(selectedLessonFile.size / (1024 * 1024)).toFixed(1)} MB • <span className="text-emerald-600 font-semibold">Ready to upload</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#4255FF] hover:bg-slate-50 cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLessonFile(null);
                            setLessonFileName('');
                          }}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 cursor-pointer"
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileSelection(e.dataTransfer.files[0]);
                        }
                      }}
                      style={{
                        backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.88), rgba(246, 247, 251, 0.94)), url('/images/lesson_upload_bg.jpg')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                      className={`group relative overflow-hidden flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center cursor-pointer transition-all shadow-2xs ${
                        isDragOver
                          ? 'border-[#4255FF] bg-blue-50/80 scale-[1.01] ring-4 ring-[#4255FF]/15'
                          : 'border-indigo-200 hover:border-[#4255FF] hover:shadow-md'
                      }`}
                    >
                      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-[#4255FF] shadow-md border border-indigo-100 mb-2.5 group-hover:scale-110 transition-transform">
                        <Icon type="cloud-upload" className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-[#2E3856]">
                        Click to choose a file <span className="font-normal text-slate-600">or drag and drop here</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-medium max-w-sm">
                        PDF, PowerPoint slides, Word documents, text notes, or video files (up to 50MB)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: MANUAL TEXT / NOTES */}
              {lessonSourceMode === 'manual' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase text-slate-600">
                      Lesson Reading Content / Notes <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {lessonManualContent.trim() ? `${lessonManualContent.trim().split(/\s+/).length} words` : '0 words'}
                    </span>
                  </div>
                  <textarea
                    required={lessonSourceMode === 'manual'}
                    rows={7}
                    placeholder="Type or paste the complete study notes, article content, reading passage, or lecture summary here for students to read..."
                    value={lessonManualContent}
                    onChange={(e) => {
                      const text = e.target.value;
                      setLessonManualContent(text);
                      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                      const mins = Math.max(1, Math.ceil(words / 180));
                      if (text.trim()) {
                        setLessonPagesOrDuration(`${words} words • ~${mins} min read`);
                      }
                    }}
                    className="w-full rounded-2xl border border-slate-300 p-3.5 text-sm leading-relaxed focus:border-[#4255FF] focus:outline-none resize-y min-h-[140px] font-mono text-xs sm:text-sm bg-slate-50/50"
                  />
                </div>
              )}


              {/* Optional Notes (if in file mode or additional instructions) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  {lessonSourceMode === 'manual' ? 'Additional Instructions for Students (Optional)' : 'Optional Notes for Students'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Read carefully before Thursday's quiz session..."
                  value={lessonNotes}
                  onChange={(e) => setLessonNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#4255FF] focus:outline-none resize-none"
                />
              </div>

              {/* CUSTOMIZE BACKGROUND IMAGE */}
              <div className="rounded-2xl border border-indigo-100 bg-[#F8F9FE] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                      <Icon type="sparkle" className="h-3.5 w-3.5 text-[#4255FF]" />
                      Customize Lesson Background
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Choose or upload a scenic background for student reading & study mode
                    </p>
                  </div>
                  {lessonBgImage && (
                    <span className="text-[10px] font-bold text-[#4255FF] bg-[#EDF0FF] px-2 py-0.5 rounded-md border border-[#BAC4FF]">
                      Background Active
                    </span>
                  )}
                </div>

                {/* Hidden custom file input */}
                <input
                  type="file"
                  ref={customBgInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/jpg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCustomBgFileSelected(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {/* Preset cards grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LESSON_BG_OPTIONS.map((bg) => {
                    const isSelected = lessonBgImage === bg.url && !customBgFile;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => {
                          setLessonBgImage(bg.url);
                          setCustomBgFile(null);
                          setCustomBgPreview(null);
                        }}
                        className={`group relative overflow-hidden rounded-xl border text-left p-2 transition cursor-pointer flex flex-col justify-between h-20 ${
                          isSelected
                            ? 'border-[#4255FF] ring-2 ring-[#4255FF]/30 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {bg.url ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
                            style={{ backgroundImage: `url('${bg.url}')` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
                        )}

                        <div className="relative z-10 flex items-center justify-between w-full">
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-[#4255FF] text-white'
                                : 'bg-black/40 text-white backdrop-blur-2xs'
                            }`}
                          >
                            {bg.tag}
                          </span>
                          {isSelected && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#4255FF] text-white text-[10px] shadow-xs">
                              ✓
                            </span>
                          )}
                        </div>

                        <span
                          className={`relative z-10 text-[11px] font-bold line-clamp-1 ${
                            bg.url ? 'text-white drop-shadow-xs' : 'text-slate-700'
                          }`}
                        >
                          {bg.name}
                        </span>
                      </button>
                    );
                  })}

                  {/* Upload Custom BG Card */}
                  <button
                    type="button"
                    onClick={() => customBgInputRef.current?.click()}
                    className={`group relative overflow-hidden rounded-xl border border-dashed text-left p-2 transition cursor-pointer flex flex-col items-center justify-center text-center h-20 ${
                      customBgFile
                        ? 'border-[#4255FF] ring-2 ring-[#4255FF]/30 bg-indigo-50/70 shadow-xs'
                        : 'border-indigo-200 hover:border-[#4255FF] hover:bg-white bg-white/70'
                    }`}
                  >
                    {customBgPreview ? (
                      <>
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url('${customBgPreview}')` }}
                        >
                          <div className="absolute inset-0 bg-black/60" />
                        </div>
                        <span className="relative z-10 text-[9px] font-bold uppercase text-white bg-[#4255FF] px-1.5 py-0.5 rounded mb-0.5">
                          ✓ Custom Upload
                        </span>
                        <span className="relative z-10 text-[10px] text-white/90 font-medium truncate max-w-[90%]">
                          {customBgFile?.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDF0FF] text-[#4255FF] mb-1 group-hover:scale-110 transition-transform">
                          <Icon type="plus" className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-bold text-[#4255FF]">Upload Custom</span>
                        <span className="text-[9px] text-slate-400">JPG, PNG, WebP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Visibility Checkbox */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="make-visible"
                  checked={lessonIsVisible}
                  onChange={(e) => setLessonIsVisible(e.target.checked)}
                  className="h-4 w-4 rounded text-[#4255FF] focus:ring-[#4255FF] cursor-pointer"
                />
                <label htmlFor="make-visible" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                  Make visible to students immediately
                </label>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadLessonModal(false);
                    setSelectedLessonFile(null);
                    setLessonManualContent('');
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLesson}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#4255FF] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#3444D9] cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isSubmittingLesson ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Icon type={lessonSourceMode === 'file' ? 'upload' : 'check'} className="h-3.5 w-3.5" />
                      <span>{lessonSourceMode === 'file' ? 'Upload Lesson' : 'Add Lesson Material'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Teacher In-System Lesson Preview / Reader Modal */}
      {previewLesson && (() => {
        const fileExt = (previewLesson.fileName || '').split('.').pop()?.toLowerCase() || '';
        const rawType = (previewLesson.fileType || '').toLowerCase();
        const isPdf = rawType === 'pdf' || fileExt === 'pdf';
        const isVideo = rawType === 'video' || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(fileExt);
        const isAudio = rawType === 'audio' || ['mp3', 'wav', 'ogg', 'm4a'].includes(fileExt);
        const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(fileExt);
        const isSlides = rawType === 'slides' || ['ppt', 'pptx', 'key'].includes(fileExt);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-fadeIn">
            <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileTypeBadge type={previewLesson.fileType} />
                  <div className="min-w-0">
                    <h2 className="font-heading text-base sm:text-lg font-bold text-[#2E3856] truncate">
                      {previewLesson.title}
                    </h2>
                    <p className="text-xs text-slate-500 truncate">
                      {previewLesson.pagesOrDuration} • Uploaded {previewLesson.uploadDate} • {previewLesson.sectionName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadLesson(previewLesson)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-[#4255FF] transition cursor-pointer"
                    title="Download Material"
                  >
                    <Icon type="download" className="h-3.5 w-3.5 text-[#4255FF]" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLesson(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/40">
                {/* 1. PDF VIEWER */}
                {isPdf && previewLesson.fileUrl && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Icon type="file-pdf" className="h-4 w-4 text-rose-500" />
                        PDF Document Reader
                      </span>
                      <a
                        href={previewLesson.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#4255FF] hover:underline inline-flex items-center gap-1"
                      >
                        Open Fullscreen ↗
                      </a>
                    </div>
                    <div className="w-full h-[540px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-inner">
                      <iframe
                        src={`${previewLesson.fileUrl}#toolbar=1&navpanes=0`}
                        className="w-full h-full border-0"
                        title={previewLesson.title}
                      />
                    </div>
                  </div>
                )}

                {/* 2. VIDEO PLAYER */}
                {isVideo && previewLesson.fileUrl && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Icon type="file-video" className="h-4 w-4 text-purple-600" />
                      Video Lecture Player
                    </span>
                    <div className="w-full rounded-2xl overflow-hidden bg-black shadow-md border border-slate-800 flex items-center justify-center">
                      <video
                        controls
                        playsInline
                        className="w-full max-h-[500px]"
                        src={previewLesson.fileUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                )}

                {/* 3. AUDIO PLAYER */}
                {isAudio && previewLesson.fileUrl && (
                  <div className="space-y-3 rounded-2xl border border-indigo-100 bg-[#EDF0FF]/40 p-5">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Icon type="sparkle" className="h-4 w-4 text-[#4255FF]" />
                      Audio Lecture Recording
                    </span>
                    <audio controls className="w-full" src={previewLesson.fileUrl}>
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}

                {/* 4. IMAGE VIEWER */}
                {isImage && previewLesson.fileUrl && (
                  <div className="space-y-3">
                    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-white p-4 text-center">
                      <img
                        src={previewLesson.fileUrl}
                        alt={previewLesson.title}
                        className="max-h-[480px] mx-auto object-contain rounded-xl shadow-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 5. SLIDES / PRESENTATION BANNER */}
                {isSlides && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white font-extrabold shadow-md shadow-amber-500/20 text-xs">
                        SLIDES
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-950">{previewLesson.fileName}</h4>
                        <p className="text-xs text-amber-800">
                          {previewLesson.pagesOrDuration} • Presentation slides for this section
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadLesson(previewLesson)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition cursor-pointer"
                    >
                      <Icon type="download" className="h-3.5 w-3.5" />
                      <span>Download Slides</span>
                    </button>
                  </div>
                )}

                {/* 6. READING PASSAGE / FULL TEXT / TEACHER NOTES */}
                {previewLesson.notes && (
                  <div
                    className="relative overflow-hidden rounded-3xl border border-indigo-200/90 p-5 sm:p-7 shadow-lg bg-cover bg-center space-y-4 min-h-[440px]"
                    style={{
                      backgroundImage: `url('${previewLesson.bgImage || '/images/lesson_upload_bg.jpg'}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-950/15 via-transparent to-emerald-950/20 pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between bg-white/50 backdrop-blur-md p-3.5 rounded-2xl border border-white/50 shadow-md">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-[#4255FF] shadow-2xs">
                          <Icon type="book" className="h-4 w-4" />
                        </div>
                        <span>Reading Material & Study Text</span>
                      </h4>
                      <span className="text-xs font-bold text-[#4255FF] bg-white/80 px-3 py-1 rounded-xl shadow-2xs border border-white/60">
                        {previewLesson.pagesOrDuration}
                      </span>
                    </div>
                    <div className="relative z-10 rounded-2xl border border-white/50 bg-white/50 backdrop-blur-md p-6 sm:p-8 text-sm leading-relaxed text-[#0F172A] font-medium whitespace-pre-wrap max-h-[480px] overflow-y-auto font-sans shadow-lg selection:bg-[#BAC4FF]">
                      {previewLesson.notes}
                    </div>
                  </div>
                )}

                {/* Fallback overview when no file URL and no notes */}
                {!isPdf && !isVideo && !isAudio && !isImage && !previewLesson.notes && (
                  <div className="rounded-2xl border border-slate-200 p-8 text-center bg-white space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF0FF] text-[#4255FF]">
                      <Icon type="book" className="h-7 w-7" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-[#2E3856]">
                      {previewLesson.title}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {previewLesson.pagesOrDuration} • File: {previewLesson.fileName}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDownloadLesson(previewLesson)}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#4255FF] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#3444D9] cursor-pointer"
                    >
                      <Icon type="download" className="h-4 w-4" />
                      Download Material
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                <span className="text-xs font-bold text-slate-500">
                  Status: {previewLesson.isVisible ? '🟢 Visible to students' : '🟡 Hidden / Draft'}
                </span>

                <button
                  type="button"
                  onClick={() => setPreviewLesson(null)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TOP HEADER: Sidebar maintained, My Library heading, search */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#4255FF]">Teacher Suite</p>
          <h1 className="font-heading text-3xl font-extrabold text-[#2E3856]">
            {selectedSection ? selectedSection.displayName : 'My Library'}
          </h1>
        </div>
      </header>

      {/* DRILL-DOWN VIEW: When Section is Open */}
      {selectedSection ? (
        <div className="space-y-6">
          {/* Back button & Section Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBackToMain}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#4255FF] shadow-xs hover:bg-[#EDF0FF] cursor-pointer"
            >
              <Icon type="arrow-left" className="h-4 w-4" />
              Back to Sections
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenUploadLessonModal(selectedSection.id)}
                className="rounded-xl border border-[#4255FF] bg-[#EDF0FF] px-3.5 py-1.5 text-xs font-bold text-[#4255FF] hover:bg-[#BAC4FF]/40 cursor-pointer"
              >
                + Upload Lesson
              </button>
              <button
                type="button"
                onClick={() => handleOpenCreateHomework(selectedSection.id)}
                className="rounded-xl bg-[#4255FF] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#3444D9] cursor-pointer"
              >
                + Create Homework
              </button>
            </div>
          </div>

          {/* Section Banner */}
          <div className="rounded-3xl border border-indigo-100 bg-linear-to-r from-[#0A092D] via-[#1E2340] to-[#2B325B] p-6 sm:p-8 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="rounded-lg bg-[#4255FF] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                  Grade {selectedSection.gradeLevel} • {selectedSection.section}
                </span>
                <h2 className="mt-3 font-heading text-3xl font-bold text-white">
                  {selectedSection.name}
                </h2>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-300">
                  <span>{selectedSection.studentCount} Students enrolled</span>
                  <span>•</span>
                  <span>{sectionLessons.length} Lessons</span>
                  <span>•</span>
                  <span>{sectionHomework.length} Homework assigned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Two Tabs: Lessons and Homework */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSectionTab('lessons')}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition cursor-pointer ${
                activeSectionTab === 'lessons'
                  ? 'border-[#4255FF] text-[#4255FF]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon type="book" className="h-4 w-4" />
              Lessons ({sectionLessons.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSectionTab('homework')}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition cursor-pointer ${
                activeSectionTab === 'homework'
                  ? 'border-[#4255FF] text-[#4255FF]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon type="target" className="h-4 w-4" />
              Homework ({sectionHomework.length})
            </button>
          </div>

          {/* Sub-tab 1: LESSONS */}
          {activeSectionTab === 'lessons' && (
            <div className="space-y-4">
              {sectionLessons.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Icon type="book" className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#2E3856]">
                    No lessons uploaded yet
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Upload your first lesson file (PDF, slides, video, or doc) for this section.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenUploadLessonModal(selectedSection.id)}
                    className="mt-5 rounded-xl bg-[#4255FF] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#3444D9] cursor-pointer"
                  >
                    Upload first lesson
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                  {sectionLessons.map((l) => (
                    <div
                      key={l.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-slate-50"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="pt-0.5 shrink-0">
                          <FileTypeBadge type={l.fileType} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-heading text-sm font-bold text-[#2E3856] truncate">
                            {l.title}
                          </h4>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                            <span className="font-medium">{l.pagesOrDuration}</span>
                            <span>•</span>
                            <span>Uploaded {l.uploadDate}</span>
                            <span>•</span>
                            <span className="text-[#4255FF] font-semibold">{l.readCount} student(s) read</span>
                          </div>
                          {l.notes && (
                            <p className="mt-1 text-xs text-slate-600 italic truncate max-w-md">
                              Notes: &quot;{l.notes}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center flex-wrap">
                        {/* Read In-System */}
                        <button
                          type="button"
                          onClick={() => setPreviewLesson(l)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-[#EDF0FF] px-3 py-1.5 text-xs font-bold text-[#4255FF] shadow-2xs hover:bg-[#BAC4FF]/40 transition cursor-pointer"
                          title="Read / Preview in system"
                        >
                          <Icon type="book" className="h-3.5 w-3.5" />
                          <span>Read</span>
                        </button>

                        {/* Download Lesson File */}
                        <button
                          type="button"
                          onClick={() => handleDownloadLesson(l)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-[#4255FF] transition cursor-pointer"
                          title={`Download ${l.fileName || 'Material'}`}
                        >
                          <Icon type="download" className="h-3.5 w-3.5 text-[#4255FF]" />
                          <span>Download</span>
                        </button>

                        {/* Visible / Hidden Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleLessonVisibility(l)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border transition cursor-pointer ${
                            l.isVisible
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          <Icon type={l.isVisible ? 'eye' : 'eye-off'} className="h-3.5 w-3.5" />
                          {l.isVisible ? 'Visible' : 'Hidden (Draft)'}
                        </button>

                        {/* Delete Lesson Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(l.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Lesson"
                        >
                          <Icon type="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 2: HOMEWORK (APPLIED CREATE ACTIVITY WORKFLOW) */}
          {activeSectionTab === 'homework' && (
            <div className="space-y-4">
              {sectionHomework.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Icon type="target" className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#2E3856]">
                    No homework assigned yet
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Create your first homework assessment using the Activity Builder for this section.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateHomework(selectedSection.id)}
                    className="mt-5 rounded-xl bg-[#4255FF] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#3444D9] cursor-pointer"
                  >
                    + Create first homework
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                  {sectionHomework.map((hw) => (
                    <div
                      key={hw.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-heading text-sm font-bold text-[#2E3856] truncate">
                            {hw.title}
                          </h4>
                          <span className="rounded-md bg-[#EDF0FF] px-2 py-0.5 text-[11px] font-bold text-[#4255FF]">
                            {hw.totalPoints} pts • {hw.questionCount} Questions
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <Icon type="clock" className="h-3.5 w-3.5 text-slate-400" />
                            Due: {hw.dueDate}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {hw.submissionProgress}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteHomework(hw.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Homework"
                        >
                          <Icon type="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* MAIN VIEW: Search Bar & Class Section Cards */
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Icon
              type="search"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search sections by name, grade level, or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm font-medium placeholder-slate-400 shadow-xs focus:border-[#4255FF] focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">
              Loading library sections...
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF0FF] text-[#4255FF]">
                <Icon type="folder" className="h-7 w-7" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#2E3856]">No sections found</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Click &quot;New Section&quot; to create your first classroom section.
              </p>
              <button
                type="button"
                onClick={() => setShowNewSectionModal(true)}
                className="mt-5 rounded-xl bg-[#4255FF] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#3444D9] cursor-pointer"
              >
                + New Section
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSections.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => handleSelectSection(sec.id)}
                  className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#BAC4FF] hover:shadow-lg cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-[#EDF0FF] px-2.5 py-1 text-xs font-bold text-[#4255FF]">
                        Grade {sec.gradeLevel || 1} • {sec.section}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Icon type="users" className="h-3.5 w-3.5 text-slate-400" />
                        {sec.studentCount} Students
                      </span>
                    </div>

                    <h3 className="mt-4 font-heading text-2xl font-bold text-[#2E3856] group-hover:text-[#4255FF] transition">
                      {sec.name}
                    </h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <Icon type="book" className="h-4 w-4 text-[#4255FF]" />
                      {sec.lessonCount} Lessons
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Icon type="target" className="h-4 w-4 text-purple-600" />
                      {sec.activityCount} Homework
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-6 text-sm font-semibold text-[#4255FF]">
          Loading library...
        </div>
      }
    >
      <LibraryContent />
    </Suspense>
  );
}
