// src/app/api/feedbacks/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET Method: Fetch feedbacks given to the authenticated user with optional filters
 */
export async function GET(request: Request) {
  try {
    // Retrieve the session to authenticate the user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = typeof session.user.id === 'number' ? session.user.id : parseInt(session.user.id, 10);
    
    // Validate the user ID
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);

    // Extract optional filters
    const keyword = searchParams.get('keyword');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const topic = searchParams.get('topic');
    const anonymous = searchParams.get('anonymous');

    // Build the where clause based on filters
    const whereClause: any = {
      toUserId: userId,
    };

    if (keyword) {
      whereClause.OR = [
        { topic: { name: { contains: keyword, mode: 'insensitive' } } },
        { comment: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.created_at.lte = new Date(endDate);
      }
    }

    if (minRating) {
      const min = parseInt(minRating);
      if (!isNaN(min)) {
        whereClause.rating = { ...whereClause.rating, gte: min };
      }
    }

    if (maxRating) {
      const max = parseInt(maxRating);
      if (!isNaN(max)) {
        whereClause.rating = { ...whereClause.rating, lte: max };
      }
    }

    if (topic) {
      whereClause.topic = { name: { equals: topic, mode: 'insensitive' } };
    }

    if (anonymous === 'true') {
      whereClause.fromUserId = null;
    } else if (anonymous === 'false') {
      whereClause.fromUserId = { not: null };
    }

    // Fetch feedbacks with filters
    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        fromUser: {
          select: {
            name: true,
          },
        },
        topic: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(feedbacks || []);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST Method: Submit new feedback
 */
export async function POST(request: Request) {
  try {
    // Retrieve the session to authenticate the user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the JSON body from the request
    const body = await request.json();
    const { topicId, rating, comment, to_user_id, anonymous } = body;

    // Validate 'anonymous' flag
    if (typeof anonymous !== 'boolean') {
      return NextResponse.json({ error: 'Invalid anonymous flag.' }, { status: 400 });
    }

    // Ensure that the user ID of the authenticated user is set as the `fromUserId` if not anonymous
    const fromUserId = anonymous 
      ? null 
      : (typeof session.user.id === 'number' ? session.user.id : parseInt(session.user.id, 10));

    // Validate required fields
    if (!topicId || !rating || !comment || !to_user_id) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Validate rating as an integer between 1 and 5
    const ratingInt = parseInt(rating);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      return NextResponse.json(
        { error: 'Invalid rating. Rating must be between 1 and 5.' },
        { status: 400 }
      );
    }

    // Parse and validate user IDs
    const toUserId = parseInt(to_user_id);
    if (isNaN(toUserId)) {
      return NextResponse.json({ error: 'Invalid to_user_id.' }, { status: 400 });
    }

    // Parse and validate topic ID
    const topicIdInt = parseInt(topicId);
    if (isNaN(topicIdInt)) {
      return NextResponse.json({ error: 'Invalid topicId.' }, { status: 400 });
    }

    // Ensure that the recipient user exists
    const toUser = await prisma.user.findUnique({
      where: { id: toUserId },
    });

    if (!toUser) {
      return NextResponse.json({ error: 'The user to give feedback to does not exist.' }, { status: 404 });
    }

    // Ensure that the topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicIdInt },
    });

    if (!topic) {
      return NextResponse.json({ error: 'The selected topic does not exist.' }, { status: 404 });
    }

    // Create a new feedback record in the database
    const feedback = await prisma.feedback.create({
      data: {
        topicId: topicIdInt,
        rating: ratingInt,
        comment,
        toUserId,
        fromUserId,
      },
      include: {
        fromUser: {
          select: {
            name: true,
          },
        },
        topic: {
          select: {
            name: true,
          },
        },
      },
    });

    // Return the newly created feedback as a JSON response
    return NextResponse.json(feedback, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit feedback.' },
      { status: 500 }
    );
  }
}
