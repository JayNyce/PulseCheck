// src/app/feedbacks/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Feedback {
  id: number;
  topicId: number;
  topic: {
    name: string;
  };
  rating: number;
  comment: string;
  toUserId: number;
  fromUserId?: number;
  created_at: string;
  fromUser?: {
    name: string | null;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Topic {
  id: number;
  name: string;
}

interface FormData {
  topicId: string;
  rating: string;
  comment: string;
  to_user_id: string;
  anonymous: boolean;
}

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [formData, setFormData] = useState<FormData>({
    topicId: '',
    rating: '',
    comment: '',
    to_user_id: '',
    anonymous: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]); // Initialize as empty array

  const [filters, setFilters] = useState({
    keyword: '',
    startDate: '',
    endDate: '',
    minRating: '',
    maxRating: '',
    topic: '',
    anonymous: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth/login');
  }, [session, status, router]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch('/api/topics');
        const data: Topic[] = await res.json();
        if (Array.isArray(data)) {
          setTopics(data);
        } else {
          console.error('Expected an array of topics', data);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchFeedbacks = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          params.append('to_user_id', session.user.id.toString());

          Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
          });

          const res = await fetch(`/api/feedbacks?${params.toString()}`);
          const data: Feedback[] = await res.json();
          setFeedbacks(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching feedbacks:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchFeedbacks();
    }
  }, [session, filters]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/users?search=${encodeURIComponent(query)}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      alert('Please select a user to give feedback.');
      return;
    }

    const from_user_id = formData.anonymous ? undefined : session?.user?.id;

    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: parseInt(formData.topicId),
          rating: formData.rating,
          comment: formData.comment,
          to_user_id: selectedUser.id,
          from_user_id,
        }),
      });

      if (res.ok) {
        setMessage('Feedback submitted successfully!');
        setFormData({ topicId: '', rating: '', comment: '', to_user_id: '', anonymous: false });
        setSelectedUser(null);
        setSearchQuery('');
        setSearchResults([]);

        const feedbackRes = await fetch(`/api/feedbacks?to_user_id=${session?.user?.id}`);
        const data: Feedback[] = await feedbackRes.json();
        setFeedbacks(Array.isArray(data) ? data : []);
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="w-full flex justify-between items-center px-6 py-4 bg-gray-100">
        {/* Header will be managed by NavBar */}
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar with Filters */}
        <div className="w-64 bg-white border-r border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Keyword</label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="Search by keyword..."
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Topic</label>
              <select
                value={filters.topic}
                onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="">All Topics</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.name}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Minimum Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="">No Minimum</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Maximum Rating</label>
              <select
                value={filters.maxRating}
                onChange={(e) => setFilters({ ...filters, maxRating: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="">No Maximum</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Anonymous</label>
              <select
                value={filters.anonymous}
                onChange={(e) => setFilters({ ...filters, anonymous: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="">All</option>
                <option value="true">Anonymous Only</option>
                <option value="false">Non-Anonymous Only</option>
              </select>
            </div>

            <button
              onClick={() =>
                setFilters({
                  keyword: '',
                  startDate: '',
                  endDate: '',
                  minRating: '',
                  maxRating: '',
                  topic: '',
                  anonymous: '',
                })
              }
              className="w-full mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {message && (
            <p className={`mb-4 text-center font-semibold ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Submit Feedback</h2>

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
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
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
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </select>
                </div>

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

                <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                  Submit Feedback
                </button>
              </form>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Recent Feedback</h2>

              {loading ? (
                <div>Loading feedbacks...</div>
              ) : feedbacks.length > 0 ? (
                <div className="space-y-6">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="border-b pb-4">
                      <h3 className="font-bold text-lg">{feedback.topic.name}</h3>
                      <p className="text-sm">Rating: {feedback.rating}/5</p>
                      <p className="text-sm">{feedback.comment}</p>
                      {feedback.fromUser ? (
                        <p className="text-xs text-gray-500">From: {feedback.fromUser.name}</p>
                      ) : (
                        <p className="text-xs text-gray-500">From: Anonymous</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(feedback.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No feedback available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
