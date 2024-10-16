// src/app/api/feedbacks/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to_user_id = searchParams.get('to_user_id');

  if (to_user_id) {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        toUserId: parseInt(to_user_id), // Fetch feedback where the logged-in user is the recipient
      },
      orderBy: {
        created_at: 'desc', // Order feedback by recency
      },
    });

    return NextResponse.json(feedbacks);
  }

  return NextResponse.json({ error: 'to_user_id not provided' }, { status: 400 });
}
