// src/app/api/courses/[courseId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Params {
  courseId: string;
}

// GET: Fetch course details
export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { courseId } = params;

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);

  if (isNaN(parsedCourseId)) {
    return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      select: { id: true, name: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course data.' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a course
export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  const { courseId } = params;

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);

  if (isNaN(parsedCourseId)) {
    return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
  }

  try {
    await prisma.userCourse.deleteMany({
      where: { courseId: parsedCourseId },
    });

    await prisma.course.delete({
      where: { id: parsedCourseId },
    });

    return NextResponse.json(
      { message: 'Course deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course.' },
      { status: 500 }
    );
  }
}
