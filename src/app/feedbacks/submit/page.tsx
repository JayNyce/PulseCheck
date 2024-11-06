// src/app/feedbacks/submit/page.tsx

'use client';

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

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      window.location.href = '/auth/login';
    }
  }, [session, status]);

  // Fetch topics and courses
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      try {
        const [topicRes, courseRes] = await Promise.all([
          fetch('/api/topics'),
          fetch(`/api/users/${session.user.id}/courses`),
        ]);

        if (!topicRes.ok || !courseRes.ok) {
          throw new Error('Failed to fetch topics or courses');
        }

        const topicsData: Topic[] = await topicRes.json();
        const coursesData: Course[] = await courseRes.json();

        setTopics(topicsData);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (error) {
        console.error('Error fetching topics or courses:', error);
        setMessage('Failed to load topics or courses.');
      }
    };
    fetchData();
  }, [session]);

  // Fetch default options when course is selected
  useEffect(() => {
    const fetchDefaultOptions = async () => {
      if (!selectedCourseId) {
        setDefaultOptions([]);
        return;
      }
      try {
        const res = await fetch(`/api/users?courseId=${selectedCourseId}&limit=100`);
        if (!res.ok) throw new Error('Failed to fetch users');
        const data: User[] = await res.json();
        const options = data.map((user) => ({
          value: user.id,
          label: `${user.name} (${user.email})`,
        }));
        setDefaultOptions(options);
      } catch (error) {
        console.error('Error fetching users:', error);
        setMessage('Failed to fetch users.');
      }
    };
    fetchDefaultOptions();
  }, [selectedCourseId]);

  // Updated loadOptions function
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
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Failed to fetch users.');
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
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
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

      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Course</label>
        <select
          value={selectedCourseId !== null ? selectedCourseId.toString() : ''}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedCourseId(value ? parseInt(value, 10) : null);
            setSelectedUser(null);
            setDefaultOptions([]);
          }}
          className="w-full border border-gray-300 p-2 rounded"
          required
        >
          <option value="" disabled>
            Select a course
          </option>
          {courses.length > 0 ? (
            courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No courses available.
            </option>
          )}
        </select>
      </div>

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
          isDisabled={!selectedCourseId}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {selectedUser && (
        <p className="mb-4">
          Giving feedback to: <strong>{selectedUser.label}</strong>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Topic */}
        <div>
          <label className="block mb-2 font-medium">Topic</label>
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
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
