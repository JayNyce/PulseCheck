// src/app/instructor/courses/create/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCoursePage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({ name: '', passKey: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Redirect if not authenticated or not an instructor
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !session.user.isInstructor) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to create course');
      setMessage('Course created successfully!');
      router.push('/instructor');
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || 'Error creating course.');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
      {message && <p className="text-red-500 mb-4">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Course Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Passkey (Optional)</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded"
            value={formData.passKey}
            onChange={(e) => setFormData({ ...formData, passKey: e.target.value })}
          />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Create Course
        </button>
      </form>
    </div>
  );
}
