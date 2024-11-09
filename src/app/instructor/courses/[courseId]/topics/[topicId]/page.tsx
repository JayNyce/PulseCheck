// src/app/instructor/courses/[courseId]/topics/[topicId]/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditTopicPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { courseId, topicId } = useParams();
  const [topicName, setTopicName] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if not authenticated or not an instructor
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !session.user.isInstructor) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  // Fetch topic details
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await fetch(`/api/instructor/courses/${courseId}/topics/${topicId}`);
        if (!res.ok) throw new Error('Failed to fetch topic');
        const data = await res.json();
        setTopicName(data.name);
      } catch (error: any) {
        console.error(error);
        setMessage(error.message || 'An error occurred while fetching the topic.');
      }
    };
    if (courseId && topicId) fetchTopic();
  }, [courseId, topicId]);

  const handleUpdateTopic = async () => {
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: topicName }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update topic');
      }
      setMessage('Topic updated successfully.');
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || 'Error updating topic.');
    }
  };

  const handleDeleteTopic = async () => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/topics/${topicId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete topic');
      }
      setMessage('Topic deleted successfully.');
      router.push(`/instructor/courses/${courseId}/topics`);
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || 'Error deleting topic.');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Edit Topic</h1>

      {message && (
        <p className={`mb-4 ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'} font-semibold`}>
          {message}
        </p>
      )}

      <div className="mb-6">
        <label className="block mb-2 font-medium">Topic Name</label>
        <input
          type="text"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full max-w-md"
        />
      </div>

      <div className="space-x-4">
        <button
          onClick={handleUpdateTopic}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Update Topic
        </button>
        <button
          onClick={handleDeleteTopic}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete Topic
        </button>
      </div>
    </div>
  );
}
