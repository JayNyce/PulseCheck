// src/app/api/admin/courses/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

interface CoursePayload {
  name: string;
  passKey?: string | null;
  instructorId: number;
}

/**
 * GET Method: Fetch all courses (Admin only)
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
        topics: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST Method: Create a new course (Admin only)
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, passKey, instructorId } = (await request.json()) as CoursePayload;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Course name is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (!instructorId || typeof instructorId !== 'number') {
      return NextResponse.json(
        { error: 'Valid instructorId is required.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check for duplicate course name
    const existingCourse = await prisma.course.findUnique({
      where: { name: trimmedName },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course name already exists.' },
        { status: 409 }
      );
    }

    // Verify instructor exists and is an instructor
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
    });

    if (!instructor || !instructor.isInstructor) {
      return NextResponse.json(
        { error: 'Instructor does not exist or is not an instructor.' },
        { status: 404 }
      );
    }

    // Create the course
    const course = await prisma.course.create({
      data: {
        name: trimmedName,
        passKey: passKey ? passKey.trim() : null,
        instructorId: instructorId,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Course name already exists.' },
          { status: 409 }
        );
      }
    }
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
