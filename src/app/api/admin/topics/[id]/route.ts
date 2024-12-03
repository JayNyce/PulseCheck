// src/app/api/admin/topics/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';

interface Params {
  id: string;
}

interface TopicUpdatePayload {
  name?: string;
  courseId?: number;
}

export async function PUT(request: Request, { params }: { params: Params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, courseId } = (await request.json()) as TopicUpdatePayload;

  // Validate input
  if (!name && !courseId) {
    return NextResponse.json(
      { error: 'At least one field (name or courseId) is required for update.' },
      { status: 400 }
    );
  }

  try {
    const topicId = parseInt(id, 10);
    if (isNaN(topicId)) {
      return NextResponse.json({ error: 'Invalid topic ID.' }, { status: 400 });
    }

    // Check if topic exists
    const existingTopic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!existingTopic) {
      return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
    }

    // If courseId is being updated, verify the new course exists
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return NextResponse.json(
          { error: 'Associated course does not exist.' },
          { status: 404 }
        );
      }
    }

    // Update the topic
    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        name: name ? name.trim() : undefined,
        courseId: courseId || undefined,
      },
    });

    return NextResponse.json(updatedTopic, { status: 200 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Topic name already exists for this course.' },
          { status: 409 }
        );
      }
    }
    console.error('Error updating topic:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const topicId = parseInt(id, 10);
    if (isNaN(topicId)) {
      return NextResponse.json({ error: 'Invalid topic ID.' }, { status: 400 });
    }

    // Check if topic exists
    const existingTopic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!existingTopic) {
      return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
    }

    // Delete the topic
    await prisma.topic.delete({
      where: { id: topicId },
    });

    return NextResponse.json({ message: 'Topic deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
