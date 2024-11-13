// src/app/instructor/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Course {
  id: number;
  name: string;
  passKey: string | null;
}

export default function InstructorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassKey, setEditPassKey] = useState('');

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
        setError(error.message || 'An error occurred while fetching courses.');
      }
    };
    if (session && session.user.isInstructor) {
      fetchCourses();
    }
  }, [session]);

  // Handle navigation
  const handleManageCourse = (courseId: number) => {
    router.push(`/instructor/courses/${courseId}`);
  };

  const handleCreateCourse = () => {
    router.push('/instructor/courses/create');
  };

  // Open edit modal
  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setEditName(course.name);
    setEditPassKey(course.passKey || '');
    setError('');
    setMessage('');
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingCourse(null);
    setEditName('');
    setEditPassKey('');
    setError('');
    setMessage('');
  };

  // Handle course update
  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    setError('');
    setMessage('');

    if (!editName.trim()) {
      setError('Course name is required.');
      return;
    }

    if (editPassKey && !/^[a-zA-Z0-9]{0,6}$/.test(editPassKey.trim())) {
      setError('PassKey must be alphanumeric and up to 6 characters.');
      return;
    }

    try {
      const res = await fetch(`/api/instructor/courses/${editingCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          passKey: editPassKey.trim() || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update course.');
      }

      const updatedCourse: Course = await res.json();
      setCourses(courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
      setMessage('Course updated successfully.');
      closeEditModal();
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the course.');
    }
  };

  // Handle course deletion
  const handleDeleteCourse = async (courseId: number) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this course? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete course.');
      }

      setCourses(courses.filter((course) => course.id !== courseId));
      setMessage('Course deleted successfully.');
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the course.');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>

      {message && (
        <p className="text-green-500 mb-4 text-center">
          {message}
        </p>
      )}

      {error && (
        <p className="text-red-500 mb-4 text-center">
          {error}
        </p>
      )}

      <div className="mb-6">
        <button
          onClick={handleCreateCourse}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Course
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">{course.name}</h3>
            <p className="mb-4">Passkey: {course.passKey || 'None'}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleManageCourse(course.id)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Manage Course
              </button>
              <button
                onClick={() => openEditModal(course)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCourse(course.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <p>No courses found. Click "Create New Course" to get started.</p>
        )}
      </div>

      {/* Edit Modal */}
      {editingCourse && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-course-title"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="edit-course-title" className="text-2xl font-bold mb-4">
              Edit Course
            </h2>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Course Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="Course name"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">PassKey</label>
              <input
                type="text"
                value={editPassKey}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-Z0-9]{0,6}$/.test(value)) {
                    setEditPassKey(value);
                  }
                }}
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="PassKey (optional)"
                maxLength={6}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeEditModal}
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCourse}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
