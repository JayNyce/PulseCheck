// src/app/admin/courses/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Course {
  id: number;
  name: string;
}

export default function AdminCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseName, setNewCourseName] = useState('');
  const [message, setMessage] = useState('');

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth/login');
    else if (!session.user.isAdmin) router.push('/dashboard');
  }, [session, status, router]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const data: Course[] = await res.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  // Add new course
  const handleAddCourse = async () => {
    if (!newCourseName.trim()) return;
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCourseName.trim() }),
      });
      if (res.ok) {
        const course: Course = await res.json();
        setCourses([...courses, course]);
        setNewCourseName('');
        setMessage('Course added successfully.');
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || 'Failed to add course.');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      setMessage('An error occurred.');
    }
  };

  // Delete course
  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCourses(courses.filter((course) => course.id !== id));
        setMessage('Course deleted successfully.');
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || 'Failed to delete course.');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setMessage('An error occurred.');
    }
  };

  // Render loading state
  if (status === 'loading') {
    return <div className="p-8">Loading courses...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Admin: Manage Courses</h1>

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
          value={newCourseName}
          onChange={(e) => setNewCourseName(e.target.value)}
          className="border border-gray-300 p-2 rounded mr-2"
          placeholder="New course name"
        />
        <button onClick={handleAddCourse} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Course
        </button>
      </div>

      <table className="w-full border-collapse bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">ID</th>
            <th className="border-b p-2 text-left">Name</th>
            <th className="border-b p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="border-b p-2">{course.id}</td>
              <td className="border-b p-2">{course.name}</td>
              <td className="border-b p-2 text-center">
                <button
                  onClick={() => router.push(`/admin/courses/${course.id}/members`)}
                  className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                >
                  Manage Members
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {courses.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center">
                No courses available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
