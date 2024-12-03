// src/app/api/feedbacks/given/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID.' },
        { status: 400 }
      );
    }

    // Fetch Feedbacks Given
    const feedbacksGiven = await prisma.feedback.findMany({
      where: {
        fromUserId: userId,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
        topic: {
          select: {
            name: true,
          },
        },
        toUser: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Calculate Topic Distribution
    const topicDistribution = feedbacksGiven.reduce((acc, feedback) => {
      const topicName = feedback.topic.name;
      acc[topicName] = (acc[topicName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate Rating Distribution
    const ratingDistribution = feedbacksGiven.reduce((acc, feedback) => {
      const rating = feedback.rating.toString();
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Prepare response
    const response = {
      feedbacksGiven,
      topicDistribution,
      ratingDistribution,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching given feedbacks data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}