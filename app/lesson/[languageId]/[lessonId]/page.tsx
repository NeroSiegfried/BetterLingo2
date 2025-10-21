'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { languages } from '@/lib/languages';
import { getLessonsForCourse } from '@/lib/lessons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  highlightedWords?: { 
    word: string; 
    isNew?: boolean; 
    isError?: boolean; 
    correction?: string; 
    explanation?: string;
    translation?: string;
    romaji?: string;
  }[];
  messageType?: 'conversation' | 'system'; // For AI messages: conversation vs system/status
}

export default function LessonPage({ params }: { params: { languageId: string; lessonId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { languageId, lessonId } = params;
  const lessonType = searchParams.get('type') || 'text';
  
  const language = languages.find(lang => lang.id === languageId);
  const lessons = getLessonsForCourse(languageId, 'beginner');
  const lesson = lessons.find(l => l.id === parseInt(lessonId));
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{ word: string; explanation: string; isError?: boolean; correction?: string } | null>(null);
  const [hoveredWord, setHoveredWord] = useState<{ word: string; translation: string; romaji?: string; x: number; y: number } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [wordBankData, setWordBankData] = useState<Array<{ word: string; translation?: string; romaji?: string; timesUsed?: number }>>([]);
  const [wordBankVersion, setWordBankVersion] = useState(0); // Trigger refetch when incremented
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!language || !lesson) {
      router.push(`/course/${languageId}`);
    }
  }, [language, lesson, router, languageId]);

  // Fetch word bank data once for instant tooltip lookups
  useEffect(() => {
    const fetchWordBank = async () => {
      try {
        const sessionData = localStorage.getItem('session');
        if (!sessionData) return;

        const session = JSON.parse(sessionData);
        const sessionToken = session.session.token;

        const response = await fetch(`/api/wordbank/${languageId}`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWordBankData(data.words || []);
        }
      } catch (error) {
        console.error('Failed to fetch word bank:', error);
      }
    };

    // Fetch on mount and when wordBankVersion changes (after new messages)
    fetchWordBank();
  }, [languageId, wordBankVersion]);

  // Initialize conversation with AI greeting in target language
  useEffect(() => {
    if (language && lesson && !isInitialized) {
      setIsInitialized(true);
      setIsTyping(true);
      
      // Get initial greeting from AI
      const initializeConversation = async () => {
        try {
          // First, add scenario system message
          const scenarioMessage: Message = {
            id: 'scenario',
            text: `📍 Scenario: ${lesson.scenario || lesson.title}\n\nYour goal: Practice this conversation until you successfully complete the interaction.`,
            sender: 'system',
            timestamp: new Date(),
            messageType: 'system',
          };
          setMessages([scenarioMessage]);

          const sessionData = localStorage.getItem('session');
          let userId = 'demo-user';
          let sessionToken = 'demo-token';

          if (sessionData) {
            const session = JSON.parse(sessionData);
            userId = session.user.id;
            sessionToken = session.session.token;
          }

          const response = await fetch('/api/llm/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: 'START_CONVERSATION' }],
              languageId,
              lessonId,
              userId,
              sessionToken,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            const newMessages: Message[] = [scenarioMessage];
            
            // Add system message if present
            if (data.systemMessage) {
              newMessages.push({
                id: `sys-${Date.now()}`,
                text: data.systemMessage,
                sender: 'system',
                timestamp: new Date(),
                messageType: 'system',
              });
            }
            
            // Add conversation message
            if (data.conversationMessage || data.message) {
              // Process new words with translations and romaji
              // Filter to only include words that actually appear in the message
              const messageText = data.conversationMessage || data.message;
              
              console.log('Processing AI response:', {
                messageText,
                newWords: data.newWords,
                newWordsCount: data.newWords?.length || 0
              });
              
              const highlightedWords = data.newWords?.filter((w: any) => {
                const wordText = typeof w === 'string' ? w : w.word;
                const translation = typeof w === 'object' ? w.translation : '';
                const isInMessage = messageText.includes(wordText);
                
                // ✅ Skip invalid translations
                if (!translation || 
                    translation === '[check dictionary]' || 
                    translation === '[translation needed]' ||
                    translation === 'unknown') {
                  console.log(`Skipping word "${wordText}" - invalid translation`);
                  return false;
                }
                
                console.log(`Checking word "${wordText}": ${isInMessage ? 'FOUND' : 'NOT FOUND'} in message`);
                return isInMessage;
              }).map((w: any) => {
                const wordText = typeof w === 'string' ? w : w.word;
                const translation = typeof w === 'object' ? w.translation : '';
                const romaji = typeof w === 'object' ? w.romaji : '';
                
                let explanation = '';
                if (romaji && translation) {
                  explanation = `${romaji} - ${translation}`;
                } else if (translation) {
                  explanation = translation;
                } else if (romaji) {
                  explanation = romaji;
                } else {
                  explanation = `New vocabulary: ${wordText}`;
                }
                
                return {
                  word: wordText,
                  isNew: true,
                  explanation: explanation,
                  translation: translation,
                  romaji: romaji,
                };
              }) || [];
              
              newMessages.push({
                id: '1',
                text: data.conversationMessage || data.message,
                sender: 'ai',
                timestamp: new Date(),
                messageType: 'conversation',
                highlightedWords: highlightedWords,
              });
            }
            
            setMessages(newMessages);
          }
        } catch (error) {
          console.error('Failed to initialize conversation:', error);
          // Fallback to generic message
          setMessages([{
            id: 'scenario',
            text: `📍 Scenario: ${lesson?.scenario || 'Practice conversation'}\n\nYour goal: Complete the interaction successfully.`,
            sender: 'system',
            timestamp: new Date(),
            messageType: 'system',
          }, {
            id: '1',
            text: 'Hello! Welcome to the lesson.',
            sender: 'ai',
            timestamp: new Date(),
            messageType: 'conversation',
          }]);
        } finally {
          setIsTyping(false);
        }
      };

      initializeConversation();
    }
  }, [language, lesson, isInitialized, languageId, lessonId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Get session from localStorage
      const sessionData = localStorage.getItem('session');
      let userId = 'demo-user';
      let sessionToken = 'demo-token';

      if (sessionData) {
        const session = JSON.parse(sessionData);
        userId = session.user.id;
        sessionToken = session.session.token;
      }

      // Build conversation history for API
      // Only include user and AI conversation messages, exclude system messages
      const conversationHistory = messages
        .filter(msg => msg.sender !== 'system' && msg.messageType !== 'system')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }));

      conversationHistory.push({
        role: 'user',
        content: inputText,
      });

      // Call LLM API
      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          languageId,
          lessonId,
          userId,
          sessionToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();

      // Check if lesson is complete
      if (data.lessonComplete) {
        setLessonComplete(true);
        setShowCompletionModal(true);
        
        // Update lesson progress in database
        try {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              sessionToken,
              languageId,
              lessonId: parseInt(lessonId),
              completed: true,
            }),
          });
        } catch (error) {
          console.error('Failed to update progress:', error);
        }
      }

      // Validate response structure
      if (!data || (!data.message && !data.conversationMessage && !data.systemMessage)) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid response from server');
      }

      // Process corrections into highlighted words
      const highlightedWords = data.corrections?.map((correction: any) => ({
        word: correction.originalWord,
        isError: true,
        correction: correction.correction,
        explanation: correction.explanation,
      })) || [];

      // Add new words as highlighted with their translations and romaji
      // Filter to only include words that actually appear in the message
      const messageText = data.conversationMessage || data.message || '';
      data.newWords?.forEach((word: any) => {
        const wordText = typeof word === 'string' ? word : word.word;
        const translation = typeof word === 'object' ? word.translation : '';
        const romaji = typeof word === 'object' ? word.romaji : '';
        
        // Skip words not present in the actual message
        if (!messageText.includes(wordText)) {
          console.warn(`Skipping word "${wordText}" - not found in message: "${messageText}"`);
          return;
        }
        
        // ✅ Skip words the student has already used (timesUsed > 0)
        const wordBankEntry = wordBankData.find((w: any) => w.word === wordText);
        if (wordBankEntry && wordBankEntry.timesUsed && wordBankEntry.timesUsed > 0) {
          console.log(`Skipping word "${wordText}" - student already used it ${wordBankEntry.timesUsed} times`);
          return;
        }
        
        // ✅ Skip words with invalid/placeholder translations
        if (!translation || 
            translation === '[check dictionary]' || 
            translation === '[translation needed]' ||
            translation === 'unknown') {
          console.warn(`Skipping word "${wordText}" - invalid translation: "${translation}"`);
          return;
        }
        
        // Build explanation with translation and romaji
        let explanation = '';
        if (romaji && translation) {
          explanation = `${romaji} - ${translation}`;
        } else if (translation) {
          explanation = translation;
        } else if (romaji) {
          explanation = romaji;
        } else {
          explanation = `New vocabulary word: ${wordText}`;
        }
        
        highlightedWords.push({
          word: wordText,
          isNew: true,
          explanation: explanation,
          translation: translation,
          romaji: romaji,
        });
      });

      const newMessages: Message[] = [];

      // ✅ Add system message FIRST (immediate feedback about student's message)
      if (data.systemMessage) {
        newMessages.push({
          id: `sys-${Date.now()}`,
          text: data.systemMessage,
          sender: 'system',
          timestamp: new Date(),
          messageType: 'system',
        });
      }

      // ✅ Add conversation message AFTER (AI's response to continue conversation)
      if (data.conversationMessage || data.message) {
        newMessages.push({
          id: (Date.now() + 1).toString(),
          text: data.conversationMessage || data.message,
          sender: 'ai',
          timestamp: new Date(),
          messageType: 'conversation',
          highlightedWords: highlightedWords.length > 0 ? highlightedWords : undefined,
        });
      }

      setMessages(prev => [...prev, ...newMessages]);
      
      // ✅ ALWAYS refresh word bank after AI response (words are stored server-side even if not reported)
      console.log('🔄 Forcing word bank refresh after AI response...');
      setWordBankVersion(prev => prev + 1);
      
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback response on error
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }
  };

  const handleWordHover = async (word: string, event: React.MouseEvent<HTMLSpanElement>) => {
    // Use cached word bank data for instant lookup
    console.log('Hover triggered for word:', word, '| Word bank size:', wordBankData.length);
    
    try {
      // First, try exact match
      let wordData = wordBankData.find((w: any) => w.word === word);
      
      console.log('Exact match result:', wordData ? `Found: ${wordData.word}` : 'Not found');
      
      // If not found and word is long enough, try to find if it contains known words
      if (!wordData && word.length > 1) {
        console.log('Trying substring matching...');
        // For Japanese, try to find the longest matching substring
        for (let len = word.length; len > 0; len--) {
          for (let start = 0; start <= word.length - len; start++) {
            const substring = word.substring(start, start + len);
            wordData = wordBankData.find((w: any) => w.word === substring);
            if (wordData) {
              console.log(`Substring match found: "${substring}" from "${word}"`);
              word = substring; // Use the matched substring
              break;
            }
          }
          if (wordData) break;
        }
      }

      // ✅ Skip words with null/empty translations or placeholders
      const hasValidTranslation = wordData?.translation && 
                                   wordData.translation !== '[check dictionary]' &&
                                   wordData.translation !== '[translation needed]' &&
                                   wordData.translation !== 'unknown';
      
      if (wordData && hasValidTranslation) {
        console.log('Showing tooltip:', { word, translation: wordData.translation, romaji: wordData.romaji });
        const rect = event.currentTarget.getBoundingClientRect();
        setHoveredWord({
          word: word,
          translation: wordData.translation || '',
          romaji: wordData.romaji || undefined,
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }
    } catch (error) {
      console.error('Failed to lookup word:', error);
    }
  };

  const handleWordLeave = () => {
    setHoveredWord(null);
  };

  const handleExit = () => {
    router.push(`/course/${languageId}`);
  };

  if (!language || !lesson) {
    return null;
  }

  if (lessonType === 'voice') {
    return router.push(`/lesson/${languageId}/${lessonId}/voice`);
  }

  return (
    <div className="min-h-screen bg-lapis-900 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-lapis border-b border-lapis-700 px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <h1 className="text-sm font-semibold truncate flex-1 text-white">
            {lesson.title}
          </h1>
          <button
            onClick={() => setShowExitModal(true)}
            className="ml-4 p-2 text-lapis-900 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-screen-xl mx-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'system' || message.messageType === 'system'
                ? 'justify-center' 
                : message.sender === 'user' 
                  ? 'justify-end' 
                  : 'justify-start'
            }`}
          >
            {message.sender === 'system' || message.messageType === 'system' ? (
              // System message - center-aligned, no stem
              <div className="max-w-[85%] bg-orange/10 border border-orange/30 rounded-2xl px-4 py-3 text-center">
                <p className="text-sm text-orange whitespace-pre-line">{message.text}</p>
              </div>
            ) : (
              // Regular conversation bubbles
              <div className="relative max-w-[75%]">
                <div
                  className={`${
                    message.sender === 'user'
                      ? 'bg-indigo-dye text-white'
                      : 'bg-white text-indigo-dye border border-lapis-300'
                  } px-4 py-3 relative`}
                  style={{
                    borderRadius: message.sender === 'user' 
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px'
                  }}
              >
              {message.sender === 'ai' && lessonType === 'text' ? (
                // For AI messages, make all words hoverable with translations
                <div>
                  {(() => {
                    const hasSpaces = message.text.includes(' ');
                    
                    if (!hasSpaces) {
                      // Japanese/Chinese/Korean - no spaces
                      // Strategy: Split into characters, but group highlighted words
                      let remainingText = message.text;
                      const segments: Array<{ text: string; highlighted?: any }> = [];
                      
                      // Sort highlighted words by length (longest first) to avoid partial matches
                      const sortedHighlights = [...(message.highlightedWords || [])].sort(
                        (a, b) => (b.word?.length || 0) - (a.word?.length || 0)
                      );
                      
                      // Build segments by finding highlighted words
                      while (remainingText.length > 0) {
                        let found = false;
                        
                        for (const hw of sortedHighlights) {
                          const wordIndex = remainingText.indexOf(hw.word);
                          if (wordIndex === 0) {
                            // Found a highlighted word at the start
                            segments.push({ text: hw.word, highlighted: hw });
                            remainingText = remainingText.substring(hw.word.length);
                            found = true;
                            break;
                          }
                        }
                        
                        if (!found) {
                          // No highlighted word at start
                          // Find the next highlighted word position
                          const nextHighlightIndex = sortedHighlights
                            .map(hw => remainingText.indexOf(hw.word))
                            .filter(idx => idx > 0)
                            .sort((a, b) => a - b)[0];
                          
                          if (nextHighlightIndex > 0) {
                            // Take text up to next highlight as unhighlighted
                            segments.push({ text: remainingText.substring(0, nextHighlightIndex) });
                            remainingText = remainingText.substring(nextHighlightIndex);
                          } else {
                            // No more highlights, take rest as unhighlighted
                            segments.push({ text: remainingText });
                            remainingText = '';
                          }
                        }
                      }
                      
                      // Render segments - ALL with hover AND underline
                      return segments.map((segment, idx) => {
                        if (segment.highlighted) {
                          // New word - green background + underline + hover
                          const hw = segment.highlighted;
                          return (
                            <span
                              key={idx}
                              onMouseEnter={(e) => handleWordHover(hw.word, e)}
                              onMouseLeave={handleWordLeave}
                              className="bg-green-900 text-green-500 px-1 cursor-pointer hover:bg-green-800 rounded border-b-2 border-dotted border-green-700"
                              style={{ textDecoration: 'none' }}
                            >
                              {segment.text}
                            </span>
                          );
                        } else {
                          // Regular text - make each character hoverable with underline
                          // Split into individual characters for granular hover
                          return segment.text.split('').map((char, charIdx) => {
                            // Skip punctuation and spaces
                            if (/[\s、。！？「」『』（）]/.test(char)) {
                              return <span key={`${idx}-${charIdx}`}>{char}</span>;
                            }
                            
                            return (
                              <span
                                key={`${idx}-${charIdx}`}
                                onMouseEnter={(e) => {
                                  // For single characters, try to find word in database
                                  handleWordHover(char, e);
                                }}
                                onMouseLeave={handleWordLeave}
                                className="cursor-help border-b border-dotted border-lapis-400 hover:border-sky-500"
                                style={{ textDecoration: 'none' }}
                              >
                                {char}
                              </span>
                            );
                          });
                        }
                      });
                    } else {
                      // Space-separated language (English, Spanish, etc.)
                      return message.text.split(' ').map((word, idx) => {
                        const cleanWord = word.replace(/[.,!?;:]/g, '');
                        if (cleanWord.length < 2) return <span key={idx}>{word} </span>;
                        
                        // Check if this word is highlighted
                        const highlighted = message.highlightedWords?.find(hw => 
                          hw.word.toLowerCase() === cleanWord.toLowerCase()
                        );
                        
                        if (highlighted) {
                          // New word - green background + underline
                          return (
                            <span
                              key={idx}
                              onMouseEnter={(e) => handleWordHover(cleanWord, e)}
                              onMouseLeave={handleWordLeave}
                              className="bg-green-900 text-green-500 px-1 cursor-pointer hover:bg-green-800 rounded border-b-2 border-dotted border-green-700"
                              style={{ textDecoration: 'none' }}
                            >
                              {word}{' '}
                            </span>
                          );
                        }
                        
                        // Old/known word - underline only
                        return (
                          <span
                            key={idx}
                            onMouseEnter={(e) => handleWordHover(cleanWord, e)}
                            onMouseLeave={handleWordLeave}
                            className="cursor-help border-b border-dotted border-lapis-400 hover:border-sky-500"
                            style={{ textDecoration: 'none' }}
                          >
                            {word}{' '}
                          </span>
                        );
                      });
                    }
                  })()}
                </div>
              ) : (
                <div>{message.text}</div>
              )}
              </div>
              </div>
            )}
          </div>
        ))}

        {/* Word hover tooltip */}
        {hoveredWord && (
          <div
            className="fixed z-50 bg-indigo-dye text-white px-3 py-2 rounded-lg shadow-xl border-2 border-lapis text-sm"
            style={{
              left: `${hoveredWord.x}px`,
              top: `${hoveredWord.y - 70}px`, // Increased offset to appear above word
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              maxWidth: '250px',
            }}
          >
            <div className="font-bold text-sky">{hoveredWord.word}</div>
            {hoveredWord.romaji && (
              <div className="text-lapis-700 text-xs italic mt-0.5">{hoveredWord.romaji}</div>
            )}
            {hoveredWord.translation && (
              <div className="text-white mt-1">{hoveredWord.translation}</div>
            )}
            {/* Arrow pointing down */}
            <div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
              style={{
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #094074', // indigo-dye color
              }}
            />
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-lapis-300 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-lapis-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-lapis-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-lapis-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-lapis-300 border-t border-lapis-500 px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-lapis-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="w-10 h-10 bg-orange text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:bg-lapis-700 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Lesson Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-2 text-green-600">Lesson Complete!</h3>
            <p className="text-gray-600 mb-6">
              Congratulations! You've successfully completed this lesson.
            </p>
            <button
              onClick={handleExit}
              className="w-full px-4 py-3 bg-orange text-white rounded-lg hover:bg-orange-600 font-semibold"
            >
              Continue to Course
            </button>
          </div>
        </div>
      )}

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Exit Lesson?</h3>
            <p className="text-gray-600 mb-6">
              Your progress will be saved. Are you sure you want to exit?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
