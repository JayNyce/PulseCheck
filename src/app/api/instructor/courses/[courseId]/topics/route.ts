// src/app/api/instructor/courses/[courseId]/topics/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Topic {
  id: number;
  name: string;
}

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is an instructor
  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const topics: Topic[] = await prisma.topic.findMany({
      where: {
        courseId: parseInt(courseId, 10),
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(topics, { status: 200 });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics.' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is an instructor
  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Topic name is required and must be a non-empty string.' }, { status: 400 });
    }

    const newTopic: Topic = await prisma.topic.create({
      data: {
        name: name.trim(),
        courseId: parseInt(courseId, 10),
      },
    });

    return NextResponse.json(newTopic, { status: 201 });
  } catch (error: any) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: error.message || 'Failed to create topic.' }, { status: 500 });
  }
}
