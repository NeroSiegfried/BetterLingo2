'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  languageId: string;
}

export default function BottomNav({ languageId }: BottomNavProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-lapis border-t border-indigo-dye px-6 py-3 z-30">
      <div className="max-w-screen-xl mx-auto flex justify-around items-center">
        <Link 
          href={`/course/${languageId}`}
          className={`flex flex-col items-center ${
            isActive(`/course/${languageId}`) ? 'text-orange' : 'text-lapis-900'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1">Lessons</span>
        </Link>

        <Link 
          href={`/word-bank/${languageId}`}
          className={`flex flex-col items-center ${
            isActive(`/word-bank/${languageId}`) ? 'text-orange' : 'text-lapis-900'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs mt-1">Word Bank</span>
        </Link>

        <Link 
          href={`/custom-scenario/${languageId}`}
          className={`flex flex-col items-center ${
            isActive(`/custom-scenario/${languageId}`) ? 'text-orange' : 'text-lapis-900'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-xs mt-1">Custom</span>
        </Link>

        <Link 
          href={`/profile`}
          className={`flex flex-col items-center ${
            isActive(`/profile`) ? 'text-orange' : 'text-lapis-900'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
