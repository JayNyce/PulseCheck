// src/app/auth/reset-password/[token]/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const token = params.token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, token }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        // Redirect to login page after a delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 shadow-md rounded-md">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        {message && <p>{message}</p>}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-black text-white p-2 rounded">
          Reset Password
        </button>
      </form>
    </div>
  );
}
