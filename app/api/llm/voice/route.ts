import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const languageId = formData.get('languageId') as string;
    const lessonId = formData.get('lessonId') as string;
    const userId = formData.get('userId') as string;
    const sessionToken = formData.get('sessionToken') as string;
    const conversationHistory = JSON.parse(formData.get('conversationHistory') as string || '[]');

    // Verify session
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || session.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    // Get language details for Whisper
    const languagesModule = await import('@/lib/languages');
    const language = languagesModule.getLanguageById(languageId);
    const whisperLanguage = language?.locale?.split('-')[0] || 'en'; // Get language code (e.g., 'es' from 'es-ES')

    // Step 1: Transcribe audio using Whisper
    const sttFormData = new FormData();
    sttFormData.append('file', audioFile);
    sttFormData.append('model', 'whisper-large-v3-turbo');
    sttFormData.append('language', whisperLanguage); // Specify target language for better accuracy

    const sttResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: sttFormData,
    });

    if (!sttResponse.ok) {
      const error = await sttResponse.text();
      console.error('STT error:', error);
      return NextResponse.json({ error: 'Speech-to-text failed' }, { status: 500 });
    }

    const sttData = await sttResponse.json();
    const userText = sttData.text;

    // Step 2: Get lesson details for context
    const lessons = await import('@/lib/lessons');
    const lessonData = lessons.getLessonsForCourse(languageId, 'beginner');
    const lesson = lessonData.find((l) => l.id === parseInt(lessonId));

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Use language details already loaded above
    const languageName = language?.name || 'the target language';
    const nativeName = language?.nativeName || languageName;
    const locale = language?.locale || 'en-US';

    // Step 3: Build system message with scenario context
    const systemMessage = {
      role: 'system',
      content: `You are a native ${languageName} speaker having a voice conversation with a beginner student learning ${languageName}.

LANGUAGE: You must speak primarily in ${languageName} (${nativeName}), not English. Use simple, beginner-friendly ${languageName} suitable for voice conversation.

SCENARIO: ${lesson.scenario || lesson.title}

Your role:
- Engage in natural spoken conversation IN ${languageName.toUpperCase()} based on the scenario
- Respond as if you are a native ${languageName} speaker from that region
- Help the student practice speaking and pronunciation
- Correct errors gently with brief explanations
- Use simple, conversational language appropriate for beginners
- Keep responses brief and natural for voice interaction (2-3 sentences)

CRITICAL: You must ONLY respond with valid JSON. Do not include any text before or after the JSON object.

Your response must be exactly this format:
{
  "message": "Your brief conversational response in ${languageName} (2-3 sentences max)",
  "corrections": [
    {
      "originalWord": "word or phrase with error",
      "correction": "corrected version",
      "explanation": "brief explanation"
    }
  ],
  "newWords": [
    {
      "word": "${languageName} word",
      "translation": "English translation"
    }
  ]
}

Do not add any commentary, notes, or text outside the JSON structure.`,
    };

    // Step 4: Get LLM response
    const messages = [
      systemMessage,
      ...conversationHistory,
      { role: 'user', content: userText },
    ];

    const chatResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.7,
        max_tokens: 300, // Shorter for voice
      }),
    });

    if (!chatResponse.ok) {
      const error = await chatResponse.text();
      console.error('Chat API error:', error);
      return NextResponse.json({ error: 'Chat API failed' }, { status: 500 });
    }

    const chatData = await chatResponse.json();
    const aiMessage = chatData.choices[0].message.content;

    // Try to parse JSON response
    let parsedResponse;
    try {
      // Extract JSON if it's embedded in text
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      parsedResponse = {
        message: aiMessage,
        corrections: [],
        newWords: [],
      };
    }

    // Step 5: Track words in word bank with translations
    if (parsedResponse.newWords && parsedResponse.newWords.length > 0) {
      for (const wordItem of parsedResponse.newWords) {
        // Handle both old format (string) and new format (object with translation)
        const wordText = typeof wordItem === 'string' ? wordItem : wordItem.word;
        const translation = typeof wordItem === 'object' ? wordItem.translation : undefined;

        await prisma.wordBank.upsert({
          where: {
            userId_languageId_word: {
              userId: session.userId,
              languageId,
              word: wordText.toLowerCase(),
            },
          },
          update: {
            timesSeen: { increment: 1 },
            translation: translation || undefined,
            updatedAt: new Date(),
          },
          create: {
            userId: session.userId,
            languageId,
            word: wordText.toLowerCase(),
            translation: translation,
            status: 'passive',
            timesSeen: 1,
          },
        });
      }
    }

    // Track words used by student
    const words = userText
      .toLowerCase()
      .split(/\W+/)
      .filter((w: string) => w.length > 2);

    for (const word of words) {
      await prisma.wordBank.upsert({
        where: {
          userId_languageId_word: {
            userId: session.userId,
            languageId,
            word,
          },
        },
        update: {
          timesUsed: { increment: 1 },
          status: 'active',
          updatedAt: new Date(),
        },
        create: {
          userId: session.userId,
          languageId,
          word,
          status: 'active',
          timesUsed: 1,
        },
      });
    }

    // Step 6: Return response (browser will handle TTS)
    return NextResponse.json({
      userText,
      message: parsedResponse.message,
      corrections: parsedResponse.corrections || [],
      newWords: parsedResponse.newWords || [],
    });
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
