// src/app/page.tsx
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to PulseCheck</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        A simple and elegant student feedback application to improve your courses
      </p>
      <Link href="/feedbacks" className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition">
        Go to PulseCheck
      </Link>
    </div>
  );
}
