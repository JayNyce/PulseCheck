// src/app/instructor/courses/[courseId]/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Course {
  id: number;
  name: string;
  passKey: string | null;
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [message, setMessage] = useState('');

  // Redirect if not authenticated or not an instructor
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !session.user.isInstructor) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/instructor/courses/${courseId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch course');
        }
        const data: Course = await res.json();
        setCourse(data);
      } catch (error: any) {
        console.error('Error fetching course:', error);
        setMessage(error.message);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  if (message) {
    return <p className="text-red-500">{message}</p>;
  }

  if (!course) return <p>Loading...</p>;

  const handleManageStudents = () => {
    router.push(`/instructor/courses/${courseId}/members`);
  };

  const handleManageTopics = () => {
    router.push(`/instructor/courses/${courseId}/topics`);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">{course.name}</h1>
      <p className="mt-2">Passkey: {course.passKey || 'None'}</p>

      {/* Options to manage students and topics */}
      <div className="mt-6 space-x-4">
        <button
          onClick={handleManageStudents}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Manage Students
        </button>
        <button
          onClick={handleManageTopics}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Manage Topics
        </button>
      </div>
    </div>
  );
}
