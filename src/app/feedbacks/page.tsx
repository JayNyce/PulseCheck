// src/app/feedbacks/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function FeedbacksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    } else {
      // Redirect to submit feedback by default
      router.push('/feedbacks/submit');
    }
  }, [session, status, router]);

  return null; // Optionally, render a loading indicator here
}
