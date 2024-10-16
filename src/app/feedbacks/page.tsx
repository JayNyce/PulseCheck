// src/app/feedbacks/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function FeedbackPage() {
  const { data: session, status } = useSession(); // Check session status
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({ course_name: '', rating: '', comment: '', to_user_id: '' });
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  const [searchResults, setSearchResults] = useState([]); // Users that match the search query
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for feedback

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
    const fetchFeedbacks = async () => {
      const res = await fetch(`/api/feedbacks?to_user_id=${session.user.id}`);
      const data = await res.json();
      setFeedbacks(data);
    };

    fetchFeedbacks();
  }, [session]);

  // Fetch users based on search query
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) { // Only search when the query is 3 or more characters
      const res = await fetch(`/api/users?search=${query}`);
      const data = await res.json();
      setSearchResults(data);
    } else {
      setSearchResults([]); // Clear results if query is too short
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      alert('Please select a user to give feedback.');
      return;
    }

    await fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, to_user_id: selectedUser.id }), // Submit feedback to the selected user
    });

    setFormData({ course_name: '', rating: '', comment: '', to_user_id: '' });
    const res = await fetch(`/api/feedbacks?to_user_id=${session.user.id}`);
    const data = await res.json();
    setFeedbacks(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 bg-gray-50">
      <h1 className="text-4xl font-bold mb-10">PulseCheck: Feedback</h1>

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
            {searchResults.length > 0 && (
              <ul className="bg-white border border-gray-300 mt-2 max-h-40 overflow-y-auto">
                {searchResults.map((user) => (
                  <li
                    key={user.id}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchQuery(user.name); // Display selected user in the search input
                      setSearchResults([]); // Clear search results
                    }}
                  >
                    {user.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedUser && <p className="mb-4">Giving feedback to: <strong>{selectedUser.name}</strong></p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Course Name</label>
              <input
                type="text"
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
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
                <option value="" disabled>Select a rating</option>
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

            <button type="submit" className="bg-black text-white px-4 py-2 rounded">Submit Feedback</button>
          </form>
        </div>

        {/* Recent Feedback given to the logged-in user */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Feedback</h2>

          <div className="space-y-6">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="border-b pb-4">
                <h3 className="font-bold">{feedback.course_name}</h3>
                <p>Rating: {feedback.rating}/5</p>
                <p>{feedback.comment}</p>
                <p className="text-sm text-gray-500">{new Date(feedback.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
