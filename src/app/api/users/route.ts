// src/app/api/users/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  // Retrieve the current session to verify user authentication
  const session = await getServerSession(authOptions);

  // If there is no active session, respond with a 401 Unauthorized error
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Retrieve search parameters from the request URL
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || ''; // Query for user name or email search
  const courseId = parseInt(searchParams.get('courseId') || '', 10); // Course ID to filter users in a specific course

  // Validate the course ID; if invalid, return a 400 Bad Request error
  if (isNaN(courseId)) {
    return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
  }

  try {
    // Parse the session user ID and validate it
    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    // Query the database for users who are:
    // - Not the current user (to avoid showing themselves in the search)
    // - Enrolled in the specified course (matching `courseId`)
    // - Have a name or email that matches the search query (case insensitive)
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: userId, // Exclude the current user from the search results
        },
        userCourses: {
          some: {
            courseId: courseId, // Only users enrolled in the selected course
          },
        },
        OR: [
          { name: { contains: search, mode: 'insensitive' } }, // Search by name
          { email: { contains: search, mode: 'insensitive' } }, // Search by email
        ],
      },
      select: {
        id: true, // User ID
        name: true, // User name
        email: true, // User email
      },
    });

    // Respond with the list of users as JSON
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    // If an error occurs, respond with a 500 Internal Server Error
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}
