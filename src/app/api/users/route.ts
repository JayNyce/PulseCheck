// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('search') || '';

  if (searchQuery.length < 3) {
    return NextResponse.json({ error: 'Search query too short' }, { status: 400 });
  }

  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: searchQuery, // Search users whose names contain the query string
        mode: 'insensitive',   // Case-insensitive search
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(users);
}
