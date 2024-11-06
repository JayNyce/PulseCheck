// src/app/api/courses/[courseId]/enroll/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Params {
  courseId: string;
}

// POST: Enroll the current user in a course
export async function POST(
  request: Request,
  { params }: { params: Params }
) {
  const { courseId } = params;

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);

  if (isNaN(parsedCourseId)) {
    return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
  }

  // Parse userId as integer
  const userId = parseInt(session.user.id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID in session.' }, { status: 400 });
  }

  try {
    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // If course has a passKey, validate it
    if (course.passKey) {
      const body = await request.json();
      const passKey = body.passKey?.trim();
      if (!passKey) {
        return NextResponse.json({ error: 'Passkey is required for this course.' }, { status: 400 });
      }
      if (passKey !== course.passKey.trim()) {
        return NextResponse.json({ error: 'Invalid passkey provided.' }, { status: 400 });
      }
    }

    // Check if the user is already enrolled
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userId, // Now an integer
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
        userId: userId, // Now an integer
        courseId: parsedCourseId,
      },
      include: {
        course: true,
      },
    });

    // Return only the course data
    return NextResponse.json(newEnrollment.course, { status: 201 });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ error: 'Failed to enroll in the course.' }, { status: 500 });
  }
}

// DELETE: Unenroll the current user from a course
export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  const { courseId } = params;

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);

  if (isNaN(parsedCourseId)) {
    return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
  }

  // Parse userId as integer
  const userId = parseInt(session.user.id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID in session.' }, { status: 400 });
  }

  try {
    // Check if the enrollment exists
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userId, // Now an integer
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
          userId: userId, // Now an integer
          courseId: parsedCourseId,
        },
      },
    });

    return NextResponse.json(
      { message: 'Successfully unenrolled from the course.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    return NextResponse.json({ error: 'Failed to unenroll from the course.' }, { status: 500 });
  }
}
