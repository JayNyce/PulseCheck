// src/app/admin/page.tsx

'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Admin Dashboard Page
 * Provides navigation to manage topics and courses.
 */
export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect users who are not authenticated or not admins
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) {
      router.push('/auth/login'); // Redirect unauthenticated users to login
    } else if (!session.user.isAdmin) {
      router.push('/dashboard'); // Redirect non-admin users to dashboard
    }
  }, [session, status, router]);

  // Render loading state
  if (status === 'loading') {
    return <div className="p-8">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Navigation to Manage Pages */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Manage</h2>
        <div className="space-y-2">
          <button
            onClick={() => router.push('/admin/topics')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Manage Topics
          </button>
          <button
            onClick={() => router.push('/admin/courses')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Manage Courses
          </button>
        </div>
      </div>
    </div>
  );
}
