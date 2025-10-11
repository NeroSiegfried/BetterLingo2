'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/lib/lessons';

interface LessonRoadmapProps {
  lessons: Lesson[];
  languageId: string;
}

export default function LessonRoadmap({ lessons, languageId }: LessonRoadmapProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [buttonPositions, setButtonPositions] = useState<{ x: number; y: number }[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(-1);

  useEffect(() => {
    // Calculate button positions after render
    const positions = buttonRefs.current.map(ref => {
      if (!ref || !containerRef.current) return { x: 0, y: 0 };
      // Get the circular button div (first child of button)
      const circleDiv = ref.querySelector('.w-16.h-16.rounded-full') as HTMLElement;
      if (!circleDiv) return { x: 0, y: 0 };
      
      const circleRect = circleDiv.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      return {
        x: circleRect.left - containerRect.left + circleRect.width / 2,
        y: circleRect.top - containerRect.top + circleRect.height / 2,
      };
    });
    setButtonPositions(positions);

    // Find and scroll to current lesson
    const currentIndex = lessons.findIndex(l => l.status === 'current');
    setCurrentLessonIndex(currentIndex);
    
    if (currentIndex !== -1 && buttonRefs.current[currentIndex]) {
      buttonRefs.current[currentIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [lessons]);

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.status !== 'locked') {
      router.push(`/lesson/${languageId}/${lesson.id}?type=${lesson.type}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green border-green-600';
      case 'current':
        return 'bg-orange border-orange-600';
      case 'locked':
        return 'bg-lapis-400 border-lapis-500';
      default:
        return 'bg-lapis-400 border-lapis-500';
    }
  };

  return (
    <div className="relative py-8 px-4 max-w-md mx-auto" ref={containerRef}>
      {/* Curved lines layer - BEHIND buttons */}
      <svg 
        className="absolute left-0 top-0 w-full pointer-events-none"
        style={{ height: '100%', zIndex: 0, overflow: 'visible' }}
      >
        {buttonPositions.length > 0 && lessons.map((lesson, index) => {
          if (index === lessons.length - 1) return null;
          
          // Find the current lesson index
          const currentIndex = lessons.findIndex(l => l.status === 'current');
          // Line is orange up to and including the current lesson, dark blue after
          const strokeColor = (index < currentIndex) ? '#fe9000' : '#305478';
          
          // Use measured positions from DOM
          const startX = buttonPositions[index].x;
          const startY = buttonPositions[index].y;
          const endX = buttonPositions[index + 1].x;
          const endY = buttonPositions[index + 1].y;
          
          const horizontalDistance = Math.abs(endX - startX);
          const verticalDistance = endY - startY;
          
          const isStartLeft = index % 2 === 0;
          const isEndLeft = (index + 1) % 2 === 0;
          
          // Cubic bezier control points for hyperbolic curve
          const horizontalPull = horizontalDistance * 0.2;
          const verticalOffset = verticalDistance * 0.45;
          
          const controlX1 = isStartLeft ? startX + horizontalPull : startX - horizontalPull;
          const controlY1 = startY + verticalOffset;
          const controlX2 = isEndLeft ? endX + horizontalPull : endX - horizontalPull;
          const controlY2 = endY - verticalOffset;
          
          return (
            <path
              key={`curve-${index}`}
              d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
              stroke={strokeColor}
              strokeWidth="3"
              strokeDasharray="8,8"
              fill="none"
            />
          );
        })}
      </svg>

      {/* Lessons container */}
      <div className="relative" style={{ zIndex: 1 }}>
        {lessons.map((lesson, index) => {
          const isLeft = index % 2 === 0;
          const isCurrent = lesson.status === 'current';
          
          return (
            <div
              key={lesson.id}
              className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}
              style={{ 
                paddingLeft: isLeft ? '28px' : '0',
                paddingRight: isLeft ? '0' : '28px',
                marginBottom: index === lessons.length - 1 ? '0' : '56px'
              }}
            >
              <button
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                onClick={() => handleLessonClick(lesson)}
                disabled={lesson.status === 'locked'}
                className={`flex flex-col items-center ${
                  lesson.status === 'locked' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${getStatusColor(
                    lesson.status
                  )} shadow-lg transition-transform hover:scale-110`}
                >
                  {lesson.type === 'checkpoint' ? (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-2xl font-bold text-white">{lesson.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center max-w-[120px]">
                  <div className="font-semibold text-sm text-indigo-dye">{lesson.title}</div>
                  {lesson.scenario && (
                    <div className="text-xs text-lapis-600 mt-1">{lesson.scenario}</div>
                  )}
                  {lesson.type !== 'checkpoint' && (
                    <div className="text-xs text-lapis-500 mt-1">
                      {lesson.type === 'text' ? 'Text Chat' : 'Voice Chat'}
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
