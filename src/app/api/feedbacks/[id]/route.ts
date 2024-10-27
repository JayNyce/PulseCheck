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

  const { rating, topic, comment } = await request.json();

  // Validate required fields
  if (rating === undefined || topic === undefined || comment === undefined) {
    return NextResponse.json({ error: 'Rating, Topic, and Comment are required.' }, { status: 400 });
  }

  // Validate rating
  const ratingInt = parseInt(rating, 10);
  if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
    return NextResponse.json(
      { error: 'Invalid rating. Rating must be between 1 and 5.' },
      { status: 400 }
    );
  }

  try {
    const feedbackIdInt = parseInt(id, 10);
    if (isNaN(feedbackIdInt)) {
      return NextResponse.json({ error: 'Invalid feedback ID.' }, { status: 400 });
    }

    const existingFeedback = await prisma.feedback.findUnique({
      where: { id: feedbackIdInt },
    });

    if (!existingFeedback) {
      return NextResponse.json({ error: 'Feedback not found.' }, { status: 404 });
    }

    // Ensure the user is the owner of the feedback
    if (existingFeedback.fromUserId !== Number(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate the topic exists or create it
    const topicRecord = await prisma.topic.upsert({
      where: { name: topic },
      update: {},
      create: { name: topic },
    });

    // Update the feedback with rating, topicId, and comment
    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackIdInt },
      data: {
        rating: ratingInt,
        topicId: topicRecord.id,
        comment, // Update comment
      },
      include: {
        toUser: { select: { name: true } },
        topic: { select: { name: true } },
      },
    });

    return NextResponse.json(updatedFeedback, { status: 200 });
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
    const feedbackIdInt = parseInt(id, 10);
    if (isNaN(feedbackIdInt)) {
      return NextResponse.json({ error: 'Invalid feedback ID.' }, { status: 400 });
    }

    const existingFeedback = await prisma.feedback.findUnique({
      where: { id: feedbackIdInt },
    });

    if (!existingFeedback) {
      return NextResponse.json({ error: 'Feedback not found.' }, { status: 404 });
    }

    // Ensure the user is the owner of the feedback
    if (existingFeedback.fromUserId !== Number(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.feedback.delete({
      where: { id: feedbackIdInt },
    });

    return NextResponse.json({ message: 'Feedback deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: 'Failed to delete feedback.' }, { status: 500 });
  }
}
