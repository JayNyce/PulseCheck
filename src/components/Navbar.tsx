// src/components/Navbar.tsx

'use client';

import Link from 'next/link';
import React from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import AnimatedSignOutButton from './signout';
import AnimatedFeedbackButton from './feedbackButton';
import AnimatedSignInButton from './signin';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const feedbackDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close Feedback dropdown when clicking outside
  useEffect(() => {
    const handleClickOutsideFeedback = (event: MouseEvent) => {
      if (
        feedbackDropdownRef.current &&
        !feedbackDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFeedbackOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideFeedback);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideFeedback);
    };
  }, []);

  // Close User menu dropdown when clicking outside
  useEffect(() => {
    const handleClickOutsideUserMenu = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideUserMenu);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideUserMenu);
    };
  }, []);

  // Close mobile menu and dropdowns when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsFeedbackOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-gray-800 bg-opacity-80 text-white shadow-md p-4">
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 mt-4 lg:mt-0">
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
            <div className="relative" ref={feedbackDropdownRef}>
              <AnimatedFeedbackButton
                onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
                isActive={pathname.startsWith('/feedbacks')}
              />
              {isFeedbackOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 text-white rounded-md shadow-lg z-20 ease-in-out">
                  <Link
                    href="/feedbacks/submit"
                    className={`block px-4 py-2 hover:bg-gray-700 rounded-t-md ${
                      pathname === '/feedbacks/submit' ? 'bg-gray-700 font-semibold' : ''
                    }`}
                    onClick={() => setIsFeedbackOpen(false)}
                  >
                    Submit Feedback
                  </Link>
                  <Link
                    href="/feedbacks/received"
                    className={`block px-4 py-2 hover:bg-gray-700 duration-500 ${
                      pathname === '/feedbacks/received' ? 'bg-gray-700 font-semibold' : ''
                    }`}
                    onClick={() => setIsFeedbackOpen(false)}
                  >
                    Received Feedback
                  </Link>
                  <Link
                    href="/feedbacks/given"
                    className={`block px-4 py-2 hover:bg-gray-700 rounded-b-md ${
                      pathname === '/feedbacks/given' ? 'bg-gray-700 font-semibold' : ''
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

            {/* Instructor Dashboard Link */}
            {session?.user?.isInstructor && (
              <Link
                href="/instructor"
                className={`text-white hover:bg-gray-700 px-3 py-2 rounded ${
                  pathname.startsWith('/instructor') ? 'bg-gray-700 font-semibold' : ''
                }`}
              >
                Instructor Dashboard
              </Link>
            )}

            {/* Admin Dashboard Link */}
            {session?.user?.isAdmin && (
              <Link
                href="/admin"
                className={`text-white hover:bg-gray-700 px-3 py-2 rounded ${
                  pathname.startsWith('/admin') ? 'bg-gray-700 font-semibold' : ''
                }`}
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* User Authentication Links */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:ml-auto mt-4 lg:mt-0 relative">
            {status === 'loading' ? null : session ? (
              <>
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="text-white flex items-center focus:outline-none px-3 py-2 hover:bg-gray-700 rounded"
                  >
                    {session.user.name}
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
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-red-500 text-white rounded-md shadow-lg z-20">
                    <AnimatedSignOutButton onSignOut={() => signOut()} />
                  </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
              >
                <AnimatedSignInButton onSignIn={() => signIn()} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
