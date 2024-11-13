// src/app/api/instructor/courses/[courseId]/members/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

interface Params {
  courseId: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
  const { courseId } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);
  if (isNaN(parsedCourseId)) {
    return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
  }

  const course = await prisma.course.findFirst({
    where: {
      id: parsedCourseId,
      instructorId: parseInt(session.user.id, 10),
    },
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const members = await prisma.user.findMany({
    where: {
      userCourses: {
        some: {
          courseId: parsedCourseId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return NextResponse.json(members);
}

export async function POST(req: Request, { params }: { params: Params }) {
  const { courseId } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);
  if (isNaN(parsedCourseId)) {
    return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
  }

  const { userId } = await req.json();
  if (!userId || isNaN(parseInt(userId, 10))) {
    return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
  }

  const course = await prisma.course.findFirst({
    where: {
      id: parsedCourseId,
      instructorId: parseInt(session.user.id, 10),
    },
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  try {
    // Prevent duplicate enrollment
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: parseInt(userId, 10),
          courseId: parsedCourseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'User is already a member of this course.' }, { status: 400 });
    }

    await prisma.userCourse.create({
      data: {
        userId: parseInt(userId, 10),
        courseId: parsedCourseId,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}
