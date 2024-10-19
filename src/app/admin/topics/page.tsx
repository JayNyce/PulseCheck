// src/app/admin/topics/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Topic {
  id: number;
  name: string;
}

export default function AdminTopicsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [message, setMessage] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) router.push('/auth/login');
  }, [session, status, router]);

  // Redirect if not admin
  useEffect(() => {
    if (session && !session.user.isAdmin) {
      router.push('/feedbacks');
    }
  }, [session, router]);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch('/api/topics');
        const data: Topic[] = await res.json();
        setTopics(data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };
    fetchTopics();
  }, []);

  // Add new topic
  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTopicName.trim() }),
      });
      if (res.ok) {
        const topic: Topic = await res.json();
        setTopics([...topics, topic]);
        setNewTopicName('');
        setMessage('Topic added successfully.');
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || 'Failed to add topic.');
      }
    } catch (error) {
      console.error('Error adding topic:', error);
      setMessage('An error occurred.');
    }
  };

  // Delete topic
  const handleDeleteTopic = async (id: number) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    try {
      const res = await fetch(`/api/topics/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTopics(topics.filter((topic) => topic.id !== id));
        setMessage('Topic deleted successfully.');
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || 'Failed to delete topic.');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      setMessage('An error occurred.');
    }
  };

  if (!session || !session.user.isAdmin) {
    return null; // Prevent rendering if not admin
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Admin: Manage Topics</h1>

      {message && (
        <p
          className={`mb-4 ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          } font-semibold`}
        >
          {message}
        </p>
      )}

      <div className="mb-6">
        <input
          type="text"
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
          className="border border-gray-300 p-2 rounded mr-2"
          placeholder="New topic name"
        />
        <button onClick={handleAddTopic} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Topic
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">ID</th>
            <th className="border-b p-2 text-left">Name</th>
            <th className="border-b p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <tr key={topic.id}>
              <td className="border-b p-2">{topic.id}</td>
              <td className="border-b p-2">{topic.name}</td>
              <td className="border-b p-2 text-center">
                <button
                  onClick={() => handleDeleteTopic(topic.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
