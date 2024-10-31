// src/app/api/auth/signup/route.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { name, email, password, courseId, passKey } = await request.json();

  // Validate required fields
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    // Create the new user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // If courseId is provided, attempt enrollment
    if (courseId && courseId !== 'No Enrollment') {
      const parsedCourseId = parseInt(courseId, 10);
      if (isNaN(parsedCourseId)) {
        return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
      }

      // Fetch the course
      const course = await prisma.course.findUnique({ where: { id: parsedCourseId } });
      if (!course) {
        return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
      }

      // If course has a passKey, validate it
      if (course.passKey) {
        if (!passKey) {
          return NextResponse.json({ error: 'PassKey is required for this course.' }, { status: 400 });
        }
        if (course.passKey !== passKey.trim()) {
          return NextResponse.json({ error: 'Invalid PassKey.' }, { status: 400 });
        }
      }

      // Enroll the user in the course
      await prisma.userCourse.create({
        data: { userId: user.id, courseId: parsedCourseId },
      });
    }

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error during signup:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
