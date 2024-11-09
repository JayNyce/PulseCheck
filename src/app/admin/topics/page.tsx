// src/app/admin/topics/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Topic {
  id: number;
  name: string;
  course: {
    id: number;
    name: string;
  };
}

interface Course {
  id: number;
  name: string;
}

export default function ManageTopics() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<{ name: string; courseId: number }>({
    name: '',
    courseId: 0,
  });
  const [error, setError] = useState<string>('');

  // Fetch topics and courses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, coursesRes] = await Promise.all([
          fetch('/api/admin/topics'),
          fetch('/api/admin/courses'),
        ]);

        if (!topicsRes.ok || !coursesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const topicsData: Topic[] = await topicsRes.json();
        const coursesData: Course[] = await coursesRes.json();

        setTopics(topicsData);
        setCourses(coursesData);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form submission to create a new topic
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.courseId) {
      setError('Please provide both name and course.');
      return;
    }

    try {
      const res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create topic');
      }

      const newTopic: Topic = await res.json();
      setTopics([...topics, newTopic]);
      setForm({ name: '', courseId: 0 });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  // Handle deletion of a topic
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      const res = await fetch(`/api/admin/topics/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete topic');
      }

      setTopics(topics.filter((topic) => topic.id !== id));
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  if (loading) return <div className="p-8">Loading topics...</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Manage Topics</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Create New Topic Form */}
      <form onSubmit={handleCreate} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create New Topic</h2>
        <div className="flex flex-col md:flex-row md:space-x-4">
          <input
            type="text"
            placeholder="Topic Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mb-4 md:mb-0 p-2 border border-gray-300 rounded"
            required
          />
          <select
            value={form.courseId}
            onChange={(e) => setForm({ ...form, courseId: parseInt(e.target.value, 10) })}
            className="mb-4 md:mb-0 p-2 border border-gray-300 rounded"
            required
          >
            <option value={0} disabled>
              Select Course
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </form>

      {/* Topics List */}
      <h2 className="text-2xl font-semibold mb-4">Existing Topics</h2>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Course</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <tr key={topic.id}>
              <td className="py-2 px-4 border-b text-center">{topic.id}</td>
              <td className="py-2 px-4 border-b">{topic.name}</td>
              <td className="py-2 px-4 border-b">{topic.course.name}</td>
              <td className="py-2 px-4 border-b text-center">
                {/* Add Edit Functionality as Needed */}
                <button
                  onClick={() => handleDelete(topic.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {topics.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4">
                No topics found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
