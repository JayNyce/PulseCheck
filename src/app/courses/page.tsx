// src/app/courses/page.tsx

'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

interface Course {
  id: number;
  name: string;
  passKey?: string;
  studentCount?: number; // New field to store the number of enrolled students
}

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState({ all: true, enrolled: true, action: false });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [passKeyInput, setPassKeyInput] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  // Fetch all courses
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to fetch all courses');
        const data: Course[] = await res.json();
        setAllCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Failed to load all courses.' });
      } finally {
        setLoading((prev) => ({ ...prev, all: false }));
      }
    };

    fetchAllCourses();
  }, []);

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/users/${session.user.id}/courses`);
        if (!res.ok) throw new Error('Failed to fetch enrolled courses');
        const data: Course[] = await res.json();
        setEnrolledCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Failed to load your courses.' });
      } finally {
        setLoading((prev) => ({ ...prev, enrolled: false }));
      }
    };

    fetchEnrolledCourses();
  }, [session?.user?.id]);

  // Determine available courses for enrollment
  const availableCourses = useMemo(() => {
    return allCourses.filter(
      (course) => !enrolledCourses.some((enrolled) => enrolled.id === course.id)
    );
  }, [allCourses, enrolledCourses]);

  // Open modal for courses requiring passkey
  const openEnrollModal = (course: Course) => {
    setSelectedCourse(course);
    setPassKeyInput('');
    setIsModalOpen(true);
  };

  // Close modal
  const closeEnrollModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setPassKeyInput('');
  };

  // Handle enrollment with passkey
  const handleEnrollWithPasskey = async () => {
    if (!selectedCourse) return;

    if (selectedCourse.passKey && !passKeyInput.trim()) {
      setMessage({ type: 'error', text: 'Passkey is required to enroll in this course.' });
      return;
    }

    setLoading((prev) => ({ ...prev, action: true }));
    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: selectedCourse.passKey ? JSON.stringify({ passKey: passKeyInput.trim() }) : '{}',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Enrollment failed');
      }

      const enrolledCourse: Course = await res.json();
      setEnrolledCourses((prev) => [...prev, enrolledCourse]);
      setMessage({ type: 'success', text: `Enrolled in ${enrolledCourse.name} successfully.` });
      closeEnrollModal();
      setSelectedCourseId('');
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Failed to enroll in the course.' });
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Handle enrollment without passkey
  const handleEnrollWithoutPasskey = async (course: Course) => {
    setLoading((prev) => ({ ...prev, action: true }));
    try {
      const res = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{}', // Empty body since no passkey is required
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Enrollment failed');
      }

      const enrolledCourse: Course = await res.json();
      setEnrolledCourses((prev) => [...prev, enrolledCourse]);
      setMessage({ type: 'success', text: `Enrolled in ${enrolledCourse.name} successfully.` });
      setSelectedCourseId('');
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Failed to enroll in the course.' });
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Handle dropdown selection and enrollment
  const handleEnrollSelection = async () => {
    if (selectedCourseId === '') {
      setMessage({ type: 'error', text: 'Please select a course to enroll.' });
      return;
    }

    const course = availableCourses.find((c) => c.id === selectedCourseId);
    if (!course) {
      setMessage({ type: 'error', text: 'Selected course not found.' });
      return;
    }

    if (course.passKey) {
      openEnrollModal(course);
    } else {
      await handleEnrollWithoutPasskey(course);
    }
  };

  // Handle unenrollment
  const handleUnenroll = async (courseId: number) => {
    // Confirmation prompt to prevent accidental unenrollment
    const confirmUnenroll = window.confirm('Are you sure you want to unenroll from this course?');
    if (!confirmUnenroll) return;

    setLoading((prev) => ({ ...prev, action: true }));
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Unenrollment failed');
      }

      setEnrolledCourses((prev) => prev.filter((course) => course.id !== courseId));
      setMessage({ type: 'success', text: 'Unenrolled successfully.' });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Failed to unenroll from the course.' });
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading.all || loading.enrolled) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Courses</h1>

      {/* Feedback Message */}
      {message && (
        <div
          className={`mb-6 px-4 py-2 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Enrolled Courses */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Enrolled Courses</h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">{course.name}</h3>
                  {course.studentCount !== undefined && (
                    <p className="text-gray-600">Enrolled Students: {course.studentCount}</p>
                  )}
                </div>
                <button
                  onClick={() => handleUnenroll(course.id)}
                  className={`mt-4 px-4 py-2 rounded ${
                    loading.action
                      ? 'bg-red-300 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  disabled={loading.action}
                >
                  {loading.action ? 'Processing...' : 'Unenroll'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You are not enrolled in any courses.</p>
        )}
      </section>

      {/* Available Courses */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Available Courses</h2>
        {availableCourses.length > 0 ? (
          <div className="flex items-center space-x-4">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="px-4 py-2 border rounded w-full max-w-md"
            >
              <option value="">Select a course</option>
              {availableCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} {course.passKey ? '(Requires Passkey)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleEnrollSelection}
              className={`px-6 py-2 rounded ${
                loading.action
                  ? 'bg-green-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              disabled={loading.action}
            >
              {loading.action ? 'Processing...' : 'Enroll'}
            </button>
          </div>
        ) : (
          <p className="text-gray-600">No available courses to enroll.</p>
        )}
      </section>

      {/* Passkey Modal */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg w-11/12 max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Enter Passkey for "{selectedCourse.name}"</h2>
            <input
              type="password"
              value={passKeyInput}
              onChange={(e) => setPassKeyInput(e.target.value)}
              placeholder="Enter passkey"
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={closeEnrollModal}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleEnrollWithPasskey}
                className={`px-4 py-2 rounded ${
                  loading.action
                    ? 'bg-green-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                disabled={loading.action}
              >
                {loading.action ? 'Processing...' : 'Enroll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
