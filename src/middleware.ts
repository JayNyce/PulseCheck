// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define the secret for JWT
const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // 1. Allow public paths without authentication
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth/login') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // 2. Allow unauthenticated GET requests to /api/courses
  if (pathname === '/api/courses' && method === 'GET') {
    return NextResponse.next();
  }

  // 3. Allow unauthenticated GET requests to specific course details if needed
  // Example: /api/courses/123
  if (pathname.match(/^\/api\/courses\/\d+$/) && method === 'GET') {
    return NextResponse.next();
  }

  // 4. Protect enrollment endpoints: /api/courses/[id]/enroll
  if (pathname.match(/^\/api\/courses\/\d+\/enroll$/) && ['POST', 'DELETE'].includes(method)) {
    const token = await getToken({ req, secret });

    if (!token) {
      // Redirect unauthenticated users to the sign-in page with a callback
      return NextResponse.redirect(
        new URL(`/api/auth/signin?callbackUrl=${encodeURIComponent(req.nextUrl.href)}`, req.url)
      );
    }

    // Optionally, you can add role-based checks here if needed
    // Example: Only allow students to enroll
    // if (!token.isStudent) {
    //   return NextResponse.redirect(new URL('/dashboard', req.url));
    // }

    return NextResponse.next();
  }

  // 5. Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret });
    if (!token || !token.isAdmin) {
      // Redirect non-admin users to the dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // 6. Protect instructor routes
  if (pathname.startsWith('/instructor')) {
    const token = await getToken({ req, secret });
    if (!token || !token.isInstructor) {
      // Redirect non-instructors to the dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // 7. Protect other API routes (excluding /api/courses GET)
  if (pathname.startsWith('/api')) {
    const token = await getToken({ req, secret });
    if (!token) {
      // Redirect unauthenticated API requests to the sign-in page with a callback
      return NextResponse.redirect(
        new URL(`/api/auth/signin?callbackUrl=${encodeURIComponent(req.nextUrl.href)}`, req.url)
      );
    }
  }

  // 8. For all other routes, proceed as normal
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/instructor/:path*',
    '/api/courses/:courseId/enroll',
    '/api/:path*',
  ],
};
