// src/app/api/feedbacks/aggregated/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * Handler for GET requests to /api/feedbacks/aggregated
 * Fetches aggregated feedback data grouped by topic and average ratings over time for the authenticated user.
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

    // Parse the user ID from the session (stored as string)
    const userId = parseInt(session.user.id, 10); // Convert string ID to number

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID.' },
        { status: 400 }
      );
    }

    // 1. Fetch Average Ratings Over Time
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
      take: 30, // Adjust the number of days as needed
    });

    // 2. Fetch Topic Counts
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
      take: 5, // Top 5 topics
    });

    // Extract topicIds to fetch Topic details
    const topicIds = topicCounts.map((item) => item.topicId);

    // Fetch Topic details
    const topics = await prisma.topic.findMany({
      where: {
        id: { in: topicIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Create a mapping from topicId to topicName
    const topicMap: Record<number, string> = {};
    topics.forEach((topic) => {
      topicMap[topic.id] = topic.name;
    });

    // Combine topicCounts with Topic names
    const formattedTopicCounts = topicCounts.map((item) => ({
      topic: topicMap[item.topicId] || 'Unknown Topic',
      count: item._count.topicId,
    }));

    // Format averageRatings for the frontend
    const formattedAverageRatings = averageRatings.map((item) => ({
      created_at: item.created_at.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      _avg: {
        rating: item._avg.rating,
      },
    }));

    // Structure the response as per the frontend's expectation
    const response = {
      averageRatings: formattedAverageRatings,
      topicCounts: formattedTopicCounts,
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
