// src/middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow public paths
    if (
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/auth/login') ||
      pathname === '/'
    ) {
      return NextResponse.next();
    }

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!token || !token.isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Protect instructor routes
    if (pathname.startsWith('/instructor')) {
      if (!token || !token.isInstructor) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/instructor/:path*'],
};
