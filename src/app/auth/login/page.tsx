// src/app/auth/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link from Next.js

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      router.push('/feedbacks');
    } else {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Hello! Lets Create an account! */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 shadow-md rounded-md">
        <h1 className="text-2xl font-bold">Login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-black text-white p-2 rounded">
          Login
        </button>

        {/* Forgot Password Link */}
        <div className="text-center mt-4">
          <Link href="/auth/forgot-password" className="text-blue-600 underline">
            Forgot your password?
          </Link>
        </div>

        {/* Add a Sign Up button below the login button */}
        <div className="text-center mt-4">
          <p>Don't have an account?</p>
          <button
            type="button"
            onClick={() => router.push('/auth/signup')}
            className="text-blue-600 underline"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
