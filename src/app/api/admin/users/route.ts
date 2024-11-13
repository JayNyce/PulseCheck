// src/app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET Method: Fetch all instructors (Admin only)
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const isInstructor = url.searchParams.get('isInstructor');

    const instructors = await prisma.user.findMany({
      where: isInstructor === 'true' ? { isInstructor: true } : {},
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(instructors, { status: 200 });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
