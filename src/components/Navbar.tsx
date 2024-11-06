// src/components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close Feedback dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFeedbackOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu and feedback dropdown when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsFeedbackOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-gray-800 text-white shadow-md p-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center text-xl font-bold">
          <Image
            src="/assets/images/icon.png"
            alt="PulseCheck Logo"
            width={40}
            height={40}
            className="mr-2 object-contain"
          />
          PulseCheck
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="block lg:hidden text-white focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {/* Hamburger Icon */}
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              // Close Icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Hamburger Icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Menu Items */}
        <div
          className={`w-full lg:flex lg:items-center lg:w-auto ${
            isMobileMenuOpen ? 'block' : 'hidden'
          }`}
          id="mobile-menu"
        >
          <div className="flex flex-col lg:flex-row lg:space-x-4 mt-4 lg:mt-0">
            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className={`text-white hover:bg-gray-700 px-3 py-2 rounded ${
                pathname === '/dashboard' ? 'bg-gray-700 font-semibold' : ''
              }`}
            >
              Dashboard
            </Link>

            {/* Feedback Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
                className={`text-white hover:bg-gray-700 px-3 py-2 rounded flex items-center focus:outline-none ${
                  pathname.startsWith('/feedbacks') ? 'bg-gray-700 font-semibold' : ''
                }`}
                aria-haspopup="true"
                aria-expanded={isFeedbackOpen}
              >
                Feedback
                {/* Dropdown Arrow Icon */}
                <svg
                  className="ml-1 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isFeedbackOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg z-20">
                  <Link
                    href="/feedbacks/submit"
                    className={`block px-4 py-2 hover:bg-gray-200 ${
                      pathname === '/feedbacks/submit' ? 'bg-gray-200 font-semibold' : ''
                    }`}
                    onClick={() => setIsFeedbackOpen(false)}
                  >
                    Submit Feedback
                  </Link>
                  <Link
                    href="/feedbacks/received"
                    className={`block px-4 py-2 hover:bg-gray-200 ${
                      pathname === '/feedbacks/received' ? 'bg-gray-200 font-semibold' : ''
                    }`}
                    onClick={() => setIsFeedbackOpen(false)}
                  >
                    Received Feedback
                  </Link>
                  <Link
                    href="/feedbacks/given"
                    className={`block px-4 py-2 hover:bg-gray-200 ${
                      pathname === '/feedbacks/given' ? 'bg-gray-200 font-semibold' : ''
                    }`}
                    onClick={() => setIsFeedbackOpen(false)}
                  >
                    Given Feedback
                  </Link>
                </div>
              )}
            </div>

            {/* Courses Link */}
            <Link
              href="/courses"
              className={`text-white hover:bg-gray-700 px-3 py-2 rounded ${
                pathname === '/courses' ? 'bg-gray-700 font-semibold' : ''
              }`}
            >
              Courses
            </Link>

            {/* Admin Dashboard Link (Visible Only to Admins) */}
            {session?.user?.isAdmin && (
              <Link
                href="/admin"
                className={`text-white hover:bg-gray-700 px-3 py-2 rounded ${
                  pathname === '/admin' ? 'bg-gray-700 font-semibold' : ''
                }`}
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* User Authentication Links */}
          <div className="flex flex-col lg:flex-row lg:space-x-4 mt-4 lg:mt-0">
            {status === 'loading' ? null : session ? (
              <>
                <span className="text-white mr-4 hidden lg:inline">
                  Hello, {session.user.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded mt-2 lg:mt-0"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
