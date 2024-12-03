// src/app/feedbacks/received/page.tsx

'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Feedback {
  id: number;
  topic: { name: string };
  rating: number;
  comment: string;
  fromUser?: { name: string | null };
  created_at: string;
}

interface Topic {
  id: number;
  name: string;
}

export default function ReceivedFeedbackPage() {
  const { data: session, status } = useSession();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filters, setFilters] = useState({
    keyword: '',
    startDate: '',
    endDate: '',
    minRating: '',
    maxRating: '',
    topic: '',
    anonymous: '',
  });
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      window.location.href = '/auth/login';
    }
  }, [session, status]);

  // Fetch topics for filter dropdown
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch('/api/topics');
        if (!res.ok) throw new Error('Failed to fetch topics');
        const data: Topic[] = await res.json();
        setTopics(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };
    fetchTopics();
  }, []);

  // Fetch feedbacks with filters applied
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const res = await fetch(`/api/feedbacks?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch feedbacks');
        const data: Feedback[] = await res.json();
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [filters]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Received Feedback</h2>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          placeholder="Keyword"
          className="w-full border border-gray-300 p-2 rounded"
        />
        <div className="flex space-x-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-1/2 border border-gray-300 p-2 rounded"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-1/2 border border-gray-300 p-2 rounded"
          />
        </div>
        <div className="flex space-x-2">
          <input
            type="number"
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
            placeholder="Min Rating"
            className="w-1/2 border border-gray-300 p-2 rounded"
            min="1"
            max="5"
          />
          <input
            type="number"
            value={filters.maxRating}
            onChange={(e) => setFilters({ ...filters, maxRating: e.target.value })}
            placeholder="Max Rating"
            className="w-1/2 border border-gray-300 p-2 rounded"
            min="1"
            max="5"
          />
        </div>
        <select
          value={filters.topic}
          onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
          className="w-full border border-gray-300 p-2 rounded"
        >
          <option value="">All Topics</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id.toString()}>
              {topic.name}
            </option>
          ))}
        </select>
        <select
          value={filters.anonymous}
          onChange={(e) => setFilters({ ...filters, anonymous: e.target.value })}
          className="w-full border border-gray-300 p-2 rounded"
        >
          <option value="">All</option>
          <option value="true">Anonymous</option>
          <option value="false">Not Anonymous</option>
        </select>
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
          className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>

      {/* Feedback List */}
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
  );
}
