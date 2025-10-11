'use client';

import { useRouter } from 'next/navigation';
import { languages } from '@/lib/languages';

export default function CoursesPage() {
  const router = useRouter();

  const handleLanguageSelect = (languageId: string) => {
    router.push(`/skill-level?language=${languageId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lapis-900 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-12 text-indigo-dye">Courses</h1>
        
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-6 px-4 min-w-min justify-center">
            {languages.map((language) => (
              <button
                key={language.id}
                onClick={() => handleLanguageSelect(language.id)}
                className="flex flex-col items-center group flex-shrink-0"
              >
                <div className="w-20 h-20 rounded-full border-2 border-lapis-400 hover:border-orange transition-colors shadow-sm overflow-hidden">
                  <img 
                    src={language.flagUrl} 
                    alt={`${language.name} flag`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="mt-2 text-sm font-medium text-lapis-500 group-hover:text-orange">
                  {language.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
