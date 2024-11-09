// src/app/api/instructor/courses/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust the import path based on your project structure

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is an instructor
  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const courses = await prisma.course.findMany({
      where: {
        instructorId: parseInt(session.user.id, 10),
      },
      select: {
        id: true,
        name: true,
        passKey: true,
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is an instructor
  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, passKey } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Course name is required.' }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        name,
        passKey: passKey || null,
        instructorId: parseInt(session.user.id, 10),
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
