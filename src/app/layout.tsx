'use client';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import './globals.css'; // Ensure this import is present
import Navbar from '@/components/Navbar'; // Import the Navbar component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {/* Navbar added back here */}
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
