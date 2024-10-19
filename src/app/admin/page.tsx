// src/app/admin/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Admin Dashboard Page
 * Allows admin users to add new feedback topics.
 */
export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State variables for managing form inputs and feedback messages
  const [newTopicName, setNewTopicName] = useState<string>('');
  const [addTopicError, setAddTopicError] = useState<string | null>(null);
  const [addTopicSuccess, setAddTopicSuccess] = useState<string | null>(null);
  const [isAddingTopic, setIsAddingTopic] = useState<boolean>(false);

  // Redirect users who are not authenticated or not admins
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) {
      router.push('/auth/login'); // Redirect unauthenticated users to login
    } else if (!session.user.isAdmin) {
      router.push('/dashboard'); // Redirect non-admin users to dashboard
    }
  }, [session, status, router]);

  /**
   * Handler for adding a new feedback topic.
   * Sends a POST request to the /api/topics endpoint.
   */
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddTopicError(null);
    setAddTopicSuccess(null);
    setIsAddingTopic(true);

    // Input validation
    if (!newTopicName.trim()) {
      setAddTopicError('Topic name cannot be empty.');
      setIsAddingTopic(false);
      return;
    }

    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTopicName.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to add topic.');
      }

      setAddTopicSuccess(`Topic "${result.name}" added successfully.`);
      setNewTopicName('');
    } catch (err: any) {
      console.error('Error adding topic:', err);
      setAddTopicError(err.message || 'An error occurred while adding the topic.');
    } finally {
      setIsAddingTopic(false);
    }
  };

  // Render loading state
  if (status === 'loading') {
    return <div className="p-8">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Admin Panel: Add New Feedback Topic */}
      <div className="bg-white p-6 shadow-md rounded">
        <h2 className="text-2xl font-semibold mb-4">Add New Feedback Topic</h2>
        <form onSubmit={handleAddTopic} className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <input
            type="text"
            placeholder="Enter new topic name"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              isAddingTopic ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isAddingTopic}
          >
            {isAddingTopic ? 'Adding...' : 'Add Topic'}
          </button>
        </form>
        {addTopicError && <p className="mt-2 text-red-500">{addTopicError}</p>}
        {addTopicSuccess && <p className="mt-2 text-green-500">{addTopicSuccess}</p>}
      </div>
    </div>
  );
}
