// src/app/api/courses/[courseId]/members/[userId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Params {
  courseId: string;
  userId: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  const { courseId, userId } = params;

  // Only pass `authOptions` as parameter
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);
  const parsedUserId = parseInt(userId, 10);

  if (isNaN(parsedCourseId) || isNaN(parsedUserId)) {
    return NextResponse.json(
      { error: 'Invalid course ID or user ID.' },
      { status: 400 }
    );
  }

  try {
    // Remove the user from the course
    await prisma.userCourse.delete({
      where: {
        userId_courseId: {
          userId: parsedUserId,
          courseId: parsedCourseId,
        },
      },
    });

    return NextResponse.json(
      { message: 'Member removed successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member.' },
      { status: 500 }
    );
  }
}
