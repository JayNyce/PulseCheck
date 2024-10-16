// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // Ensure this path is correct

const handler = NextAuth(authOptions);

// Export the handler for GET and POST methods as required by Next.js API routes
export { handler as GET, handler as POST };
