'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { languages } from '@/lib/languages';
import BottomNav from '@/components/BottomNav';

interface Word {
  id: string;
  word: string;
  translation: string | null;
  status: string;
  timesUsed: number;
  timesSeen: number;
  isWeakness?: boolean;
}

export default function WordBankPage({ params }: { params: { languageId: string } }) {
  const router = useRouter();
  const { languageId } = params;
  const language = languages.find(lang => lang.id === languageId);

  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWords();
  }, [languageId]);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const sessionData = localStorage.getItem('session');
      
      if (!sessionData) {
        setError('Please log in to view your word bank');
        setLoading(false);
        return;
      }

      const session = JSON.parse(sessionData);
      
      const response = await fetch(`/api/wordbank/${languageId}`, {
        headers: {
          'Authorization': `Bearer ${session.session.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }

      const data = await response.json();
      setWords(data.words || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching words:', err);
      setError('Failed to load word bank');
    } finally {
      setLoading(false);
    }
  };

  const handlePronounce = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = language?.voiceCode || 'en-US';
      utterance.rate = 0.8; // Slower for learning
      speechSynthesis.speak(utterance);
    }
  };

  const handlePractice = () => {
    router.push(`/word-bank/${languageId}/practice`);
  };

  if (!language) {
    return null;
  }

  return (
    <div className="min-h-screen bg-lapis-900 pb-24">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-lapis border-b border-indigo-dye px-4 py-3 z-30">
        <div className="max-w-screen-xl mx-auto flex items-center justify-center">
          <h1 className="text-lg font-bold text-white">Word Bank</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 px-4">
        <div className="max-w-2xl mx-auto py-6">
          {loading ? (
            <div className="text-center text-white py-8">Loading words...</div>
          ) : error ? (
            <div className="text-center text-orange py-8">{error}</div>
          ) : words.length === 0 ? (
            <div className="text-center text-white py-8">
              <p className="mb-4">No words yet! Start learning to build your word bank.</p>
              <button
                onClick={() => router.push(`/course/${languageId}`)}
                className="px-6 py-2 bg-orange text-white rounded-lg hover:bg-orange-600"
              >
                Start Learning
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">My Words: {words.length}</h2>
                <button
                  onClick={fetchWords}
                  className="px-4 py-2 bg-indigo-dye text-white rounded-lg hover:bg-indigo-dye-600"
                >
                  ↻ Refresh
                </button>
              </div>
              
              <div className="space-y-3">
                {words.map((word) => (
                  <div
                    key={word.id}
                    className={`bg-white rounded-lg p-4 flex items-center justify-between border-2 ${
                      word.status === 'active' ? 'border-green' : 'border-lapis-400'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-indigo-dye">{word.word}</h3>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          word.status === 'active' ? 'bg-green text-white' : 'bg-lapis-400 text-white'
                        }`}>
                          {word.status === 'active' ? '✓ Active' : '○ Passive'}
                        </span>
                      </div>
                      {word.translation && (
                        <p className="text-base text-lapis-700 mb-2">→ {word.translation}</p>
                      )}
                      <div className="flex gap-4 text-xs text-lapis-500">
                        <span>🗣 Used: {word.timesUsed}x</span>
                        <span>👁 Seen: {word.timesSeen}x</span>
                      </div>
                      {word.timesUsed === 0 && word.status === 'passive' && (
                        <span className="inline-block mt-2 text-xs bg-orange text-white px-2 py-1 rounded">
                          Try using this word!
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handlePronounce(word.word)}
                  className="ml-4 p-3 bg-lapis text-white rounded-full hover:bg-indigo-dye"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Practice Button Above Bottom Nav */}
      {words.length >= 3 && (
        <div className="fixed left-0 right-0 bg-lapis-300 border-t border-lapis-500 px-6 py-3 z-20 flex justify-center" style={{ bottom: '64px' }}>
          <button
            onClick={handlePractice}
            className="w-full max-w-md py-3 bg-orange text-white font-semibold rounded-lg hover:bg-orange-600 shadow-lg"
          >
            Practice
          </button>
        </div>
      )}

      {/* Bottom Navbar */}
      <BottomNav languageId={languageId} />
    </div>
  );
}
