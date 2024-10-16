// src/app/page.tsx (Homepage)
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/feedbacks'); // If user is logged in, send them to PulseCheck (or dashboard)
    }
  }, [session, router]);

  const handlePulseCheckClick = () => {
    if (session) {
      router.push('/feedbacks');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-5xl font-bold mb-4">Welcome to PulseCheck</h1>
      <p className="text-xl mb-6">A simple and elegant student feedback application to improve your courses</p>
      <button onClick={handlePulseCheckClick} className="px-6 py-3 bg-black text-white rounded-lg">
        Go to PulseCheck
      </button>
    </div>
  );
}
