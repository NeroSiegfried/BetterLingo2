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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [silenceTimer, audioContext]);

  const handleMicToggle = async () => {
    if (isRecording) {
      // Stop recording manually
      setIsRecording(false);
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      
      // Stop the media recorder
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      
      // Close audio context
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          
          // Send to API
          await sendAudioToAPI(audioBlob);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        
        // ✅ Set up silence detection instead of fixed timer
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        
        setAudioContext(context);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let silenceStart = Date.now();
        const SILENCE_THRESHOLD = 10; // Volume threshold (0-255)
        const SILENCE_DURATION = 2000; // Stop after 2 seconds of silence
        
        const checkAudioLevel = () => {
          if (!recorder || recorder.state === 'inactive') return;
          
          analyser.getByteTimeDomainData(dataArray);
          
          // Calculate average volume
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            const value = Math.abs(dataArray[i] - 128);
            sum += value;
          }
          const average = sum / bufferLength;
          
          if (average < SILENCE_THRESHOLD) {
            // Silence detected
            if (Date.now() - silenceStart > SILENCE_DURATION) {
              // Stop recording after prolonged silence
              console.log('Auto-stopping due to silence');
              if (recorder.state === 'recording') {
                recorder.stop();
              }
              setIsRecording(false);
              if (context) {
                context.close();
              }
              return;
            }
          } else {
            // Sound detected, reset silence timer
            silenceStart = Date.now();
          }
          
          // Continue checking
          const timer = setTimeout(checkAudioLevel, 100);
          setSilenceTimer(timer);
        };
        
        // Start monitoring
        checkAudioLevel();
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please grant permission.');
      }
    }
  };

  const sendAudioToAPI = async (audioBlob: Blob) => {
    try {
      // Get session from localStorage
      const sessionData = localStorage.getItem('session');
      let userId = 'demo-user';
      let sessionToken = 'demo-token';

      if (sessionData) {
        const session = JSON.parse(sessionData);
        userId = session.user.id;
        sessionToken = session.session.token;
      }

      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('languageId', languageId);
      formData.append('lessonId', lessonId);
      formData.append('userId', userId);
      formData.append('sessionToken', sessionToken);
      formData.append('conversationHistory', JSON.stringify(conversationHistory));

      // Wait a short moment before showing AI speaking state
      setTimeout(() => {
        setIsAISpeaking(true);
      }, 500);

      // Call API
      const response = await fetch('/api/llm/voice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process voice input');
      }

      const data = await response.json();

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: data.userText },
        { role: 'assistant', content: data.message },
      ]);

      // Speak the response using browser TTS with proper language code
      const utterance = new SpeechSynthesisUtterance(data.message);
      utterance.lang = language?.voiceCode || 'en-US'; // Use the proper voice code for the language
      utterance.rate = 0.9; // Slightly slower for learners
      utterance.onend = () => {
        setIsAISpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error processing voice input:', error);
      setIsAISpeaking(false);
      alert('Error processing voice input. Please try again.');
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
