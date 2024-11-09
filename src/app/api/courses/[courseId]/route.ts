// src/app/api/courses/[courseId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
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
      select: { id: true, name: true, passKey: true },
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

// PATCH: Update a course
export async function PATCH(
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

  const { name, passKey } = await request.json();

  // Validate input
  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Course name is required.' }, { status: 400 });
  }

  if (passKey !== null && passKey !== undefined && passKey !== '') {
    if (!/^[a-zA-Z0-9]{0,6}$/.test(passKey.trim())) {
      return NextResponse.json({ error: 'PassKey must be alphanumeric and up to 6 characters.' }, { status: 400 });
    }
  }

  try {
    const updatedCourse = await prisma.course.update({
      where: { id: parsedCourseId },
      data: {
        name: name.trim(),
        passKey: passKey ? passKey.trim() : null,
      },
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error: any) {
    console.error('Error updating course:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return NextResponse.json({ error: 'Course name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update course.' }, { status: 500 });
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
    // Delete related UserCourse entries first
    await prisma.userCourse.deleteMany({
      where: { courseId: parsedCourseId },
    });

    // Delete the course itself
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
