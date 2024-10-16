// types/next-auth.d.ts

import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Changed from number to string
      name: string;
      email: string;
      // No 'role' or 'image' properties
    };
  }
}
