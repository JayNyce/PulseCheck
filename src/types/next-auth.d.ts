// types/next-auth.d.ts

import NextAuth, { DefaultSession, DefaultUser, DefaultJWT } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    isAdmin: boolean;
    isInstructor: boolean; 
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin: boolean;
      isInstructor: boolean; 
      name?: string | null;
      email?: string | null;
    } & DefaultSession['user'];
  }

  interface JWT extends DefaultJWT {
    id: string;
    isAdmin: boolean;
    isInstructor: boolean; 
  }
}
