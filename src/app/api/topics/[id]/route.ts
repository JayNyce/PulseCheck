// src/app/api/topics/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * DELETE Method: Delete a specific topic by ID
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const topicId = parseInt(params.id);

    // Validate the topic ID
    if (isNaN(topicId)) {
      return NextResponse.json({ error: 'Invalid topic ID.' }, { status: 400 });
    }

    // Check if the topic exists
    const existingTopic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!existingTopic) {
      return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
    }

    // Delete the topic
    await prisma.topic.delete({
      where: { id: topicId },
    });

    return NextResponse.json({ message: 'Topic deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
