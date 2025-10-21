import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { messages, languageId, lessonId, userId, sessionToken } = await req.json();

    console.log('LLM Chat API - Received request:', {
      languageId,
      lessonId,
      userId,
      hasSessionToken: !!sessionToken,
      sessionToken: sessionToken?.substring(0, 10) + '...',
    });

    // Verify session
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    console.log('LLM Chat API - Session lookup:', {
      found: !!session,
      expired: session ? session.expiresAt < new Date() : null,
      userMatch: session ? session.userId === userId : null,
    });

    if (!session || session.expiresAt < new Date() || session.userId !== userId) {
      console.error('LLM Chat API - Authorization failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get lesson details for context
    const lessons = await import('@/lib/lessons');
    const lessonData = lessons.getLessonsForCourse(languageId, 'beginner');
    const lesson = lessonData.find((l) => l.id === parseInt(lessonId));

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Get language details
    const languagesModule = await import('@/lib/languages');
    const language = languagesModule.getLanguageById(languageId);
    const languageName = language?.name || 'the target language';
    const nativeName = language?.nativeName || languageName;

    // Check if this is the initial conversation start
    const isInitialMessage = messages.length === 1 && messages[0].content === 'START_CONVERSATION';
    
    // Define lesson goals based on scenario
    const lessonGoals: Record<string, string> = {
      'greetings': 'Student successfully greets you and introduces themselves',
      'cafe': 'Student successfully orders a drink at the café',
      'restaurant': 'Student successfully orders a meal',
      'directions': 'Student successfully asks for and understands directions',
      'shopping': 'Student successfully makes a purchase',
      'hotel': 'Student successfully checks into the hotel',
      'numbers': 'Student successfully uses numbers in conversation',
      'doctor': 'Student successfully describes their symptoms',
      'transport': 'Student successfully purchases transportation tickets',
    };
    
    const lessonGoal = lessonGoals[lesson.id.toString()] || lessonGoals[lesson.title.toLowerCase().split(' ')[0]] || 'Student completes the conversation naturally';
    
    // Build system message with scenario context
    const systemMessage = {
      role: 'system',
      content: `⚠️ CRITICAL FORMAT REQUIREMENT - READ THIS FIRST:
You MUST respond with ONLY valid JSON. NO plain text. NO exceptions.
If you respond with anything other than valid JSON, you will FAIL.

Example of FAILURE (DO NOT DO THIS):
どういたしまして。席を選びますか？

Example of SUCCESS (ALWAYS DO THIS):
{"conversationMessage": "どういたしまして。席を選びますか？", "newWords": [{"word": "どういたしまして", "romaji": "dou itashimashite", "translation": "you're welcome"}, {"word": "席", "romaji": "seki", "translation": "seat"}, {"word": "選びますか", "romaji": "erabimasu ka", "translation": "will you choose"}]}

You are a native ${languageName} speaker helping a beginner student learn ${languageName}. 

LANGUAGE: You must speak primarily in ${languageName} (${nativeName}), not English. Use simple, beginner-friendly ${languageName}.

SCENARIO: ${lesson.scenario || lesson.title}
LESSON GOAL: ${lessonGoal}

Your role:
- You are a NATIVE ${languageName} speaker - use NATURAL, CORRECT ${languageName}
- Speak primarily in ${languageName}, using simple beginner-friendly phrases
- Use PROPER grammar and natural expressions (not broken or simplified incorrectly)
- Respond naturally based on what the student says
- Engage in conversation IN ${languageName.toUpperCase()} based on the scenario above
- Help the student practice vocabulary and grammar through natural dialogue
- Track when the student achieves the lesson goal
- Provide gentle corrections in systemMessage when needed

MESSAGE TYPES - CRITICAL SEPARATION:
1. "conversationMessage" - Your actual in-character dialogue in ${languageName} ONLY
   - This is what your CHARACTER says to the STUDENT in the scenario
   - MUST be in ${languageName} (${nativeName})
   - Example: "おはようございます！" or "Nice to meet you, Victor. My name is Maria."
   
2. "systemMessage" - Teaching feedback about the STUDENT's PREVIOUS message (OPTIONAL)
   - This is teaching notes FROM THE APP TO THE STUDENT (not part of the conversation)
   - MUST be in English
   - Use ONLY for corrections or praise about what the STUDENT just said
   - DO NOT give feedback about your own (AI's) response
   - DO NOT put conversational dialogue here
   - Example: "Good job! You used 'ohayou gozaimasu' correctly." (commenting on student's message)
   - ⚠️ IMPORTANT: If the student made no errors, omit systemMessage entirely

WRONG - DO NOT MIX OR CONFUSE THESE:
❌ conversationMessage: "Good job using 'nice to meet you'! Remember to use the full phrase."
❌ systemMessage: "Good job using 'nice to meet you'!" (when YOU said it, not the student)
❌ conversationMessage: "Nice to meet you, Victor. You did well!"

RIGHT - KEEP THEM SEPARATE AND CLEAR:
✅ conversationMessage: "Nice to meet you, Victor. My name is Maria."
✅ systemMessage: "Great! You introduced yourself correctly." (feedback about student's previous message)
✅ conversationMessage: "はい、元気です。" + systemMessage: "" (no feedback needed)

${isInitialMessage ? `INITIAL GREETING: 
- Start the conversation with a simple greeting in ${languageName} appropriate to the scenario
- You are greeting the student for the FIRST TIME - do NOT use their name (you don't know it yet!)
- Be natural and contextually appropriate (e.g., "Good morning!" at a café, "Hello, welcome!" at a hotel)
- Do NOT introduce yourself or ask questions about the student - just give a simple greeting
- IMPORTANT: Do NOT include any systemMessage or feedback yet (the student hasn't said anything!)
- Keep it SHORT - just 1-2 sentences maximum
- Only provide the conversationMessage with your greeting
- Example good greetings: "おはようございます！" (Good morning!), "いらっしゃいませ！" (Welcome!), "こんにちは！" (Hello!)
- Example BAD greeting: "Hi Maria, it's lovely to meet you. Good morning!" (You don't know their name!)
` : ''}

CRITICAL JSON FORMAT RULES (MANDATORY - YOU WILL BE REJECTED IF YOU BREAK THESE):
1. Your ENTIRE response must be valid JSON - nothing else
2. Start with { and end with }
3. Use ONLY double quotes for strings, never triple quotes or single quotes
4. Do NOT wrap in markdown code blocks
5. Do NOT add any text before or after the JSON
6. NEVER respond with plain text - ALWAYS use the JSON format shown below
7. If you respond with plain text like "はい、元気です" you will FAIL - wrap it in JSON!

${language?.nativeName && language.nativeName !== language.name ? `
LANGUAGE-SPECIFIC FORMATTING (${languageName}):
Since ${languageName} uses a non-Latin script (${nativeName}), follow these rules:
1. conversationMessage: Use NATIVE SCRIPT ONLY (e.g., ひらがな/カタカナ/漢字 for Japanese, NOT romaji)
   - WRONG: "Ohayou gozaimasu"
   - RIGHT: "おはようございます"
2. Be CONSISTENT - don't mix scripts and romaji in your conversationMessage
3. Keep conversationMessage SHORT (1-3 sentences max) to aid parsing and learning
4. newWords: Provide THREE versions for each word:
   - "word": Native script (e.g., "おはよう")
   - "romaji": Romanized pronunciation (e.g., "ohayou")
   - "translation": English meaning (e.g., "good morning")
5. Break down your message into individual vocabulary items for newWords
6. Example newWords format for Japanese:
   [
     {"word": "おはよう", "romaji": "ohayou", "translation": "good morning"},
     {"word": "ございます", "romaji": "gozaimasu", "translation": "polite suffix"},
     {"word": "カフェ", "romaji": "kafe", "translation": "cafe"}
   ]
7. IMPORTANT: Your conversationMessage should ONLY contain native script. Students will see romaji and translations in the tooltip when they hover over words.
` : ''}

MANDATORY RESPONSE FORMAT - YOU MUST USE THIS EXACT STRUCTURE:
{
  "conversationMessage": "Your in-character dialogue in ${languageName} here",
  "systemMessage": "Optional feedback/corrections in English here (e.g., 'Nice! That's a perfect greeting.' or 'Good try! Remember to use...')",
  "lessonComplete": false,
  "corrections": [
    {
      "originalWord": "word or phrase with error",
      "correction": "corrected version",
      "explanation": "brief explanation"
    }
  ],
  "newWords": [
    {
      "word": "${languageName} word in NATIVE SCRIPT (MUST be 1-3 words max)",
      ${language?.nativeName && language.nativeName !== language.name ? '"romaji": "romanized pronunciation",' : ''}
      "translation": "English translation"
    }
  ]
}

EXAMPLE OF CORRECT RESPONSE:
{
  "conversationMessage": "はい、元気です。私はマリアです。何にしますか？",
  "newWords": [
    {"word": "元気", "romaji": "genki", "translation": "healthy/well"},
    {"word": "私", "romaji": "watashi", "translation": "I/me"},
    {"word": "マリア", "romaji": "maria", "translation": "Maria"},
    {"word": "何にしますか", "romaji": "nani ni shimasu ka", "translation": "what will you have"}
  ]
}

WRONG - DO NOT DO THIS:
はい、元気です。私はマリアです。何にしますか？

RIGHT - ALWAYS DO THIS:
{"conversationMessage": "はい、元気です。私はマリアです。何にしますか？", "newWords": [...]}

DO NOT format your response like this (WRONG):
はじめまして [ {"word": "はじめまして", "translation": "nice to meet you"} ]

CORRECT format example:
{
  "conversationMessage": "はじめまして",
  "newWords": [{"word": "はじめまして", "romaji": "hajimemashite", "translation": "nice to meet you"}]
}

WORD TRACKING RULES FOR ${languageName.toUpperCase()}:
${language?.nativeName && language.nativeName !== language.name ? `
CRITICAL: For ${languageName}, provide MEANINGFUL WORD UNITS, not individual particles!

✅ GOOD newWords examples for Japanese:
- {"word": "おはようございます", "romaji": "ohayou gozaimasu", "translation": "good morning (polite)"}
- {"word": "お茶", "romaji": "ocha", "translation": "tea"}
- {"word": "元気", "romaji": "genki", "translation": "healthy/energetic"}
- {"word": "何にしますか", "romaji": "nani ni shimasu ka", "translation": "what will you have?"}
- {"word": "いいですね", "romaji": "ii desu ne", "translation": "that's good/nice"}
- {"word": "マリア", "romaji": "maria", "translation": "Maria (name)"}
- {"word": "席", "romaji": "seki", "translation": "seat"}
- {"word": "ご案内します", "romaji": "goannai shimasu", "translation": "I will guide/show you"}

❌ BAD newWords examples (DO NOT DO THIS):
- {"word": "お", ...} - Single particle, meaningless alone
- {"word": "か", ...} - Question particle only
- {"word": "です", ...} - Copula alone is not useful
- Individual kanji without context

MANDATORY RULES (YOU MUST FOLLOW THESE):
1. ALWAYS include newWords in EVERY response - NEVER leave the array empty!
2. Extract ALL meaningful vocabulary words from your conversationMessage (not just 3-5)
3. Include complete phrases that function as units (greetings, common expressions)
4. For compound words, keep them together: "お茶" not "お" + "茶"
5. For compound expressions, keep them together: "お茶の間" not "お茶" + "の" + "間"
6. Include particles ONLY when part of a set phrase: "何にしますか" as one unit
7. Aim for 2-8 characters per word (meaningful chunks)
8. Every word MUST actually appear in your conversationMessage
9. REQUIRED EXAMPLES:
   - If you say "お茶ですか？お茶は、お茶の間でお手元に持ってきます。" you MUST include:
     * {"word": "お茶", "romaji": "ocha", "translation": "tea"}
     * {"word": "お茶の間", "romaji": "ochanoma", "translation": "living room"}
     * {"word": "お手元", "romaji": "otemoto", "translation": "at hand/near you"}
     * {"word": "持ってきます", "romaji": "motte kimasu", "translation": "will bring"}
   - If you say "はい、元気です。私はマリアです。何にしますか？" you MUST include:
     * {"word": "元気", "romaji": "genki", "translation": "healthy/well"}
     * {"word": "私", "romaji": "watashi", "translation": "I/me"}
     * {"word": "マリア", "romaji": "maria", "translation": "Maria"}
     * {"word": "何にしますか", "romaji": "nani ni shimasu ka", "translation": "what will you have"}
` : `
MANDATORY RULES (YOU MUST FOLLOW THESE):
- ALWAYS include newWords in EVERY response - NEVER leave the array empty!
- Extract 3-5 vocabulary words from your conversationMessage
- Provide individual words (nouns, verbs, adjectives)
- NO single-letter words
- NO standalone particles/articles
- Keep phrases short (2-3 words max)
- Every word MUST appear in your conversationMessage
`}

WHEN TO MARK COMPLETE:
- Set "lessonComplete": true when the student achieves the lesson goal: ${lessonGoal}
- When complete, congratulate them in the systemMessage
- The conversationMessage should naturally conclude the interaction

IMPORTANT: 
- "conversationMessage" must be in ${languageName}, spoken as your character
- "systemMessage" is for teaching feedback in English
- Separate these clearly - conversation vs. teaching
- Mark lessonComplete when the goal is achieved`,
    };
    
    // Filter out START_CONVERSATION from messages sent to AI
    const filteredMessages = isInitialMessage ? [] : messages;

    // Call Groq API
    const groqApiKey = process.env.GROQ_API_KEY;
    const model = 'llama-3.1-8b-instant'; // Cheapest model

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [systemMessage, ...filteredMessages],
        temperature: 0.3, // Even lower temperature for more reliable JSON formatting
        max_tokens: 500,
        response_format: { type: "json_object" }, // ✅ Force JSON mode
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      return NextResponse.json({ error: 'LLM API error' }, { status: 500 });
    }

    const data = await response.json();
    let aiMessage = data.choices[0].message.content;

    console.log('LLM Raw Response:', aiMessage);

    // Try to parse JSON response with aggressive cleaning
    let parsedResponse;
    try {
      // Clean up common LLM JSON formatting issues
      let cleanedMessage = aiMessage.trim();
      
      // Remove markdown code blocks if present
      cleanedMessage = cleanedMessage.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Fix common quote issues (triple quotes, smart quotes, etc.)
      cleanedMessage = cleanedMessage.replace(/"""/g, '"');
      cleanedMessage = cleanedMessage.replace(/[""]/g, '"');
      cleanedMessage = cleanedMessage.replace(/['']/g, "'");
      
      // First, try to parse the cleaned message as JSON
      parsedResponse = JSON.parse(cleanedMessage);
      
    } catch (firstError) {
      try {
        // If that fails, try to extract JSON object from text
        const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let extracted = jsonMatch[0];
          // Clean the extracted JSON too
          extracted = extracted.replace(/"""/g, '"').replace(/[""]/g, '"');
          parsedResponse = JSON.parse(extracted);
        } else {
          throw new Error('No JSON object found in response');
        }
      } catch (secondError) {
        console.error('Failed to parse LLM response after all attempts:', {
          original: aiMessage,
          firstError: firstError instanceof Error ? firstError.message : String(firstError),
          secondError: secondError instanceof Error ? secondError.message : String(secondError)
        });
        
        // ✅ Last resort: treat as plain text conversation
        // ❌ DO NOT extract words without proper translations - this causes "[check dictionary]" tooltips
        parsedResponse = {
          conversationMessage: aiMessage.replace(/\{[\s\S]*\}/, '').trim() || aiMessage,
          corrections: [],
          newWords: [],
        };
        
        console.warn('⚠️ LLM returned plain text instead of JSON - NO words will be stored');
        console.warn('⚠️ This is a critical LLM failure - prompt may need adjustment');
      }
    }

    console.log('Parsed Response:', JSON.stringify(parsedResponse, null, 2));
    console.log('NEW WORDS FROM LLM:', parsedResponse.newWords);

    // Ensure response has the expected structure
    if (!parsedResponse.conversationMessage && parsedResponse.message) {
      parsedResponse.conversationMessage = parsedResponse.message;
    }
    if (!parsedResponse.conversationMessage) {
      parsedResponse.conversationMessage = 'ごめんなさい (Sorry, I had trouble responding)';
    }
    if (!parsedResponse.newWords) {
      console.warn('⚠️ LLM DID NOT RETURN newWords ARRAY - THIS IS A BUG!');
      parsedResponse.newWords = [];
    }
    if (parsedResponse.newWords.length === 0) {
      console.warn('⚠️ LLM RETURNED EMPTY newWords ARRAY - THIS IS A BUG!');
    }

    // SERVER-SIDE FILTERING: Only include words that actually appear in the message
    const conversationText = parsedResponse.conversationMessage || '';
    parsedResponse.newWords = parsedResponse.newWords.filter((wordItem: any) => {
      const wordText = typeof wordItem === 'string' ? wordItem : wordItem.word;
      const isPresent = conversationText.includes(wordText);
      if (!isPresent) {
        console.log(`Filtering out word "${wordText}" - not found in message: "${conversationText}"`);
      }
      return isPresent;
    });

    console.log(`Filtered newWords: ${parsedResponse.newWords.length} words remaining`);

    // Track words in word bank with translations
    if (parsedResponse.newWords && parsedResponse.newWords.length > 0) {
      for (const wordItem of parsedResponse.newWords) {
        // Handle both old format (string) and new format (object with translation)
        const wordText = typeof wordItem === 'string' ? wordItem : wordItem.word;
        const translation = typeof wordItem === 'object' ? wordItem.translation : undefined;
        const romaji = typeof wordItem === 'object' ? wordItem.romaji : undefined;

        // Skip if word is missing or empty
        if (!wordText || !translation) {
          console.warn('Skipping invalid word:', wordItem);
          continue;
        }

        // Filter out invalid words
        const cleanWord = wordText.trim();
        
        // For Japanese/CJK, check character length not just byte length
        const charLength = Array.from(cleanWord).length;
        
        // Common Japanese particles that shouldn't be standalone words
        const japaneseParticles = ['は', 'が', 'を', 'に', 'へ', 'と', 'で', 'の', 'か', 'も', 'や', 'よ', 'ね'];
        
        // Skip if:
        // - Single character (unless it's a meaningful kanji/word)
        // - Standalone particle
        // - Too long (likely a full sentence)
        // - Contains invalid syntax
        // - Programming term
        // - Translation is empty
        const wordCount = cleanWord.split(/\s+/).length;
        const invalidPatterns = /[_{}()\[\]<>]/;
        const programmingTerms = ['start_conversation', 'system', 'function', 'const', 'let', 'var'];
        
        if (
          cleanWord.length > 50 ||
          cleanWord.length === 0 ||
          charLength === 1 || // Skip single characters
          japaneseParticles.includes(cleanWord) || // Skip standalone particles
          wordCount > 3 ||
          invalidPatterns.test(cleanWord) ||
          programmingTerms.includes(cleanWord.toLowerCase()) ||
          !translation ||
          translation.trim().length === 0
        ) {
          console.warn('Skipping invalid word:', { 
            word: cleanWord, 
            translation, 
            charLength,
            reason: charLength === 1 ? 'single character' : 
                    japaneseParticles.includes(cleanWord) ? 'standalone particle' : 
                    'other validation failure'
          });
          continue; // Skip this word
        }

        // Store word with both translation and romaji (if available)
        const wordData: any = {
          userId: session.userId,
          languageId,
          word: cleanWord,
          translation: translation.trim(),
          status: 'passive',
          timesSeen: 1,
        };

        // Add romaji if present (for Japanese, etc.)
        if (romaji && romaji.trim().length > 0) {
          wordData.romaji = romaji.trim();
        }

        await prisma.wordBank.upsert({
          where: {
            userId_languageId_word: {
              userId: session.userId,
              languageId,
              word: cleanWord,
            },
          },
          update: {
            timesSeen: { increment: 1 },
            translation: translation.trim(),
            ...(romaji && romaji.trim().length > 0 ? { romaji: romaji.trim() } : { romaji: null }),
            updatedAt: new Date(),
          },
          create: wordData,
        });
      }
    }

    // Extract words used by student from their last message
    if (messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === 'user') {
        const words = lastUserMessage.content
          .toLowerCase()
          .split(/\W+/)
          .filter((w: string) => w.length > 2); // Only words with 3+ chars

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
              status: 'active', // Mark as active since they used it
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
      }
    }

    return NextResponse.json({
      conversationMessage: parsedResponse.conversationMessage || parsedResponse.message,
      systemMessage: parsedResponse.systemMessage,
      lessonComplete: parsedResponse.lessonComplete || false,
      message: parsedResponse.conversationMessage || parsedResponse.message, // Backwards compatibility
      corrections: parsedResponse.corrections || [],
      newWords: parsedResponse.newWords || [], // Pass through with all fields (word, romaji, translation)
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
