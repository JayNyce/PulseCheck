// src/app/api/users/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET Method: Search users based on a query
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';

    // Fetch users whose names match the search query
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 10, // Limit results
    });

    return NextResponse.json(users || []);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
