'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { languages } from '@/lib/languages';
import { getLessonsForCourse } from '@/lib/lessons';

export default function VoiceLessonPage({ params }: { params: { languageId: string; lessonId: string } }) {
  const router = useRouter();
  const { languageId, lessonId } = params;
  
  const language = languages.find(lang => lang.id === languageId);
  const lessons = getLessonsForCourse(languageId, 'beginner');
  const lesson = lessons.find(l => l.id === parseInt(lessonId));
  
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [audioLevels, setAudioLevels] = useState([20, 30, 25, 35, 28]);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!language || !lesson) {
      router.push(`/course/${languageId}`);
    }
  }, [language, lesson, router, languageId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAISpeaking) {
      interval = setInterval(() => {
        setAudioLevels(prev => prev.map(() => Math.random() * 60 + 20));
      }, 100);
    } else {
      setAudioLevels([20, 30, 25, 35, 28]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAISpeaking]);

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearTimeout(recordingTimer);
      }
    };
  }, [recordingTimer]);

  const handleMicToggle = () => {
    if (isRecording) {
      // Stop recording manually
      setIsRecording(false);
      if (recordingTimer) {
        clearTimeout(recordingTimer);
        setRecordingTimer(null);
      }
      
      // Wait a short moment before AI starts speaking
      setTimeout(() => {
        setIsAISpeaking(true);
        
        // Simulate AI response
        setTimeout(() => {
          setIsAISpeaking(false);
        }, 3000);
      }, 500);
    } else {
      // Start recording
      setIsRecording(true);
      
      // Auto-stop recording after 10 seconds
      const timer = setTimeout(() => {
        setIsRecording(false);
        setRecordingTimer(null);
        
        // Wait a short moment before AI starts speaking
        setTimeout(() => {
          setIsAISpeaking(true);
          
          // Simulate AI response
          setTimeout(() => {
            setIsAISpeaking(false);
          }, 3000);
        }, 500);
      }, 10000);
      
      setRecordingTimer(timer);
    }
  };

  const handleExit = () => {
    router.push(`/course/${languageId}`);
  };

  if (!language || !lesson) {
    return null;
  }

  return (
    <div className="min-h-screen bg-lapis-900 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-lapis border-b border-indigo-dye px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <h1 className="text-sm font-semibold truncate flex-1 text-white">
            {lesson.scenario || lesson.title}
          </h1>
          <button
            onClick={() => setShowExitModal(true)}
            className="ml-4 p-2 text-lapis-900 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Content - Audio Visualizer */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex items-center justify-center space-x-2 h-20">
          {audioLevels.map((level, index) => (
            <div
              key={index}
              className={`w-4 rounded-full transition-all duration-300 ${
                isAISpeaking ? 'bg-orange' : 'bg-indigo-dye'
              }`}
              style={{ 
                height: `${isAISpeaking ? level : 20}px`,
                alignSelf: 'center'
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navbar Area */}
      <div className="relative bg-lapis-300 border-t border-lapis-500">
        <div className="h-24 flex flex-col items-center justify-end pb-4">
          <p className="text-sm text-white font-medium">
            {isRecording ? 'Listening...' : isAISpeaking ? 'AI is speaking...' : 'Tap to speak'}
          </p>
        </div>
        
        {/* Microphone button - positioned at top edge of navbar, half above/half below */}
        <div className="absolute left-1/2 top-0 pointer-events-auto" style={{ transform: 'translate(-50%, -50%)', zIndex: 20 }}>
          <button
            onClick={handleMicToggle}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-orange hover:bg-orange-600 animate-pulse'
                : 'bg-indigo-dye hover:bg-indigo-dye-600'
            } text-white shadow-lg`}
          >
            {isRecording ? (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <rect x="6" y="6" width="8" height="8" rx="1" />
              </svg>
            ) : (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-lapis-400">
            <h3 className="text-lg font-semibold mb-2 text-indigo-dye">Exit Lesson?</h3>
            <p className="text-lapis-500 mb-6">
              Your progress will be saved. Are you sure you want to exit?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 px-4 py-2 border border-lapis-400 rounded-lg hover:bg-lapis-900 text-indigo-dye"
              >
                Cancel
              </button>
              <button
                onClick={handleExit}
                className="flex-1 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange-600"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
