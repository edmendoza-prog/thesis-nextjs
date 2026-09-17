'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Question = {
  id?: string;
  prompt: string;
  options: Array<{ id: string; text: string; correct: boolean }>;
  explanation: string;
};

function normalizeQuestion(rawQuestion: any, fallbackIndex: number | string): Question {
  const options = Array.isArray(rawQuestion?.options)
    ? rawQuestion.options.map((option: any, optionIndex: number) => ({
        id: String(option?.id ?? String.fromCharCode(65 + optionIndex)),
        text: String(option?.text ?? option?.value ?? 'Option'),
        correct: Boolean(option?.correct),
      }))
    : [];

  return {
    id: rawQuestion?.id ? String(rawQuestion.id) : `question-${String(fallbackIndex)}`,
    prompt: String(rawQuestion?.prompt ?? 'Untitled question'),
    options,
    explanation: String(rawQuestion?.explanation ?? ''),
  };
}

function normalizeQuestions(rawQuestions: unknown): Question[] {
  if (!Array.isArray(rawQuestions)) {
    return [];
  }

  const flattened: Question[] = [];

  rawQuestions.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    const groupQuestions = Array.isArray((entry as any).questions)
      ? (entry as any).questions
      : [];

    if (groupQuestions.length > 0) {
      groupQuestions.forEach((question: any, questionIndex: number) => {
        flattened.push(normalizeQuestion(question, `${index}-${questionIndex}`));
      });
      return;
    }

    flattened.push(normalizeQuestion(entry, index));
  });

  return flattened;
}

function StudentAssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || 'Assessment';
  const subject = searchParams.get('subject') || 'General';
  const due = searchParams.get('due') || 'Pending';
  const activityId = Number(searchParams.get('id') ?? '0');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ value: number; max: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(activityId > 0);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!activityId) {
        setQuestions([]);
        setLoadingQuestions(false);
        return;
      }

      try {
        setLoadingQuestions(true);
        const response = await fetch(`/api/student/activities?activityId=${activityId}`);
        const data = await response.json();
        const fetchedQuestions = normalizeQuestions(data?.activity?.questions ?? []);
        setQuestions(fetchedQuestions);
        if (data?.activity?.answers && typeof data.activity.answers === 'object') {
          setAnswers(data.activity.answers);
        }
        if (data?.activity?.completed) {
          setSubmitted(true);
          if (data.activity.score !== null && data.activity.score !== undefined) {
            setScore({ value: Number(data.activity.score), max: Number(data.activity.maxScore ?? 0) });
          }
        }
      } catch (error) {
        console.error('Failed to load assessment questions:', error);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [activityId]);

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  );

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!activityId || questions.length === 0 || submitting) return;

    setSubmitting(true);
    setSubmissionError('');
    try {
      const response = await fetch('/api/student/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, answers }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Unable to save assessment');
      setScore({ value: Number(data.score ?? 0), max: Number(data.maxScore ?? 0) });
      setSubmitted(true);
    } catch (error) {
      console.error('Assessment submission failed:', error);
      setSubmissionError(error instanceof Error ? error.message : 'Unable to save assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-primary-100 p-4 text-foreground-900 lg:p-6">
      <div className="mx-auto max-w-5xl rounded-2xl border border-primary-200 bg-white shadow-sm">
        <header className="border-b border-primary-200 bg-primary-50 px-5 py-6 md:px-8">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/student-dashboard')}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm font-bold text-primary-700 transition hover:bg-primary-50"
            >
              ← Back
            </button>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Assessment</p>
              <h1 className="mt-2 font-heading text-3xl font-bold">{title}</h1>
            </div>
            <div className="rounded-xl border border-accent-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-foreground-500">Subject</p>
              <p className="mt-1 text-sm font-bold text-accent-700">{subject}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-foreground-600">
            <span className="rounded-full bg-white px-3 py-1.5 font-semibold">{due}</span>
            <span className="rounded-full bg-white px-3 py-1.5 font-semibold">{questions.length} questions</span>
            <span className="rounded-full bg-white px-3 py-1.5 font-semibold">{answeredCount}/{questions.length} answered</span>
          </div>
        </header>

        <div className="space-y-6 p-5 md:p-8">
          {loadingQuestions ? (
            <div className="rounded-2xl border border-dashed border-primary-300 bg-background-50 p-8 text-center text-sm text-foreground-500">
              Loading assessment questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary-300 bg-background-50 p-8 text-center text-sm text-foreground-500">
              No assessment data available yet. This will be populated dynamically when your teacher creates an activity.
            </div>
          ) : questions.map((question, index) => {
            const questionId = question.id || `${title}-${index}`;
            const selectedAnswer = answers[questionId];
            const safeOptions = Array.isArray(question.options) ? question.options : [];

            return (
              <section key={questionId} className="rounded-2xl border border-primary-200 bg-background-50 p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {index + 1}
                  </div>
                  <h2 className="text-lg font-bold text-foreground-900">{question.prompt}</h2>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {safeOptions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-primary-200 bg-white p-3 text-sm text-foreground-500 md:col-span-2">
                      No answer options available for this question yet.
                    </div>
                  ) : safeOptions.map((option) => {
                    const isSelected = selectedAnswer === option.id;
                    const isCorrect = submitted && option.correct;
                    const showMistake = submitted && isSelected && !option.correct;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleAnswer(questionId, option.id)}
                        className={[
                          'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                          isSelected ? 'border-accent-400 bg-accent-50 text-accent-800' : 'border-background-200 bg-white text-foreground-700 hover:border-primary-300 hover:bg-primary-50/50',
                          isCorrect ? 'border-green-400 bg-green-50 text-green-800' : '',
                          showMistake ? 'border-red-300 bg-red-50 text-red-700' : '',
                        ].join(' ')}
                      >
                        <span className={[
                          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                          isSelected ? 'bg-accent-500 text-white' : 'bg-background-200 text-foreground-600',
                          isCorrect ? 'bg-green-500 text-white' : '',
                          showMistake ? 'bg-red-500 text-white' : '',
                        ].join(' ')}>{option.id}</span>
                        <span className="flex-1">{option.text}</span>
                        {submitted && option.correct && <span className="text-lg text-green-600">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm text-foreground-700">
                    <p className="font-bold text-primary-700">Explanation:</p>
                    <p className="mt-1">{question.explanation}</p>
                  </div>
                )}
              </section>
            );
          })}

          <div className="flex flex-col gap-3 border-t border-primary-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className={`text-sm ${submissionError ? 'text-red-600' : 'text-foreground-500'}`}>
              {submissionError || (score ? `Score saved: ${score.value}/${score.max}` : 'Answer each item before submitting your work.')}
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={questions.length === 0 || submitting || submitted}
              className="rounded-xl bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : submitted ? 'Completed' : 'Submit Assessment'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function StudentAssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary-100 p-6 text-sm font-semibold text-primary-700">Loading assessment…</div>}>
      <StudentAssessmentContent />
    </Suspense>
  );
}
