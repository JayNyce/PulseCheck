// src/app/admin/courses/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Course {
  id: number;
  name: string;
  passKey: string | null;
}

export default function AdminCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCoursePassKey, setNewCoursePassKey] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // States for editing
  //these are actually the states for editing
  
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editCourseName, setEditCourseName] = useState('');
  const [editCoursePassKey, setEditCoursePassKey] = useState('');

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth/login');
    else if (!session.user.isAdmin) router.push('/dashboard');
  }, [session, status, router]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to fetch courses.');
        const data: Course[] = await res.json();
        setCourses(data);
      } catch (error) {
        console.error(error);
        setMessage('Failed to load courses.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Add new course
  const handleAddCourse = async () => {
    if (!newCourseName.trim()) {
      setMessage('Course name is required.');
      return;
    }

    const payload: { name: string; passKey?: string } = { name: newCourseName.trim() };
    if (newCoursePassKey.trim()) {
      payload.passKey = newCoursePassKey.trim();
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const course: Course = await res.json();
        setCourses([...courses, course]);
        setNewCourseName('');
        setNewCoursePassKey('');
        setMessage(`Course added successfully. PassKey: ${course.passKey || '—'}`);
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || 'Failed to add course.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Delete course
  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    setIsLoading(true);

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
      console.error(error);
      setMessage('An error occurred while deleting the course.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Open edit modal
  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setEditCourseName(course.name);
    setEditCoursePassKey(course.passKey || '');
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingCourse(null);
    setEditCourseName('');
    setEditCoursePassKey('');
  };

  // Handle update course
  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    if (!editCourseName.trim()) {
      setMessage('Course name is required.');
      return;
    }

    if (editCoursePassKey && !/^[a-zA-Z0-9]{0,6}$/.test(editCoursePassKey.trim())) {
      setMessage('PassKey must be alphanumeric and up to 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editCourseName.trim(),
          passKey: editCoursePassKey.trim() || null,
        }),
      });

      if (res.ok) {
        const updatedCourse: Course = await res.json();
        setCourses(courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
        setMessage('Course updated successfully.');
        closeEditModal();
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || 'Failed to update course.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin: Manage Courses</h1>

      {message && (
        <p
          className={`mb-4 text-center font-semibold ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}

      {/* Add Course Form */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center">
        <input
          type="text"
          value={newCourseName}
          onChange={(e) => setNewCourseName(e.target.value)}
          className="border border-gray-300 p-2 rounded mr-0 sm:mr-2 mb-2 sm:mb-0 w-full sm:w-1/3"
          placeholder="New course name"
        />
        <input
          type="text"
          value={newCoursePassKey}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[a-zA-Z0-9]*$/.test(value) && value.length <= 6) {
              setNewCoursePassKey(value);
            }
          }}
          className="border border-gray-300 p-2 rounded mr-0 sm:mr-2 mb-2 sm:mb-0 w-full sm:w-1/4"
          placeholder="PassKey (optional)"
          maxLength={6}
        />
        <button
          onClick={handleAddCourse}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Add Course
        </button>
      </div>

      {/* Courses Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded">
          <thead>
            <tr>
              <th className="border-b p-2 text-left">ID</th>
              <th className="border-b p-2 text-left">Name</th>
              <th className="border-b p-2 text-left">PassKey</th>
              <th className="border-b p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="border-b p-2">{course.id}</td>
                <td className="border-b p-2">{course.name}</td>
                <td className="border-b p-2">{course.passKey || '—'}</td>
                <td className="border-b p-2 text-center">
                  <button
                    onClick={() => router.push(`/admin/courses/${course.id}/members`)}
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2 mb-2 sm:mb-0"
                  >
                    Manage Members
                  </button>
                  <button
                    onClick={() => openEditModal(course)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 mb-2 sm:mb-0"
                  >
                    Edit
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
                <td colSpan={4} className="p-4 text-center">
                  No courses available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingCourse && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-course-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeEditModal();
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 id="edit-course-title" className="text-2xl font-bold mb-4">Edit Course</h2>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Course Name</label>
              <input
                type="text"
                value={editCourseName}
                onChange={(e) => setEditCourseName(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="Course name"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">PassKey</label>
              <input
                type="text"
                value={editCoursePassKey}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-Z0-9]*$/.test(value) && value.length <= 6) {
                    setEditCoursePassKey(value);
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
                className="bg-blue-500 text-white px-4 py-2 rounded"
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
