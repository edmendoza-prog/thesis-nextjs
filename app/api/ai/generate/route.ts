import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export type QuestionType = 'Identification' | 'True or False' | 'Multiple Choice' | 'Matching Type';

export type CriteriaRow = {
  id: number;
  name: string;
  questionType: QuestionType;
  questionCount: number;
  weight: number;
};

type QuestionTranslationPayload = {
  prompt: string;
  type?: string;
  options?: { id: string; text: string; correct?: boolean }[];
  pairs?: { id: number | string; item: string; match: string }[];
  columnA?: string[];
  columnB?: string[];
  expectedAnswer?: string;
  explanation?: string;
};

type GenerateRequest = {
  action: 'translate' | 'translate-question' | 'generate-questions' | 'generate-game-questions';
  lessonText?: string;
  question?: QuestionTranslationPayload;
  targetLanguage?: string;
  criteria?: CriteriaRow[];
  questionCount?: number;
  assessmentCategory?: 'quiz' | 'test';
};

function getConfiguredApiKey(): string | null {
  const raw = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'your_openai_api_key_here') {
    return null;
  }
  return trimmed;
}

export async function GET() {
  const apiKey = getConfiguredApiKey();

  return NextResponse.json({
    configured: true,
    hasOpenAiKey: Boolean(apiKey),
    model: 'gpt-4o-mini',
  });
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getConfiguredApiKey();
    const body: GenerateRequest = await request.json();
    const { action, lessonText, question, targetLanguage, criteria, assessmentCategory, questionCount } = body;

    if (action === 'translate') {
      if (!lessonText || !lessonText.trim()) {
        return NextResponse.json({ error: 'Lesson text is required' }, { status: 400 });
      }
      return await handleTranslation(apiKey, lessonText);
    } else if (action === 'translate-question') {
      if (!question || !question.prompt) {
        return NextResponse.json({ error: 'Question data is required' }, { status: 400 });
      }
      return await handleQuestionTranslation(apiKey, question, targetLanguage || 'Filipino (Tagalog)');
    } else if (action === 'generate-questions') {
      if (!lessonText || !lessonText.trim()) {
        return NextResponse.json({ error: 'Lesson text is required' }, { status: 400 });
      }
      if (!Array.isArray(criteria) || criteria.length === 0) {
        return NextResponse.json({ error: 'At least one question criterion is required' }, { status: 400 });
      }

      const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);
      if (Math.round(totalWeight) !== 100) {
        return NextResponse.json({ error: 'Criteria weights must total exactly 100%' }, { status: 400 });
      }

      return await handleQuestionGeneration(apiKey, lessonText, criteria, assessmentCategory ?? 'quiz');
    } else if (action === 'generate-game-questions') {
      if (!lessonText || !lessonText.trim()) {
        return NextResponse.json({ error: 'Document or lesson text is required' }, { status: 400 });
      }
      return await handleGameQuestionGeneration(apiKey, lessonText, questionCount || 8);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getModelCandidates(): string[] {
  const envModel = (process.env.OPENAI_MODEL || '').trim();
  const validEnvModel =
    envModel && !envModel.includes('luna') && !envModel.includes('your_')
      ? envModel
      : null;

  const candidates = [validEnvModel, 'gpt-4o-mini', 'gpt-4.1-mini']
    .filter((model): model is string => Boolean(model && model.trim()));

  return [...new Set(candidates)];
}

function extractJsonPayload(content: string): any {
  if (!content) return null;
  const text = content.trim();

  // 1. Try direct parse
  try {
    return JSON.parse(text);
  } catch {}

  // 2. Try markdown code block extraction (handles surrounding prose / thoughts)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // 3. Try finding outermost JSON array [ ... ]
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket && (firstBrace === -1 || firstBracket < firstBrace)) {
    try {
      return JSON.parse(text.slice(firstBracket, lastBracket + 1));
    } catch {}
  }

  // 4. Try finding outermost JSON object { ... }
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {}
  }

  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(text.slice(firstBracket, lastBracket + 1));
    } catch {}
  }

  return null;
}

