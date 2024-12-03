// src/app/instructor/courses/[courseId]/topics/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Topic {
  id: number;
  name: string;
}

export default function TopicsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { courseId } = useParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if not authenticated or not an instructor
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !session.user.isInstructor) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`/api/instructor/courses/${courseId}/topics`);
        if (!res.ok) throw new Error('Failed to fetch topics');
        const data: Topic[] = await res.json();
        setTopics(data);
      } catch (error: any) {
        console.error(error);
        setMessage(error.message || 'An error occurred while fetching topics.');
      }
    };
    fetchTopics();
  }, [courseId]);

  const handleManageTopic = (topicId: number) => {
    router.push(`/instructor/courses/${courseId}/topics/${topicId}`);
  };

  const handleCreateTopic = () => {
    router.push(`/instructor/courses/${courseId}/topics/create`);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Manage Topics</h1>

      {message && (
        <p className={`mb-4 ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'} font-semibold`}>
          {message}
        </p>
      )}

      {/* Create Topic Button */}
      <div className="mb-6">
        <button
          onClick={handleCreateTopic}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create New Topic
        </button>
      </div>

      {/* Topics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">{topic.name}</h3>
            <button
              onClick={() => handleManageTopic(topic.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Manage Topic
            </button>
          </div>
        ))}
        {topics.length === 0 && (
          <p>No topics found. Click "Create New Topic" to get started.</p>
        )}
      </div>
    </div>
  );
}
