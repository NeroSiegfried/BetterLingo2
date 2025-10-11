'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function ProfilePage() {
  const router = useRouter();
  // Get languageId from localStorage or use a default
  const languageId = typeof window !== 'undefined' ? localStorage.getItem('currentLanguage') || 'english' : 'english';

  const handleLogout = () => {
    // TODO: Implement actual logout
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-lapis-900 pb-20">
      {/* Top Navbar */}
      <nav className="bg-lapis border-b border-indigo-dye px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center justify-center">
          <h1 className="text-lg font-bold text-white">Profile</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* User Info */}
          <div className="bg-white rounded-lg p-6 border border-lapis-400">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-20 h-20 bg-indigo-dye rounded-full flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>
              <div>
                <h2 className="text-xl font-bold text-indigo-dye">John Doe</h2>
                <p className="text-lapis-500">john.doe@example.com</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg p-6 border border-lapis-400">
            <h3 className="text-lg font-semibold mb-4 text-indigo-dye">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-900 rounded-lg border border-orange">
                <div className="text-3xl font-bold text-orange">12</div>
                <div className="text-sm text-indigo-dye">Day Streak</div>
              </div>
              <div className="text-center p-4 bg-green-900 rounded-lg border border-green">
                <div className="text-3xl font-bold text-green">45</div>
                <div className="text-sm text-indigo-dye">Lessons Completed</div>
              </div>
              <div className="text-center p-4 bg-lapis-800 rounded-lg border border-lapis-600">
                <div className="text-3xl font-bold text-lapis">238</div>
                <div className="text-sm text-indigo-dye">Words Learned</div>
              </div>
              <div className="text-center p-4 bg-indigo-dye-900 rounded-lg border border-indigo-dye-700">
                <div className="text-3xl font-bold text-indigo-dye">18h</div>
                <div className="text-sm text-lapis-500">Practice Time</div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg divide-y divide-gray-200">
            <button className="w-full px-6 py-4 text-left hover:bg-gray-50">
              <div className="font-medium">Account Settings</div>
            </button>
            <button className="w-full px-6 py-4 text-left hover:bg-gray-50">
              <div className="font-medium">Notification Preferences</div>
            </button>
            <button className="w-full px-6 py-4 text-left hover:bg-gray-50">
              <div className="font-medium">Privacy Settings</div>
            </button>
            <button className="w-full px-6 py-4 text-left hover:bg-gray-50">
              <div className="font-medium">Help & Support</div>
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 mb-4"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Bottom Navbar */}
      <BottomNav languageId={languageId} />
    </div>
  );
}
