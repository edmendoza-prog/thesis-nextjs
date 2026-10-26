'use client';

import { useEffect, useMemo, useState } from 'react';
import { extractLessonText } from '@/lib/documentParser';

export type QuestionType = 'Identification' | 'True or False' | 'Multiple Choice' | 'Matching Type';

export type CriteriaRow = {
  id: number;
  name: string;
  questionType: QuestionType;
  questionCount: number;
  weight: number;
};

export type QuestionOption = {
  id: string;
  text: string;
  correct: boolean;
};

export type MatchingPair = {
  id: number;
  item: string;
  match: string;
};

export type GeneratedQuestion = {
  id: string;
  type?: 'identification' | 'true_false' | 'multiple_choice' | 'matching';
  prompt: string;
  expectedAnswer?: string;
  options?: QuestionOption[];
  pairs?: MatchingPair[];
  columnA?: string[];
  columnB?: string[];
  explanation: string;
};

export type CriteriaGroup = {
  id: number;
  name: string;
  questionType: QuestionType;
  weight: number;
  questions: GeneratedQuestion[];
};

type ClassOption = {
  id: number;
  name: string;
  section?: string;
};

const defaultCriteriaList: CriteriaRow[] = [
  { id: 1, name: 'Reading Comprehension', questionType: 'Multiple Choice', questionCount: 10, weight: 40 },
  { id: 2, name: 'Vocabulary', questionType: 'Identification', questionCount: 5, weight: 20 },
  { id: 3, name: 'Lesson Concepts', questionType: 'True or False', questionCount: 5, weight: 20 },
  { id: 4, name: 'Key Terms', questionType: 'Matching Type', questionCount: 5, weight: 20 },
];

function SectionHeader({
  iconClass,
  title,
  subtitle,
  rightAction,
}: {
  iconClass: string;
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 border-b border-slate-200/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EDF0FF] text-[#4255FF] shadow-xs">
          <i className={`${iconClass} text-base`} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#2E3856]">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {rightAction && <div className="self-end sm:self-auto">{rightAction}</div>}
    </div>
  );
}

export type CreateActivityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialClassId?: number;
  onSaved?: (newActivity?: any) => void;
};

