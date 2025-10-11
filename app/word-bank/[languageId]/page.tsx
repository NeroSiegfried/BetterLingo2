'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { languages } from '@/lib/languages';
import BottomNav from '@/components/BottomNav';

interface Word {
  id: string;
  word: string;
  translation: string;
  isWeakness?: boolean;
}

export default function WordBankPage({ params }: { params: { languageId: string } }) {
  const router = useRouter();
  const { languageId } = params;
  const language = languages.find(lang => lang.id === languageId);

  // Mock word data
  const [words] = useState<Word[]>([
    { id: '1', word: 'Hello', translation: 'Hola', isWeakness: false },
    { id: '2', word: 'Goodbye', translation: 'Adiós', isWeakness: false },
    { id: '3', word: 'Coffee', translation: 'Café', isWeakness: true },
    { id: '4', word: 'Water', translation: 'Agua', isWeakness: false },
    { id: '5', word: 'Restaurant', translation: 'Restaurante', isWeakness: true },
    { id: '6', word: 'Please', translation: 'Por favor', isWeakness: false },
    { id: '7', word: 'Thank you', translation: 'Gracias', isWeakness: false },
    { id: '8', word: 'Yesterday', translation: 'Ayer', isWeakness: true },
  ]);

  const handlePronounce = (word: string) => {
    // TODO: Implement text-to-speech
    console.log('Pronouncing:', word);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = language?.countryCode === 'ES' ? 'es-ES' : 'en-US';
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
          <h2 className="text-2xl font-bold mb-6 text-indigo-dye">{words.length} words</h2>
          
          <div className="space-y-3">
            {words.map((word) => (
              <div
                key={word.id}
                className={`bg-white rounded-lg p-4 flex items-center justify-between border ${
                  word.isWeakness ? 'border-orange bg-orange-900' : 'border-lapis-400'
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-indigo-dye">{word.word}</h3>
                  <p className="text-lapis-500">{word.translation}</p>
                  {word.isWeakness && (
                    <span className="inline-block mt-1 text-xs bg-orange text-white px-2 py-1 rounded">
                      Needs practice
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
        </div>
      </div>

      {/* Practice Button Above Bottom Nav */}
      <div className="fixed left-0 right-0 bg-lapis-300 border-t border-lapis-500 px-6 py-3 z-20 flex justify-center" style={{ bottom: '64px' }}>
        <button
          onClick={handlePractice}
          className="w-full max-w-md py-3 bg-orange text-white font-semibold rounded-lg hover:bg-orange-600"
        >
          Practice
        </button>
      </div>

      {/* Bottom Navbar */}
      <BottomNav languageId={languageId} />
    </div>
  );
}