async function fetchChatCompletion(
  apiKey: string,
  modelCandidates: string[],
  messages: any[],
  systemPrompt?: string,
  timeoutMs: number = 22000
) {
  const candidates = [...new Set(modelCandidates.filter((model) => Boolean(model && model.trim())))];
  let lastError: any = null;

  for (const model of candidates) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          temperature: 0.4,
          messages: systemPrompt
            ? [
                { role: 'system', content: systemPrompt },
                ...messages,
              ]
            : messages,
        }),
      });

      clearTimeout(timer);

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        lastError = payload?.error?.message || `OpenAI model ${model} request failed (${response.status})`;
        if (response.status !== 404 && response.status !== 400) {
          throw new Error(lastError);
        }
        continue;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timer);
      lastError = error instanceof Error ? error.message : 'Unknown OpenAI error';
      if (candidates.length === 1) {
        throw error;
      }
    }
  }

  throw new Error(lastError || 'OpenAI request failed');
}

async function handleTranslation(apiKey: string | null, lessonText: string) {
  if (apiKey) {
    try {
      const modelCandidates = getModelCandidates();
      const data = await fetchChatCompletion(
        apiKey,
        modelCandidates,
        [
          {
            role: 'user',
            content: `Translate the following lesson text into natural, student-friendly Filipino (Tagalog) suitable for elementary and high school students:\n\n${lessonText.slice(0, 6000)}`,
          },
        ],
        'You are a helpful bilingual teacher assistant that translates educational content into clear, natural Filipino (Tagalog) while keeping key academic terms understandable.',
        20000
      );

      const translatedText = data.choices[0]?.message?.content || '';
      if (translatedText.trim()) {
        return NextResponse.json({ translatedText: translatedText.trim() });
      }
    } catch (err) {
      console.warn('OpenAI lesson translation fallback:', err);
    }
  }

  return NextResponse.json({
    translatedText: `[Salin sa Filipino]\n${lessonText}`,
  });
}

async function handleQuestionTranslation(
  apiKey: string | null,
  question: QuestionTranslationPayload,
  targetLanguage: string = 'Filipino (Tagalog)'
) {
  if (apiKey) {
    try {
      const modelCandidates = getModelCandidates();
      const systemPrompt = `You are an expert bilingual elementary school teacher. Accurately translate this academic quiz question, its multiple-choice options or matching pairs/items, and explanation into natural, student-friendly ${targetLanguage}. Maintain clarity and preserve correct meaning. Return ONLY a valid JSON object matching this exact schema without any markdown wrapping or text:
{
  "prompt": "Translated question prompt",
  "options": [
    { "id": "A", "text": "Translated option text" }
  ],
  "pairs": [
    { "id": 1, "item": "Translated Column A item", "match": "Translated Column B match" }
  ],
  "columnA": ["Translated Column A item 1", "..."],
  "columnB": ["Translated Column B item 1", "..."],
  "expectedAnswer": "Translated expected answer if present",
  "explanation": "Translated explanation if present"
}`;

      const userContent = `Translate this question to ${targetLanguage}:\n${JSON.stringify(question, null, 2)}`;

      const data = await fetchChatCompletion(
        apiKey,
        modelCandidates,
        [{ role: 'user', content: userContent }],
        systemPrompt,
        15000
      );

      const rawContent = data.choices[0]?.message?.content || '{}';
      const parsed = extractJsonPayload(rawContent);
      const payload = (parsed && typeof parsed === 'object' && (parsed.translatedQuestion || parsed.question || parsed)) || null;

      if (payload && payload.prompt && typeof payload.prompt === 'string') {
        return NextResponse.json({
          translatedQuestion: {
            prompt: payload.prompt.trim(),
            options: Array.isArray(payload.options) && payload.options.length > 0
              ? payload.options
              : question.options,
            pairs: Array.isArray(payload.pairs) && payload.pairs.length > 0
              ? payload.pairs
              : question.pairs,
            columnA: Array.isArray(payload.columnA) && payload.columnA.length > 0
              ? payload.columnA
              : question.columnA,
            columnB: Array.isArray(payload.columnB) && payload.columnB.length > 0
              ? payload.columnB
              : question.columnB,
            expectedAnswer: payload.expectedAnswer || question.expectedAnswer,
            explanation: payload.explanation || question.explanation,
          },
        });
      }
    } catch (err) {
      console.warn('Question translation fallback:', err);
    }
  }

  return NextResponse.json({
    translatedQuestion: {
      prompt: question.prompt,
      options: question.options,
      pairs: question.pairs,
      columnA: question.columnA,
      columnB: question.columnB,
      expectedAnswer: question.expectedAnswer,
      explanation: question.explanation,
    },
  });
}

