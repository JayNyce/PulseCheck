// src/app/api/instructor/courses/[courseId]/topics/[topicId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

interface Params {
  courseId: string;
  topicId: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
  const { courseId, topicId } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);
  const parsedTopicId = parseInt(topicId, 10);

  const topic = await prisma.topic.findFirst({
    where: {
      id: parsedTopicId,
      courseId: parsedCourseId,
      course: {
        instructorId: parseInt(session.user.id, 10),
      },
    },
  });

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  return NextResponse.json(topic);
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const { courseId, topicId } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);
  const parsedTopicId = parseInt(topicId, 10);
  const { name } = await req.json();

  const topic = await prisma.topic.findFirst({
    where: {
      id: parsedTopicId,
      courseId: parsedCourseId,
      course: {
        instructorId: parseInt(session.user.id, 10),
      },
    },
  });

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  try {
    const updatedTopic = await prisma.topic.update({
      where: { id: parsedTopicId },
      data: { name },
    });
    return NextResponse.json(updatedTopic);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { courseId, topicId } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedCourseId = parseInt(courseId, 10);
  const parsedTopicId = parseInt(topicId, 10);

  const topic = await prisma.topic.findFirst({
    where: {
      id: parsedTopicId,
      courseId: parsedCourseId,
      course: {
        instructorId: parseInt(session.user.id, 10),
      },
    },
  });

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  try {
    await prisma.topic.delete({
      where: { id: parsedTopicId },
    });
    return NextResponse.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
