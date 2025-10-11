'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { languages } from '@/lib/languages';
import { getLessonsForCourse } from '@/lib/lessons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  highlightedWords?: { word: string; isNew?: boolean; isError?: boolean; correction?: string; explanation?: string }[];
}

export default function LessonPage({ params }: { params: { languageId: string; lessonId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { languageId, lessonId } = params;
  const lessonType = searchParams.get('type') || 'text';
  
  const language = languages.find(lang => lang.id === languageId);
  const lessons = getLessonsForCourse(languageId, 'beginner');
  const lesson = lessons.find(l => l.id === parseInt(lessonId));
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! Welcome to the lesson. Are you ready to practice?',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{ word: string; explanation: string; isError?: boolean; correction?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!language || !lesson) {
      router.push(`/course/${languageId}`);
    }
  }, [language, lesson, router, languageId]);

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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Great! Let me help you with that. Would you like to try ordering a coffee?',
        sender: 'ai',
        timestamp: new Date(),
        highlightedWords: [
          { word: 'coffee', isNew: true, explanation: 'A hot drink made from roasted beans' }
        ]
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleWordClick = (word: string, explanation: string, isError?: boolean, correction?: string) => {
    setSelectedWord({ word, explanation, isError, correction });
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
            {lesson.scenario || lesson.title}
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
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
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
              {message.highlightedWords && message.highlightedWords.length > 0 ? (
                <div>
                  {message.text.split(' ').map((word, idx) => {
                    const highlighted = message.highlightedWords?.find(hw => 
                      word.toLowerCase().includes(hw.word.toLowerCase())
                    );
                    
                    if (highlighted) {
                      return (
                        <span
                          key={idx}
                          onClick={() => handleWordClick(
                            highlighted.word,
                            highlighted.explanation || '',
                            highlighted.isError,
                            highlighted.correction
                          )}
                          className={`${
                            highlighted.isNew ? 'bg-green-800 text-indigo-dye' : 
                            highlighted.isError ? 'bg-orange-300 text-indigo-dye' : ''
                          } px-1 cursor-pointer hover:opacity-80 rounded`}
                        >
                          {word}{' '}
                        </span>
                      );
                    }
                    return <span key={idx}>{word} </span>;
                  })}
                </div>
              ) : (
                <div>{message.text}</div>
              )}
              </div>
            </div>
          </div>
        ))}

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

      {/* Word Explanation Modal */}
      {selectedWord && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedWord(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">
                {selectedWord.isError ? 'Correction' : 'New Word'}
              </h3>
              <button
                onClick={() => setSelectedWord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {selectedWord.word}
              </div>
              {selectedWord.isError && selectedWord.correction && (
                <div className="mb-2">
                  <span className="text-sm text-gray-600">Correct form: </span>
                  <span className="text-lg font-semibold text-green-600">{selectedWord.correction}</span>
                </div>
              )}
              <p className="text-gray-700">{selectedWord.explanation}</p>
            </div>
            
            <button
              onClick={() => setSelectedWord(null)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
