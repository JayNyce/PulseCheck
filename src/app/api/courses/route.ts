// src/app/api/courses/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next'; // Correct import path
import { authOptions } from '@/lib/auth';
import crypto from 'crypto'; // Ensure crypto is imported

export async function GET() {
  try {
    const courses = await prisma.course.findMany();
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, passKey } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Course name is required.' }, { status: 400 });
  }

  // Validate passKey if provided
  let finalPassKey = passKey?.trim();
  if (finalPassKey) {
    if (finalPassKey.length > 6) {
      return NextResponse.json({ error: 'PassKey must be at most 6 characters long.' }, { status: 400 });
    }

    // Optional: Add format validations if necessary
    // Example: Only alphanumeric characters
    if (!/^[a-zA-Z0-9]+$/.test(finalPassKey)) {
      return NextResponse.json({ error: 'PassKey must be alphanumeric.' }, { status: 400 });
    }

    // Since passKey is not unique, no need to check for existing passKeys
  } else {
    // Optionally generate a passKey if desired, without ensuring uniqueness
    finalPassKey = crypto.randomBytes(3).toString('hex'); // Generates a 6-character hex code
  }

  try {
    const course = await prisma.course.create({
      data: {
        name: name.trim(),
        passKey: finalPassKey,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course.' }, { status: 500 });
  }
}
