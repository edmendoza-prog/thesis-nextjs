import { NextRequest, NextResponse } from 'next/server';

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

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const configured = Boolean(apiKey && apiKey !== 'your_openai_api_key_here' && apiKey.trim().length > 0);

  return NextResponse.json({
    configured,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  });
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return NextResponse.json(
        { error: 'API key not configured. Please add OPENAI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const body: GenerateRequest = await request.json();
    const { action, lessonText, question, targetLanguage, criteria, assessmentCategory, questionCount } = body;

    if (action === 'translate') {
      return await handleTranslation(apiKey, lessonText!);
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
      if (totalWeight !== 100) {
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
  const candidates = [process.env.OPENAI_MODEL, 'gpt-4o-mini', 'gpt-4.1-mini']
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

  // 3. Try finding outermost JSON object { ... }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {}
  }

  // 4. Try finding outermost JSON array [ ... ]
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(text.slice(firstBracket, lastBracket + 1));
    } catch {}
  }

  return null;
}

async function fetchChatCompletion(apiKey: string, modelCandidates: string[], messages: any[], systemPrompt?: string) {
  const candidates = [...new Set(modelCandidates.filter((model) => Boolean(model && model.trim())))];
  let lastError: any = null;

  for (const model of candidates) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: systemPrompt
            ? [
                { role: 'system', content: systemPrompt },
                ...messages,
              ]
            : messages,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        lastError = payload?.error?.message || `OpenAI model ${model} request failed`;
        if (response.status !== 404 && response.status !== 400) {
          throw new Error(lastError);
        }
        continue;
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown OpenAI error';
      if (candidates.length === 1) {
        throw error;
      }
    }
  }

  throw new Error(lastError || 'OpenAI request failed');
}

async function handleTranslation(apiKey: string, lessonText: string) {
  const modelCandidates = getModelCandidates();
  const data = await fetchChatCompletion(apiKey, modelCandidates, [
    {
      role: 'user',
      content: `Translate the following lesson text to simple English suitable for elementary school students:\n\n${lessonText}`,
    },
  ], 'You are a helpful assistant that translates educational content to simple, clear English suitable for elementary students. Maintain the educational value while making it accessible.');

  const translatedText = data.choices[0]?.message?.content || '';
  return NextResponse.json({ translatedText });
}

