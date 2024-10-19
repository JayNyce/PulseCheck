// src/components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          PulseCheck
        </Link>
        <div className="flex space-x-4">
          {status === 'loading' ? null : session ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              {session.user.isAdmin && (
                <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                  Admin Dashboard
                </Link>
              )}
              <Link href="/api/auth/signout" className="text-gray-700 hover:text-gray-900">
                Sign Out
              </Link>
            </>
          ) : (
            <Link href="/auth/login" className="text-gray-700 hover:text-gray-900">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
