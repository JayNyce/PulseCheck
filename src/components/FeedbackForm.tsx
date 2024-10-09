// src/components/FeedbackForm.tsx
'use client';

import { useState } from 'react';

export default function FeedbackForm() {
  const [content, setContent] = useState<string>('');

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just log the feedback
    console.log('Feedback submitted:', content);
    alert('Feedback submitted!');
    setContent('');
  };

  return (
    <form onSubmit={submitFeedback} className="mb-6">
      <textarea
        className="w-full p-2 border border-gray-300 rounded mb-2"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter your feedback here..."
        rows={5}
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Submit Feedback
      </button>
    </form>
  );
}
