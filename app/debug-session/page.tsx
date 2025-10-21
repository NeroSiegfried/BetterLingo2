'use client';

import { useEffect, useState } from 'react';

export default function DebugSessionPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      const data = localStorage.getItem('session');
      if (data) {
        setSessionData(JSON.parse(data));
      } else {
        setError('No session found in localStorage');
      }
    } catch (err) {
      setError(`Error reading session: ${err}`);
    }
  }, []);

  const testAPI = async () => {
    try {
      const data = localStorage.getItem('session');
      if (!data) {
        alert('No session found');
        return;
      }

      const session = JSON.parse(data);
      const token = session.session?.token;

      if (!token) {
        alert('No token in session');
        return;
      }

      // Test the courses API
      const response = await fetch('/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      alert(`API Response (${response.status}): ${JSON.stringify(result, null, 2)}`);
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : sessionData ? (
          <div>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Session found!
            </div>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
            
            <button
              onClick={testAPI}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test API Call
            </button>
          </div>
        ) : (
          <p>Loading...</p>
        )}

        <div className="mt-6">
          <a href="/login" className="text-blue-500 hover:underline">Go to Login</a>
        </div>
      </div>
    </div>
  );
}
