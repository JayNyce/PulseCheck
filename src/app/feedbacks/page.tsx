// src/app/feedbacks/page.tsx
'use client';

import { useState } from 'react';

interface Feedback {
  id: number;
  name: string;
  course: string;
  rating: number;
  comment: string;
  date: string;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: 1,
      name: 'John Doe',
      course: 'React Basics',
      rating: 4,
      comment: 'Great course! The content was well-structured and easy to follow.',
      date: new Date().toLocaleString(),
    },
    {
      id: 2,
      name: 'Jane Smith',
      course: 'Advanced JavaScript',
      rating: 5,
      comment: 'Excellent content and explanations. I learned a lot of new techniques.',
      date: new Date().toLocaleString(),
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    course: '',
    rating: '',
    comment: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newFeedback = {
      id: feedbacks.length + 1,
      name: formData.name,
      course: formData.course,
      rating: Number(formData.rating),
      comment: formData.comment,
      date: new Date().toLocaleString(),
    };

    setFeedbacks([newFeedback, ...feedbacks]); // Add new feedback on top
    setFormData({ name: '', course: '', rating: '', comment: '' }); // Reset form
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 bg-gray-50">
      <h1 className="text-4xl font-bold mb-10">PulseCheck: Student Feedback</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl w-full">
        {/* Submit Feedback Form */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Submit Feedback</h2>
          <p className="text-gray-600 mb-6">Share your thoughts about the course</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Course</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
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

            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
              Submit Feedback
            </button>
          </form>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Feedback</h2>
          <p className="text-gray-600 mb-6">Latest comments from students</p>

          <div className="space-y-6">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="border-b pb-4">
                <h3 className="font-bold">
                  {feedback.name} - {feedback.course}
                </h3>
                <p className="text-sm text-gray-600">Rating: {feedback.rating}/5</p>
                <p className="text-gray-700">{feedback.comment}</p>
                <p className="text-sm text-gray-500">{feedback.date}</p>
              </div>
            ))}
          </div>

          <button
            className="bg-gray-200 mt-6 text-black px-4 py-2 rounded"
            onClick={() => setFeedbacks([...feedbacks])}
          >
            Refresh Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
