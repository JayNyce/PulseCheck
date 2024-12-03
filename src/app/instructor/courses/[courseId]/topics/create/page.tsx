// src/app/instructor/courses/[courseId]/topics/create/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CreateTopicPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { courseId } = useParams();
  const [topicName, setTopicName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !session.user.isInstructor) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) {
      setMessage('Topic name cannot be empty.');
      return;
    }
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: topicName }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create topic.');
      }
      const createdTopic = await res.json();
      setMessage('Topic created successfully!');
      setTopicName('');
      router.push(`/instructor/courses/${courseId}/topics`);
    } catch (error: any) {
      console.error('Error creating topic:', error);
      setMessage(error.message || 'An error occurred while creating the topic.');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Create New Topic</h1>

      {message && <p className="text-red-500 mb-4">{message}</p>}

      <form onSubmit={handleCreateTopic} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="topicName" className="block text-lg font-medium mb-2">
            Topic Name
          </label>
          <input
            type="text"
            id="topicName"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Enter topic name"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create Topic
        </button>
      </form>
    </div>
  );
}
