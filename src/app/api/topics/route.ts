// src/app/api/topics/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

interface TopicPayload {
  name: string;
  courseId: number;
}

/**
 * GET Method: Fetch all predefined topics for the authenticated user
 */
export async function GET(request: Request) {
  try {
    // Retrieve the session to authenticate the user
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Optionally, implement further authorization here

    const topics = await prisma.topic.findMany({
      orderBy: { name: 'asc' },
      include: { course: { select: { id: true, name: true } } },
    });
    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST Method: Create a new topic (Admin only)
 */
export async function POST(request: Request) {
  try {
    // Retrieve the session to authenticate the user
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have admin privileges.' },
        { status: 403 }
      );
    }

    const { name, courseId } = (await request.json()) as TopicPayload;

    // Validate the topic name and courseId
    if (
      !name ||
      typeof name !== 'string' ||
      name.trim() === '' ||
      !courseId ||
      typeof courseId !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Topic name and valid courseId are required.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Associated course does not exist.' },
        { status: 404 }
      );
    }

    // Check if the topic already exists within the course
    const existingTopic = await prisma.topic.findUnique({
      where: {
        name_courseId: {
          name: trimmedName,
          courseId: courseId,
        },
      },
    });

    if (existingTopic) {
      return NextResponse.json(
        { error: 'Topic name already exists for this course.' },
        { status: 409 }
      );
    }

    // Create the new topic
    const topic = await prisma.topic.create({
      data: {
        name: trimmedName,
        courseId: courseId,
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violation
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Topic name already exists for this course.' },
          { status: 409 }
        );
      }
    }
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
