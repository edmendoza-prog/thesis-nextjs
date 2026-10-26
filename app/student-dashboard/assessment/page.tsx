'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';

type QuestionOption = {
  id: string;
  text: string;
  correct?: boolean;
};

export type MatchingPair = {
  id: string | number;
  item: string;
  match: string;
};

type Question = {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'identification' | 'matching';
  prompt: string;
  options: QuestionOption[];
  pairs?: MatchingPair[];
  columnA?: string[];
  columnB?: string[];
  expectedAnswer?: string;
  explanation: string;
};

type TranslatedQuestionData = {
  prompt: string;
  options?: { id: string; text: string }[];
  pairs?: { id: number | string; item: string; match: string }[];
  columnA?: string[];
  columnB?: string[];
  expectedAnswer?: string;
  explanation?: string;
};

const SUPPORTED_LANGUAGES = [
  { id: 'English', label: 'English', short: 'English', flag: '🇺🇸' },
  { id: 'Filipino (Tagalog)', label: 'Filipino (Tagalog)', short: 'Filipino', flag: '🇵🇭' },
  { id: 'Cebuano (Bisaya)', label: 'Cebuano (Bisaya)', short: 'Bisaya', flag: '🏝️' },
  { id: 'Ilocano', label: 'Ilocano', short: 'Ilocano', flag: '🌾' },
  { id: 'Spanish', label: 'Spanish', short: 'Spanish', flag: '🇪🇸' },
];

const SHAPES = [
  {
    shape: '▲',
    name: 'Triangle',
    key: '1',
    bg: 'bg-[#FF6D00]',
    baseShadow: 'shadow-[0_7px_0_0_#B84300]',
    activeShadow: 'active:shadow-[0_2px_0_0_#B84300]',
    hover: 'hover:bg-[#F26400]',
  },
  {
    shape: '◆',
    name: 'Diamond',
    key: '2',
    bg: 'bg-[#156FEA]',
    baseShadow: 'shadow-[0_7px_0_0_#0D489E]',
    activeShadow: 'active:shadow-[0_2px_0_0_#0D489E]',
    hover: 'hover:bg-[#1263D4]',
  },
  {
    shape: '●',
    name: 'Circle',
    key: '3',
    bg: 'bg-[#229E3A]',
    baseShadow: 'shadow-[0_7px_0_0_#146324]',
    activeShadow: 'active:shadow-[0_2px_0_0_#146324]',
    hover: 'hover:bg-[#1D8B33]',
  },
  {
    shape: '■',
    name: 'Square',
    key: '4',
    bg: 'bg-[#D92534]',
    baseShadow: 'shadow-[0_7px_0_0_#8E131E]',
    activeShadow: 'active:shadow-[0_2px_0_0_#8E131E]',
    hover: 'hover:bg-[#C71E2D]',
  },
];

function normalizeQuestions(rawQuestions: any[]): Question[] {
  if (!Array.isArray(rawQuestions)) return [];

  const list: Question[] = [];
  rawQuestions.forEach((q, idx) => {
    if (!q) return;

    if (Array.isArray(q.questions)) {
      q.questions.forEach((subQ: any, sIdx: number) => {
        list.push(parseSingleQuestion(subQ, `${idx}-${sIdx}`));
      });
      return;
    }

    list.push(parseSingleQuestion(q, idx));
  });

  return list;
}

