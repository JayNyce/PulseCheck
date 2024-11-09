// src/app/feedbacks/layout.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface FeedbacksLayoutProps {
  children: React.ReactNode;
}

const FeedbacksLayout: React.FC<FeedbacksLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4">Feedbacks</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/feedbacks/submit"
              className={`block px-4 py-2 rounded hover:bg-gray-100 ${
                pathname === '/feedbacks/submit' ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              Submit Feedback
            </Link>
          </li>
          <li>
            <Link
              href="/feedbacks/received"
              className={`block px-4 py-2 rounded hover:bg-gray-100 ${
                pathname === '/feedbacks/received' ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              Received Feedback
            </Link>
          </li>
          <li>
            <Link
              href="/feedbacks/given"
              className={`block px-4 py-2 rounded hover:bg-gray-100 ${
                pathname === '/feedbacks/given' ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              Given Feedback
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 bg-gray-100">
        {children}
      </main>
    </div>
  );
};

export default FeedbacksLayout;
