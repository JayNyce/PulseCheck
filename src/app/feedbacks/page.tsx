// src/app/feedbacks/page.tsx

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Feedback {
  id: number;
  topic: string;
  rating: number;
  comment: string;
  toUserId: number;
  fromUserId: number;
  created_at: string;
}

interface User {
  id: string; // 'id' is a string because NextAuth's 'session.user.id' is a string
  name: string;
  email: string;
}

interface FormData {
  topic: string;
  rating: string;
  comment: string;
  to_user_id: string;
}

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    rating: '',
    comment: '',
    to_user_id: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState('');

  // If the session is loading, show a loading message
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // If no session, redirect to login
  if (!session) {
    router.push('/auth/login');
    return null;
  }

  // Fetch feedbacks given to the logged-in user
  useEffect(() => {
    if (session.user && session.user.id) {
      const userId = session.user.id;
      const fetchFeedbacks = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/feedbacks?to_user_id=${userId}`);
          const data: Feedback[] = await res.json();

          // Ensure feedbacks is an array
          setFeedbacks(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching feedbacks:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchFeedbacks();
    }
  }, [session]);

  // Fetch users based on search query
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/users?search=${query}`);
        const data: User[] = await res.json();
        setSearchResults(data);
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

    if (!session.user || !session.user.id) {
      alert('User session is not available.');
      return;
    }

    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          to_user_id: selectedUser.id,
          from_user_id: session.user.id,
        }),
      });

      if (res.ok) {
        // Feedback submission is successful
        setMessage('Feedback submitted successfully!');
        setFormData({ topic: '', rating: '', comment: '', to_user_id: '' });
        setSelectedUser(null);
        setSearchQuery('');

        // Fetch updated feedbacks
        const feedbackRes = await fetch(`/api/feedbacks?to_user_id=${session.user.id}`);
        const data: Feedback[] = await feedbackRes.json();
        setFeedbacks(Array.isArray(data) ? data : []);
      } else {
        // Feedback submission failed
        setMessage('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      // Clear the message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  // Logout handler
  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 bg-gray-50">
      {/* Logout Button */}
      <div className="w-full flex justify-end px-6 mb-6">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-10">PulseCheck: Feedback</h1>

      {/* Show submission message */}
      {message && (
        <p
          className={`text-center mb-4 ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          } font-semibold`}
        >
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl w-full">
        {/* Submit Feedback Form */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Submit Feedback</h2>

          {/* Search bar for selecting the user */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Search for a user to give feedback</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
              placeholder="Enter user name..."
            />
            {searchLoading ? (
              <div>Searching...</div>
            ) : (
              searchResults.length > 0 && (
                <ul className="bg-white border border-gray-300 mt-2 max-h-40 overflow-y-auto">
                  {searchResults.map((user) => (
                    <li
                      key={user.id}
                      className="p-2 cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchQuery(user.name);
                        setSearchResults([]);
                      }}
                    >
                      {user.name}
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
            <div>
              <label className="block mb-2 font-medium">Topic</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>

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
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Comment</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
                rows={4}
                required
              />
            </div>

            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
              Submit Feedback
            </button>
          </form>
        </div>

        {/* Recent Feedback given to the logged-in user */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Feedback</h2>

          {loading ? (
            <div>Loading feedbacks...</div>
          ) : feedbacks.length > 0 ? (
            <div className="space-y-6">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="border-b pb-4">
                  <h3 className="font-bold">{feedback.topic}</h3>
                  <p>Rating: {feedback.rating}/5</p>
                  <p>{feedback.comment}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(feedback.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No feedback available</p>
          )}
        </div>
      </div>
    </div>
  );
}
