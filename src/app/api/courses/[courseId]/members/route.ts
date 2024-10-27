// src/app/api/courses/[courseId]/members/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Params {
  courseId: string;
}

// GET: Fetch all members of a course
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
      include: { userCourses: { include: { user: true } } },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    const members = course.userCourses.map((userCourse) => userCourse.user);

    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    console.error('Error fetching course members:', error);
    return NextResponse.json({ error: 'Failed to fetch members.' }, { status: 500 });
  }
}

// POST: Add a member to a course
export async function POST(
  request: Request,
  { params }: { params: Params }
) {
  const { courseId } = params;

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);
  const { userId } = await request.json();
  const parsedUserId = parseInt(userId, 10);

  if (isNaN(parsedCourseId) || isNaN(parsedUserId)) {
    return NextResponse.json({ error: 'Invalid course ID or user ID.' }, { status: 400 });
  }

  try {
    // Check if the user is already a member of this specific course
    const existingUserCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: parsedUserId,
          courseId: parsedCourseId,
        },
      },
    });

    if (existingUserCourse) {
      return NextResponse.json(
        { error: 'User is already a member of this course.' },
        { status: 400 }
      );
    }

    // Add the user to the course
    const newUserCourse = await prisma.userCourse.create({
      data: { userId: parsedUserId, courseId: parsedCourseId },
      include: { user: true },
    });

    // Return the newly added user
    return NextResponse.json(newUserCourse.user, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Failed to add member.' }, { status: 500 });
  }
}
