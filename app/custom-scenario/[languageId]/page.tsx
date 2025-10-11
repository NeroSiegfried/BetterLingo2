'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { languages } from '@/lib/languages';
import BottomNav from '@/components/BottomNav';

export default function CustomScenarioPage({ params }: { params: { languageId: string } }) {
  const router = useRouter();
  const { languageId } = params;
  const language = languages.find(lang => lang.id === languageId);

  const [scenarioType, setScenarioType] = useState<'text' | 'voice'>('text');
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const topics = [
    'Travel', 'Food & Dining', 'Shopping', 'Work', 'Family',
    'Hobbies', 'Weather', 'Health', 'Transportation', 'Education'
  ];

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleStartScenario = () => {
    if (!scenarioTitle.trim()) {
      alert('Please enter a scenario title');
      return;
    }

    // TODO: Save custom scenario and navigate to lesson
    console.log({
      type: scenarioType,
      title: scenarioTitle,
      description: scenarioDescription,
      topics: selectedTopics,
    });

    // For now, redirect to a mock lesson
    router.push(`/lesson/${languageId}/999?type=${scenarioType}`);
  };

  if (!language) {
    return null;
  }

  return (
    <div className="min-h-screen bg-lapis-900 pb-24">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-lapis border-b border-indigo-dye px-4 py-3 z-30">
        <div className="max-w-screen-xl mx-auto flex items-center justify-center">
          <h1 className="text-lg font-bold text-white">Custom Scenario</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 px-4">
        <div className="max-w-2xl mx-auto py-6 space-y-6">
          
          {/* Scenario Type */}
          <div>
            <label className="block text-sm font-medium text-indigo-dye mb-2">
              Scenario Type
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setScenarioType('text')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium ${
                  scenarioType === 'text'
                    ? 'border-orange bg-orange-900 text-indigo-dye'
                    : 'border-lapis-400 bg-white text-indigo-dye'
                }`}
              >
                Text Chat
              </button>
              <button
                onClick={() => setScenarioType('voice')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium ${
                  scenarioType === 'voice'
                    ? 'border-orange bg-orange-900 text-indigo-dye'
                    : 'border-lapis-400 bg-white text-indigo-dye'
                }`}
              >
                Voice Chat
              </button>
            </div>
          </div>

          {/* Scenario Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-indigo-dye mb-2">
              Scenario Title
            </label>
            <input
              id="title"
              type="text"
              value={scenarioTitle}
              onChange={(e) => setScenarioTitle(e.target.value)}
              placeholder="e.g., Planning a vacation"
              className="w-full px-4 py-3 border border-lapis-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange bg-white text-indigo-dye"
            />
          </div>

          {/* Scenario Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-indigo-dye mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={scenarioDescription}
              onChange={(e) => setScenarioDescription(e.target.value)}
              placeholder="Describe what you want to practice..."
              rows={4}
              className="w-full px-4 py-3 border border-lapis-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange bg-white text-indigo-dye"
            />
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-indigo-dye mb-2">
              Topics (Select one or more)
            </label>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTopics.includes(topic)
                      ? 'bg-orange text-white'
                      : 'bg-white text-indigo-dye border border-lapis-400 hover:border-lapis-600'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartScenario}
            className="w-full py-3 bg-orange text-white font-semibold rounded-lg hover:bg-orange-600"
          >
            Start Practice
          </button>
        </div>
      </div>

      {/* Bottom Navbar */}
      <BottomNav languageId={languageId} />
    </div>
  );
}
