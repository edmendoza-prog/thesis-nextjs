'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import * as pdfjsLib from 'pdfjs-dist';

type CriteriaRow = {
  id: number;
  name: string;
  weight: number;
};

type QuestionOption = {
  id: string;
  text: string;
  correct: boolean;
};

type GeneratedQuestion = {
  id: string;
  prompt: string;
  options: QuestionOption[];
  explanation: string;
};

type CriteriaGroup = {
  id: number;
  name: string;
  questions: GeneratedQuestion[];
};

type ClassOption = {
  id: number;
  name: string;
};

const baseCriteria: CriteriaRow[] = [
  { id: 1, name: 'Reading Comprehension', weight: 40 },
  { id: 2, name: 'Vocabulary', weight: 30 },
  { id: 3, name: 'Writing', weight: 30 },
];

const lessonSeed = ``;

function SectionHeader({ iconClass, title, rightAction }: { iconClass: string; title: string; rightAction?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 border-b border-primary-100 pb-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
          <i className={iconClass} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground-900">{title}</h2>
      </div>
      {rightAction}
    </div>
  );
}

function CreateActivityForm() {
  const searchParams = useSearchParams();
  const urlClassId = searchParams.get('classId');

  const [title, setTitle] = useState('');
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(urlClassId ? Number(urlClassId) : 0);
  const [subject, setSubject] = useState('');
  const [lessonText, setLessonText] = useState(lessonSeed);
  const [translatedText, setTranslatedText] = useState('');
  const [translationVisible, setTranslationVisible] = useState(true);
  const [criteriaRows, setCriteriaRows] = useState<CriteriaRow[]>(baseCriteria);
  const [visibility, setVisibility] = useState('section');
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [points, setPoints] = useState('');
  const [badge, setBadge] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [assessmentCategory, setAssessmentCategory] = useState<'quiz' | 'test'>('quiz');
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedGroups, setGeneratedGroups] = useState<CriteriaGroup[]>([]);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/teacher/create-activity');
        const data = await response.json();
        const classes = Array.isArray(data?.classes) ? data.classes : [];
        setClassOptions(classes);
        if (urlClassId) {
          setSelectedClassId(Number(urlClassId));
        } else if (classes[0]) {
          setSelectedClassId(Number(classes[0].id));
        }
      } catch (error) {
        console.error('Failed to load classes:', error);
      }
    };

    fetchClasses();
  }, [urlClassId]);

  const totalWeight = useMemo(
    () => criteriaRows.reduce((sum, row) => sum + Number(row.weight || 0), 0),
    [criteriaRows],
  );

  const readyToGenerate = totalWeight === 100 && lessonText.trim().length > 0;
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [checkingApiKey, setCheckingApiKey] = useState(true);

  // Check if API key is configured on mount
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch('/api/ai/generate');
        const data = await response.json();
        const isMissing = !data?.configured;
        setApiKeyMissing(isMissing);
        setShowErrorBanner(isMissing);
      } catch (error) {
        console.error('Failed to check API key:', error);
        setApiKeyMissing(true);
        setShowErrorBanner(true);
      } finally {
        setCheckingApiKey(false);
      }
    };
    checkApiKey();
  }, []);

  const handleAddCriteria = () => {
    setCriteriaRows((prev) => [
      ...prev,
      { id: Date.now(), name: `New Criteria ${prev.length + 1}`, weight: 0 },
    ]);
  };

  const handleCriteriaChange = (id: number, field: 'name' | 'weight', value: string) => {
    setCriteriaRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        return {
          ...row,
          [field]: field === 'name' ? value : Number(value || 0),
        };
      }),
    );
  };

  const handleDeleteCriteria = (id: number) => {
    setCriteriaRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const [translating, setTranslating] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Configure PDF.js worker
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
  }, []);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadedFileName(file.name);

    try {
      let text = '';

      // Handle different file types
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (fileExtension === '.pdf') {
        // Extract text from PDF
        text = await extractTextFromPDF(file);
      } else if (['.txt', '.md'].includes(fileExtension) || file.type.startsWith('text/')) {
        // Read text files directly
        text = await file.text();
      } else {
        // Try to read as text anyway for unknown types
        try {
          text = await file.text();
        } catch {
          alert(`Unsupported file type: ${fileExtension}. Please upload a PDF, TXT, or MD file.`);
          setUploadedFileName(null);
          return;
        }
      }

      // Limit to 8000 characters
      const truncatedText = text.substring(0, 8000);
      setLessonText(truncatedText);
      
      if (text.length > 8000) {
        alert(`File was truncated to 8000 characters (original: ${text.length} characters)`);
      }
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please try again or use a different file format.');
      setUploadedFileName(null);
    } finally {
      setUploadingFile(false);
      // Reset input so the same file can be uploaded again
      event.target.value = '';
    }
  };

  const handleAutoTranslate = async () => {
    if (!lessonText.trim()) {
      setShowErrorBanner(true);
      return;
    }

    if (apiKeyMissing) {
      setShowErrorBanner(true);
      return;
    }

    setTranslating(true);
    setShowErrorBanner(false);

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
        const error = await response.json();
        console.error('Translation error:', error);
        setShowErrorBanner(true);
        return;
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
      setTranslationVisible(true);
    } catch (error) {
      console.error('Translation failed:', error);
      setShowErrorBanner(true);
    } finally {
      setTranslating(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!readyToGenerate) {
      setShowErrorBanner(true);
      return;
    }

    if (!questionCount || Number(questionCount) < 1) {
      setShowErrorBanner(true);
      return;
    }

    if (apiKeyMissing) {
      setShowErrorBanner(true);
      return;
    }

    setShowErrorBanner(false);
    setLoadingGenerate(true);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-questions',
          lessonText: translatedText || lessonText,
          criteria: criteriaRows,
          questionCount,
          assessmentCategory,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Generation error:', error);
        setShowErrorBanner(true);
        setLoadingGenerate(false);
        return;
      }

      const data = await response.json();
      
      // Map the response to match our component structure
      const generated = data.generatedGroups.map((group: any) => ({
        id: group.criteriaId,
        name: group.criteriaName,
        questions: group.questions.map((q: any, idx: number) => ({
          id: `${group.criteriaId}-${idx}`,
          ...q,
        })),
      }));

      setGeneratedGroups(generated);
    } catch (error) {
      console.error('Question generation failed:', error);
      setShowErrorBanner(true);
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleSaveActivity = async () => {
    if (!title.trim() || !selectedClassId) {
      setShowErrorBanner(true);
      return;
    }

    setSaving(true);
    setShowErrorBanner(false);
    setShowSuccessBanner(false);

    try {
      const response = await fetch('/api/teacher/create-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          class_id: selectedClassId,
          subject,
          activity_type: assessmentCategory,
          visibility,
          points: Number(points || 0),
          badge,
          include_quiz: includeQuiz,
          generatedGroups,
          generated_questions: generatedGroups,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save activity');
      }

      setShowSuccessBanner(true);
    } catch (error) {
      console.error('Save activity failed:', error);
      setShowErrorBanner(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-280 pb-10">
      <header className="mb-6 flex flex-col gap-4 border-b border-primary-200/70 pb-6 animate-fadeInUp sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-accent-700">Activity builder</p><h1 className="font-heading text-4xl font-bold text-foreground-900">Create activity</h1><p className="mt-2 text-foreground-600">Set up content, assessments, and learner rewards in one place.</p></div>
        <div className="rounded-lg border border-primary-200 bg-background-50 px-4 py-3 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-foreground-500">Draft status</p><p className="mt-1 flex items-center gap-2 text-sm font-bold text-[#d97706]"><span className="h-2 w-2 rounded-full bg-[#f59e0b]" />In progress</p></div>
      </header>

      <div className="space-y-6">
        <section className="animate-fadeInUp rounded-xl border border-primary-200 bg-background-50 p-5 shadow-sm sm:p-6" style={{ animationDelay: '100ms' }}>
          <SectionHeader iconClass="ri-file-list-line text-lg" title="Basic Information" />
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground-700">Activity Title</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground-700">Select Class</label>
                <select
                  value={selectedClassId || 0}
                  onChange={(event) => setSelectedClassId(Number(event.target.value))}
                  className="w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                >
                  {classOptions.length > 0 ? (
                    classOptions.map((classOption) => (
                      <option key={classOption.id} value={classOption.id}>{classOption.name}</option>
                    ))
                  ) : (
                    <option value={0}>No classes available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground-700">Select Subject</label>
                <select
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                >
                  <option>Science</option>
                  <option>Math</option>
                  <option>English</option>
                  <option>Reading</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 border-t border-primary-100 pt-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground-700">Activity Visibility</label>
                <select
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value)}
                  className="w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                >
                  <option value="section">Only This Section</option>
                  <option value="grade">Entire Grade Level</option>
                  <option value="all">All Grades & Sections</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="flex w-full items-center justify-between rounded-lg border border-background-300 bg-background-50 px-4 py-3">
                  <div><p className="text-sm font-semibold text-foreground-700">Include Quiz Section</p><p className="mt-0.5 text-xs text-foreground-500">Add a structured quiz to this activity.</p></div>
                  <button type="button" onClick={() => setIncludeQuiz((current) => !current)} aria-label="Toggle quiz section" className={`relative h-8 w-14 rounded-full transition ${includeQuiz ? 'bg-accent-500' : 'bg-background-300'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${includeQuiz ? 'left-7' : 'left-1'}`} /></button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground-700">Assign Points</label>
                <input type="number" value={points} onChange={(event) => setPoints(event.target.value)} className="w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground-700">Assign Badge</label>
                <input type="text" value={badge} onChange={(event) => setBadge(event.target.value)} placeholder="e.g. Achievement badge" className="w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100" />
              </div>
            </div>
          </div>
        </section>

        <section className="animate-fadeInUp rounded-xl border border-primary-200 bg-background-50 p-5 shadow-sm sm:p-6" style={{ animationDelay: '200ms' }}>
          <SectionHeader iconClass="ri-upload-cloud-line text-lg" title="Upload Lesson & Auto-Translate" />
          <p className="mb-4 text-sm text-foreground-600">
            Upload a document file (PDF, TXT, MD) or paste your lesson text below. The system can translate it to English automatically.
          </p>

          {uploadedFileName && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-accent-700">
              <i className="ri-file-line" aria-hidden="true" />
              <span className="flex-1 font-semibold">{uploadedFileName}</span>
              <button
                type="button"
                onClick={() => {
                  setUploadedFileName(null);
                  setLessonText('');
                }}
                className="text-accent-600 hover:text-accent-800"
                aria-label="Clear file"
              >
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
          )}

          <textarea
            value={lessonText}
            onChange={(event) => setLessonText(event.target.value)}
            rows={6}
            placeholder="Paste your lesson content here, or upload a file using the action below..."
            className="w-full rounded-lg border border-background-300 bg-background-50 px-4 py-3 text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-foreground-500">{lessonText.length} / 8000 characters</div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-primary-300 bg-primary-50 px-4 py-2.5 text-sm font-bold text-primary-700 transition hover:bg-primary-100">
                {uploadingFile ? (
                  <><i className="ri-loader-4-line animate-spin text-lg" aria-hidden="true" />Reading file...</>
                ) : (
                  <><i className="ri-upload-2-line text-lg" aria-hidden="true" />Upload lesson file</>
                )}
                <input type="file" className="hidden" accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf" onChange={handleFileUpload} disabled={uploadingFile} />
              </label>
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={translating || apiKeyMissing}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {translating ? <><i className="ri-loader-4-line animate-spin" aria-hidden="true" />Translating...</> : <>Auto-Translate to English<i className="ri-translate-2" aria-hidden="true" /></>}
              </button>
            </div>
          </div>

          {translationVisible && (
            <div className="mt-5 rounded-2xl border border-accent-200 bg-accent-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-accent-700">
                <i className="ri-checkbox-circle-line text-xl" aria-hidden="true" />
                <span className="font-bold">English Translation</span>
              </div>
              <p className="text-sm leading-7 text-foreground-700">{translatedText}</p>
            </div>
          )}
        </section>

        <section className="animate-fadeInUp rounded-xl border border-primary-200 bg-background-50 p-5 shadow-sm sm:p-6" style={{ animationDelay: '300ms' }}>
          <SectionHeader
            iconClass="ri-list-check-2 text-lg"
            title="Exam Criteria & Weights"
            rightAction={
              <button
                type="button"
                onClick={handleAddCriteria}
                className="rounded-full bg-secondary-100 px-3 py-1.5 text-xs font-bold text-secondary-700 transition hover:bg-secondary-200"
              >
                Add Criteria
              </button>
            }
          />
          <p className="mb-5 text-sm text-foreground-600">Set the criteria percentages so they total exactly 100%.</p>

          <div className="space-y-3">
            {criteriaRows.map((row, index) => (
              <div key={row.id} className="flex items-center gap-3 rounded-lg border border-background-200 bg-background-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 text-sm font-bold text-secondary-600">
                  {index + 1}
                </div>

                <input
                  type="text"
                  value={row.name}
                  onChange={(event) => handleCriteriaChange(row.id, 'name', event.target.value)}
                  className="flex-1 rounded-xl border border-background-300 bg-background-50 px-3 py-2.5 text-sm outline-none transition focus:border-secondary-300 focus:ring-2 focus:ring-secondary-200"
                />

                <div className="flex items-center gap-2 rounded-xl border border-background-300 bg-background-50 px-2 py-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={row.weight}
                    onChange={(event) => handleCriteriaChange(row.id, 'weight', event.target.value)}
                    className="w-16 bg-transparent text-right text-sm font-semibold outline-none"
                  />
                  <span className="text-sm font-bold text-foreground-500">%</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCriteria(row.id)}
                  disabled={criteriaRows.length === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Delete criterion"
                >
                  <i className="ri-delete-bin-line text-lg" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-base font-bold text-foreground-700">Total: {totalWeight}%</div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                totalWeight === 100 ? 'bg-accent-100 text-accent-700' : 'bg-red-100 text-red-600'
              }`}
            >
              <i className={totalWeight === 100 ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} aria-hidden="true" />
              {totalWeight === 100 ? 'Ready to generate' : 'Must total exactly 100%'}
            </div>
          </div>
        </section>

        <section className="animate-fadeInUp rounded-xl border border-primary-200 bg-background-50 p-5 shadow-sm sm:p-6" style={{ animationDelay: '400ms' }}>
          <SectionHeader iconClass="ri-magic-line text-lg" title={`Generate ${assessmentCategory === 'quiz' ? 'Quiz' : 'Test'} Questions`} />
          <p className="mb-5 text-sm text-foreground-600">
            The AI reads your translated lesson and builds a {assessmentCategory} distributed across your criteria weights.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-foreground-700">Assessment type
                <select
                  value={assessmentCategory}
                  onChange={(event) => setAssessmentCategory(event.target.value as 'quiz' | 'test')}
                  className="rounded-lg border border-background-300 bg-background-50 px-3 py-2 text-sm font-bold text-foreground-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                >
                  <option value="quiz">Quiz</option>
                  <option value="test">Test</option>
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-foreground-700">Number of Questions
              <input
                type="number"
                min={1}
                max={50}
                value={questionCount}
                onChange={(event) => setQuestionCount(Number(event.target.value || 1))}
                className="w-20 rounded-xl border border-background-300 bg-background-50 px-3 py-2 text-center text-sm outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
              />
              </label>
            </div>

            <button
              type="button"
              onClick={handleGenerateQuestions}
              disabled={loadingGenerate || !readyToGenerate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingGenerate ? <i className="ri-loader-4-line animate-spin text-lg" aria-hidden="true" /> : <i className="ri-question-answer-line text-lg" aria-hidden="true" />}
              Generate {assessmentCategory === 'quiz' ? 'Quiz' : 'Test'} Questions
            </button>
          </div>
        </section>

        {showErrorBanner && (
          <div className="animate-fadeInUp rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700" style={{ animationDelay: '500ms' }}>
            <div className="flex items-start gap-2">
              <i className="ri-error-warning-line mt-0.5 text-lg" aria-hidden="true" />
              <div>
                <p className="font-bold">Unable to generate questions right now.</p>
                {apiKeyMissing && (
                  <p className="mt-1 text-sm">
                    AI key is missing. Add your OpenAI API key to <code className="rounded bg-red-100 px-1 py-0.5 text-xs">.env.local</code> file:
                    <br />
                    <code className="mt-1 block rounded bg-red-100 p-2 text-xs">OPENAI_API_KEY=sk-your-key-here</code>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {checkingApiKey && (
          <div className="animate-fadeInUp rounded-2xl border border-primary-200 bg-primary-50 p-4 text-primary-700" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-2">
              <i className="ri-loader-4-line animate-spin text-lg" aria-hidden="true" />
              <span>Checking API configuration...</span>
            </div>
          </div>
        )}

        {showSuccessBanner && (
          <div className="animate-fadeInUp rounded-2xl border border-accent-200 bg-accent-50 p-4 text-accent-700" style={{ animationDelay: '550ms' }}>
            <div className="flex items-center gap-2 font-bold">
              <i className="ri-checkbox-circle-line text-lg" aria-hidden="true" />
              Activity saved successfully!
            </div>
          </div>
        )}

        {generatedGroups.length > 0 && (
          <div className="space-y-5">
            {generatedGroups.map((group, groupIndex) => (
              <div
                key={group.id}
                className="animate-fadeInUp rounded-xl border border-primary-200 bg-background-50 p-5 shadow-sm"
                style={{ animationDelay: `${(groupIndex + 1) * 100}ms` }}
              >
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <i className="ri-questionnaire-line text-lg" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground-900">{group.name}</h3>
                    <p className="text-sm text-foreground-500">{group.questions.length} questions</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {group.questions.map((question, questionIndex) => (
                    <div
                      key={question.id}
                      className="animate-fadeInUp rounded-lg border border-background-200 bg-background-50 p-4"
                      style={{ animationDelay: `${(groupIndex + 1) * 80 + questionIndex * 80}ms` }}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 text-sm font-bold text-secondary-600">
                          {questionIndex + 1}
                        </div>
                        <p className="font-bold text-foreground-900">{question.prompt}</p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm ${
                              option.correct
                                ? 'border-accent-300 bg-accent-50 text-accent-800'
                                : 'border-background-200 bg-background-50 text-foreground-700'
                            }`}
                          >
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                option.correct ? 'bg-accent-500 text-white' : 'bg-background-200 text-foreground-600'
                              }`}
                            >
                              {option.id}
                            </div>
                            <span className="flex-1">{option.text}</span>
                            {option.correct && <i className="ri-check-line text-lg" aria-hidden="true" />}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm text-foreground-700">
                        <div className="mb-1 flex items-center gap-2 font-bold text-primary-700">
                          <i className="ri-lightbulb-line" aria-hidden="true" />
                          Explanation:
                        </div>
                        <p>{question.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleSaveActivity}
          disabled={saving}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-accent-600 px-5 py-4 text-lg font-bold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <i className="ri-loader-4-line animate-spin text-xl" aria-hidden="true" /> : <i className="ri-save-line text-xl" aria-hidden="true" />}
          Save Activity
        </button>
      </div>
    </div>
  );
}

export default function CreateActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-280 pb-10">
          <div className="h-8 w-48 animate-pulse rounded bg-background-200" />
        </div>
      }
    >
      <CreateActivityForm />
    </Suspense>
  );
}