/**
 * Extracts clean sentences and key terms from lesson text for fallback generation.
 */
function parseLessonFacts(rawText: string) {
  const cleaned = rawText
    .replace(/===\s*Slide\s*\d+\s*===/gi, '. ')
    .replace(/---\s*Page\s*\d+\s*---/gi, '. ')
    .replace(/\[Slide\s*\d+\s*Speaker Notes\]:/gi, '. ')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const rawSentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 20 && s.length <= 260 && /[a-zA-Z]{3,}/.test(s));

  const sentences = rawSentences.length > 0
    ? rawSentences
    : [
        `The primary topic of this lesson is ${cleaned.slice(0, 80) || 'key academic concepts'}.`,
        'Understanding the core vocabulary and principles helps students apply what they learn in class.',
        'Careful reading and analysis of the lesson material builds strong comprehension skills.',
        'Key terms in this study unit connect foundational concepts to real-world examples.',
      ];

  // Extract candidate key terms (capitalized words or important nouns >= 4 chars)
  const stopWords = new Set([
    'this', 'that', 'these', 'those', 'with', 'from', 'into', 'during', 'including',
    'until', 'against', 'among', 'throughout', 'despite', 'towards', 'upon', 'concerning',
    'what', 'which', 'where', 'when', 'while', 'about', 'above', 'below', 'between',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'all', 'any', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'than',
    'too', 'very', 'can', 'will', 'just', 'should', 'now', 'also', 'they', 'their', 'them',
    'have', 'has', 'had', 'been', 'were', 'being', 'does', 'did', 'doing', 'would', 'could',
    'lesson', 'slide', 'page', 'chapter', 'topic', 'section', 'students', 'study',
  ]);

  const wordFreq = new Map<string, string>();
  const words = cleaned.match(/\b[A-Za-z][A-Za-z-]{3,22}\b/g) || [];
  for (const w of words) {
    const lower = w.toLowerCase();
    if (!stopWords.has(lower) && !wordFreq.has(lower)) {
      wordFreq.set(lower, w.charAt(0).toUpperCase() + w.slice(1));
    }
  }

  const keyTerms = Array.from(wordFreq.values());
  const fallbackTerms = ['Comprehension', 'Main Idea', 'Context Clues', 'Key Concept', 'Analysis', 'Conclusion', 'Structure', 'Evidence'];
  for (const ft of fallbackTerms) {
    if (keyTerms.length < 12 && !keyTerms.includes(ft)) {
      keyTerms.push(ft);
    }
  }

  return { sentences, keyTerms, cleaned };
}

/**
 * Generates structured questions for a single criterion from lesson text without external API dependency.
 */
