// src/app/auth/forgot-password/page.tsx
'use client';
import React  from 'react';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setMessage('If this email exists, a password reset link will be sent.');
    } else {
      setMessage('There was an error, please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 shadow-md rounded-md">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p>Enter your email address and we will send you a link to reset your password.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-black text-white p-2 rounded">
          Send Reset Link
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
