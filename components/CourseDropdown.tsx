'use client';

import { useState, useRef } from 'react';
import { languages, Language } from '@/lib/languages';

interface CourseDropdownProps {
  currentLanguage: Language;
  userCourses: string[]; // Array of language IDs
  onCourseSelect: (languageId: string) => void;
  onAddCourse: () => void;
}

export default function CourseDropdown({ 
  currentLanguage, 
  userCourses, 
  onCourseSelect,
  onAddCourse 
}: CourseDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sort courses by most recent first (reverse order of appearance in userCourses)
  const sortedCourses = languages
    .filter(lang => userCourses.includes(lang.id) && lang.id !== currentLanguage.id)
    .sort((a, b) => userCourses.indexOf(b.id) - userCourses.indexOf(a.id));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full border-2 border-lapis-800 hover:border-orange transition-colors overflow-hidden"
      >
        <img 
          src={currentLanguage.flagUrl} 
          alt={`${currentLanguage.name} flag`}
          className="w-full h-full object-cover"
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed left-0 right-0 top-12 z-50 flex justify-center px-4">
            <div className="bg-white rounded-lg shadow-lg border border-lapis-400 p-4 w-full max-w-screen-xl">
              <div 
                ref={scrollRef}
                className="flex justify-center space-x-3 overflow-x-auto pb-2"
              >
                {sortedCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      onCourseSelect(course.id);
                      setIsOpen(false);
                    }}
                    className="flex-shrink-0 flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded border-2 border-lapis-400 hover:border-orange transition-colors overflow-hidden relative">
                      <img 
                        src={course.flagUrl} 
                        alt={`${course.name} flag`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="mt-1 text-xs font-medium text-indigo-dye">
                      {course.name}
                    </span>
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    onAddCourse();
                    setIsOpen(false);
                  }}
                  className="flex-shrink-0 flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded bg-lapis-900 border-2 border-lapis-600 border-dashed flex items-center justify-center hover:border-orange hover:bg-orange-900 transition-colors">
                    <div className="text-3xl text-lapis-400 font-light">+</div>
                  </div>
                  <span className="mt-1 text-xs font-medium text-lapis-500">
                    Add
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
