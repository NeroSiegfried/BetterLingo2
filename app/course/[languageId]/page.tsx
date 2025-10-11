'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { languages } from '@/lib/languages';
import { getLessonsForCourse } from '@/lib/lessons';
import CourseDropdown from '@/components/CourseDropdown';
import BottomNav from '@/components/BottomNav';
import LessonRoadmap from '@/components/LessonRoadmap';

export default function CoursePage({ params }: { params: { languageId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { languageId } = params;
  const level = searchParams.get('level') || 'beginner';
  
  const language = languages.find(lang => lang.id === languageId);
  
  // Get user courses from localStorage, add current language if not present
  const [userCourses, setUserCourses] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userCourses');
      const courses = stored ? JSON.parse(stored) : [];
      if (!courses.includes(languageId)) {
        courses.push(languageId);
        localStorage.setItem('userCourses', JSON.stringify(courses));
      }
      // Store current language for navigation
      localStorage.setItem('currentLanguage', languageId);
      return courses;
    }
    return [languageId];
  });
  
  const lessons = getLessonsForCourse(languageId, level);

  useEffect(() => {
    if (!language) {
      router.push('/courses');
    }
  }, [language, router]);

  if (!language) {
    return null;
  }

  const handleCourseSelect = (newLanguageId: string) => {
    router.push(`/course/${newLanguageId}?level=${level}`);
  };

  const handleAddCourse = () => {
    router.push('/courses');
  };

  return (
    <div className="min-h-screen bg-lapis-900 pb-20">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-lapis border-b border-lapis-700 px-4 py-3 z-30">
        <div className="max-w-screen-xl mx-auto flex items-center justify-center relative">
          <div className="absolute left-0">
            <CourseDropdown
              currentLanguage={language}
              userCourses={userCourses}
              onCourseSelect={handleCourseSelect}
              onAddCourse={handleAddCourse}
            />
          </div>
          <h1 className="text-lg font-bold uppercase tracking-wide text-white">
            {language.name}
          </h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <LessonRoadmap lessons={lessons} languageId={languageId} />
      </div>

      {/* Bottom Navbar */}
      <BottomNav languageId={languageId} />
    </div>
  );
}
