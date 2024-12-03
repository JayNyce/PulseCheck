// src/app/instructor/courses/page.tsx

'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Course {
  id: number;
  name: string;
  passKey: string | null;
}

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');

  // Redirect if not authenticated or not an instructor
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !session.user.isInstructor) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/instructor/courses');
        if (!res.ok) throw new Error('Failed to fetch courses.');
        const data: Course[] = await res.json();
        setCourses(data);
      } catch (error: any) {
        console.error('Error fetching courses:', error);
        setMessage(error.message || 'An error occurred while fetching courses.');
      }
    };
    fetchCourses();
  }, []);

  const handleManageCourse = (courseId: number) => {
    router.push(`/instructor/courses/${courseId}`);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Your Courses</h1>

      {message && (
        <p className="text-red-500 mb-4">
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">{course.name}</h3>
            <p className="mb-4">Passkey: {course.passKey || 'None'}</p>
            <button
              onClick={() => handleManageCourse(course.id)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Manage Course
            </button>
          </div>
        ))}
        {courses.length === 0 && (
          <p>No courses found. Create a new course to get started.</p>
        )}
      </div>
    </div>
  );
}
