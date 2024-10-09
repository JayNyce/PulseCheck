// src/components/Layout.tsx
'use client';

import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export default function Layout({ children, user }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-800 p-4 text-white flex justify-between">
        <h1 className="text-xl font-bold">
          <Link href="/">PulseCheck</Link>
        </h1>
        <div>
          {user ? (
            <>
              <span className="mr-4">Welcome, {user.name}</span>
              <Link href="/logout" className="hover:underline">
                Logout
              </Link>
            </>
          ) : (
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          )}
        </div>
      </nav>
      <main className="flex-grow container mx-auto p-4">{children}</main>
      <footer className="bg-gray-800 p-4 text-white text-center">
        &copy; {new Date().getFullYear()} PulseCheck
      </footer>
    </div>
  );
}
