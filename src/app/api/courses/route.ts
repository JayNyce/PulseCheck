// src/app/api/courses/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET Method: Fetch all courses the user is enrolled in or instructing
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = typeof session.user.id === 'number' ? session.user.id : parseInt(session.user.id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    // Fetch courses where the user is enrolled or is the instructor
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { userCourses: { some: { userId } } },
          { instructorId: userId },
        ],
      },
      include: {
        instructor: { select: { name: true, email: true } },
        topics: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST Method: Create a new course
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = typeof session.user.id === 'number' ? session.user.id : parseInt(session.user.id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    // Verify that the user is an instructor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isInstructor: true },
    });

    if (!user || !user.isInstructor) {
      return NextResponse.json({ error: 'Forbidden: Only instructors can create courses.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, passKey } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Course name is required and must be a string.' }, { status: 400 });
    }

    // Optional: Validate passKey if needed (e.g., minimum length)
    let finalPassKey: string | null = null;
    if (passKey && typeof passKey === 'string') {
      finalPassKey = passKey.trim();
      // Example validation: minimum 6 characters
      if (finalPassKey.length < 6) {
        return NextResponse.json({ error: 'PassKey must be at least 6 characters long.' }, { status: 400 });
      }
    }

    // Create the course with instructorId
    const course = await prisma.course.create({
      data: {
        name: name.trim(),
        passKey: finalPassKey,
        instructorId: userId,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error('Error creating course:', error);
    if (error.code === 'P2002') { // Unique constraint failed
      return NextResponse.json({ error: 'Course name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
