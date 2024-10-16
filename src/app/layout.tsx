// src/app/layout.tsx
"use client"; // Mark this as a client component

import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react'; // Import SessionProvider

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider> {/* Wrap children with SessionProvider */}
      </body>
    </html>
  );
}
