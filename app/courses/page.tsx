'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { languages } from '@/lib/languages';

export default function CoursesPage() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const sessionData = localStorage.getItem('session');
      if (!sessionData) {
        // Not logged in - show all courses
        setEnrolledCourses([]);
        setLoading(false);
        return;
      }

      const session = JSON.parse(sessionData);
      const response = await fetch('/api/courses', {
        headers: {
          'Authorization': `Bearer ${session.session.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.courses.map((c: any) => c.languageId));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = async (languageId: string) => {
    // Check if already enrolled
    if (enrolledCourses.includes(languageId)) {
      router.push(`/course/${languageId}`);
      return;
    }

    // Enroll in course
    const sessionData = localStorage.getItem('session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ languageId, level: 'beginner' }),
        });
      } catch (error) {
        console.error('Error enrolling in course:', error);
      }
    }

    router.push(`/skill-level?language=${languageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lapis-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange"></div>
      </div>
    );
  }

  // Separate enrolled and available courses
  const enrolled = languages.filter(lang => enrolledCourses.includes(lang.id));
  const available = languages.filter(lang => !enrolledCourses.includes(lang.id));

  return (
    <div className="min-h-screen bg-lapis-900 px-4 py-8">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12 text-white">My Courses</h1>
        
        {/* Enrolled Courses */}
        {enrolled.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-lapis-300 mb-6">Continue Learning</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {enrolled.map((language) => (
                <button
                  key={language.id}
                  onClick={() => handleLanguageSelect(language.id)}
                  className="flex flex-col items-center group"
                >
                  <div className="w-24 h-24 rounded-full border-4 border-orange shadow-lg overflow-hidden hover:scale-105 transition-transform">
                    <img 
                      src={language.flagUrl} 
                      alt={`${language.name} flag`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="mt-3 text-sm font-medium text-white">
                    {language.name}
                  </span>
                  <span className="text-xs text-orange">In Progress</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses */}
        {available.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-lapis-300 mb-6">
              {enrolled.length > 0 ? 'Explore More' : 'Choose a Language'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {available.map((language) => (
                <button
                  key={language.id}
                  onClick={() => handleLanguageSelect(language.id)}
                  className="flex flex-col items-center group"
                >
                  <div className="w-24 h-24 rounded-full border-2 border-lapis-400 hover:border-orange transition-colors shadow-sm overflow-hidden">
                    <img 
                      src={language.flagUrl} 
                      alt={`${language.name} flag`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="mt-3 text-sm font-medium text-lapis-300 group-hover:text-orange transition-colors">
                    {language.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
