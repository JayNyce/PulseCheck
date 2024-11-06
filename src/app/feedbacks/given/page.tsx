// src/app/feedbacks/given/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Feedback {
  id: number;
  toUser: { name: string };
  topic: { name: string };
  rating: number;
  comment: string;
  created_at: string;
}

export default function GivenFeedbackPage() {
  const { data: session, status } = useSession();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editTopic, setEditTopic] = useState<string>('');
  const [editComment, setEditComment] = useState<string>('');
  const [message, setMessage] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      window.location.href = '/auth/login';
    }
  }, [session, status]);

  // Fetch given feedbacks
  const fetchGivenFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setFeedbacks(data.givenFeedback.recentFeedbacks);
    } catch (error) {
      console.error('Error fetching given feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchGivenFeedbacks();
    }
  }, [session]);

  // Handle Delete Feedback
  const handleDelete = async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const res = await fetch(`/api/feedbacks/${feedbackId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete feedback');
      setMessage('Feedback deleted successfully.');
      fetchGivenFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setMessage('Failed to delete feedback.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Handle Edit Feedback
  const handleEdit = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setEditRating(feedback.rating);
    setEditTopic(feedback.topic.name);
    setEditComment(feedback.comment);
  };

  // Submit Edited Feedback
  const submitEdit = async () => {
    if (!editingFeedback) return;
    try {
      const res = await fetch(`/api/feedbacks/${editingFeedback.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editRating, topic: editTopic, comment: editComment }),
      });
      if (!res.ok) throw new Error('Failed to update feedback');
      setMessage('Feedback updated successfully.');
      setEditingFeedback(null);
      fetchGivenFeedbacks();
    } catch (error) {
      console.error('Error updating feedback:', error);
      setMessage('Failed to update feedback.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Feedback Given</h2>

      {message && (
        <p
          className={`mb-4 text-center font-semibold ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}

      {loading ? (
        <div>Loading feedbacks...</div>
      ) : feedbacks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Recipient</th>
                <th className="px-4 py-2 text-left">Topic</th>
                <th className="px-4 py-2 text-left">Rating</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((feedback) => (
                <tr key={feedback.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{feedback.toUser?.name || 'Unknown Recipient'}</td>
                  <td className="px-4 py-2">{feedback.topic?.name || 'Unknown Topic'}</td>
                  <td className="px-4 py-2">{feedback.rating}</td>
                  <td className="px-4 py-2">
                    <button
                      className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => handleEdit(feedback)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleDelete(feedback.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No feedbacks given yet.</p>
      )}

      {/* Edit Feedback Modal */}
      {editingFeedback && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Edit Feedback</h2>
            <form onSubmit={(e) => { e.preventDefault(); submitEdit(); }} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block mb-2 font-medium">Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editRating}
                  onChange={(e) => setEditRating(Number(e.target.value))}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
              {/* Topic */}
              <div>
                <label className="block mb-2 font-medium">Topic</label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
              {/* Comment */}
              <div>
                <label className="block mb-2 font-medium">Comment</label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  rows={4}
                  required
                />
              </div>
              {/* Actions */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={() => setEditingFeedback(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
