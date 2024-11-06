// src/app/feedbacks/submit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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

export default function SubmitFeedbackPage() {
  const { data: session, status } = useSession();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
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
      }
    };
    fetchData();
  }, [session]);

  // Handle user search within the selected course
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2 && selectedCourseId) {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/users?search=${encodeURIComponent(query)}&courseId=${selectedCourseId}`
        );
        if (!res.ok) throw new Error('Failed to search users');
        const data: User[] = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
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
          topicId: parseInt(formData.topicId),
          rating: parseInt(formData.rating),
          comment: formData.comment,
          to_user_id: selectedUser.id,
          anonymous: formData.anonymous,
        }),
      });

      if (res.ok) {
        setMessage('Feedback submitted successfully!');
        setFormData({ topicId: '', rating: '', comment: '', anonymous: false });
        setSelectedUser(null);
        setSearchQuery('');
        setSearchResults([]);
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
          value={selectedCourseId}
          onChange={(e) => {
            setSelectedCourseId(e.target.value);
            setSearchQuery('');
            setSearchResults([]);
            setSelectedUser(null);
          }}
          className="w-full border border-gray-300 p-2 rounded"
          required
        >
          <option value="" disabled>
            Select a course
          </option>
          {courses.length > 0 ? (
            courses.map((course) => (
              <option key={course.id} value={course.id.toString()}>
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
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Enter user name..."
          disabled={!selectedCourseId}
        />
        {searchLoading ? (
          <div className="mt-2">Searching...</div>
        ) : (
          searchResults.length > 0 && (
            <ul className="bg-white border border-gray-300 mt-2 max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <li
                  key={user.id}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => {
                    setSelectedUser(user);
                    // Removed 'to_user_id' from formData
                    setSearchQuery(user.name);
                    setSearchResults([]);
                  }}
                >
                  {user.name} ({user.email})
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      {selectedUser && (
        <p className="mb-4">
          Giving feedback to: <strong>{selectedUser.name}</strong>
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
