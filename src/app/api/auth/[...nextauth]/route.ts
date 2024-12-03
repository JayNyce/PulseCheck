
// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Export GET and POST handlers directly as NextAuth instance
export const GET = (req: any, res: any) => NextAuth(authOptions)(req, res);
export const POST = (req: any, res: any) => NextAuth(authOptions)(req, res);
