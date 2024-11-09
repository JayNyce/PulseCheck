// src/app/api/courses/[courseId]/topics/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Topic {
  id: number;
  name: string;
}

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = params;
  const session = await getServerSession(authOptions);

  // Authentication Check
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse userId and courseId
  const userId = typeof session.user.id === 'number' ? session.user.id : parseInt(session.user.id, 10);
  const parsedCourseId = parseInt(courseId, 10);

  if (isNaN(userId) || isNaN(parsedCourseId)) {
    return NextResponse.json({ error: 'Invalid user or course ID.' }, { status: 400 });
  }

  try {
    // Verify course existence and user enrollment
    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      include: {
        userCourses: {
          where: { userId },
          select: { userId: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    if (course.userCourses.length === 0) {
      return NextResponse.json({ error: 'Forbidden: Not enrolled in this course.' }, { status: 403 });
    }

    // Fetch topics for the enrolled course
    const topics: Topic[] = await prisma.topic.findMany({
      where: { courseId: parsedCourseId },
      select: { id: true, name: true },
    });

    return NextResponse.json(topics, { status: 200 });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
