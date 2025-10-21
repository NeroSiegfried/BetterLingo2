'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { languages } from '@/lib/languages';
import { getLessonsForCourse, Lesson } from '@/lib/lessons';
import CourseDropdown from '@/components/CourseDropdown';
import BottomNav from '@/components/BottomNav';
import LessonRoadmap from '@/components/LessonRoadmap';

export default function CoursePage({ params }: { params: { languageId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { languageId } = params;
  const level = searchParams.get('level') || 'beginner';
  
  const language = languages.find(lang => lang.id === languageId);
  
  const [userCourses, setUserCourses] = useState<string[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>(getLessonsForCourse(languageId, level));
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to force refresh

  useEffect(() => {
    if (!language) {
      router.push('/courses');
    }
  }, [language, router]);

  // Refetch progress when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      console.log('Page focused, refreshing progress...');
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    // Fetch user courses from API
    const fetchCourses = async () => {
      try {
        const sessionData = localStorage.getItem('session');
        if (!sessionData) return;

        const session = JSON.parse(sessionData);
        const sessionToken = session.session.token;

        const response = await fetch('/api/courses', {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const courseIds = data.courses.map((c: any) => c.languageId);
          setUserCourses(courseIds);

          // Enroll in current language if not already enrolled
          if (!courseIds.includes(languageId)) {
            await fetch('/api/courses', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
              },
              body: JSON.stringify({ languageId, level }),
            });
            setUserCourses([...courseIds, languageId]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, [languageId, level]);

  useEffect(() => {
    // Fetch lesson progress from API
    const fetchProgress = async () => {
      try {
        const sessionData = localStorage.getItem('session');
        if (!sessionData) {
          setLoading(false);
          return;
        }

        const session = JSON.parse(sessionData);
        const sessionToken = session.session.token;

        const response = await fetch(`/api/progress/${languageId}`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Progress data received:', data);
          const completedLessonIds = data.progress
            .filter((p: any) => p.status === 'completed')
            .map((p: any) => p.lessonId);

          console.log('Completed lesson IDs:', completedLessonIds);

          // Update lesson statuses based on progress
          const baseLessons = getLessonsForCourse(languageId, level);
          const updatedLessons = baseLessons.map((lesson, index) => {
            if (completedLessonIds.includes(lesson.id)) {
              return { ...lesson, status: 'completed' as const };
            } else if (index === 0 || completedLessonIds.includes(baseLessons[index - 1].id)) {
              // First lesson OR previous lesson is completed
              return { ...lesson, status: 'current' as const };
            } else {
              return { ...lesson, status: 'locked' as const };
            }
          });

          console.log('Updated lessons:', updatedLessons.map(l => ({ id: l.id, title: l.title, status: l.status })));
          setLessons(updatedLessons);
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [languageId, level, refreshTrigger]); // Add refreshTrigger as dependency

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