function generateFallbackCriterionQuestions(
  lessonText: string,
  criterion: CriteriaRow
) {
  const { sentences, keyTerms } = parseLessonFacts(lessonText);
  const count = Math.max(1, Math.min(50, Number(criterion.questionCount || 5)));
  const qType = criterion.questionType;
  const questions: any[] = [];

  for (let i = 0; i < count; i++) {
    const sentence = sentences[i % sentences.length];
    const primaryTerm = keyTerms[i % keyTerms.length] || `Concept ${i + 1}`;

    if (qType === 'Identification') {
      // Mask the term in the sentence if present, otherwise ask for the key concept
      const regex = new RegExp(`\\b${primaryTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const maskedPrompt = regex.test(sentence)
        ? `Identify the missing key term from the lesson: "${sentence.replace(regex, '__________')}"`
        : `Based on the lesson (${criterion.name}), what key term is described by: "${sentence}"?`;

      questions.push({
        type: 'identification',
        prompt: maskedPrompt,
        expectedAnswer: primaryTerm,
        explanation: `According to the lesson material: ${sentence}`,
      });
    } else if (qType === 'True or False') {
      const isTrue = i % 2 === 0;
      let statement = sentence;
      if (!isTrue) {
        const altTerm = keyTerms[(i + 3) % keyTerms.length] || 'an unrelated factor';
        const regex = new RegExp(`\\b${primaryTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(sentence) && altTerm.toLowerCase() !== primaryTerm.toLowerCase()) {
          statement = sentence.replace(regex, altTerm);
        } else if (/\bis\b/i.test(sentence)) {
          statement = sentence.replace(/\bis\b/i, 'is never');
        } else if (/\bare\b/i.test(sentence)) {
          statement = sentence.replace(/\bare\b/i, 'are never');
        } else {
          statement = `The lesson states that ${primaryTerm} has no relation to ${criterion.name.toLowerCase()}.`;
        }
      }

      questions.push({
        type: 'true_false',
        prompt: statement,
        options: [
          { id: 'T', text: 'True', correct: isTrue },
          { id: 'F', text: 'False', correct: !isTrue },
        ],
        explanation: isTrue
          ? `True. This statement directly reflects the lesson: "${sentence}"`
          : `False. The correct lesson statement is: "${sentence}"`,
      });
    } else if (qType === 'Matching Type') {
      const pairCount = 4;
      const pairs = [];
      for (let p = 0; p < pairCount; p++) {
        const term = keyTerms[(i * 2 + p) % keyTerms.length] || `Term ${p + 1}`;
        const sent = sentences[(i + p) % sentences.length] || `Key concept related to ${term}`;
        const shortMatch = sent.length > 90 ? `${sent.slice(0, 87).trim()}...` : sent;
        pairs.push({
          id: p + 1,
          item: term,
          match: shortMatch,
        });
      }
      const colA = pairs.map((p) => p.item);
      const colB = [...pairs.map((p) => p.match)].sort(() => 0.5 - Math.random());

      questions.push({
        type: 'matching',
        prompt: `Match each key term from "${criterion.name}" in Column A with its corresponding description from the lesson in Column B:`,
        pairs,
        columnA: colA,
        columnB: colB,
        explanation: 'Each term in Column A corresponds to its definition or context in the lesson material.',
      });
    } else {
      // Multiple Choice
      const regex = new RegExp(`\\b${primaryTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const distractors = keyTerms
        .filter((t) => t.toLowerCase() !== primaryTerm.toLowerCase())
        .slice(0, 10);

      const d1 = distractors[i % Math.max(1, distractors.length)] || 'Secondary factor';
      const d2 = distractors[(i + 1) % Math.max(1, distractors.length)] || 'Unrelated process';
      const d3 = distractors[(i + 2) % Math.max(1, distractors.length)] || 'External variable';

      const promptText = regex.test(sentence)
        ? `Which key term from the lesson best completes the following statement?\n"${sentence.replace(regex, '_____')}"`
        : `According to the lesson on ${criterion.name}, which concept is highlighted in the statement: "${sentence}"?`;

      const rawOptions = [
        { text: primaryTerm, correct: true },
        { text: d1, correct: false },
        { text: d2, correct: false },
        { text: d3, correct: false },
      ];

      // Shuffle options evenly
      for (let s = rawOptions.length - 1; s > 0; s--) {
        const j = (i + s * 3) % (s + 1);
        [rawOptions[s], rawOptions[j]] = [rawOptions[j], rawOptions[s]];
      }

      const letters = ['A', 'B', 'C', 'D'];
      questions.push({
        type: 'multiple_choice',
        prompt: promptText,
        options: rawOptions.map((opt, idx) => ({
          id: letters[idx],
          text: opt.text,
          correct: opt.correct,
        })),
        explanation: `Based on the lesson content: "${sentence}"`,
      });
    }
  }

  return {
    criteriaId: criterion.id,
    criteriaName: criterion.name,
    questionType: criterion.questionType,
    weight: criterion.weight,
    questions,
  };
}

function sanitizeGeneratedGroup(group: any, criterion: CriteriaRow) {
  const questions = Array.isArray(group?.questions) ? group.questions : [];
  const updatedQuestions = questions.map((q: any) => {
    const qType = String(q?.type || group?.questionType || criterion.questionType || '').toLowerCase();

    // 1. Multiple Choice
    if (qType.includes('multiple') || qType === 'multiple_choice' || (Array.isArray(q?.options) && q.options.length >= 3)) {
      let rawOptions = Array.isArray(q.options) ? [...q.options] : [];
      if (rawOptions.length > 0) {
        const hasCorrect = rawOptions.some((o: any) => o.correct === true || o.correct === 'true');
        if (!hasCorrect) {
          const randomIdx = Math.floor(Math.random() * rawOptions.length);
          rawOptions = rawOptions.map((o: any, idx: number) => ({
            ...o,
            correct: idx === randomIdx,
          }));
        } else {
          let foundFirst = false;
          rawOptions = rawOptions.map((o: any) => {
            const isCorr = (o.correct === true || o.correct === 'true') && !foundFirst;
            if (isCorr) foundFirst = true;
            return { ...o, correct: isCorr };
          });
        }

        // Fisher-Yates shuffle options
        for (let i = rawOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
        }

        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const shuffledOptions = rawOptions.map((opt: any, idx: number) => ({
          id: letters[idx] || String.fromCharCode(65 + idx),
          text: String(opt.text || opt.value || `Option ${idx + 1}`),
          correct: Boolean(opt.correct),
        }));

        return {
          ...q,
          type: 'multiple_choice',
          prompt: String(q.prompt || q.question || ''),
          options: shuffledOptions,
          explanation: String(q.explanation || ''),
        };
      }
    }

    // 2. True / False
    if (qType.includes('true') || qType === 'true_false' || qType === 'tf') {
      let isTrueCorrect = true;
      if (Array.isArray(q?.options) && q.options.length >= 2) {
        const opt0Correct = q.options[0]?.correct === true || q.options[0]?.correct === 'true';
        const opt1Correct = q.options[1]?.correct === true || q.options[1]?.correct === 'true';
        if (opt0Correct && !opt1Correct) isTrueCorrect = true;
        else if (opt1Correct && !opt0Correct) isTrueCorrect = false;
      } else if (q?.expectedAnswer !== undefined || q?.answer !== undefined) {
        const ans = String(q.expectedAnswer ?? q.answer ?? '').toLowerCase();
        if (/false|mali|f|no|2|b/i.test(ans)) isTrueCorrect = false;
      }

      return {
        ...q,
        type: 'true_false',
        prompt: String(q.prompt || q.question || ''),
        options: [
          { id: 'T', text: 'True', correct: isTrueCorrect },
          { id: 'F', text: 'False', correct: !isTrueCorrect },
        ],
        explanation: String(q.explanation || ''),
      };
    }

    // 3. Identification
    if (qType.includes('identification')) {
      const expected = String(q?.expectedAnswer ?? q?.answer ?? q?.correctAnswer ?? '').trim();
      return {
        ...q,
        type: 'identification',
        prompt: String(q.prompt || q.question || ''),
        expectedAnswer: expected,
        explanation: String(q.explanation || ''),
      };
    }

    // 4. Matching
    if (qType.includes('matching')) {
      const pairs = Array.isArray(q?.pairs)
        ? q.pairs.map((p: any, idx: number) => ({
            id: p?.id ?? idx + 1,
            item: String(p?.item ?? p?.prompt ?? `Item ${idx + 1}`),
            match: String(p?.match ?? p?.answer ?? `Match ${idx + 1}`),
          }))
        : [];
      const colA = pairs.map((p: any) => p.item || '');
      const colB = [...pairs.map((p: any) => p.match || '')].sort(() => 0.5 - Math.random());
      return {
        ...q,
        type: 'matching',
        prompt: String(q.prompt || q.question || 'Match the items in Column A with Column B:'),
        pairs,
        columnA: colA,
        columnB: colB,
        explanation: String(q.explanation || ''),
      };
    }

    return q;
  });

  return {
    criteriaId: criterion.id,
    criteriaName: criterion.name,
    questionType: criterion.questionType,
    weight: criterion.weight,
    questions: updatedQuestions,
  };
}

async function generateSingleCriterionWithAI(
  apiKey: string,
  lessonText: string,
  criterion: CriteriaRow,
  assessmentCategory: 'quiz' | 'test'
) {
  const assessmentName = assessmentCategory === 'test' ? 'test' : 'quiz';
  const count = Math.max(1, Number(criterion.questionCount || 5));

  let schemaInstruction = '';
  if (criterion.questionType === 'Identification') {
    schemaInstruction = `Each question object in "questions" MUST have:
{
  "type": "identification",
  "prompt": "Clear question asking the student to identify a specific term, name, or concept from the lesson",
  "expectedAnswer": "Exact term or short phrase",
  "explanation": "Brief 1-sentence explanation"
}`;
  } else if (criterion.questionType === 'True or False') {
    schemaInstruction = `Generate a balanced mix of True and False statements. Each question object in "questions" MUST have:
{
  "type": "true_false",
  "prompt": "Clear factual statement based on the lesson",
  "options": [
    { "id": "T", "text": "True", "correct": true },
    { "id": "F", "text": "False", "correct": false }
  ],
  "explanation": "Brief 1-sentence explanation"
}`;
  } else if (criterion.questionType === 'Matching Type') {
    schemaInstruction = `Each question object in "questions" MUST have 4 matching pairs:
{
  "type": "matching",
  "prompt": "Match the terms with their definitions",
  "pairs": [
    { "id": 1, "item": "Term 1", "match": "Definition 1" },
    { "id": 2, "item": "Term 2", "match": "Definition 2" },
    { "id": 3, "item": "Term 3", "match": "Definition 3" },
    { "id": 4, "item": "Term 4", "match": "Definition 4" }
  ],
  "columnA": ["Term 1", "Term 2", "Term 3", "Term 4"],
  "columnB": ["Definition 2", "Definition 4", "Definition 1", "Definition 3"],
  "explanation": "Brief 1-sentence explanation"
}`;
  } else {
    schemaInstruction = `Each question object in "questions" MUST have 4 choices (A, B, C, D) with exactly ONE correct answer:
{
  "type": "multiple_choice",
  "prompt": "Clear question based on the lesson",
  "options": [
    { "id": "A", "text": "Choice A", "correct": false },
    { "id": "B", "text": "Choice B", "correct": true },
    { "id": "C", "text": "Choice C", "correct": false },
    { "id": "D", "text": "Choice D", "correct": false }
  ],
  "explanation": "Brief 1-sentence explanation"
}`;
  }

  const prompt = `Based on the following lesson content, generate ${count} "${criterion.questionType}" questions for the ${assessmentName} section "${criterion.name}".

LESSON CONTENT:
${lessonText.slice(0, 6500)}

SCHEMA REQUIREMENT:
${schemaInstruction}

Return ONLY valid JSON in this exact format:
{
  "criteriaId": ${criterion.id},
  "criteriaName": ${JSON.stringify(criterion.name)},
  "questionType": ${JSON.stringify(criterion.questionType)},
  "weight": ${criterion.weight},
  "questions": [ ... ${count} items ... ]
}`;

  const data = await fetchChatCompletion(
    apiKey,
    getModelCandidates(),
    [{ role: 'user', content: prompt }],
    'You are an expert teacher and educational test creator. Always respond with valid JSON only.',
    22000
  );

  const content = data.choices[0]?.message?.content || '{}';
  const parsed = extractJsonPayload(content);
  if (!parsed) {
    throw new Error(`Failed to parse AI JSON for criterion ${criterion.name}`);
  }

  const groupObj = Array.isArray(parsed)
    ? (parsed[0]?.questions ? parsed[0] : { questions: parsed })
    : parsed;

  const sanitized = sanitizeGeneratedGroup(groupObj, criterion);
  if (!Array.isArray(sanitized.questions) || sanitized.questions.length === 0) {
    throw new Error(`No questions returned for criterion ${criterion.name}`);
  }

  return sanitized;
}

async function handleQuestionGeneration(
  apiKey: string | null,
  lessonText: string,
  criteria: CriteriaRow[],
  assessmentCategory: 'quiz' | 'test'
) {
  if (!apiKey) {
    const fallbackGroups = criteria.map((c) => generateFallbackCriterionQuestions(lessonText, c));
    return NextResponse.json({ generatedGroups: fallbackGroups, source: 'fallback' });
  }

  // Generate each criterion in parallel so multi-section quizzes complete in ~3-5 seconds instead of timing out
  const generatedGroups = await Promise.all(
    criteria.map(async (criterion) => {
      try {
        return await generateSingleCriterionWithAI(apiKey, lessonText, criterion, assessmentCategory);
      } catch (err) {
        console.warn(`Criterion "${criterion.name}" AI generation fell back to local lesson parser:`, err);
        return generateFallbackCriterionQuestions(lessonText, criterion);
      }
    })
  );

  return NextResponse.json({ generatedGroups });
}

async function handleGameQuestionGeneration(
  apiKey: string | null,
  lessonText: string,
  questionCount: number = 8
) {
  if (apiKey) {
    try {
      const prompt = `You are an expert elementary and high school teacher and interactive quiz game master.
Given the following lesson or document content, extract and generate ${questionCount} engaging, classroom-appropriate trivia/quiz questions and clear, concise answers for a fast-paced classroom game (e.g., Palosebo Greasy Pole Race or Tug-of-War).

LESSON / DOCUMENT CONTENT:
${lessonText.slice(0, 8000)}

REQUIREMENTS:
1. Each item must have:
   - "question": A clear, direct, and interesting question based on the provided material.
   - "answer": A concise, accurate, unambiguous answer (1 to 5 words).
2. The questions should test understanding of key concepts, definitions, names, historical events, facts, or numbers mentioned in the text.
3. Keep the tone engaging and appropriate for students.

CRITICAL: Return ONLY a valid JSON array of objects with the exact schema:
[
  {
    "question": "What is the largest organ of the human body?",
    "answer": "Skin"
  }
]`;

      const data = await fetchChatCompletion(
        apiKey,
        getModelCandidates(),
        [{ role: 'user', content: prompt }],
        'You are an expert teacher creating fun classroom quiz games. Always return valid JSON only.',
        20000
      );

      const content = data.choices[0]?.message?.content || '[]';
      const parsed = extractJsonPayload(content);

      if (parsed) {
        const questions: Array<{ question: string; answer: string }> = Array.isArray(parsed)
          ? parsed
          : (parsed.questions || []);
        if (questions.length > 0) {
          return NextResponse.json({ questions });
        }
      }
    } catch (err) {
      console.warn('Game question generation fallback:', err);
    }
  }

  // Fallback game questions from lessonText
  const { sentences, keyTerms } = parseLessonFacts(lessonText);
  const count = Math.max(1, Math.min(30, Number(questionCount || 8)));
  const fallbackQuestions = Array.from({ length: count }).map((_, idx) => {
    const sent = sentences[idx % sentences.length];
    const term = keyTerms[idx % keyTerms.length] || `Concept ${idx + 1}`;
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return {
      question: regex.test(sent)
        ? `Fill in the key term from the lesson: "${sent.replace(regex, '_____')}"`
        : `Which key term from the lesson relates to: "${sent}"?`,
      answer: term,
    };
  });

  return NextResponse.json({ questions: fallbackQuestions });
}
