// src/app/api/instructor/courses/[courseId]/members/[userId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

interface Params {
  courseId: string;
  userId: string; // Made userId required
}

// DELETE: Remove a member
export async function DELETE(
  req: Request,
  { params }: { params: Params }
) {
  const { courseId, userId } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);
  const parsedUserId = parseInt(userId, 10);

  if (isNaN(parsedCourseId) || isNaN(parsedUserId)) {
    return NextResponse.json({ error: 'Invalid course or user ID.' }, { status: 400 });
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
    await prisma.userCourse.delete({
      where: {
        userId_courseId: {
          userId: parsedUserId,
          courseId: parsedCourseId,
        },
      },
    });

    return NextResponse.json({ message: 'Member removed successfully.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
