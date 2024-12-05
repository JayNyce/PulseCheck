// src/app/api/feedbacks/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Params {
  id: string;
}

// PUT: Update a feedback entry
export async function PUT(request: Request, { params }: { params: Params }) {
  const { id } = params;

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rating, topic, comment, anonymous } = await request.json();

    // Validate input
    if (!rating || !topic || !comment || typeof anonymous !== 'boolean') {
      return NextResponse.json(
        { error: 'Rating, Topic, Comment, and Anonymous flag are required.' },
        { status: 400 }
      );
    }

    const feedbackIdInt = parseInt(id, 10);
    if (isNaN(feedbackIdInt)) {
      return NextResponse.json({ error: 'Invalid feedback ID.' }, { status: 400 });
    }

    // Find existing feedback
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id: feedbackIdInt },
      include: { topic: true },
    });

    if (!existingFeedback) {
      return NextResponse.json({ error: 'Feedback not found.' }, { status: 404 });
    }

    const userId = parseInt(session.user.id, 10);
    if (existingFeedback.fromUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Upsert topic
    const topicRecord = await prisma.topic.upsert({
      where: {
        name_courseId: {
          name: topic.trim(),
          courseId: existingFeedback.topic.courseId,
        },
      },
      update: {},
      create: { name: topic.trim(), courseId: existingFeedback.topic.courseId },
    });

    // Update feedback
    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackIdInt },
      data: {
        rating: parseInt(rating, 10),
        topicId: topicRecord.id,
        comment: comment.trim(),
        fromUserId: anonymous ? null : userId,
      },
      include: {
        fromUser: {
          select: { name: true },
        },
        topic: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(updatedFeedback, { status: 200 });
  } catch (error: any) {
    console.error('Error updating feedback:', error.message, error.stack);
    return NextResponse.json({ error: 'Failed to update feedback.' }, { status: 500 });
  }
}

// DELETE: Remove a feedback entry
export async function DELETE(request: Request, { params }: { params: Params }) {
  const { id } = params;

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const feedbackIdInt = parseInt(id, 10);
    if (isNaN(feedbackIdInt)) {
      return NextResponse.json({ error: 'Invalid feedback ID.' }, { status: 400 });
    }

    // Find feedback
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id: feedbackIdInt },
    });

    if (!existingFeedback) {
      return NextResponse.json({ error: 'Feedback not found.' }, { status: 404 });
    }

    const userId = parseInt(session.user.id, 10);
    if (existingFeedback.fromUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete feedback
    await prisma.feedback.delete({
      where: { id: feedbackIdInt },
    });

    return NextResponse.json({ message: 'Feedback deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting feedback:', error.message, error.stack);
    return NextResponse.json({ error: 'Failed to delete feedback.' }, { status: 500 });
  }
}
