// src/app/api/courses/[courseId]/enroll/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Params {
  courseId: string;
}

/**
 * POST: Enroll the current user in a course
 * - During Signup: Unauthenticated request with userId
 * - After Login: Authenticated request
 */
export async function POST(request: Request, { params }: { params: Params }) {
  const { courseId } = params;

  const session = await getServerSession(authOptions);

  let userId: number;

  if (session && session.user && session.user.id) {
    // Authenticated user
    userId = parseInt(session.user.id, 10);
  } else {
    // Unauthenticated user (Enrollment during signup)
    const { userId: bodyUserId, passKey } = await request.json();

    if (!bodyUserId) {
      return NextResponse.json({ error: 'User ID is required for enrollment.' }, { status: 400 });
    }

    userId = parseInt(bodyUserId, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    // For security, ensure that the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
  }

  const parsedCourseId = parseInt(courseId, 10);
  if (isNaN(parsedCourseId)) {
    return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
  }

  try {
    // Fetch the course
    const course = await prisma.course.findUnique({ where: { id: parsedCourseId } });
    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // If course has a passKey, validate it
    if (course.passKey) {
      const { passKey } = await request.json();
      if (!passKey) {
        return NextResponse.json({ error: 'PassKey is required for this course.' }, { status: 400 });
      }
      if (course.passKey !== passKey.trim()) {
        return NextResponse.json({ error: 'Invalid PassKey.' }, { status: 400 });
      }
    }

    // Check if the user is already enrolled
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: parsedCourseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this course.' },
        { status: 400 }
      );
    }

    // Enroll the user in the course
    const newEnrollment = await prisma.userCourse.create({
      data: {
        userId: userId,
        courseId: parsedCourseId,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json(newEnrollment.course, { status: 201 });
  } catch (error: any) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ error: 'Failed to enroll in the course.' }, { status: 500 });
  }
}

/**
 * DELETE: Unenroll the current user from a course
 */
export async function DELETE(request: Request, { params }: { params: Params }) {
  const { courseId } = params;

  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse userId as integer
  const userId = parseInt(session.user.id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID in session.' }, { status: 400 });
  }

  const parsedCourseId = parseInt(courseId, 10);
  if (isNaN(parsedCourseId)) {
    return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
  }

  try {
    // Check if the enrollment exists
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: parsedCourseId,
        },
      },
    });

    if (!existingEnrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course.' },
        { status: 400 }
      );
    }

    // Unenroll the user from the course
    await prisma.userCourse.delete({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: parsedCourseId,
        },
      },
    });

    return NextResponse.json(
      { message: 'Successfully unenrolled from the course.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error unenrolling from course:', error);
    return NextResponse.json({ error: 'Failed to unenroll from the course.' }, { status: 500 });
  }
}
