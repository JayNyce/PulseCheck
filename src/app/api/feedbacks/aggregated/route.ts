// src/app/api/feedbacks/aggregated/route.ts

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

    // Fetch Average Ratings Over Time
    const averageRatings = await prisma.feedback.groupBy({
      by: ['created_at'],
      where: {
        toUserId: userId,
      },
      _avg: {
        rating: true,
      },
      orderBy: {
        created_at: 'asc',
      },
      take: 30,
    });

    // Fetch Topic Counts
    const topicCounts = await prisma.feedback.groupBy({
      by: ['topicId'],
      where: {
        toUserId: userId,
      },
      _count: {
        topicId: true,
      },
      orderBy: {
        _count: {
          topicId: 'desc',
        },
      },
      take: 5,
    });

    // Fetch Topic details
    const topicIds = topicCounts.map((item) => item.topicId);
    const topics = await prisma.topic.findMany({
      where: {
        id: { in: topicIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const topicMap: Record<number, string> = {};
    topics.forEach((topic) => {
      topicMap[topic.id] = topic.name;
    });

    const formattedTopicCounts = topicCounts.map((item) => ({
      topic: topicMap[item.topicId] || 'Unknown Topic',
      count: item._count.topicId,
    }));

    // Fetch Recent Feedback
    const recentFeedback = await prisma.feedback.findMany({
      where: {
        toUserId: userId,
      },
      select: {
        id: true,
        created_at: true,
        rating: true,
        comment: true,
        topic: {
          select: {
            name: true,
          },
        },
        fromUser: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 5, // Limit to 5 most recent feedback
    });

    const formattedRecentFeedback = recentFeedback.map((feedback) => ({
      id: feedback.id,
      date: feedback.created_at.toISOString().split('T')[0],
      topic: feedback.topic.name,
      rating: feedback.rating,
      comment: feedback.comment,
      from: feedback.fromUser?.name || 'Anonymous',
    }));

    const response = {
      averageRatings: averageRatings.map((item) => ({
        created_at: item.created_at.toISOString().split('T')[0],
        _avg: {
          rating: item._avg.rating,
        },
      })),
      topicCounts: formattedTopicCounts,
      recentFeedback: formattedRecentFeedback,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching aggregated data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}