function parseSingleQuestion(q: any, fallbackIdx: string | number): Question {
  const isMatching =
    q.type === 'matching' ||
    q.questionType === 'Matching Type' ||
    (Array.isArray(q.pairs) && q.pairs.length > 0) ||
    (Array.isArray(q.columnA) && Array.isArray(q.columnB) && q.columnA.length > 0);

  if (isMatching) {
    let pairs: MatchingPair[] = [];
    if (Array.isArray(q.pairs) && q.pairs.length > 0) {
      pairs = q.pairs.map((p: any, pIdx: number) => ({
        id: String(p.id ?? pIdx + 1),
        item: String(p.item ?? p.prompt ?? `Item ${pIdx + 1}`),
        match: String(p.match ?? p.answer ?? `Match ${pIdx + 1}`),
      }));
    } else if (Array.isArray(q.columnA) && Array.isArray(q.columnB)) {
      pairs = q.columnA.map((item: string, pIdx: number) => ({
        id: String(pIdx + 1),
        item: String(item),
        match: String(q.columnB[pIdx] ?? `Match ${pIdx + 1}`),
      }));
    }

    const columnA = pairs.map((p) => p.item);
    // Shuffle columnB options for the bank
    const columnB = [...pairs.map((p) => p.match)].sort(() => 0.5 - Math.random());

    return {
      id: String(q.id ?? `question-${fallbackIdx}`),
      type: 'matching',
      prompt: String(q.prompt ?? 'Match each item in Column A with its correct match in Column B:'),
      options: [],
      pairs,
      columnA,
      columnB,
      explanation: String(q.explanation ?? 'Review key terms and concepts from the lesson handout.'),
    };
  }

  const isIdentification =
    q.type === 'identification' ||
    q.questionType === 'Identification' ||
    Boolean(
      (q.expectedAnswer || q.answer || q.correctAnswer) &&
      (!q.options ||
        q.options.length === 0 ||
        q.options.every((o: any) => /^Option [A-D]$/i.test(String(o.text ?? o.value ?? ''))))
    );

  if (isIdentification) {
    const exp = String(q.expectedAnswer ?? q.answer ?? q.correctAnswer ?? '').trim();
    return {
      id: String(q.id ?? `question-${fallbackIdx}`),
      type: 'identification',
      prompt: String(q.prompt ?? 'Identify the correct term or concept:'),
      options: [],
      expectedAnswer: exp,
      explanation: String(q.explanation ?? 'Review key terms and concepts from the lesson handout.'),
    };
  }

  const isTrueFalse =
    q.type === 'true_false' ||
    q.type === 'truefalse' ||
    q.type === 'tf' ||
    q.questionType === 'True or False' ||
    q.questionType === 'True / False' ||
    q.questionType === 'True/False' ||
    (Array.isArray(q.options) &&
      (q.options.length === 2 ||
        (q.options.length > 2 &&
          /^(true|tama)$/i.test(String(q.options[0]?.text ?? q.options[0]?.value ?? '').trim()) &&
          /^(false|mali)$/i.test(String(q.options[1]?.text ?? q.options[1]?.value ?? '').trim()))));

  let options: QuestionOption[] = [];

  // Parse raw options if provided
  if (Array.isArray(q.options) && q.options.length > 0) {
    options = q.options.map((opt: any, oIdx: number) => {
      const isCorrectFlag =
        opt?.correct === true ||
        opt?.correct === 'true' ||
        opt?.correct === 1 ||
        opt?.correct === '1' ||
        opt?.isCorrect === true ||
        opt?.isCorrect === 'true';

      return {
        id: String(opt?.id ?? String.fromCharCode(65 + oIdx)),
        text: String(opt?.text ?? opt?.value ?? `Option ${oIdx + 1}`),
        correct: Boolean(isCorrectFlag),
      };
    });
  }

  // Look for any external correct answer indicator on the question object
  const rawCorrectKey = String(
    q.correctAnswer ??
    q.answer ??
    q.correctOption ??
    q.correct ??
    q.expectedAnswer ??
    q.key ??
    ''
  ).trim();

  if (isTrueFalse) {
    // Standardize True/False options: strictly Option 0 = True, Option 1 = False
    const opt0Text = options[0]?.text || 'True';
    const opt1Text = options[1]?.text || 'False';

    const trueLabel = /tama/i.test(opt0Text) ? 'Tama' : 'True';
    const falseLabel = /mali/i.test(opt1Text) ? 'Mali' : 'False';

    // Determine whether True or False is the correct answer
    let isTrueCorrect: boolean | null = null;

    // 1. Check rawCorrectKey string
    if (/^(true|t|tama|1|a|yes|oo)$/i.test(rawCorrectKey)) {
      isTrueCorrect = true;
    } else if (/^(false|f|mali|2|b|no|hindi)$/i.test(rawCorrectKey)) {
      isTrueCorrect = false;
    }

    // 2. Check options if rawCorrectKey was not explicit
    if (isTrueCorrect === null) {
      if (options[0]?.correct && !options[1]?.correct) {
        isTrueCorrect = true;
      } else if (options[1]?.correct && !options[0]?.correct) {
        isTrueCorrect = false;
      } else if (options.length > 2) {
        // If an old 3rd or 4th option was marked correct from old padding bug, check explanation/context
        const fullContext = `${rawCorrectKey} ${q.explanation || ''}`.toLowerCase();
        if (/false|mali|incorrect|not true|hindi/i.test(fullContext)) {
          isTrueCorrect = false;
        } else {
          isTrueCorrect = true;
        }
      }
    }

    // 3. Fallback to explanation or default
    if (isTrueCorrect === null) {
      const expText = String(q.explanation || '').toLowerCase();
      if (/false|mali|incorrect|hindi totoo|hindi/i.test(expText)) {
        isTrueCorrect = false;
      } else {
        isTrueCorrect = true;
      }
    }

    options = [
      { id: 'A', text: trueLabel, correct: isTrueCorrect === true },
      { id: 'B', text: falseLabel, correct: isTrueCorrect === false },
    ];
  } else {
    // For regular Multiple Choice:
    // If no option is flagged as correct, match against rawCorrectKey
    if (options.length > 0 && !options.some((o) => o.correct) && rawCorrectKey) {
      const matchOpt =
        options.find(
          (o) =>
            o.id.toLowerCase() === rawCorrectKey.toLowerCase() ||
            o.text.toLowerCase().trim() === rawCorrectKey.toLowerCase().trim()
        ) || options[0];
      if (matchOpt) matchOpt.correct = true;
    }

    // If options is empty
    if (options.length === 0) {
      options = [
        { id: 'A', text: 'Option A', correct: false },
        { id: 'B', text: 'Option B', correct: true },
        { id: 'C', text: 'Option C', correct: false },
        { id: 'D', text: 'Option D', correct: false },
      ];
    } else if (!options.some((o) => o.correct)) {
      // Guaranteed at least 1 correct answer
      options[0].correct = true;
    }

    // Randomize Multiple Choice option positions so correct answer is not always Position 1 (Top-Left / ▲)
    if (options.length > 1) {
      const shuffled = [...options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      options = shuffled.map((opt, idx) => ({
        ...opt,
        id: letters[idx] || String.fromCharCode(65 + idx),
      }));
    }
  }

  return {
    id: String(q.id ?? `question-${fallbackIdx}`),
    type: isTrueFalse ? 'true_false' : q.type || 'multiple_choice',
    prompt: String(q.prompt ?? 'What is the correct answer?'),
    options,
    explanation: String(q.explanation ?? 'Review the lesson handout for more context.'),
  };
}

function StudentAssessmentPlayer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activityId = Number(searchParams.get('id') ?? '0');
  const classId = searchParams.get('classId') || '';
  const title = searchParams.get('title') || 'Homework Assignment';
  const subject = searchParams.get('subject') || 'Class Activity';
  const due = searchParams.get('due') || 'No due date';
  const totalPointsParam = Number(searchParams.get('points') ?? '20');

  const [gameState, setGameState] = useState<'start' | 'playing' | 'results'>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, Record<string, string>>>({});
  const [answeredLocked, setAnsweredLocked] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [identificationInput, setIdentificationInput] = useState('');

  // Drag and Drop & Matching States
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [draggedFromSlot, setDraggedFromSlot] = useState<string | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);
  const [selectedBankCard, setSelectedBankCard] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  // Global drag coordinates tracker for 100% solid custom drag pill
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      if (e.clientX !== 0 || e.clientY !== 0) {
        setDragPos({ x: e.clientX, y: e.clientY });
      }
    };
    const handleWindowDragEnd = () => {
      setDraggedCard(null);
      setDragPos(null);
      setDraggedFromSlot(null);
      setActiveDropTarget(null);
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragend', handleWindowDragEnd);
    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragend', handleWindowDragEnd);
    };
  }, []);

  // Translation States
  const [preferredLanguage, setPreferredLanguage] = useState<string>('English');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('original');
  const [translationsCache, setTranslationsCache] = useState<Record<string, Record<string, TranslatedQuestionData>>>({});
  const [translating, setTranslating] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Load activity questions
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!activityId) {
        // Mock sample questions for preview if not saved, including Matching Type
        const defaultSample: Question[] = [
          {
            id: 'q1',
            type: 'multiple_choice',
            prompt: 'Which part of the cell is known as the powerhouse of the cell?',
            options: [
              { id: 'A', text: 'Nucleus', correct: false },
              { id: 'B', text: 'Ribosome', correct: false },
              { id: 'C', text: 'Mitochondria', correct: true },
              { id: 'D', text: 'Endoplasmic Reticulum', correct: false },
            ],
            explanation: 'Mitochondria generate most of the chemical energy needed to power the cell’s biochemical reactions.',
          },
          {
            id: 'q2',
            type: 'matching',
            prompt: 'Match each plant part with its primary botanical function (Drag to match):',
            pairs: [
              { id: '1', item: 'Roots', match: 'Absorbs water and minerals from soil' },
              { id: '2', item: 'Stem', match: 'Supports leaves and conducts nutrients' },
              { id: '3', item: 'Leaves', match: 'Performs photosynthesis to create food' },
              { id: '4', item: 'Flowers', match: 'Facilitates reproduction and pollination' },
            ],
            columnA: ['Roots', 'Stem', 'Leaves', 'Flowers'],
            columnB: [
              'Supports leaves and conducts nutrients',
              'Performs photosynthesis to create food',
              'Absorbs water and minerals from soil',
              'Facilitates reproduction and pollination',
            ],
            options: [],
            explanation: 'Roots absorb water, Stems transport fluids and support the plant, Leaves synthesize sugars via photosynthesis, and Flowers reproduce.',
          },
          {
            id: 'q3',
            type: 'multiple_choice',
            prompt: 'Which planet is known as the Red Planet due to iron oxide on its surface?',
            options: [
              { id: 'A', text: 'Venus', correct: false },
              { id: 'B', text: 'Mars', correct: true },
              { id: 'C', text: 'Jupiter', correct: false },
              { id: 'D', text: 'Mercury', correct: false },
            ],
            explanation: 'Mars appears reddish because of widespread iron oxide (rust) covering its rocks and dust.',
          },
          {
            id: 'q4',
            type: 'multiple_choice',
            prompt: 'What is the boiling point of pure water at standard atmospheric pressure?',
            options: [
              { id: 'A', text: '90°C', correct: false },
              { id: 'B', text: '100°C', correct: true },
              { id: 'C', text: '110°C', correct: false },
              { id: 'D', text: '120°C', correct: false },
            ],
            explanation: 'At 1 atm of pressure, water changes phase from liquid to gas at precisely 100 degrees Celsius.',
          },
        ];
        setQuestions(defaultSample);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/student/activities?activityId=${activityId}`);
        const data = await res.json();
        if (res.ok && data.activity) {
          const loadedQuestions = normalizeQuestions(data.activity.questions || []);
          if (loadedQuestions.length > 0) {
            setQuestions(loadedQuestions);
          } else {
            setQuestions([
              {
                id: '1',
                type: 'multiple_choice',
                prompt: `Review Question 1 for ${data.activity.title || title}`,
                options: [
                  { id: 'A', text: 'Concept A (Correct)', correct: true },
                  { id: 'B', text: 'Concept B', correct: false },
                  { id: 'C', text: 'Concept C', correct: false },
                  { id: 'D', text: 'Concept D', correct: false },
                ],
                explanation: 'Refer to the uploaded lecture slides and class readings.',
              },
            ]);
          }

          if (data.activity.completed) {
            if (data.activity.answers) setSelectedAnswers(data.activity.answers);
            if (data.activity.score !== null) setCurrentScore(Number(data.activity.score));
            setGameState('results');
          }
        }
      } catch (err) {
        console.error('Failed to load homework questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [activityId, title]);

  const currentQ = questions[currentIndex] || null;
  const pointsPerQuestion = questions.length > 0 ? totalPointsParam / questions.length : 5;

  // Question translation handler
  const handleTranslate = async (targetLang: string) => {
    setShowLanguageDropdown(false);
    if (targetLang === 'original') {
      setSelectedLanguage('original');
      return;
    }

    setPreferredLanguage(targetLang);
    setSelectedLanguage(targetLang);
    if (!currentQ) return;

    if (translationsCache[currentQ.id]?.[targetLang]) {
      return;
    }

    setTranslating(true);
    setTranslationError(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate-question',
          question: {
            prompt: currentQ.prompt,
            type: currentQ.type,
            options: currentQ.options.map((o) => ({ id: o.id, text: o.text })),
            pairs: currentQ.pairs,
            columnA: currentQ.columnA,
            columnB: currentQ.columnB,
            explanation: currentQ.explanation,
          },
          targetLanguage: targetLang,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Translation request failed');
      }

      const data = await res.json();
      if (data.translatedQuestion) {
        setTranslationsCache((prev) => ({
          ...prev,
          [currentQ.id]: {
            ...(prev[currentQ.id] || {}),
            [targetLang]: data.translatedQuestion,
          },
        }));
      }
    } catch (err: any) {
      console.error('Failed to translate question:', err);
      setTranslationError(err.message || 'Translation unavailable');
      setTimeout(() => setTranslationError(null), 4000);
    } finally {
      setTranslating(false);
    }
  };

  // Instant one-click automatic translation toggle
  const handleQuickTranslateToggle = () => {
    if (selectedLanguage !== 'original') {
      setSelectedLanguage('original');
    } else {
      handleTranslate(preferredLanguage);
    }
  };

  // Auto-translate if user switches question while a language is active
  useEffect(() => {
    if (gameState === 'playing' && currentQ && selectedLanguage !== 'original') {
      if (!translationsCache[currentQ.id]?.[selectedLanguage]) {
        handleTranslate(selectedLanguage);
      }
    }
  }, [currentIndex, selectedLanguage, gameState]);

  // Derived current question & option texts based on translation
  const currentTranslation =
    selectedLanguage !== 'original' && currentQ
      ? translationsCache[currentQ.id]?.[selectedLanguage]
      : null;

  const displayPrompt = currentTranslation?.prompt || currentQ?.prompt || '';

  const displayOptions = (currentQ?.options || []).map((opt, idx) => {
    if (!currentTranslation || !Array.isArray(currentTranslation.options)) return opt;
    const match =
      currentTranslation.options.find(
        (to) => to.id === opt.id || String(to.id).toLowerCase() === String(opt.id).toLowerCase()
      ) || currentTranslation.options[idx];
    return {
      ...opt,
      text: match?.text || opt.text,
    };
  });

  const displayPairs: MatchingPair[] = (currentQ?.pairs || []).map((p, idx) => {
    if (!currentTranslation?.pairs?.[idx]) return p;
    const transPair = currentTranslation.pairs[idx];
    return {
      id: p.id,
      item: transPair.item || p.item,
      match: transPair.match || p.match,
    };
  });

  const displayExplanation = currentTranslation?.explanation || currentQ?.explanation || '';

  // Matching Question Helpers
  const currentMatches = currentQ ? matchingAnswers[currentQ.id] || {} : {};
  const allBankOptions = currentQ?.type === 'matching' ? displayPairs.map((p) => p.match) : [];
  const placedAnswerValues = Object.values(currentMatches);
  const availableBankOptions = allBankOptions.filter((opt) => !placedAnswerValues.includes(opt));
  // Solid palette lookup for matching
  const MATCH_COLORS = [
    { bg: '#F56500', shadow: '#B84300' },
    { bg: '#1877F2', shadow: '#0D489E' },
    { bg: '#16A34A', shadow: '#146324' },
    { bg: '#DC2626', shadow: '#8E131E' },
    { bg: '#7C3AED', shadow: '#5B21B6' },
  ];

  // Handle Drag & Drop
  const handleDragStartFromBank = (e: React.DragEvent, answerText: string) => {
    if (answeredLocked) return;
    try {
      e.dataTransfer.setData('text/plain', answerText);
      e.dataTransfer.effectAllowed = 'move';
      if (typeof window !== 'undefined') {
        const img = new Image();
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
        if (e.dataTransfer.setDragImage) {
          e.dataTransfer.setDragImage(img, 0, 0);
        }
      }
    } catch {
      // Ignore
    }
    setDraggedCard(answerText);
    setDragPos({ x: e.clientX, y: e.clientY });
    setDraggedFromSlot(null);
  };

  const handleDragStartFromSlot = (e: React.DragEvent, answerText: string, slotItem: string) => {
    if (answeredLocked) return;
    try {
      e.dataTransfer.setData('text/plain', answerText);
      e.dataTransfer.effectAllowed = 'move';
      if (typeof window !== 'undefined') {
        const img = new Image();
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
        if (e.dataTransfer.setDragImage) {
          e.dataTransfer.setDragImage(img, 0, 0);
        }
      }
    } catch {
      // Ignore
    }
    setDraggedCard(answerText);
    setDragPos({ x: e.clientX, y: e.clientY });
    setDraggedFromSlot(slotItem);
  };

  const handleDragOverSlot = (e: React.DragEvent, slotItem: string) => {
    if (answeredLocked) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropTarget !== slotItem) {
      setActiveDropTarget(slotItem);
    }
  };

  const handleDragLeaveSlot = (slotItem: string) => {
    if (activeDropTarget === slotItem) {
      setActiveDropTarget(null);
    }
  };

  const handleDropOnSlot = (e: React.DragEvent, slotItem: string) => {
    if (answeredLocked || !currentQ) return;
    e.preventDefault();
    const droppedText = e.dataTransfer.getData('text/plain') || draggedCard;
    if (!droppedText) return;

    setMatchingAnswers((prev) => {
      const cur = { ...(prev[currentQ.id] || {}) };
      // If this answer was in another slot, clear that slot
      Object.keys(cur).forEach((k) => {
        if (cur[k] === droppedText) delete cur[k];
      });
      cur[slotItem] = droppedText;
      return { ...prev, [currentQ.id]: cur };
    });

    setDraggedCard(null);
    setDragPos(null);
    setDraggedFromSlot(null);
    setActiveDropTarget(null);
    setSelectedBankCard(null);
  };

  const handleRemoveSlotMatch = (slotItem: string) => {
    if (answeredLocked || !currentQ) return;
    setMatchingAnswers((prev) => {
      const cur = { ...(prev[currentQ.id] || {}) };
      delete cur[slotItem];
      return { ...prev, [currentQ.id]: cur };
    });
    setSelectedBankCard(null);
  };

  const handleResetAllMatches = () => {
    if (answeredLocked || !currentQ) return;
    setMatchingAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {},
    }));
    setSelectedBankCard(null);
  };

  const handleBankCardClick = (answerText: string) => {
    if (answeredLocked) return;
    setSelectedBankCard((prev) => (prev === answerText ? null : answerText));
  };

  const handleSlotClick = (slotItem: string) => {
    if (answeredLocked || !currentQ) return;

    if (selectedBankCard) {
      // Place selected card into this slot
      setMatchingAnswers((prev) => {
        const cur = { ...(prev[currentQ.id] || {}) };
        Object.keys(cur).forEach((k) => {
          if (cur[k] === selectedBankCard) delete cur[k];
        });
        cur[slotItem] = selectedBankCard;
        return { ...prev, [currentQ.id]: cur };
      });
      setSelectedBankCard(null);
    } else if (currentMatches[slotItem]) {
      // If already matched and clicked with no card selected, remove and send back to bank
      handleRemoveSlotMatch(slotItem);
    }
  };

  // Submit and evaluate Matching Question
  const handleConfirmMatchingAnswer = () => {
    if (answeredLocked || !currentQ) return;

    const pairs = displayPairs;
    if (pairs.length === 0) return;

    let correctPairsCount = 0;
    pairs.forEach((p) => {
      if (currentMatches[p.item] === p.match) {
        correctPairsCount += 1;
      }
    });

    const isAllCorrect = correctPairsCount === pairs.length;
    const earnedPoints = Math.round((correctPairsCount / pairs.length) * pointsPerQuestion * 10) / 10;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: currentMatches,
    }));

    setAnsweredLocked(true);
    setCurrentScore((prev) => Math.round((prev + earnedPoints) * 10) / 10);
    if (isAllCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  // Submit and evaluate Identification Question
  const handleConfirmIdentificationAnswer = () => {
    if (answeredLocked || !currentQ || currentQ.type !== 'identification') return;
    const typed = identificationInput.trim();
    if (!typed) return;

    const qId = currentQ.id;
    const expected = (currentTranslation?.expectedAnswer || currentQ.expectedAnswer || '').trim();

    const cleanStr = (s: string) =>
      s
        .toLowerCase()
        .replace(/^(ang|ang mga|the|a|an)\s+/i, '')
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
        .trim();

    const isCorrect =
      cleanStr(typed) === cleanStr(expected) ||
      typed.toLowerCase() === expected.toLowerCase() ||
      (expected.length > 0 && cleanStr(typed).includes(cleanStr(expected))) ||
      (expected.length > 0 && cleanStr(expected).includes(cleanStr(typed)));

    setSelectedAnswers((prev) => ({ ...prev, [qId]: typed }));
    setAnsweredLocked(true);

    if (isCorrect) {
      setCurrentScore((prev) => Math.round((prev + pointsPerQuestion) * 10) / 10);
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleSelectAnswer = useCallback(
    (optionId: string) => {
      if (answeredLocked || !currentQ) return;

      const qId = currentQ.id;
      const isCorrect = currentQ.options.find((o) => o.id === optionId)?.correct ?? false;

      setSelectedAnswers((prev) => ({ ...prev, [qId]: optionId }));
      setAnsweredLocked(true);

      if (isCorrect) {
        setCurrentScore((prev) => Math.round((prev + pointsPerQuestion) * 10) / 10);
        setCorrectCount((prev) => prev + 1);
      }
    },
    [answeredLocked, currentQ, pointsPerQuestion]
  );

  // Keyboard listening: 1 to 4 keys for Multiple Choice
  useEffect(() => {
    if (gameState !== 'playing' || answeredLocked || !currentQ || currentQ.type === 'matching') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (currentQ.options[index]) {
          handleSelectAnswer(currentQ.options[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, answeredLocked, currentQ, handleSelectAnswer]);

  // Celebration Confetti effect when homework completes
  const triggerCelebrationConfetti = useCallback(() => {
    try {
      // 1. Instant center burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4338CA', '#F56500', '#1877F2', '#16A34A', '#DC2626', '#FFD700', '#EC4899'],
      });

      // 2. Dual side cannons lasting 2.5 seconds
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#4338CA', '#F56500', '#1877F2', '#16A34A', '#FFD700', '#EC4899', '#8B5CF6'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      requestAnimationFrame(frame);
    } catch {
      // Graceful fallback if not supported
    }
  }, []);

  // Trigger confetti upon reaching the results screen
  useEffect(() => {
    if (gameState === 'results') {
      triggerCelebrationConfetti();
    }
  }, [gameState, triggerCelebrationConfetti]);

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAnsweredLocked(false);
      setIdentificationInput('');
    } else {
      setGameState('results');
      triggerCelebrationConfetti();
    }
  };

  const handleExit = () => {
    if (gameState === 'playing' && !window.confirm('Are you sure you want to exit homework? Your progress for this session will not be saved until submitted.')) {
      return;
    }
    const returnUrl = classId ? `/student-dashboard?tab=Classes&classId=${classId}` : '/student-dashboard?tab=Classes';
    router.push(returnUrl);
  };

  const handleSubmitHomework = async () => {
    setSubmitting(true);
    try {
      if (activityId > 0) {
        await fetch('/api/student/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId,
            answers: selectedAnswers,
          }),
        });
      }

      // Return to class homework tab
      const returnUrl = classId ? `/student-dashboard?tab=Classes&classId=${classId}` : '/student-dashboard?tab=Classes';
      router.push(returnUrl);
    } catch (err) {
      console.error('Failed to submit homework:', err);
      const returnUrl = classId ? `/student-dashboard?tab=Classes&classId=${classId}` : '/student-dashboard?tab=Classes';
      router.push(returnUrl);
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#4338CA] border-t-transparent" />
          <p className="font-heading text-lg font-bold text-slate-800">Loading homework player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 select-none">
      {/* 1. TOP BAR: Clean White with subtle border */}
      <header className="relative z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-extrabold text-slate-700 shadow-xs transition hover:bg-slate-100 active:scale-95 cursor-pointer"
          >
            ← Exit
          </button>
          <div className="hidden sm:block">
            <h1 className="font-heading text-sm font-extrabold text-slate-900 truncate max-w-xs md:max-w-md">
              {title}
            </h1>
            <p className="text-[11px] text-slate-500">{subject}</p>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Top Bar Quick Automatic Translate Button */}
            <button
              type="button"
              onClick={handleQuickTranslateToggle}
              disabled={translating}
              title={selectedLanguage === 'original' ? 'Translate question (Automatic)' : 'Show original'}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition shadow-xs cursor-pointer ${selectedLanguage !== 'original'
                  ? 'border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
            >
              {translating ? (
                <i className="ri-loader-4-line animate-spin text-sm" />
              ) : (
                <i className="ri-translate-2 text-sm" />
              )}
            </button>

            <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3.5 py-1 text-xs font-bold text-[#4338CA] border border-indigo-100">
              <span>Question</span>
              <span className="font-extrabold text-[#4338CA]">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs font-extrabold text-slate-600">
              <span>Score:</span>
              <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-sm font-black text-emerald-700 shadow-xs">
                {currentScore} pts
              </span>
            </div>
          </div>
        )}

        {gameState !== 'playing' && (
          <div className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
            {totalPointsParam} Total Points
          </div>
        )}
      </header>

      {/* Thin Progress Line directly under top bar */}
      <div className="h-1.5 w-full bg-slate-100">
        <div
          className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300 ease-out shadow-xs"
          style={{ width: gameState === 'start' ? '0%' : gameState === 'results' ? '100%' : `${progressPercentage}%` }}
        />
      </div>

      {/* 2. BODY CONTENT: Start Screen, Question Player, or Results Screen */}
      <main className="relative flex flex-1 flex-col items-center justify-center p-3 sm:p-6 md:p-8 bg-white overflow-y-auto">
        {/* START SCREEN */}
        {gameState === 'start' && (
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl animate-fadeInUp">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#4338CA] text-3xl text-white shadow-lg">
              📚
            </div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#4338CA]">
              {subject}
            </p>
            <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-black text-slate-900">
              {title}
            </h2>

            <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Questions</p>
                <p className="mt-1 font-heading text-xl font-extrabold text-slate-900">{questions.length}</p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Total Points</p>
                <p className="mt-1 font-heading text-xl font-extrabold text-emerald-600">{totalPointsParam} pts</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Due Date</p>
                <p className="mt-1 text-xs font-bold text-amber-600 truncate">{due}</p>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-600">
              💡 Take your time to review each question carefully. You can use keys <strong>1 to 4</strong> on your keyboard to answer quickly, and click the <strong>Translate Icon</strong> to automatically translate questions!
            </p>

            <button
              type="button"
              onClick={() => setGameState('playing')}
              className="mt-8 w-full rounded-2xl border-b-4 border-[#312E81] bg-[#4338CA] py-4 font-heading text-lg font-black text-white shadow-lg transition-all duration-150 hover:bg-[#3730A3] hover:translate-y-0.5 active:translate-y-1 cursor-pointer"
            >
              Start homework →
            </button>
          </div>
        )}

        {/* QUESTION SCREEN */}
        {gameState === 'playing' && currentQ && (
          <div className="flex w-full flex-1 flex-col justify-center max-w-[1560px] mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-4 animate-fadeIn gap-3 sm:gap-5">
            {/* Top Centered Question Card */}
            <div className="relative flex min-h-[120px] sm:min-h-[150px] md:min-h-[165px] flex-col items-center justify-center rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-8 text-center shadow-md">

              {/* Top-Left Translate Button & Language Picker */}
              <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-6 z-10 flex items-center gap-2">
                {/* Instant Automatic Translate Icon Button */}
                <button
                  type="button"
                  onClick={handleQuickTranslateToggle}
                  disabled={translating}
                  title={selectedLanguage === 'original' ? 'Click to translate automatically' : 'Click to show original'}
                  className={`inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all cursor-pointer shadow-xs border ${selectedLanguage !== 'original'
                      ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 hover:scale-105 active:scale-95'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:scale-105 active:scale-95'
                    }`}
                >
                  {translating ? (
                    <i className="ri-loader-4-line animate-spin text-lg sm:text-xl text-slate-700" />
                  ) : (
                    <i className="ri-translate-2 text-lg sm:text-xl" />
                  )}
                </button>

                {/* Language Pill & Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLanguageDropdown((prev) => !prev)}
                    className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-bold transition cursor-pointer border ${selectedLanguage !== 'original'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    title="Select language"
                  >
                    <span>
                      {selectedLanguage === 'original'
                        ? (SUPPORTED_LANGUAGES.find((l) => l.id === preferredLanguage)?.short || 'EN')
                        : (SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage)?.short || 'Translated')}
                    </span>
                    <span className="text-[10px] opacity-75">▾</span>
                  </button>

                  {showLanguageDropdown && (
                    <div className="absolute left-0 top-full mt-2 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl animate-fadeIn text-left">
                      <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                        Translate to
                      </div>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => handleTranslate(lang.id)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition text-left cursor-pointer ${selectedLanguage === lang.id
                              ? 'bg-[#4338CA] text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          <span>{lang.flag} {lang.label}</span>
                          {selectedLanguage === lang.id && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Centered Question Number Pill */}
              <div className="mb-3 flex items-center justify-center">
                <span className="rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-bold text-[#4338CA] uppercase tracking-widest border border-indigo-100">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Translation Error Banner */}
              {translationError && (
                <div className="mb-3 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-1.5 text-xs text-rose-600 text-center animate-fadeIn">
                  ⚠️ {translationError}
                </div>
              )}

              {/* Question Text */}
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-snug max-w-4xl tracking-tight">
                {displayPrompt}
              </h2>
            </div>

            {/* QUESTION SCREEN: Identification, Matching, or Multiple Choice / True-False */}
            {currentQ.type === 'identification' ? (
              <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto w-full animate-fadeIn">
                {/* Text input area */}
                <div className="w-full">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      disabled={answeredLocked}
                      value={answeredLocked ? (selectedAnswers[currentQ.id] || identificationInput) : identificationInput}
                      onChange={(e) => setIdentificationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !answeredLocked && identificationInput.trim()) {
                          handleConfirmIdentificationAnswer();
                        }
                      }}
                      placeholder="Type your answer here..."
                      autoFocus
                      className={`w-full rounded-2xl border-2 px-5 py-4 text-base sm:text-lg font-bold text-slate-900 shadow-sm transition outline-none ${answeredLocked
                          ? (() => {
                            const studentAns = String(selectedAnswers[currentQ.id] || identificationInput);
                            const expected = (currentTranslation?.expectedAnswer || currentQ.expectedAnswer || '').trim();
                            const cleanStr = (s: string) => s.toLowerCase().replace(/^(ang|ang mga|the|a|an)\s+/i, '').replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim();
                            const isCorrect = cleanStr(studentAns) === cleanStr(expected) || studentAns.toLowerCase().trim() === expected.toLowerCase() || (expected.length > 0 && cleanStr(studentAns).includes(cleanStr(expected))) || (expected.length > 0 && cleanStr(expected).includes(cleanStr(studentAns)));
                            return isCorrect
                              ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-300'
                              : 'border-rose-400 bg-rose-50/50 text-rose-950 ring-2 ring-rose-300';
                          })()
                          : 'border-slate-300 bg-white focus:border-[#4338CA] focus:ring-4 focus:ring-indigo-100'
                        }`}
                    />
                    {!answeredLocked && (
                      <button
                        type="button"
                        disabled={!identificationInput.trim()}
                        onClick={handleConfirmIdentificationAnswer}
                        className="absolute right-2 rounded-xl border-b-2 border-[#312E81] bg-[#4338CA] hover:bg-[#3730A3] px-5 py-2.5 font-heading text-xs font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Submit ↵
                      </button>
                    )}
                  </div>

                  {/* Answer feedback badge after submit */}
                  {answeredLocked && (
                    <div className="mt-3 flex items-center justify-between rounded-2xl border p-3 text-xs sm:text-sm font-bold animate-fadeInUp">
                      {(() => {
                        const studentAns = String(selectedAnswers[currentQ.id] || identificationInput);
                        const expected = (currentTranslation?.expectedAnswer || currentQ.expectedAnswer || '').trim();
                        const cleanStr = (s: string) => s.toLowerCase().replace(/^(ang|ang mga|the|a|an)\s+/i, '').replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim();
                        const isCorrect = cleanStr(studentAns) === cleanStr(expected) || studentAns.toLowerCase().trim() === expected.toLowerCase() || (expected.length > 0 && cleanStr(studentAns).includes(cleanStr(expected))) || (expected.length > 0 && cleanStr(expected).includes(cleanStr(studentAns)));

                        return isCorrect ? (
                          <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border-emerald-200 w-full p-2.5 rounded-xl">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-xs">✓</span>
                            <span>Correct! Excellent job.</span>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-rose-800 bg-rose-50 border-rose-200 w-full p-2.5 rounded-xl">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white font-black text-xs">✕</span>
                              <span>Incorrect.</span>
                            </div>
                            {expected && (
                              <span className="text-slate-700">
                                Correct answer: <strong className="text-emerald-700 font-extrabold">{expected}</strong>
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ) : currentQ.type === 'matching' ? (
              <div className="flex flex-col gap-4 animate-fadeIn">
                {/* 2-Column Matching Play Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                  {/* Left Column: Column A (Questions & Target Slots) */}
                  <div className="lg:col-span-7 flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 px-2.5 items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-blue-600 text-white text-xs font-black shadow-xs">
                          Column A
                        </span>
                        <h3 className="font-heading text-sm font-extrabold text-slate-800 tracking-tight">
                          Items & Premises
                        </h3>
                      </div>
                      <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-0.5 text-xs font-bold text-indigo-700">
                        {Object.keys(currentMatches).length} of {displayPairs.length} matched
                      </span>
                    </div>

                    <div className="space-y-3">
                      {displayPairs.map((pair, pIdx) => {
                        const matchedAnswer = currentMatches[pair.item];
                        const isSlotHovered = activeDropTarget === pair.item;
                        const isCorrect = answeredLocked && matchedAnswer === pair.match;
                        const isIncorrect = answeredLocked && matchedAnswer && matchedAnswer !== pair.match;
                        const isUnanswered = answeredLocked && !matchedAnswer;

                        // Vibrant color assignments per row
                        const ROW_THEMES = [
                          {
                            badge: 'bg-[#F58220] text-white shadow-xs',
                            cardBorder: 'border-orange-200/90 hover:border-orange-300 bg-orange-50/20',
                            itemText: 'text-slate-900',
                            slotDefault: 'border-orange-300/80 bg-orange-50/40 text-orange-900',
                            placedCard: 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-sm border-orange-600',
                          },
                          {
                            badge: 'bg-[#1368CE] text-white shadow-xs',
                            cardBorder: 'border-blue-200/90 hover:border-blue-300 bg-blue-50/20',
                            itemText: 'text-slate-900',
                            slotDefault: 'border-blue-300/80 bg-blue-50/40 text-blue-900',
                            placedCard: 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm border-blue-700',
                          },
                          {
                            badge: 'bg-[#26890C] text-white shadow-xs',
                            cardBorder: 'border-emerald-200/90 hover:border-emerald-300 bg-emerald-50/20',
                            itemText: 'text-slate-900',
                            slotDefault: 'border-emerald-300/80 bg-emerald-50/40 text-emerald-900',
                            placedCard: 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-sm border-emerald-700',
                          },
                          {
                            badge: 'bg-[#E21B3C] text-white shadow-xs',
                            cardBorder: 'border-rose-200/90 hover:border-rose-300 bg-rose-50/20',
                            itemText: 'text-slate-900',
                            slotDefault: 'border-rose-300/80 bg-rose-50/40 text-rose-900',
                            placedCard: 'bg-linear-to-r from-rose-500 to-pink-600 text-white shadow-sm border-rose-600',
                          },
                          {
                            badge: 'bg-[#7C3AED] text-white shadow-xs',
                            cardBorder: 'border-purple-200/90 hover:border-purple-300 bg-purple-50/20',
                            itemText: 'text-slate-900',
                            slotDefault: 'border-purple-300/80 bg-purple-50/40 text-purple-900',
                            placedCard: 'bg-linear-to-r from-purple-600 to-violet-600 text-white shadow-sm border-purple-700',
                          },
                        ];

                        const theme = ROW_THEMES[pIdx % ROW_THEMES.length];

                        let slotStyle = `${theme.slotDefault} hover:border-indigo-400 hover:bg-indigo-50/50`;
                        if (isSlotHovered) {
                          slotStyle = 'border-indigo-600 bg-indigo-100 ring-4 ring-indigo-200 scale-[1.01] text-indigo-950 font-black';
                        } else if (selectedBankCard && !matchedAnswer) {
                          slotStyle = 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-300 animate-pulse';
                        } else if (matchedAnswer && !answeredLocked) {
                          slotStyle = 'border-transparent p-0 bg-transparent';
                        } else if (isCorrect) {
                          slotStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-300 shadow-sm';
                        } else if (isIncorrect || isUnanswered) {
                          slotStyle = 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-300 shadow-sm';
                        }

                        return (
                          <div
                            key={pair.id || pIdx}
                            className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl border-2 p-3 sm:p-4 shadow-xs transition-all ${answeredLocked
                                ? isCorrect
                                  ? 'border-emerald-300 bg-emerald-50/30'
                                  : 'border-rose-300 bg-rose-50/30'
                                : theme.cardBorder
                              }`}
                          >
                            {/* Premise / Item (Column A) */}
                            <div className="flex items-center gap-3 sm:w-5/12 min-w-0">
                              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-heading text-xs font-black ${theme.badge}`}>
                                {pIdx + 1}
                              </span>
                              <span className={`font-heading text-sm sm:text-base font-bold ${theme.itemText} leading-snug`}>
                                {pair.item}
                              </span>
                            </div>

                            {/* Arrow Indicator */}
                            <div className="hidden sm:flex items-center text-slate-300">
                              <i className="ri-arrow-right-line text-lg text-slate-400" />
                            </div>

                            {/* Target Drop Slot (Column B Target) */}
                            <div
                              onDragOver={(e) => handleDragOverSlot(e, pair.item)}
                              onDragLeave={() => handleDragLeaveSlot(pair.item)}
                              onDrop={(e) => handleDropOnSlot(e, pair.item)}
                              onClick={() => handleSlotClick(pair.item)}
                              className={`relative flex min-h-[58px] sm:w-6/12 items-center justify-between rounded-[22px] border-2 border-dashed px-3 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${slotStyle}`}
                            >
                              {matchedAnswer ? (
                                (() => {
                                  const placedThemeIdx = allBankOptions.indexOf(matchedAnswer) >= 0 ? allBankOptions.indexOf(matchedAnswer) : pIdx;
                                  const PLACED_PALETTES = [
                                    { bg: '#F56500', shadow: '0 5px 0 0 #B84300' },
                                    { bg: '#1877F2', shadow: '0 5px 0 0 #0D489E' },
                                    { bg: '#16A34A', shadow: '0 5px 0 0 #146324' },
                                    { bg: '#DC2626', shadow: '0 5px 0 0 #8E131E' },
                                    { bg: '#7C3AED', shadow: '0 5px 0 0 #5B21B6' },
                                  ];
                                  const palette = PLACED_PALETTES[placedThemeIdx % PLACED_PALETTES.length];

                                  return (
                                    <div
                                      draggable={!answeredLocked}
                                      onDragStart={(e) => handleDragStartFromSlot(e, matchedAnswer, pair.item)}
                                      style={{
                                        backgroundColor: answeredLocked
                                          ? isCorrect
                                            ? '#15803D'
                                            : '#B91C1C'
                                          : palette.bg,
                                        boxShadow: answeredLocked
                                          ? isCorrect
                                            ? '0 5px 0 0 #0D5226'
                                            : '0 5px 0 0 #741010'
                                          : palette.shadow,
                                      }}
                                      className="flex w-full items-center justify-between gap-2.5 rounded-[18px] p-3 text-white transition-all select-none opacity-100 hover:scale-[1.01] cursor-grab active:cursor-grabbing"
                                    >
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-black/25 text-white">
                                        <i className="ri-draggable text-sm" />
                                      </div>
                                      <span className="font-heading font-black text-white text-xs sm:text-sm leading-snug flex-1 text-left drop-shadow-sm">
                                        {matchedAnswer}
                                      </span>
                                      {!answeredLocked && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveSlotMatch(pair.item);
                                          }}
                                          title="Remove answer"
                                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/25 hover:bg-black/40 text-white transition cursor-pointer"
                                        >
                                          ✕
                                        </button>
                                      )}
                                      {answeredLocked && (
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-emerald-800 font-black text-xs shadow-xs">
                                          {isCorrect ? '✓' : '✕'}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : (
                                <div className="flex items-center gap-2 text-slate-500 px-2 py-1.5">
                                  <i className="ri-inbox-unarchive-line text-base text-indigo-500" />
                                  <span className="text-xs font-semibold">
                                    {selectedBankCard ? 'Click to place selected answer' : 'Drop answer here or tap to match'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Show Correct Answer Helper if incorrect during review */}
                            {isIncorrect && (
                              <div className="w-full text-left sm:hidden text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-300">
                                ✓ Correct match: {pair.match}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Column B (Available Answer Bank) */}
                  <div className="lg:col-span-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 px-2.5 items-center justify-center rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-xs">
                          Column B
                        </span>
                        <h3 className="font-heading text-sm font-extrabold text-slate-800 tracking-tight">
                          Answer Pool
                        </h3>
                      </div>
                      {!answeredLocked && Object.keys(currentMatches).length > 0 && (
                        <button
                          type="button"
                          onClick={handleResetAllMatches}
                          className="text-xs font-bold text-slate-500 hover:text-rose-600 underline cursor-pointer"
                        >
                          Reset All
                        </button>
                      )}
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedFromSlot) {
                          handleRemoveSlotMatch(draggedFromSlot);
                        }
                      }}
                      className="space-y-3"
                    >
                      {availableBankOptions.map((ansText, aIdx) => {
                        const isSelected = selectedBankCard === ansText;

                        // Guaranteed solid 3D vibrant color schemes
                        const SOLID_BANK_PALETTES = [
                          { bg: '#F56500', shadow: '0 6px 0 0 #B84300' },
                          { bg: '#1877F2', shadow: '0 6px 0 0 #0D489E' },
                          { bg: '#16A34A', shadow: '0 6px 0 0 #146324' },
                          { bg: '#DC2626', shadow: '0 6px 0 0 #8E131E' },
                          { bg: '#7C3AED', shadow: '0 6px 0 0 #5B21B6' },
                        ];

                        const themeIdx = allBankOptions.indexOf(ansText) >= 0 ? allBankOptions.indexOf(ansText) : aIdx;
                        const palette = SOLID_BANK_PALETTES[themeIdx % SOLID_BANK_PALETTES.length];

                        return (
                          <div
                            key={aIdx}
                            draggable={!answeredLocked}
                            onDragStart={(e) => handleDragStartFromBank(e, ansText)}
                            onClick={() => handleBankCardClick(ansText)}
                            style={{
                              backgroundColor: palette.bg,
                              boxShadow: palette.shadow,
                            }}
                            className={`relative flex items-center justify-between gap-3 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 font-heading font-black text-white transition-all select-none opacity-100 ${isSelected
                                ? 'ring-4 ring-indigo-400 scale-[1.02] brightness-110'
                                : 'hover:scale-[1.01]'
                              } cursor-grab active:cursor-grabbing active:translate-y-[2px]`}
                          >
                            {/* Left: Grip Squircle Container */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-black/25 text-white text-base shadow-inner">
                              <i className="ri-draggable" />
                            </div>

                            {/* Center: Choice Text */}
                            <span className="font-heading text-sm sm:text-base font-black leading-snug flex-1 text-left drop-shadow-sm">
                              {ansText}
                            </span>

                            {/* Right: Drag or Selected Pill */}
                            {isSelected ? (
                              <span className="rounded-xl bg-white text-indigo-900 px-3 py-1 text-xs font-black uppercase shadow-xs">
                                Selected
                              </span>
                            ) : (
                              <div className="flex h-8 px-2.5 shrink-0 items-center justify-center rounded-[10px] bg-black/25 text-white/95 text-xs font-black shadow-inner">
                                Drag ↕
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Matching Confirm Button (Before Answering) */}
                {!answeredLocked && (
                  <div className="mt-2 flex items-center justify-end">
                    <button
                      type="button"
                      disabled={Object.keys(currentMatches).length === 0}
                      onClick={handleConfirmMatchingAnswer}
                      className="w-full sm:w-auto rounded-2xl border-b-4 border-[#312E81] bg-linear-to-r from-[#4338CA] via-[#4F46E5] to-[#6366F1] hover:from-[#3730A3] hover:to-[#4338CA] px-8 py-3.5 font-heading text-base font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <i className="ri-checkbox-circle-fill mr-2 text-emerald-300" />
                      Confirm Matches ({Object.keys(currentMatches).length}/{displayPairs.length})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* 3D Choice Grid (2 choices for True/False side-by-side, 4 choices for Multiple Choice) */
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full ${displayOptions.length === 2 ? 'max-w-5xl mx-auto' : ''
                  }`}
              >
                {displayOptions.map((opt, optIndex) => {
                  const shapeMeta = SHAPES[optIndex % SHAPES.length];
                  const isSelected = selectedAnswers[currentQ.id] === opt.id;
                  const isOptionCorrect = Boolean(opt.correct);

                  let tileClass = `${shapeMeta.bg} ${shapeMeta.baseShadow} ${shapeMeta.hover} ${shapeMeta.activeShadow}`;
                  let statusBadge = null;

                  if (answeredLocked) {
                    if (isOptionCorrect) {
                      tileClass = 'bg-[#15803D] shadow-[0_6px_0_0_#0D5226] ring-4 ring-emerald-400 scale-[1.01]';
                      statusBadge = (
                        <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-emerald-700 text-base sm:text-lg font-black shadow-md">
                          ✓
                        </span>
                      );
                    } else if (isSelected && !isOptionCorrect) {
                      tileClass = 'bg-[#B91C1C] shadow-[0_6px_0_0_#741010] ring-4 ring-rose-400';
                      statusBadge = (
                        <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-rose-700 text-base sm:text-lg font-black shadow-md">
                          ✕
                        </span>
                      );
                    } else {
                      tileClass = 'bg-slate-300 shadow-[0_5px_0_0_#94A3B8] opacity-35 cursor-not-allowed';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={answeredLocked}
                      onClick={() => handleSelectAnswer(opt.id)}
                      className={`relative flex w-full ${displayOptions.length === 2
                          ? 'min-h-[85px] sm:min-h-[105px] md:min-h-[120px]'
                          : 'min-h-[90px] sm:min-h-[110px] md:min-h-[125px]'
                        } items-center justify-between rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 transition-all duration-150 text-white ${tileClass} ${!answeredLocked ? 'cursor-pointer active:translate-y-[4px]' : ''
                        }`}
                    >
                      {/* Left: Dark Translucent Squircle Container */}
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-[14px] sm:rounded-[16px] bg-black/25 text-white text-lg sm:text-xl font-black shadow-inner">
                        {shapeMeta.shape}
                      </div>

                      {/* Center: Large Left-Aligned Choice Text */}
                      <span className="font-heading text-base sm:text-lg md:text-xl font-black text-white leading-snug px-3 sm:px-5 flex-1 text-left drop-shadow-xs break-words">
                        {opt.text}
                      </span>

                      {/* Right: Key Squircle Indicator (or Status Checkmark when answered) */}
                      {statusBadge ? (
                        statusBadge
                      ) : (
                        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-[12px] bg-black/25 text-white/95 text-xs sm:text-sm font-black shadow-inner">
                          {shapeMeta.key}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Universal Next Question Centered Button */}
            {answeredLocked && (
              <div className="mt-6 flex items-center justify-center animate-fadeInUp">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto rounded-2xl border-b-4 border-[#312E81] bg-[#4338CA] hover:bg-[#3730A3] px-10 py-3.5 font-heading text-base font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {currentIndex < questions.length - 1 ? 'Next question →' : 'View Results 🏆'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULTS SCREEN */}
        {gameState === 'results' && (
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl animate-fadeInUp my-4 text-slate-900">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-3xl text-white shadow-lg">
                🎉
              </div>
              <h2 className="font-heading text-3xl font-black text-slate-900">
                Homework Complete!
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                You have completed all questions for <strong>{title}</strong>.
              </p>

              {/* Score Big Display */}
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Total Score</p>
                  <p className="mt-1 font-heading text-3xl sm:text-4xl font-black text-emerald-600">
                    {currentScore} <span className="text-lg text-slate-400">/ {totalPointsParam}</span>
                  </p>
                </div>
                <div className="border-l border-slate-200">
                  <p className="text-xs font-bold uppercase text-slate-500">Correct Answers</p>
                  <p className="mt-1 font-heading text-3xl sm:text-4xl font-black text-slate-900">
                    {correctCount} <span className="text-lg text-slate-400">/ {questions.length}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Review List */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Question Review & Solutions
                </h3>
                {selectedLanguage !== 'original' && (
                  <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    🌐 Translated: {SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage)?.short || selectedLanguage}
                  </span>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto space-y-2.5 pr-2">
                {questions.map((q, idx) => {
                  const qTrans = translationsCache[q.id]?.[selectedLanguage];
                  const qPrompt = qTrans?.prompt || q.prompt;
                  const qExp = qTrans?.explanation || q.explanation;

                  if (q.type === 'matching') {
                    const studentMatches: Record<string, string> =
                      selectedAnswers[q.id] || matchingAnswers[q.id] || {};
                    const pairs = (q.pairs || []).map((p, pIdx) => {
                      if (!qTrans?.pairs?.[pIdx]) return p;
                      return {
                        id: p.id,
                        item: qTrans.pairs[pIdx].item || p.item,
                        match: qTrans.pairs[pIdx].match || p.match,
                      };
                    });

                    const allCorrect =
                      pairs.length > 0 &&
                      pairs.every((p) => studentMatches[p.item] === p.match);

                    return (
                      <div
                        key={q.id || idx}
                        className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-800">
                            Q{idx + 1} (Matching): {qPrompt}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${allCorrect
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                          >
                            {allCorrect ? '✓ All Correct' : 'Pairs Review'}
                          </span>
                        </div>

                        {/* Matching pairs review */}
                        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2">
                          {pairs.map((p, pIdx) => {
                            const given = studentMatches[p.item];
                            const isPairRight = given === p.match;
                            return (
                              <div
                                key={p.id || pIdx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg bg-slate-50 p-2 text-slate-700"
                              >
                                <span className="font-bold text-slate-900">
                                  {p.item} →
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`font-semibold ${isPairRight ? 'text-emerald-700' : 'text-rose-700'
                                      }`}
                                  >
                                    {given || 'No match'}
                                  </span>
                                  {!isPairRight && (
                                    <span className="text-[11px] text-slate-500">
                                      (Expected: <strong className="text-emerald-700">{p.match}</strong>)
                                    </span>
                                  )}
                                  <span className="text-xs font-black">
                                    {isPairRight ? '✓' : '✕'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {qExp && (
                          <p className="text-[11px] text-slate-500 italic mt-2">
                            Note: {qExp}
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (q.type === 'identification') {
                    const studentAns = String(selectedAnswers[q.id] || 'No answer');
                    const expectedAns = (qTrans?.expectedAnswer || q.expectedAnswer || '').trim();
                    const cleanStr = (s: string) =>
                      s
                        .toLowerCase()
                        .replace(/^(ang|ang mga|the|a|an)\s+/i, '')
                        .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
                        .trim();
                    const isRight =
                      Boolean(selectedAnswers[q.id]) &&
                      (cleanStr(studentAns) === cleanStr(expectedAns) ||
                        studentAns.toLowerCase().trim() === expectedAns.toLowerCase() ||
                        (expectedAns.length > 0 && cleanStr(studentAns).includes(cleanStr(expectedAns))) ||
                        (expectedAns.length > 0 && cleanStr(expectedAns).includes(cleanStr(studentAns))));

                    return (
                      <div
                        key={q.id || idx}
                        className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-800">
                            Q{idx + 1} (Identification): {qPrompt}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${isRight
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-100 text-rose-700 border border-rose-200'
                              }`}
                          >
                            {isRight ? '✓ Correct' : '✕ Incorrect'}
                          </span>
                        </div>
                        <div className="mt-2 text-slate-600 space-y-0.5">
                          <p>
                            Your answer: <strong className={isRight ? 'text-emerald-700' : 'text-rose-700'}>{studentAns}</strong>
                          </p>
                          {!isRight && expectedAns && (
                            <p>
                              Correct answer: <strong className="text-emerald-700">{expectedAns}</strong>
                            </p>
                          )}
                          {qExp && (
                            <p className="text-[11px] text-slate-500 italic mt-1">
                              Note: {qExp}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const studentAnsId = selectedAnswers[q.id];
                  const correctOption = q.options.find((o) => o.correct);
                  const isRight = studentAnsId && correctOption && studentAnsId === correctOption.id;
                  const chosenOption = q.options.find((o) => o.id === studentAnsId);

                  const chosenText =
                    qTrans?.options?.find((to) => to.id === studentAnsId)?.text || chosenOption?.text || 'No answer';
                  const correctText =
                    qTrans?.options?.find((to) => to.id === correctOption?.id)?.text || correctOption?.text || '';

                  return (
                    <div
                      key={q.id || idx}
                      className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800">
                          Q{idx + 1}: {qPrompt}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${isRight ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                        >
                          {isRight ? '✓ Correct' : '✕ Incorrect'}
                        </span>
                      </div>
                      <div className="mt-2 text-slate-600 space-y-0.5">
                        <p>
                          Your answer: <strong className={isRight ? 'text-emerald-700' : 'text-rose-700'}>{chosenText}</strong>
                        </p>
                        {!isRight && correctOption && (
                          <p>
                            Correct answer: <strong className="text-emerald-700">{correctText}</strong>
                          </p>
                        )}
                        {qExp && (
                          <p className="text-[11px] text-slate-500 italic mt-1">
                            Note: {qExp}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Homework CTA */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Ready to save your grade to your student record?
              </span>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitHomework}
                className="w-full sm:w-auto rounded-2xl border-b-4 border-[#15803D] bg-[#16A34A] px-8 py-3.5 font-heading text-base font-black text-white shadow-lg transition-all hover:bg-[#15803D] hover:translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit homework ✓'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 100% Solid Custom Drag Card (matches 2nd image perfectly without browser wash-out) */}
      {draggedCard && dragPos && (
        <div
          style={{
            position: 'fixed',
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`,
            transform: 'translate(-50%, -50%) rotate(1deg) scale(1.02)',
            pointerEvents: 'none',
            zIndex: 999999,
            width: 'max-content',
            maxWidth: '520px',
          }}
          className="shadow-2xl"
        >
          {(() => {
            const themeIdx = allBankOptions.indexOf(draggedCard) >= 0 ? allBankOptions.indexOf(draggedCard) : 0;
            const palette = MATCH_COLORS[themeIdx % MATCH_COLORS.length];

            return (
              <div
                style={{
                  backgroundColor: palette.bg,
                  boxShadow: palette.shadow,
                }}
                className="flex items-center justify-between gap-3.5 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 font-heading font-black text-white select-none opacity-100 ring-2 ring-white/60"
              >
                {/* Left: Grip Squircle */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-black/25 text-white text-base shadow-inner">
                  <i className="ri-draggable" />
                </div>

                {/* Center: Choice Text */}
                <span className="font-heading text-sm sm:text-base font-black leading-snug flex-1 text-left drop-shadow-sm text-white px-2">
                  {draggedCard}
                </span>

                {/* Right: Drag Pill */}
                <div className="flex h-8 px-2.5 shrink-0 items-center justify-center rounded-[10px] bg-black/25 text-white/95 text-xs font-black shadow-inner">
                  Drag ↕
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default function StudentAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
          <p className="font-heading text-lg font-bold text-slate-800">Loading player...</p>
        </div>
      }
    >
      <StudentAssessmentPlayer />
    </Suspense>
  );
}