async function handleQuestionTranslation(
  apiKey: string,
  question: QuestionTranslationPayload,
  targetLanguage: string = 'Filipino (Tagalog)'
) {
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
    systemPrompt
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

  // Fallback: Return original question fields cleanly without leaking unparsed raw markdown/JSON
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

async function handleQuestionGeneration(
  apiKey: string,
  lessonText: string,
  criteria: CriteriaRow[],
  assessmentCategory: 'quiz' | 'test'
) {
  const totalQuestions = criteria.reduce((sum, c) => sum + Number(c.questionCount || 0), 0);
  const assessmentName = assessmentCategory === 'test' ? 'test' : 'quiz';

  const criteriaInstructions = criteria.map((c, idx) => {
    return `${idx + 1}. Criteria Name: "${c.name}" | Question Type: "${c.questionType}" | Number of Questions to generate: ${c.questionCount} | Weight: ${c.weight}%`;
  }).join('\n');

  const prompt = `You are an expert elementary school teacher and educational test creator.
Based on the following lesson content, generate a ${assessmentName} with structured questions matching each criterion exactly.

LESSON CONTENT:
${lessonText}

QUESTION CRITERIA AND DISTRIBUTION:
${criteriaInstructions}

TOTAL QUESTIONS TO GENERATE: ${totalQuestions}

RULES BY QUESTION TYPE:
1. "Identification":
   - Question asks the student to identify a specific word, term, concept, or name from the lesson.
   - Must include the "prompt", "expectedAnswer" (the specific term/answer), and an "explanation".
2. "True or False":
   - A clear statement directly related to the lesson.
   - Must include the "prompt", "options": [{"id": "T", "text": "True", "correct": boolean}, {"id": "F", "text": "False", "correct": boolean}], and an "explanation".
   - IMPORTANT: Generate a realistic, balanced mix of True and False statements (do NOT make every statement True).
3. "Multiple Choice":
   - A question with 4 clear choices (A, B, C, D) and exactly ONE correct answer.
   - Must include "prompt", "options": [{"id": "A", "text": "...", "correct": boolean}, {"id": "B", "text": "...", "correct": boolean}, {"id": "C", "text": "...", "correct": boolean}, {"id": "D", "text": "...", "correct": boolean}], and an "explanation".
   - CRITICAL REQUIREMENT: Randomize the correct choice position across A, B, C, and D evenly. Do NOT default to option A as the correct answer.
4. "Matching Type":
   - Column A items (prompts/definitions) and Column B items (matching terms/answers).
   - Must include "prompt", "pairs": [{"id": 1, "item": "<Column A item>", "match": "<Column B correct match>"}, ...], "columnA": ["item 1", ...], "columnB": ["randomized match 1", ...], and an "explanation".

CRITICAL: Return ONLY a valid JSON array matching this exact schema:
[
  {
    "criteriaId": <number>,
    "criteriaName": "<string>",
    "questionType": "Identification" | "True or False" | "Multiple Choice" | "Matching Type",
    "weight": <number>,
    "questions": [
      // For Identification:
      {
        "type": "identification",
        "prompt": "What is ...?",
        "expectedAnswer": "Photosynthesis",
        "explanation": "..."
      },
      // For True or False:
      {
        "type": "true_false",
        "prompt": "Plants need sunlight to make food.",
        "options": [
          { "id": "T", "text": "True", "correct": true },
          { "id": "F", "text": "False", "correct": false }
        ],
        "explanation": "..."
      },
      // For Multiple Choice (Distribute correct answers across A, B, C, D):
      {
        "type": "multiple_choice",
        "prompt": "Which part of the plant absorbs water?",
        "options": [
          { "id": "A", "text": "Leaves", "correct": false },
          { "id": "B", "text": "Roots", "correct": true },
          { "id": "C", "text": "Stem", "correct": false },
          { "id": "D", "text": "Flower", "correct": false }
        ],
        "explanation": "..."
      },
      // For Matching Type:
      {
        "type": "matching",
        "prompt": "Match the terms with their definitions",
        "pairs": [
          { "id": 1, "item": "Roots", "match": "Absorbs water and nutrients" },
          { "id": 2, "item": "Stem", "match": "Supports the plant structure" },
          { "id": 3, "item": "Leaves", "match": "Produces food using sunlight" }
        ],
        "columnA": ["Roots", "Stem", "Leaves"],
        "columnB": ["Produces food using sunlight", "Absorbs water and nutrients", "Supports the plant structure"],
        "explanation": "..."
      }
    ]
  }
]
`;

  const data = await fetchChatCompletion(apiKey, getModelCandidates(), [
    {
      role: 'user',
      content: prompt,
    },
  ], `You are an expert elementary school teacher and educational test creator. Always respond with valid JSON matching the exact format requested.`);

  const content = data.choices[0]?.message?.content || '[]';
  const parsed = extractJsonPayload(content);

  if (!parsed) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Invalid response format from AI');
  }

  const generatedGroups: any[] = Array.isArray(parsed) ? parsed : (parsed.groups || parsed.criteria || []);

  // Programmatically sanitize, balance, and randomize correct answers for all question types
  const sanitizedGroups = generatedGroups.map((group: any) => {
    const questions = Array.isArray(group.questions) ? group.questions : [];
    const updatedQuestions = questions.map((q: any) => {
      const qType = (q.type || group.questionType || '').toLowerCase();

      // 1. Multiple Choice: Shuffle options to eliminate option 'A' bias and re-assign IDs A, B, C, D
      if (qType.includes('multiple') || qType === 'multiple_choice' || (Array.isArray(q.options) && q.options.length >= 3)) {
        let rawOptions = Array.isArray(q.options) ? [...q.options] : [];
        if (rawOptions.length > 0) {
          // Identify if any option is currently marked correct
          const hasCorrect = rawOptions.some((o: any) => o.correct === true || o.correct === 'true');
          if (!hasCorrect) {
            // Pick a random option as correct if AI forgot to set one
            const randomIdx = Math.floor(Math.random() * rawOptions.length);
            rawOptions = rawOptions.map((o: any, idx: number) => ({
              ...o,
              correct: idx === randomIdx,
            }));
          } else {
            // Ensure only 1 option is marked correct
            let foundFirst = false;
            rawOptions = rawOptions.map((o: any) => {
              const isCorr = (o.correct === true || o.correct === 'true') && !foundFirst;
              if (isCorr) foundFirst = true;
              return { ...o, correct: isCorr };
            });
          }

          // Fisher-Yates shuffle the options array
          for (let i = rawOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
          }

          // Re-assign clean IDs: A, B, C, D, ...
          const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
          const shuffledOptions = rawOptions.map((opt: any, idx: number) => ({
            id: letters[idx] || String.fromCharCode(65 + idx),
            text: String(opt.text || opt.value || `Option ${idx + 1}`),
            correct: Boolean(opt.correct),
          }));

          return {
            ...q,
            type: 'multiple_choice',
            options: shuffledOptions,
          };
        }
      }

      // 2. True / False: Standardize True and False
      if (qType.includes('true') || qType === 'true_false' || qType === 'tf') {
        let isTrueCorrect = true;
        if (Array.isArray(q.options) && q.options.length >= 2) {
          const opt0Correct = q.options[0]?.correct === true || q.options[0]?.correct === 'true';
          const opt1Correct = q.options[1]?.correct === true || q.options[1]?.correct === 'true';
          if (opt0Correct && !opt1Correct) isTrueCorrect = true;
          else if (opt1Correct && !opt0Correct) isTrueCorrect = false;
        } else if (q.expectedAnswer !== undefined || q.answer !== undefined) {
          const ans = String(q.expectedAnswer ?? q.answer ?? '').toLowerCase();
          if (/false|mali|f|no|2|b/i.test(ans)) isTrueCorrect = false;
        }

        return {
          ...q,
          type: 'true_false',
          options: [
            { id: 'T', text: 'True', correct: isTrueCorrect },
            { id: 'F', text: 'False', correct: !isTrueCorrect },
          ],
        };
      }

      // 3. Identification: Clean expected answer
      if (qType.includes('identification')) {
        const expected = String(q.expectedAnswer ?? q.answer ?? q.correctAnswer ?? '').trim();
        return {
          ...q,
          type: 'identification',
          expectedAnswer: expected,
        };
      }

      // 4. Matching: Ensure pairs and columns
      if (qType.includes('matching')) {
        const pairs = Array.isArray(q.pairs) ? q.pairs : [];
        const colA = pairs.map((p: any) => p.item || '');
        const colB = [...pairs.map((p: any) => p.match || '')].sort(() => 0.5 - Math.random());
        return {
          ...q,
          type: 'matching',
          pairs,
          columnA: colA,
          columnB: colB,
        };
      }

      return q;
    });

    return {
      ...group,
      questions: updatedQuestions,
    };
  });

  return NextResponse.json({ generatedGroups: sanitizedGroups });
}

async function handleGameQuestionGeneration(
  apiKey: string,
  lessonText: string,
  questionCount: number = 8
) {
  const prompt = `You are an expert elementary and high school teacher and interactive quiz game master.
Given the following lesson or document content, extract and generate ${questionCount} engaging, classroom-appropriate trivia/quiz questions and clear, concise answers for a fast-paced classroom game (e.g., Palosebo Greasy Pole Race or Tug-of-War).

LESSON / DOCUMENT CONTENT:
${lessonText.slice(0, 10000)}

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
]
`;

  const data = await fetchChatCompletion(
    apiKey,
    getModelCandidates(),
    [{ role: 'user', content: prompt }],
    'You are an expert teacher creating fun classroom quiz games. Always return valid JSON only.'
  );

  const content = data.choices[0]?.message?.content || '[]';
  const parsed = extractJsonPayload(content);

  if (!parsed) {
    console.error('Failed to parse AI game questions response:', content);
    throw new Error('Invalid response format from AI');
  }

  const questions: Array<{ question: string; answer: string }> = Array.isArray(parsed)
    ? parsed
    : (parsed.questions || []);

  return NextResponse.json({ questions });
}

