import { NextRequest, NextResponse } from 'next/server';

type CriteriaRow = {
  id: number;
  name: string;
  weight: number;
};

type GenerateRequest = {
  action: 'translate' | 'generate-questions';
  lessonText?: string;
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
    const { action, lessonText, criteria, questionCount, assessmentCategory } = body;

    if (action === 'translate') {
      return await handleTranslation(apiKey, lessonText!);
    } else if (action === 'generate-questions') {
      if (!lessonText || !lessonText.trim()) {
        return NextResponse.json({ error: 'Lesson text is required' }, { status: 400 });
      }
      if (!Array.isArray(criteria) || criteria.length === 0) {
        return NextResponse.json({ error: 'At least one grading criterion is required' }, { status: 400 });
      }
      if (!Number.isFinite(Number(questionCount)) || Number(questionCount) < 1) {
        return NextResponse.json({ error: 'Question count must be at least 1' }, { status: 400 });
      }

      return await handleQuestionGeneration(apiKey, lessonText, criteria, Number(questionCount), assessmentCategory ?? 'quiz');
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

async function handleQuestionGeneration(
  apiKey: string,
  lessonText: string,
  criteria: CriteriaRow[],
  questionCount: number,
  assessmentCategory: 'quiz' | 'test'
) {
  const totalWeight = criteria.reduce((sum, criterion) => sum + Number(criterion.weight || 0), 0);
  if (totalWeight <= 0) {
    throw new Error('Criteria weights must total more than zero');
  }

  const distribution = criteria.map((criterion) => ({
    ...criterion,
    questionCount: Number(((questionCount * Number(criterion.weight || 0)) / totalWeight).toFixed(6)),
  }));

  const rawCounts = distribution.map((criterion) => ({
    ...criterion,
    base: Math.floor(criterion.questionCount),
    remainder: criterion.questionCount - Math.floor(criterion.questionCount),
  }));

  let remainingQuestions = questionCount - rawCounts.reduce((sum, item) => sum + item.base, 0);
  const ordered = [...rawCounts].sort((a, b) => b.remainder - a.remainder || a.name.localeCompare(b.name));

  for (let i = 0; i < remainingQuestions; i += 1) {
    if (ordered[i]) {
      ordered[i].base += 1;
    }
  }

  const questionsPerCriteria = ordered.map((item) => ({
    ...item,
    questionCount: Math.max(1, item.base),
  }));

  const sumAllocated = questionsPerCriteria.reduce((sum, item) => sum + item.questionCount, 0);
  if (sumAllocated !== questionCount) {
    const difference = questionCount - sumAllocated;
    if (difference !== 0) {
      const target = questionsPerCriteria[0];
      if (target) {
        target.questionCount += difference;
      }
    }
  }

  const assessmentName = assessmentCategory === 'test' ? 'test' : 'quiz';
  const prompt = `You are an educational content generator. Based on the following lesson, generate ${assessmentName} questions.

LESSON CONTENT:
${lessonText}

CRITERIA AND QUESTION DISTRIBUTION:
${questionsPerCriteria.map(c => `- ${c.name}: ${c.questionCount} questions (${c.weight}% weight)`).join('\n')}

Generate exactly ${questionCount} multiple-choice questions distributed according to the criteria weights above. 

For each question, provide:
1. A clear question prompt appropriate for elementary students
2. Four answer options (A, B, C, D) with exactly ONE correct answer
3. A brief explanation of why the correct answer is right

Return the response as a JSON array with this structure:
[
  {
    "criteriaId": <number>,
    "criteriaName": "<string>",
    "questions": [
      {
        "prompt": "<question text>",
        "options": [
          { "id": "A", "text": "<option text>", "correct": true/false },
          { "id": "B", "text": "<option text>", "correct": true/false },
          { "id": "C", "text": "<option text>", "correct": true/false },
          { "id": "D", "text": "<option text>", "correct": true/false }
        ],
        "explanation": "<explanation text>"
      }
    ]
  }
]

Ensure the ${assessmentName} questions are age-appropriate, clear, and directly related to the lesson content.`;

  const data = await fetchChatCompletion(apiKey, getModelCandidates(), [
    {
      role: 'user',
      content: prompt,
    },
  ], `You are an expert educational content creator specializing in elementary education. Generate clear, age-appropriate ${assessmentName} questions. Always respond with valid JSON in the exact format specified.`);

  let content = data.choices[0]?.message?.content || '[]';
  content = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

  let generatedGroups;
  try {
    const parsed = JSON.parse(content);
    generatedGroups = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.criteria || []);
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Invalid response format from AI');
  }

  return NextResponse.json({ generatedGroups });
}

