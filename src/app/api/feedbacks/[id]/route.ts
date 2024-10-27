// src/app/api/feedbacks/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Params {
  id: string;
}

// PUT: Update a feedback entry
export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = params;

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { rating, topic } = await request.json();

  if (rating === undefined || topic === undefined) {
    return NextResponse.json({ error: 'Rating and Topic are required.' }, { status: 400 });
  }

  try {
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id: Number(id) },
    });

    if (!existingFeedback) {
      return NextResponse.json({ error: 'Feedback not found.' }, { status: 404 });
    }

    // Convert session.user.id to a number and check if it matches fromUserId
    if (existingFeedback.fromUserId !== Number(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const topicRecord = await prisma.topic.upsert({
      where: { name: topic },
      update: {},
      create: { name: topic },
    });

    const feedback = await prisma.feedback.update({
      where: { id: Number(id) },
      data: {
        rating,
        topicId: topicRecord.id,
      },
    });

    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Failed to update feedback.' }, { status: 500 });
  }
}

// DELETE: Remove a feedback entry
export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = params;

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id: Number(id) },
    });

    if (!existingFeedback) {
      return NextResponse.json({ error: 'Feedback not found.' }, { status: 404 });
    }

    // Convert session.user.id to a number and check if it matches fromUserId
    if (existingFeedback.fromUserId !== Number(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.feedback.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Feedback deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: 'Failed to delete feedback.' }, { status: 500 });
  }
}
