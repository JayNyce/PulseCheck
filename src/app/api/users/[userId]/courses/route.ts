// src/app/api/users/[userId]/courses/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    // Parse and validate userId
    const id = parseInt(userId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Fetch courses associated with the user
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
      },
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
