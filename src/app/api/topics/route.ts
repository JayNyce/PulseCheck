import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Fixed import
import { Prisma } from '@prisma/client';

/**
 * GET Method: Fetch all predefined topics for the authenticated user
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

    // Optionally, you can implement further authorization here

    const topics = await prisma.topic.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST Method: Create a new topic (Admin only)
 */
export async function POST(request: Request) {
  try {
    // Retrieve the session to authenticate the user
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have admin privileges.' },
        { status: 403 }
      );
    }

    const { name } = await request.json();

    // Validate the topic name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Topic name is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if the topic already exists
    const existingTopic = await prisma.topic.findUnique({
      where: { name: trimmedName },
    });

    if (existingTopic) {
      return NextResponse.json(
        { error: 'Topic name already exists.' },
        { status: 409 }
      );
    }

    // Create the new topic
    const topic = await prisma.topic.create({
      data: {
        name: trimmedName,
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violation (e.g., duplicate topic name)
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Topic name already exists.' },
          { status: 409 }
        );
      }
    }
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
