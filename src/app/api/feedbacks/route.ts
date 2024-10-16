import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import the Prisma client from prisma.ts

// GET Method: Fetch feedbacks given to the user with to_user_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const to_user_id = searchParams.get('to_user_id');

    // Check if to_user_id is provided
    if (!to_user_id) {
      return NextResponse.json({ error: 'to_user_id not provided' }, { status: 400 });
    }

    const userId = parseInt(to_user_id);
    
    // Validate the to_user_id as a valid integer
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid to_user_id' }, { status: 400 });
    }

    // Fetch feedbacks for the specified user
    const feedbacks = await prisma.feedback.findMany({
      where: {
        toUserId: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Always return an array, even if no feedback is found
    return NextResponse.json(feedbacks || []);

  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST Method: Handle feedback submission
export async function POST(request: Request) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();
    const { topic, rating, comment, to_user_id, from_user_id } = body;

    // Check if all fields are present
    if (!topic || !rating || !comment || !to_user_id || !from_user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure the rating is a valid integer between 1 and 5
    const ratingInt = parseInt(rating);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      return NextResponse.json({ error: 'Invalid rating. Rating must be between 1 and 5.' }, { status: 400 });
    }

    // Parse and validate user IDs
    const toUserId = parseInt(to_user_id);
    const fromUserId = parseInt(from_user_id);
    if (isNaN(toUserId) || isNaN(fromUserId)) {
      return NextResponse.json({ error: 'Invalid user IDs.' }, { status: 400 });
    }

    // Create a new feedback record in the database
    const feedback = await prisma.feedback.create({
      data: {
        topic, // Topic of feedback
        rating: ratingInt, // Rating (ensured as an integer)
        comment, // Feedback comment
        toUserId, // The user receiving the feedback
        fromUserId, // The user giving the feedback
      },
    });

    // Return the newly created feedback as a JSON response
    return NextResponse.json(feedback);

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
