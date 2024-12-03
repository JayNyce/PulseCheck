// src/app/api/admin/topics/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';

interface TopicPayload {
  name: string;
  courseId: number;
}

/**
 * GET Method: Fetch all topics (Admin only)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const topics = await prisma.topic.findMany({
      include: {
        course: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(topics, { status: 200 });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST Method: Create a new topic (Admin only)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, courseId } = (await request.json()) as TopicPayload;

    // Validate input
    if (
      !name ||
      typeof name !== 'string' ||
      name.trim() === '' ||
      !courseId ||
      typeof courseId !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Valid name and courseId are required.' },
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

    // Check for duplicate topic within the course
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
        { error: 'Topic already exists for this course.' },
        { status: 409 }
      );
    }

    // Create the topic
    const topic = await prisma.topic.create({
      data: {
        name: trimmedName,
        courseId: courseId,
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Topic already exists for this course.' },
          { status: 409 }
        );
      }
    }
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
