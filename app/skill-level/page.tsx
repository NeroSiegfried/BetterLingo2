'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { languages } from '@/lib/languages';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export default function SkillLevelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);
  const languageId = searchParams.get('language');
  
  const language = languages.find(lang => lang.id === languageId);

  useEffect(() => {
    if (!languageId) {
      router.push('/courses');
    }
  }, [languageId, router]);

  const handleLevelSelect = (level: SkillLevel) => {
    setSelectedLevel(level);
  };

  const handleContinue = () => {
    if (selectedLevel && languageId) {
      router.push(`/course/${languageId}?level=${selectedLevel}`);
    }
  };

  if (!language) {
    return null;
  }

  const levels: { value: SkillLevel; label: string; description: string }[] = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Proficient speaker' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-lapis-900 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-12 text-indigo-dye">Skill Level</h1>
        
        <div className="space-y-4">
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => handleLevelSelect(level.value)}
              className={`w-full p-6 rounded-lg border-2 transition-all ${
                selectedLevel === level.value
                  ? 'border-orange bg-orange-900'
                  : 'border-lapis-400 bg-white hover:border-lapis-600'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                  selectedLevel === level.value
                    ? 'border-orange'
                    : 'border-lapis-400'
                }`}>
                  {selectedLevel === level.value && (
                    <div className="w-3 h-3 rounded-full bg-orange"></div>
                  )}
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-lg text-indigo-dye">{level.label}</div>
                  <div className="text-sm text-lapis-500">{level.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedLevel}
          className={`w-full mt-8 py-3 px-4 rounded-lg font-medium transition-colors ${
            selectedLevel
              ? 'bg-orange text-white hover:bg-orange-600'
              : 'bg-lapis-700 text-lapis-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
