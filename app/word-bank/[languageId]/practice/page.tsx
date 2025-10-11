'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { languages } from '@/lib/languages';

interface MatchPair {
  id: string;
  word: string;
  translation: string;
}

export default function WordPracticePage({ params }: { params: { languageId: string } }) {
  const router = useRouter();
  const { languageId } = params;
  const language = languages.find(lang => lang.id === languageId);

  const words: MatchPair[] = [
    { id: '1', word: 'Hello', translation: 'Hola' },
    { id: '2', word: 'Goodbye', translation: 'Adiós' },
    { id: '3', word: 'Coffee', translation: 'Café' },
    { id: '4', word: 'Water', translation: 'Agua' },
    { id: '5', word: 'Please', translation: 'Por favor' },
  ];

  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Shuffle and set up the game
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    const shuffledTranslations = [...words].sort(() => Math.random() - 0.5);
    
    setLeftItems(shuffledWords.map(w => w.id));
    setRightItems(shuffledTranslations.map(w => w.id));
  }, []);

  const handleLeftClick = (id: string) => {
    if (matches.has(id)) return;
    setSelectedLeft(id);
    if (selectedRight) {
      checkMatch(id, selectedRight);
    }
  };

  const handleRightClick = (id: string) => {
    if (matches.has(id)) return;
    setSelectedRight(id);
    if (selectedLeft) {
      checkMatch(selectedLeft, id);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      setMatches(prev => {
        const newSet = new Set(prev);
        newSet.add(leftId);
        return newSet;
      });
      setScore(prev => prev + 1);
      setSelectedLeft(null);
      setSelectedRight(null);
      
      if (matches.size + 1 === words.length) {
        setTimeout(() => {
          alert('Congratulations! You matched all words!');
          router.push(`/word-bank/${languageId}`);
        }, 500);
      }
    } else {
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 1000);
    }
  };

  const getWord = (id: string) => words.find(w => w.id === id)?.word || '';
  const getTranslation = (id: string) => words.find(w => w.id === id)?.translation || '';

  if (!language) {
    return null;
  }

  return (
    <div className="min-h-screen bg-lapis-900 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-lapis border-b border-indigo-dye px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/word-bank/${languageId}`)}
            className="p-2 text-lapis-900 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">Match the Words</h1>
          <div className="w-10"></div>
        </div>
      </nav>

      {/* Score */}
      <div className="bg-lapis-300 px-4 py-3 text-center">
        <p className="text-sm text-indigo-dye">
          Score: <span className="font-bold text-orange">{score}</span> / {words.length}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              {leftItems.map((id) => (
                <button
                  key={`left-${id}`}
                  onClick={() => handleLeftClick(id)}
                  disabled={matches.has(id)}
                  className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-all ${
                    matches.has(id)
                      ? 'bg-green-800 border-green text-indigo-dye opacity-50'
                      : selectedLeft === id
                      ? 'bg-orange-900 border-orange text-indigo-dye'
                      : 'bg-white border-lapis-400 text-indigo-dye hover:border-lapis-600'
                  }`}
                >
                  {getWord(id)}
                </button>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {rightItems.map((id) => (
                <button
                  key={`right-${id}`}
                  onClick={() => handleRightClick(id)}
                  disabled={matches.has(id)}
                  className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-all ${
                    matches.has(id)
                      ? 'bg-green-800 border-green text-indigo-dye opacity-50'
                      : selectedRight === id
                      ? 'bg-orange-900 border-orange text-indigo-dye'
                      : 'bg-white border-lapis-400 text-indigo-dye hover:border-lapis-600'
                  }`}
                >
                  {getTranslation(id)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-lapis-500">
            <p>Tap a word on the left, then its translation on the right</p>
          </div>
        </div>
      </div>
    </div>
  );
}
