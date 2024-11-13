// src/app/admin/courses/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  name: string;
  passKey?: string | null;
  instructor: {
    id: number;
    name: string;
    email: string;
  } | null; // Allow instructor to be null
  topics: {
    id: number;
    name: string;
  }[];
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function ManageCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<{ name: string; passKey?: string; instructorId: number }>({
    name: '',
    passKey: '',
    instructorId: 0,
  });
  const [error, setError] = useState<string>('');

  // States for editing
<<<<<<< HEAD
  //these are actually the states for editing
  //these are actually the states for editing
=======
>>>>>>> 4fc09b562af52f7d54e3e2e8d7a8850d86d9e2d4
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editCourseName, setEditCourseName] = useState('');
  const [editCoursePassKey, setEditCoursePassKey] = useState('');
  const [editInstructorId, setEditInstructorId] = useState<number>(0);

  // Fetch courses and instructors on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, usersRes] = await Promise.all([
          fetch('/api/admin/courses'),
          fetch('/api/admin/users?isInstructor=true'), // Ensure this endpoint filters instructors correctly
        ]);

        if (!coursesRes.ok || !usersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const coursesData: Course[] = await coursesRes.json();
        const usersData: User[] = await usersRes.json();

        setCourses(coursesData);
        setUsers(usersData);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form submission to create a new course
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || form.instructorId === 0) {
      setError('Please provide both name and instructor.');
      return;
    }

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create course');
      }

      const newCourse: Course = await res.json();
      setCourses([...courses, newCourse]);
      setForm({ name: '', passKey: '', instructorId: 0 });
      setError(''); // Clear any existing errors
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  // Handle deletion of a course
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete course.');
      }

      setCourses(courses.filter((course) => course.id !== id));
      setError(''); // Clear any existing errors
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  // Open edit modal
  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setEditCourseName(course.name);
    setEditCoursePassKey(course.passKey || '');
    setEditInstructorId(course.instructor ? course.instructor.id : 0);
    setError('');
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingCourse(null);
    setEditCourseName('');
    setEditCoursePassKey('');
    setEditInstructorId(0);
    setError('');
  };

  // Handle update course
  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    if (!editCourseName.trim()) {
      setError('Course name is required.');
      return;
    }

    if (editInstructorId === 0) {
      setError('Please select an instructor.');
      return;
    }

    if (editCoursePassKey && !/^[a-zA-Z0-9]{0,6}$/.test(editCoursePassKey.trim())) {
      setError('PassKey must be alphanumeric and up to 6 characters.');
      return;
    }

    try {
      const payload: { name: string; passKey?: string | null; instructorId: number } = {
        name: editCourseName.trim(),
        instructorId: editInstructorId,
      };

      if (editCoursePassKey.trim()) {
        payload.passKey = editCoursePassKey.trim();
      } else {
        payload.passKey = null;
      }

      const res = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update course.');
      }

      const updatedCourse: Course = await res.json();
      setCourses(courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
      closeEditModal();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  if (loading) return <div className="p-8">Loading courses...</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Manage Courses</h1>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Create New Course Form */}
      <form onSubmit={handleCreate} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create New Course</h2>
        <div className="flex flex-col md:flex-row md:space-x-4">
          <input
            type="text"
            placeholder="Course Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mb-4 md:mb-0 p-2 border border-gray-300 rounded w-full md:w-auto"
            required
          />
          <input
            type="text"
            placeholder="PassKey (optional)"
            value={form.passKey}
            onChange={(e) => setForm({ ...form, passKey: e.target.value })}
            className="mb-4 md:mb-0 p-2 border border-gray-300 rounded w-full md:w-auto"
            maxLength={6}
          />
          <select
            value={form.instructorId}
            onChange={(e) => setForm({ ...form, instructorId: parseInt(e.target.value, 10) })}
            className="mb-4 md:mb-0 p-2 border border-gray-300 rounded w-full md:w-auto"
            required
          >
            <option value={0} disabled>
              Select Instructor
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full md:w-auto"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>

      {/* Courses List */}
      <h2 className="text-2xl font-semibold mb-4">Existing Courses</h2>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Instructor</th>
            <th className="py-2 px-4 border-b">PassKey</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="py-2 px-4 border-b text-center">{course.id}</td>
              <td className="py-2 px-4 border-b">{course.name}</td>
              <td className="py-2 px-4 border-b">
                {course.instructor ? (
                  `${course.instructor.name} (${course.instructor.email})`
                ) : (
                  'Unknown'
                )}
              </td>
              <td className="py-2 px-4 border-b">{course.passKey || 'N/A'}</td>
              <td className="py-2 px-4 border-b text-center">
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
                  onClick={() => handleDelete(course.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {courses.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4">
                No courses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

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

            <div className="mb-4">
              <label className="block mb-2 font-medium">Instructor</label>
              <select
                value={editInstructorId}
                onChange={(e) => setEditInstructorId(parseInt(e.target.value, 10))}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value={0} disabled>
                  Select Instructor
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
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
