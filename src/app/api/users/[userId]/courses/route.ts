// src/app/api/users/[userId]/courses/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const session = await getServerSession(authOptions);

  // Parse and validate userId
  const id = parseInt(userId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  // Ensure the requesting user matches the userId parameter or is an admin
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse session.user.id as integer
  const userIdInt = parseInt(session.user.id, 10);
  if (isNaN(userIdInt)) {
    return NextResponse.json({ error: 'Invalid user ID in session.' }, { status: 400 });
  }

  // Authorization check
  if (userIdInt !== id && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch courses associated with the user along with the count of enrolled students
    const courses = await prisma.course.findMany({
      where: {
        userCourses: {
          some: {
            userId: id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { userCourses: true }, // Counts the number of enrollments per course
        },
      },
    });

    // Map the response to include a more readable field name if desired
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      name: course.name,
      studentCount: course._count.userCourses,
    }));

    return NextResponse.json(formattedCourses, { status: 200 });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