export default function CreateActivityModal({
  isOpen,
  onClose,
  initialClassId,
  onSaved,
}: CreateActivityModalProps) {
  // Basic Information States
  const [title, setTitle] = useState('');
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(initialClassId ? Number(initialClassId) : 0);
  const [subject, setSubject] = useState('English & Reading');
  const [visibility, setVisibility] = useState('section');
  const [includeQuiz, setIncludeQuiz] = useState(true);

  // Lesson & Content States
  const [lessonText, setLessonText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [translationVisible, setTranslationVisible] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showManualPaste, setShowManualPaste] = useState(false);

  // Schedule & Due Date States
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState<string>(defaultDueDate);
  const [dueTime, setDueTime] = useState<string>('23:59');
  const [hasDueDate, setHasDueDate] = useState<boolean>(true);
  const [allowLateSubmission, setAllowLateSubmission] = useState<boolean>(true);

  // Criteria & Weights States
  const [criteriaRows, setCriteriaRows] = useState<CriteriaRow[]>(defaultCriteriaList);
  const [assessmentCategory, setAssessmentCategory] = useState<'quiz' | 'test'>('quiz');

  // Generation & Saving States
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedGroups, setGeneratedGroups] = useState<CriteriaGroup[]>([]);
  const [showQuestionsPreview, setShowQuestionsPreview] = useState(true);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Record<string | number, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Question Translation States
  const [questionTargetLang, setQuestionTargetLang] = useState<string>('Filipino (Tagalog)');
  const [translatingQKey, setTranslatingQKey] = useState<string | null>(null);
  const [translatingAllQuestions, setTranslatingAllQuestions] = useState<boolean>(false);
  const [questionTranslations, setQuestionTranslations] = useState<
    Record<
      string,
      Record<
        string,
        {
          prompt: string;
          options?: { id: string; text: string }[];
          expectedAnswer?: string;
          explanation?: string;
        }
      >
    >
  >({});
  const [translatedQuestionsVisible, setTranslatedQuestionsVisible] = useState<Record<string, boolean>>({});

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      if (initialClassId) {
        setSelectedClassId(Number(initialClassId));
      }
      setErrorMessage(null);
      setShowSuccessBanner(false);
    }
  }, [isOpen, initialClassId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch Classes
  useEffect(() => {
    if (!isOpen) return;
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/teacher/grades');
        const data = await response.json();
        const classes = Array.isArray(data?.grades) ? data.grades : [];
        setClassOptions(classes);
        if (initialClassId) {
          setSelectedClassId(Number(initialClassId));
        } else if (classes.length > 0 && !selectedClassId) {
          setSelectedClassId(Number(classes[0].id));
        }
      } catch (error) {
        console.error('Failed to load classes:', error);
      }
    };
    fetchClasses();
  }, [isOpen, initialClassId, selectedClassId]);

  // Check API Key
  useEffect(() => {
    if (!isOpen) return;
    const checkApiKey = async () => {
      try {
        const response = await fetch('/api/ai/generate');
        const data = await response.json();
        setApiKeyMissing(!data?.configured);
      } catch (error) {
        console.error('Failed to check API key:', error);
        setApiKeyMissing(true);
      }
    };
    checkApiKey();
  }, [isOpen]);

  // Real-time Calculations
  const totalWeight = useMemo(
    () => criteriaRows.reduce((sum, row) => sum + Number(row.weight || 0), 0),
    [criteriaRows]
  );

  const totalQuestions = useMemo(
    () => criteriaRows.reduce((sum, row) => sum + Number(row.questionCount || 0), 0),
    [criteriaRows]
  );

  const isWeightValid = totalWeight === 100;
  const readyToGenerate = isWeightValid && totalQuestions > 0 && (lessonText.trim().length > 0 || translatedText.trim().length > 0);

  const toggleGroupCollapse = (groupId: string | number) => {
    setCollapsedGroupIds((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Criteria Handlers
  const handleAddCriteria = () => {
    const newId = Date.now();
    const defaultTypes: QuestionType[] = ['Identification', 'True or False', 'Multiple Choice', 'Matching Type'];
    const chosenType = defaultTypes[criteriaRows.length % defaultTypes.length];
    setCriteriaRows((prev) => [
      ...prev,
      {
        id: newId,
        name: `Section ${prev.length + 1}`,
        questionType: chosenType,
        questionCount: 5,
        weight: 0,
      },
    ]);
  };

  const handleCriteriaChange = (id: number, field: keyof CriteriaRow, value: any) => {
    setCriteriaRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return {
          ...row,
          [field]: field === 'weight' || field === 'questionCount' ? Math.max(0, Number(value || 0)) : value,
        };
      })
    );
  };

  const handleDeleteCriteria = (id: number) => {
    if (criteriaRows.length <= 1) return;
    setCriteriaRows((prev) => prev.filter((row) => row.id !== id));
  };

  // Document extraction
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadedFileName(file.name);
    setErrorMessage(null);

    try {
      const text = await extractLessonText(file);

      if (!text || text.trim().length < 5) {
        throw new Error('No readable text could be extracted from this document.');
      }

      const truncatedText = text.substring(0, 8000);
      setLessonText(truncatedText);
    } catch (error: unknown) {
      console.error('Error reading file:', error);
      const errMsg = error instanceof Error ? error.message : 'Failed to extract text from file.';
      setErrorMessage(`${errMsg} Please try another file or paste your lesson text directly.`);
      setUploadedFileName(null);
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  };

  // Auto-Translate Lesson
  const handleAutoTranslate = async () => {
    if (!lessonText.trim()) {
      setErrorMessage('Please provide or upload lesson content before translating.');
      return;
    }

    if (apiKeyMissing) {
      setErrorMessage('OpenAI API key is missing or not configured.');
      return;
    }

    setTranslating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          lessonText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation request failed');
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
      setTranslationVisible(true);
    } catch (error: any) {
      console.error('Translation failed:', error);
      setErrorMessage(error.message || 'Translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  // Generate Questions
  const handleGenerateQuestions = async () => {
    if (!isWeightValid) {
      setErrorMessage(`Criteria weights must total exactly 100% (currently ${totalWeight}%).`);
      return;
    }

    if (totalQuestions <= 0) {
      setErrorMessage('Please specify at least 1 question across your criteria.');
      return;
    }

    const contentToUse = (translatedText || lessonText).trim();
    if (!contentToUse) {
      setErrorMessage('Please upload or enter lesson content before generating questions.');
      return;
    }

    if (apiKeyMissing) {
      setErrorMessage('OpenAI API key is not configured.');
      return;
    }

    setErrorMessage(null);
    setLoadingGenerate(true);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-questions',
          lessonText: contentToUse,
          criteria: criteriaRows,
          assessmentCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Question generation failed');
      }

      const data = await response.json();
      const rawGroups = data.generatedGroups || [];

      const formattedGroups: CriteriaGroup[] = rawGroups.map((group: any, groupIdx: number) => {
        const matchedCriteria = criteriaRows[groupIdx] || {
          id: group.criteriaId || groupIdx + 1,
          name: group.criteriaName || `Section ${groupIdx + 1}`,
          questionType: group.questionType || 'Multiple Choice',
          weight: group.weight || 0,
        };

        return {
          id: matchedCriteria.id,
          name: group.criteriaName || matchedCriteria.name,
          questionType: group.questionType || matchedCriteria.questionType,
          weight: group.weight || matchedCriteria.weight,
          questions: (group.questions || []).map((q: any, qIdx: number) => ({
            id: `${matchedCriteria.id}-${qIdx + 1}`,
            type: q.type || (matchedCriteria.questionType === 'Identification' ? 'identification' : matchedCriteria.questionType === 'True or False' ? 'true_false' : matchedCriteria.questionType === 'Matching Type' ? 'matching' : 'multiple_choice'),
            prompt: q.prompt || '',
            expectedAnswer: q.expectedAnswer,
            options: q.options || [],
            pairs: q.pairs || [],
            columnA: q.columnA || [],
            columnB: q.columnB || [],
            explanation: q.explanation || '',
          })),
        };
      });

      setGeneratedGroups(formattedGroups);
      setShowQuestionsPreview(true);
      setCollapsedGroupIds({});
    } catch (error: any) {
      console.error('Question generation failed:', error);
      setErrorMessage(error.message || 'Question generation failed. Please check your lesson content and try again.');
    } finally {
      setLoadingGenerate(false);
    }
  };

  // Correct Answer Management Handlers
  const handleSetOptionCorrect = (groupId: number, qIdx: number, optionId: string) => {
    setGeneratedGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        const updatedQuestions = group.questions.map((q, idx) => {
          if (idx !== qIdx) return q;
          return {
            ...q,
            options: (q.options || []).map((opt) => ({
              ...opt,
              correct: opt.id === optionId,
            })),
          };
        });
        return { ...group, questions: updatedQuestions };
      })
    );
  };

  const handleSetExpectedAnswer = (groupId: number, qIdx: number, expectedAnswer: string) => {
    setGeneratedGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        const updatedQuestions = group.questions.map((q, idx) => {
          if (idx !== qIdx) return q;
          return { ...q, expectedAnswer };
        });
        return { ...group, questions: updatedQuestions };
      })
    );
  };

  // Question Translation Handlers
  const handleTranslateSingleQuestion = async (
    qKey: string,
    question: GeneratedQuestion,
    lang: string = questionTargetLang
  ) => {
    if (questionTranslations[qKey]?.[lang]) {
      setTranslatedQuestionsVisible((prev) => ({
        ...prev,
        [qKey]: !prev[qKey],
      }));
      return;
    }

    setTranslatingQKey(qKey);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate-question',
          question: {
            prompt: question.prompt,
            options: question.options?.map((o) => ({ id: o.id, text: o.text })),
            expectedAnswer: question.expectedAnswer,
            explanation: question.explanation,
          },
          targetLanguage: lang,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      if (data.translatedQuestion) {
        setQuestionTranslations((prev) => ({
          ...prev,
          [qKey]: {
            ...(prev[qKey] || {}),
            [lang]: data.translatedQuestion,
          },
        }));
        setTranslatedQuestionsVisible((prev) => ({ ...prev, [qKey]: true }));
      }
    } catch (error) {
      console.error('Failed to translate question:', error);
      alert('Failed to translate question. Please try again.');
    } finally {
      setTranslatingQKey(null);
    }
  };

  const handleTranslateAllQuestions = async (lang: string = questionTargetLang) => {
    setTranslatingAllQuestions(true);
    try {
      for (const group of generatedGroups) {
        for (let qIdx = 0; qIdx < group.questions.length; qIdx++) {
          const question = group.questions[qIdx];
          const qKey = `${group.id}-${qIdx}`;
          if (!questionTranslations[qKey]?.[lang]) {
            try {
              const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'translate-question',
                  question: {
                    prompt: question.prompt,
                    options: question.options?.map((o) => ({ id: o.id, text: o.text })),
                    expectedAnswer: question.expectedAnswer,
                    explanation: question.explanation,
                  },
                  targetLanguage: lang,
                }),
              });
              const data = await response.json();
              if (data.translatedQuestion) {
                setQuestionTranslations((prev) => ({
                  ...prev,
                  [qKey]: {
                    ...(prev[qKey] || {}),
                    [lang]: data.translatedQuestion,
                  },
                }));
              }
            } catch (e) {
              console.error(`Failed translation for question ${qKey}:`, e);
            }
          }
        }
      }
      const allVis: Record<string, boolean> = {};
      generatedGroups.forEach((group) => {
        group.questions.forEach((_, qIdx) => {
          allVis[`${group.id}-${qIdx}`] = true;
        });
      });
      setTranslatedQuestionsVisible(allVis);
    } finally {
      setTranslatingAllQuestions(false);
    }
  };

  // Save Activity Handler
  const handleSaveActivity = async () => {
    if (!title.trim()) {
      setErrorMessage('Please enter an Activity Title.');
      return;
    }

    if (!selectedClassId) {
      setErrorMessage('Please select a target class.');
      return;
    }

    if (includeQuiz) {
      if (!isWeightValid) {
        setErrorMessage(`Question criteria weights must total exactly 100% (currently ${totalWeight}%).`);
        return;
      }
      if (generatedGroups.length === 0 && !lessonText.trim()) {
        setErrorMessage('Please generate quiz questions or provide lesson text before saving.');
        return;
      }
    }

    setSaving(true);
    setErrorMessage(null);
    setShowSuccessBanner(false);

    try {
      const finalDueDateTime = hasDueDate && dueDate
        ? `${dueDate}T${dueTime || '23:59'}:00`
        : null;

      const response = await fetch('/api/teacher/create-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          class_id: selectedClassId,
          subject,
          activity_type: assessmentCategory,
          visibility,
          include_quiz: includeQuiz,
          criteria: criteriaRows,
          generatedGroups,
          generated_questions: generatedGroups,
          due_date: finalDueDateTime,
          allow_late_submission: allowLateSubmission,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save activity');
      }

      setShowSuccessBanner(true);
      if (onSaved) {
        onSaved(data);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      console.error('Save activity failed:', error);
      setErrorMessage(error.message || 'Failed to save activity. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#f8fafc] shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4.5 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4255FF] text-white shadow-md shadow-[#4255FF]/25">
              <i className="ri-draft-line text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#2E3856]">Create New Activity</h2>
              <p className="text-xs text-slate-500 font-medium">Configure lesson content, criteria, and structured assessments</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            title="Close modal"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Success Banner */}
          {showSuccessBanner && (
            <div className="rounded-2xl border border-[#23B26D]/30 bg-[#23B26D]/10 p-4 text-[#23B26D] flex items-center gap-3 shadow-xs">
              <i className="ri-checkbox-circle-fill text-2xl shrink-0" />
              <div>
                <p className="text-sm font-extrabold">Activity Saved & Assigned Successfully!</p>
                <p className="text-xs text-emerald-800">Your questions and lesson details have been assigned to the class.</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600 flex items-center gap-3 shadow-xs">
              <i className="ri-error-warning-fill text-2xl shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-extrabold">Notice</p>
                <p className="text-xs text-red-700">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* 1. BASIC INFORMATION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <SectionHeader
              iconClass="ri-file-info-line"
              title="Basic Information"
              subtitle="Set the title, target class, subject, and assessment options."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Activity Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chapter 4: The Solar System - Comprehension & Vocab"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#4255FF] focus:bg-white focus:ring-2 focus:ring-[#EDF0FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assign To Class / Section <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2E3856] outline-none focus:border-[#4255FF] focus:ring-2 focus:ring-[#EDF0FF]"
                >
                  <option value={0} disabled>Select a class</option>
                  {classOptions.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.section ? `(${cls.section})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Science, English, Math"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#4255FF] focus:bg-white focus:ring-2 focus:ring-[#EDF0FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#4255FF] focus:ring-2 focus:ring-[#EDF0FF]"
                >
                  <option value="section">Assigned Section Only</option>
                  <option value="all_students">All Students in School</option>
                  <option value="draft">Draft / Private</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="modal-include-quiz"
                  checked={includeQuiz}
                  onChange={(e) => setIncludeQuiz(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#4255FF] focus:ring-[#4255FF]"
                />
                <label htmlFor="modal-include-quiz" className="text-xs font-bold text-[#2E3856] cursor-pointer">
                  Include Structured Quiz &amp; Criteria
                </label>
              </div>
            </div>
          </section>

          {/* 1.5. SCHEDULE & DUE DATE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <SectionHeader
              iconClass="ri-calendar-event-line"
              title="Schedule & Due Date"
              subtitle="Set when this activity is due and configure submission deadlines for students."
              rightAction={
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Enable Due Date</span>
                  <button
                    type="button"
                    onClick={() => setHasDueDate(!hasDueDate)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${hasDueDate ? 'bg-[#4255FF]' : 'bg-slate-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasDueDate ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              }
            />

            {hasDueDate ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#4255FF] focus:bg-white focus:ring-2 focus:ring-[#EDF0FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Due Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#4255FF] focus:bg-white focus:ring-2 focus:ring-[#EDF0FF]"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Schedule Settings */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="modal-allow-late"
                      checked={allowLateSubmission}
                      onChange={(e) => setAllowLateSubmission(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#4255FF] focus:ring-[#4255FF]"
                    />
                    <label htmlFor="modal-allow-late" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Allow late submission
                    </label>
                  </div>

                  <span className="text-[11px] font-bold text-[#4255FF] bg-[#EDF0FF] px-2.5 py-1 rounded-md border border-[#BAC4FF]/40 self-start sm:self-auto">
                    📅 Due: {dueDate ? new Date(`${dueDate}T${dueTime || '23:59'}`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'} at {dueTime}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                No due date set. Students can complete this activity anytime without deadline restrictions.
              </div>
            )}
          </section>

          {/* 2. UPLOAD LESSON & CONTENT */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <SectionHeader
              iconClass="ri-file-text-line"
              title="Upload Lesson & Content"
              subtitle="Upload PowerPoint presentations (PPTX), PDFs, Word docs, Excel, or text files."
              rightAction={
                <div className="flex items-center gap-2">
                  {uploadedFileName && (
                    <button
                      type="button"
                      onClick={() => setShowManualPaste(!showManualPaste)}
                      className="text-xs font-bold text-[#4255FF] hover:underline"
                    >
                      {showManualPaste ? 'Hide Editor' : 'Edit Extracted Text'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={translating || !lessonText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#EDF0FF] border border-[#BAC4FF] px-3.5 py-2 text-xs font-bold text-[#4255FF] hover:bg-[#4255FF] hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {translating ? (
                      <>
                        <i className="ri-loader-4-line animate-spin text-sm" />
                        <span>Translating...</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-translate-2 text-sm" />
                        <span>Auto-Translate (Filipino)</span>
                      </>
                    )}
                  </button>
                </div>
              }
            />

            {/* Document Upload Area */}
            <div className="mb-4">
              <label
                htmlFor="modal-doc-upload"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.88), rgba(246, 247, 251, 0.94)), url('/images/lesson_upload_bg.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                className={`group relative overflow-hidden flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer shadow-2xs ${uploadingFile
                  ? 'border-[#4255FF] bg-blue-50/80 scale-[1.01] ring-4 ring-[#4255FF]/15'
                  : 'border-indigo-200 hover:border-[#4255FF] hover:shadow-md'
                  }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#4255FF] shadow-md border border-indigo-100 group-hover:scale-110 transition-transform">
                  {uploadingFile ? (
                    <i className="ri-loader-4-line animate-spin text-2xl" />
                  ) : (
                    <i className="ri-file-upload-line text-2xl" />
                  )}
                </div>
                <p className="mt-2 text-sm font-bold text-[#2E3856]">
                  {uploadingFile ? 'Extracting document text...' : 'Click to Upload Document'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Supports PowerPoint (.pptx), PDF, Word (.docx), Excel (.xlsx), and Text (.txt)
                </p>
                <input
                  id="modal-doc-upload"
                  type="file"
                  accept=".pptx,.pdf,.docx,.doc,.xlsx,.xls,.txt,.rtf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded File Card */}
            {uploadedFileName && !uploadingFile && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-200 bg-[#EDF0FF]/60 p-3.5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4255FF] text-white">
                    <i className="ri-file-check-line text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2E3856] line-clamp-1">{uploadedFileName}</p>
                    <p className="text-[11px] text-[#4255FF] font-semibold">
                      ✓ Text extracted ({lessonText.length} characters)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFileName(null);
                    setLessonText('');
                    setTranslatedText('');
                  }}
                  className="text-slate-400 hover:text-red-500 text-xs font-bold px-2 py-1"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Manual Paste / Edit Text Area */}
            {(!uploadedFileName || showManualPaste) && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {uploadedFileName ? 'Extracted Lesson Content:' : 'Or Paste Lesson Text:'}
                </label>
                <textarea
                  rows={4}
                  value={lessonText}
                  onChange={(e) => setLessonText(e.target.value)}
                  placeholder="Paste your lesson paragraphs, study notes, or reading material here..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-800 outline-none focus:border-[#4255FF] focus:bg-white focus:ring-2 focus:ring-[#EDF0FF]"
                />
              </div>
            )}

            {/* Translated Text Preview */}
            {translationVisible && translatedText && (
              <div className="mt-4 rounded-xl border border-[#23B26D]/30 bg-[#23B26D]/10 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#23B26D] flex items-center gap-1.5">
                    <i className="ri-translate-2" />
                    Filipino Translation (Ready)
                  </span>
                  <button
                    type="button"
                    onClick={() => setTranslationVisible(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Hide
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-slate-700 bg-white/70 p-3 rounded-xl border border-[#23B26D]/20">
                  {translatedText}
                </p>
              </div>
            )}
          </section>

          {/* 3. QUESTION CRITERIA & WEIGHTS */}
          {includeQuiz && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
              <SectionHeader
                iconClass="ri-scales-3-line"
                title="Question Criteria & Weights"
                subtitle="Define question types, item counts, and percentage distribution (must equal 100%)."
                rightAction={
                  <button
                    type="button"
                    onClick={handleAddCriteria}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#EDF0FF] border border-[#BAC4FF] px-3.5 py-2 text-xs font-bold text-[#4255FF] hover:bg-[#4255FF] hover:text-white transition-colors cursor-pointer shadow-xs"
                  >
                    <i className="ri-add-line text-sm" />
                    <span>Add Criteria</span>
                  </button>
                }
              />

              <div className="space-y-3">
                {criteriaRows.map((row, index) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2E3856] text-xs font-bold text-white">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-[130px]">
                      <input
                        type="text"
                        value={row.name}
                        placeholder="Criteria name"
                        onChange={(e) => handleCriteriaChange(row.id, 'name', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#4255FF]"
                      />
                    </div>

                    <div className="w-full sm:w-40">
                      <select
                        value={row.questionType}
                        onChange={(e) => handleCriteriaChange(row.id, 'questionType', e.target.value as QuestionType)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-[#2E3856] outline-none focus:border-[#4255FF]"
                      >
                        <option value="Identification">Identification</option>
                        <option value="True or False">True or False</option>
                        <option value="Multiple Choice">Multiple Choice</option>
                        <option value="Matching Type">Matching Type</option>
                      </select>
                    </div>

                    <div className="w-full sm:w-24 flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={row.questionCount || ''}
                        onChange={(e) => handleCriteriaChange(row.id, 'questionCount', e.target.value)}
                        placeholder="Qty"
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-center text-xs font-bold text-slate-800 outline-none focus:border-[#4255FF]"
                      />
                    </div>

                    <div className="w-full sm:w-24 flex items-center gap-1">
                      <div className="relative w-full">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={row.weight || ''}
                          onChange={(e) => handleCriteriaChange(row.id, 'weight', e.target.value)}
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-300 bg-white pl-2 pr-5 py-1.5 text-right text-xs font-bold text-slate-800 outline-none focus:border-[#4255FF]"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCriteria(row.id)}
                      disabled={criteriaRows.length <= 1}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 transition-colors"
                      title="Delete criterion"
                    >
                      <i className="ri-delete-bin-line text-sm" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Weight summary bar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-5 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold">Total Questions: </span>
                    <span className="font-extrabold text-[#2E3856]">{totalQuestions}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Total Weight: </span>
                    <span className={`font-extrabold ${isWeightValid ? 'text-[#23B26D]' : 'text-red-600'}`}>
                      {totalWeight}%
                    </span>
                  </div>
                </div>

                <div>
                  {isWeightValid ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#23B26D]/15 px-3 py-1 text-xs font-bold text-[#23B26D]">
                      <i className="ri-checkbox-circle-fill text-sm" /> 100% (Ready)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                      <i className="ri-error-warning-fill text-sm" /> Must equal 100%
                    </span>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* 4. GENERATE QUESTIONS SECTION */}
          {includeQuiz && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
              <SectionHeader
                iconClass="ri-magic-line"
                title={`Generate ${assessmentCategory === 'quiz' ? 'Quiz' : 'Test'} Questions`}
                subtitle="The AI will read your lesson content and distribute questions across your specified criteria."
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Mode:
                  </label>
                  <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setAssessmentCategory('quiz')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${assessmentCategory === 'quiz'
                        ? 'bg-white text-[#4255FF] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssessmentCategory('test')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${assessmentCategory === 'test'
                        ? 'bg-white text-[#4255FF] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      Test
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateQuestions}
                  disabled={loadingGenerate || !readyToGenerate || apiKeyMissing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4255FF] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#4255FF]/20 hover:bg-[#3444D9] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loadingGenerate ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-base" />
                      <span>Generating {totalQuestions} Questions...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-sparkling-fill text-base text-[#FFCD1F]" />
                      <span>Generate {assessmentCategory === 'quiz' ? 'Quiz' : 'Test'} ({totalQuestions} Items)</span>
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {/* 5. GENERATED QUESTIONS PREVIEW WITH TRANSLATION CONTROLS */}
          {generatedGroups.length > 0 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#2E3856]">
                      Generated Questions Preview ({generatedGroups.reduce((s, g) => s + g.questions.length, 0)} Items)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Review, translate, and verify your questions before saving.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQuestionsPreview(!showQuestionsPreview)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <i className={showQuestionsPreview ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    <span>{showQuestionsPreview ? 'Close Questions' : 'Show Questions'}</span>
                  </button>
                </div>

                {/* Question Translation Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-[#EDF0FF]/80 to-blue-50/80 border border-[#BAC4FF]/40">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4255FF] text-white text-xs font-bold">
                      <i className="ri-translate-2" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#2E3856] block">Question Translation</span>
                      <span className="text-[10px] text-slate-500">Translate questions for local learners</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={questionTargetLang}
                      onChange={(e) => setQuestionTargetLang(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-[#2E3856]"
                    >
                      <option value="Filipino (Tagalog)">🇵🇭 Filipino (Tagalog)</option>
                      <option value="Cebuano (Bisaya)">🏝️ Cebuano (Bisaya)</option>
                      <option value="Ilocano">🌾 Ilocano</option>
                      <option value="Spanish">🇪🇸 Spanish</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleTranslateAllQuestions(questionTargetLang)}
                      disabled={translatingAllQuestions}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#4255FF] hover:bg-[#3444D9] text-white text-xs font-bold disabled:opacity-50"
                    >
                      {translatingAllQuestions ? (
                        <>
                          <i className="ri-loader-4-line animate-spin text-xs" />
                          <span>Translating All...</span>
                        </>
                      ) : (
                        <>
                          <i className="ri-sparkling-fill text-xs text-[#FFCD1F]" />
                          <span>Translate All Questions</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              {showQuestionsPreview &&
                generatedGroups.map((group, groupIdx) => {
                  const isGroupCollapsed = Boolean(collapsedGroupIds[group.id || groupIdx]);
                  return (
                    <div key={group.id || groupIdx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDF0FF] text-[#4255FF] font-bold text-xs">
                            {groupIdx + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#2E3856]">{group.name}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {group.questions.length} questions • {group.weight}% Weight ({group.questionType})
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleGroupCollapse(group.id || groupIdx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          <span>{isGroupCollapsed ? 'Show' : 'Close'}</span>
                          <i className={isGroupCollapsed ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'} />
                        </button>
                      </div>

                      {!isGroupCollapsed && (
                        <div className="mt-4 space-y-3.5">
                          {group.questions.map((question, qIdx) => {
                            const qKey = `${group.id}-${qIdx}`;
                            const isTranslatingThis = translatingQKey === qKey;
                            const translatedData = questionTranslations[qKey]?.[questionTargetLang];
                            const isTransVisible = Boolean(translatedQuestionsVisible[qKey]) && Boolean(translatedData);

                            const displayedPrompt = isTransVisible && translatedData?.prompt ? translatedData.prompt : question.prompt;
                            const displayedExpected = isTransVisible && translatedData?.expectedAnswer ? translatedData.expectedAnswer : question.expectedAnswer;
                            const displayedExplanation = isTransVisible && translatedData?.explanation ? translatedData.explanation : question.explanation;

                            return (
                              <div
                                key={question.id || qIdx}
                                className={`rounded-xl border p-3.5 transition-all ${isTransVisible
                                  ? 'border-[#4255FF]/30 bg-blue-50/20'
                                  : 'border-slate-200/80 bg-slate-50/50'
                                  }`}
                              >
                                <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex items-start gap-2.5 flex-1">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2E3856] text-[11px] font-bold text-white mt-0.5">
                                      {qIdx + 1}
                                    </span>
                                    <div>
                                      {isTransVisible && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EDF0FF] text-[#4255FF] text-[10px] font-bold border border-[#BAC4FF]/40 mb-1">
                                          <i className="ri-translate-2 text-xs" />
                                          {questionTargetLang}
                                        </span>
                                      )}
                                      <p className="font-bold text-xs sm:text-sm text-[#2E3856] leading-snug">{displayedPrompt}</p>
                                    </div>
                                  </div>

                                  <div className="self-end sm:self-start shrink-0 ml-8 sm:ml-2">
                                    {isTranslatingThis ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4255FF] animate-pulse">
                                        <i className="ri-loader-4-line animate-spin" /> Translating...
                                      </span>
                                    ) : translatedData ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setTranslatedQuestionsVisible((prev) => ({
                                            ...prev,
                                            [qKey]: !prev[qKey],
                                          }))
                                        }
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors ${isTransVisible
                                          ? 'bg-[#23B26D]/10 text-[#23B26D] border-[#23B26D]/30'
                                          : 'bg-white text-slate-700 border-slate-300'
                                          }`}
                                      >
                                        <i className="ri-translate-2" />
                                        <span>{isTransVisible ? 'Original' : 'Translated'}</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleTranslateSingleQuestion(qKey, question, questionTargetLang)}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:text-[#4255FF]"
                                      >
                                        <i className="ri-translate-2 text-[#4255FF]" />
                                        <span>Translate</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Options & Expected Answers */}
                                {question.type === 'identification' && (
                                  <div className="mt-2 ml-7 p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col gap-1 shadow-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold uppercase text-slate-500">
                                        Expected Correct Answer:
                                      </span>
                                      <span className="text-[10px] text-slate-400">Editable</span>
                                    </div>
                                    <input
                                      type="text"
                                      value={displayedExpected || ''}
                                      onChange={(e) => handleSetExpectedAnswer(group.id, qIdx, e.target.value)}
                                      placeholder="Type expected correct answer..."
                                      className="w-full text-xs font-bold text-[#23B26D] bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-[#23B26D] focus:bg-white transition-all"
                                    />
                                  </div>
                                )}

                                {question.type === 'true_false' && question.options && (
                                  <div className="mt-2 ml-7">
                                    <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                                      Correct Answer (Click to change):
                                    </span>
                                    <div className="grid grid-cols-2 gap-2 max-w-xs">
                                      {question.options.map((opt) => {
                                        const translatedOpt = translatedData?.options?.find(
                                          (t) => t.id.toLowerCase() === opt.id.toLowerCase()
                                        );
                                        const optText = isTransVisible && translatedOpt?.text ? translatedOpt.text : opt.text;
                                        return (
                                          <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => handleSetOptionCorrect(group.id, qIdx, opt.id)}
                                            title="Click to set as the correct answer"
                                            className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                              opt.correct
                                                ? 'border-[#23B26D] bg-[#23B26D]/15 text-[#23B26D] ring-2 ring-[#23B26D]/20 shadow-sm'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                          >
                                            <span>{optText}</span>
                                            {opt.correct && <i className="ri-check-line text-sm" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {question.type === 'multiple_choice' && question.options && (
                                  <div className="mt-2 ml-7">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] font-semibold text-slate-400">
                                        Options (Click option to set as correct answer):
                                      </span>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      {question.options.map((opt) => {
                                        const translatedOpt = translatedData?.options?.find(
                                          (t) => t.id.toLowerCase() === opt.id.toLowerCase()
                                        );
                                        const optText = isTransVisible && translatedOpt?.text ? translatedOpt.text : opt.text;
                                        return (
                                          <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => handleSetOptionCorrect(group.id, qIdx, opt.id)}
                                            title="Click to set as the correct answer"
                                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                                              opt.correct
                                                ? 'border-[#23B26D] bg-[#23B26D]/10 font-bold text-slate-900 ring-2 ring-[#23B26D]/25 shadow-sm'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                          >
                                            <span
                                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                                opt.correct ? 'bg-[#23B26D] text-white' : 'bg-slate-100 text-slate-600'
                                              }`}
                                            >
                                              {opt.id}
                                            </span>
                                            <span className="flex-1">{optText}</span>
                                            {opt.correct && (
                                              <span className="text-[10px] font-bold text-[#23B26D] bg-[#23B26D]/15 px-1.5 py-0.5 rounded ml-auto flex items-center gap-0.5 shrink-0">
                                                <i className="ri-check-line text-xs" /> Correct
                                              </span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {question.type === 'matching' && question.pairs && (
                                  <div className="mt-2 ml-7 overflow-x-auto">
                                    <table className="w-full text-xs text-left border-collapse bg-white rounded-lg border border-slate-200">
                                      <thead>
                                        <tr className="bg-slate-100 text-slate-600 font-bold">
                                          <th className="p-2 border-b border-slate-200">Column A</th>
                                          <th className="p-2 border-b border-slate-200">Column B (Match)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {question.pairs.map((pair, pIdx) => (
                                          <tr key={pair.id || pIdx} className="border-b border-slate-100 last:border-0">
                                            <td className="p-2 font-semibold text-[#2E3856]">{pair.item}</td>
                                            <td className="p-2 text-[#23B26D] font-bold">→ {pair.match}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}

                                {displayedExplanation && (
                                  <div className="mt-2.5 ml-7 rounded-lg border border-[#EDF0FF] bg-[#EDF0FF]/50 p-2 text-xs text-slate-600 flex items-start gap-1.5">
                                    <i className="ri-lightbulb-line text-sm text-[#4255FF] shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-bold text-[#4255FF]">Explanation: </span>
                                      {displayedExplanation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Sticky Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveActivity}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4255FF] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#4255FF]/20 hover:bg-[#3444D9] disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <i className="ri-loader-4-line animate-spin text-base" />
                <span>Saving Activity...</span>
              </>
            ) : (
              <>
                <i className="ri-save-3-line text-base" />
                <span>Save Activity & Assign</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
