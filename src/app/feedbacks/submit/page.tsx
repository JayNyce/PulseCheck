// src/app/feedbacks/submit/page.tsx

'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AsyncSelect from 'react-select/async';

interface Topic {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface OptionType {
  value: number;
  label: string;
}

export default function SubmitFeedbackPage() {
  const { data: session, status } = useSession();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [defaultOptions, setDefaultOptions] = useState<OptionType[]>([]);
  const [selectedUser, setSelectedUser] = useState<OptionType | null>(null);
  const [formData, setFormData] = useState({
    topicId: '',
    rating: '',
    comment: '',
    anonymous: false,
  });
  const [message, setMessage] = useState('');
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      window.location.href = '/auth/login';
    }
  }, [session, status]);

  // Fetch courses the user is enrolled in
  useEffect(() => {
    const fetchCourses = async () => {
      if (!session?.user?.id) return;
      setIsLoadingCourses(true);
      try {
        const res = await fetch(`/api/users/${session.user.id}/courses`);
        if (!res.ok) throw new Error('Failed to fetch courses');
        const coursesData: Course[] = await res.json();
        setCourses(coursesData);
      } catch (error: any) {
        console.error('Error fetching courses:', error);
        setMessage(error.message || 'Failed to load courses.');
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [session]);

  // Fetch topics based on selected course
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedCourseId) {
        setTopics([]);
        setFormData((prev) => ({ ...prev, topicId: '' }));
        return;
      }
      setIsLoadingTopics(true);
      try {
        const res = await fetch(`/api/courses/${selectedCourseId}/topics`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch topics');
        }
        const topicsData: Topic[] = await res.json();
        setTopics(topicsData);
      } catch (error: any) {
        console.error('Error fetching topics:', error);
        setMessage(error.message || 'Failed to load topics.');
      } finally {
        setIsLoadingTopics(false);
      }
    };
    fetchTopics();
  }, [selectedCourseId]);

  // Fetch default user options based on selected course
  useEffect(() => {
    const fetchDefaultOptions = async () => {
      if (!selectedCourseId) {
        setDefaultOptions([]);
        return;
      }
      setIsLoadingUsers(true);
      try {
        const res = await fetch(`/api/users?courseId=${selectedCourseId}&limit=100`);
        if (!res.ok) throw new Error('Failed to fetch users');
        const data: User[] = await res.json();
        const options = data.map((user) => ({
          value: user.id,
          label: `${user.name} (${user.email})`,
        }));
        setDefaultOptions(options);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        setMessage(error.message || 'Failed to fetch users.');
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchDefaultOptions();
  }, [selectedCourseId]);

  // Load options for AsyncSelect based on search input and selected course
  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    if (!selectedCourseId) {
      return [];
    }
    try {
      const res = await fetch(
        `/api/users?search=${encodeURIComponent(inputValue)}&courseId=${selectedCourseId}&limit=100`
      );
      if (!res.ok) throw new Error('Failed to fetch users');
      const data: User[] = await res.json();
      const options = data.map((user) => ({
        value: user.id,
        label: `${user.name} (${user.email})`,
      }));
      return options;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setMessage(error.message || 'Failed to fetch users.');
      return [];
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      alert('Please select a user to give feedback.');
      return;
    }

    if (!formData.topicId || !formData.rating || !formData.comment) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: parseInt(formData.topicId, 10),
          rating: parseInt(formData.rating, 10),
          comment: formData.comment,
          to_user_id: selectedUser.value,
          anonymous: formData.anonymous,
        }),
      });

      if (res.ok) {
        setMessage('Feedback submitted successfully!');
        setFormData({ topicId: '', rating: '', comment: '', anonymous: false });
        setSelectedUser(null);
        setDefaultOptions([]);
        setTopics([]);
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Submit Feedback</h2>

      {message && (
        <p
          className={`mb-4 text-center font-semibold ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}

      {/* Course Selection */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Course</label>
        {isLoadingCourses ? (
          <p>Loading courses...</p>
        ) : courses.length > 0 ? (
          <select
            value={selectedCourseId !== null ? selectedCourseId.toString() : ''}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCourseId(value ? parseInt(value, 10) : null);
              setSelectedUser(null);
              setDefaultOptions([]);
              setTopics([]);
              setFormData({ ...formData, topicId: '' });
            }}
            className="w-full border border-gray-300 p-2 rounded"
            required
          >
            <option value="" disabled>
              Select a course
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        ) : (
          <p>You are not enrolled in any courses.</p>
        )}
      </div>

      {/* User Selection */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Search for a user to give feedback</label>
        <AsyncSelect
          isClearable
          cacheOptions
          defaultOptions={defaultOptions}
          loadOptions={loadOptions}
          onChange={(option) => setSelectedUser(option)}
          value={selectedUser}
          placeholder={!selectedCourseId ? 'Select a course first' : 'Search or browse users...'}
          isDisabled={!selectedCourseId || isLoadingUsers}
          className="react-select-container"
          classNamePrefix="react-select"
        />
        {isLoadingUsers && <p className="mt-2">Loading users...</p>}
      </div>

      {selectedUser && (
        <p className="mb-4">
          Giving feedback to: <strong>{selectedUser.label}</strong>
        </p>
      )}

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Topic */}
        <div>
          <label className="block mb-2 font-medium">Topic</label>
          {isLoadingTopics ? (
            <p>Loading topics...</p>
          ) : topics.length > 0 ? (
            <select
              value={formData.topicId}
              onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded"
              required
            >
              <option value="" disabled>
                Select a topic
              </option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id.toString()}>
                  {topic.name}
                </option>
              ))}
            </select>
          ) : selectedCourseId ? (
            <p>No topics available for this course.</p>
          ) : (
            <p>Please select a course first.</p>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block mb-2 font-medium">Rating</label>
          <select
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded"
            required
          >
            <option value="" disabled>
              Select a rating
            </option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating.toString()}>
                {rating}
              </option>
            ))}
          </select>
        </div>

        {/* Comment */}
        <div>
          <label className="block mb-2 font-medium">Comment</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded"
            rows={4}
            placeholder="Enter your comments..."
            required
          />
        </div>

        {/* Anonymous */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.anonymous}
            onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
            id="anonymous"
            className="mr-2"
          />
          <label htmlFor="anonymous" className="font-medium">
            Submit anonymously
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          disabled={isLoadingTopics || isLoadingUsers}
        >
          {isLoadingTopics || isLoadingUsers ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
