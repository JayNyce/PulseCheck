// src/middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Allow the following paths without authentication
    if (
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/auth/login') ||
      pathname.startsWith('/auth/error') ||
      pathname === '/' // Home page
    ) {
      return NextResponse.next();
    }

    // Protect the admin route
    if (pathname.startsWith('/admin')) {
      const token = req.nextauth.token;

      if (!token || !token.isAdmin) {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard'; // Redirect to dashboard if not admin
        return NextResponse.redirect(url);
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
  matcher: ['/admin/:path*'],
};
