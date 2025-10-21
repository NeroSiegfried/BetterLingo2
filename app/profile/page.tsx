'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

interface UserStats {
  totalWords: number;
  activeWords: number;
  passiveWords: number;
  lessonsCompleted: number;
}

export default function ProfilePage() {
  const router = useRouter();
  // Get languageId from localStorage or use a default
  const languageId = typeof window !== 'undefined' ? localStorage.getItem('currentLanguage') || 'english' : 'english';
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({
    totalWords: 0,
    activeWords: 0,
    passiveWords: 0,
    lessonsCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const sessionData = localStorage.getItem('session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        setUser(session.user);
        
        // Fetch word bank stats
        const wordResponse = await fetch(`/api/wordbank/${languageId}`, {
          headers: {
            'Authorization': `Bearer ${session.session.token}`,
          },
        });
        
        if (wordResponse.ok) {
          const wordData = await wordResponse.json();
          const words = wordData.words || [];
          setStats({
            totalWords: words.length,
            activeWords: words.filter((w: any) => w.status === 'active').length,
            passiveWords: words.filter((w: any) => w.status === 'passive').length,
            lessonsCompleted: 0, // TODO: fetch from progress API
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const sessionData = localStorage.getItem('session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        // Call logout API
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionToken: session.session.token,
          }),
        });
      }
      
      // Clear session from localStorage
      localStorage.removeItem('session');
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear session anyway
      localStorage.removeItem('session');
      router.push('/');
    }
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
            {loading ? (
              <div className="text-center text-indigo-dye">Loading...</div>
            ) : (
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 bg-indigo-dye rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-indigo-dye">{user?.name || 'User'}</h2>
                  <p className="text-lapis-500">{user?.email || 'Not logged in'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg p-6 border border-lapis-400">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-indigo-dye">Your Stats</h3>
              <button
                onClick={loadUserData}
                className="text-sm text-orange hover:underline"
              >
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-900 rounded-lg border border-green">
                <div className="text-3xl font-bold text-green">{stats.activeWords}</div>
                <div className="text-sm text-indigo-dye">Active Words</div>
              </div>
              <div className="text-center p-4 bg-lapis-800 rounded-lg border border-lapis-600">
                <div className="text-3xl font-bold text-lapis">{stats.passiveWords}</div>
                <div className="text-sm text-indigo-dye">Passive Words</div>
              </div>
              <div className="text-center p-4 bg-indigo-dye-900 rounded-lg border border-indigo-dye-700">
                <div className="text-3xl font-bold text-indigo-dye">{stats.totalWords}</div>
                <div className="text-sm text-indigo-dye">Total Words</div>
              </div>
              <div className="text-center p-4 bg-orange-900 rounded-lg border border-orange">
                <div className="text-3xl font-bold text-orange">{stats.lessonsCompleted}</div>
                <div className="text-sm text-indigo-dye">Lessons Completed</div>
              </div>
            </div>
          </div>

          {/* Placeholder message */}
          <div className="text-center text-white text-sm opacity-70">
            More stats coming soon!
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
