// src/app/api/users/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  try {
    // Convert session.user.id to a number
    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    // Get the user's course IDs
    const userCourses = await prisma.userCourse.findMany({
      where: {
        userId: userId,
      },
      select: {
        courseId: true,
      },
    });

    const courseIds = userCourses.map((uc) => uc.courseId);

    // Find users who are in the same courses
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: userId, // Exclude current user
        },
        userCourses: {
          some: {
            courseId: {
              in: courseIds,
            },
          },
        },
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}
