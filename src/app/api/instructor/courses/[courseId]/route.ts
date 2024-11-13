// src/app/api/instructor/courses/[courseId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// Define the structure of the request payload for updating a course
interface CourseUpdatePayload {
  name?: string;
  passKey?: string | null;
}

// Define the structure of route parameters
interface Params {
  courseId: string;
}

/**
 * GET Method: Fetch a specific course (Instructor only)
 */
export async function GET(request: Request, { params }: { params: Params }) {
  const { courseId } = params;
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is an instructor
  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsedCourseId = parseInt(courseId, 10);
    if (isNaN(parsedCourseId)) {
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    // Fetch the course including the instructorId for ownership verification
    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      select: {
        id: true,
        name: true,
        passKey: true,
        instructorId: true, // Include instructorId for ownership check
        topics: {
          select: { id: true, name: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // Verify ownership
    const instructorId = parseInt(session.user.id, 10);
    if (course.instructorId !== instructorId) {
      return NextResponse.json(
        { error: 'Access denied. You do not own this course.' },
        { status: 403 }
      );
    }

    // Create a new object excluding 'instructorId'
    const { instructorId: _, ...courseData } = course;

    return NextResponse.json(courseData, { status: 200 });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH Method: Update a course (Instructor only)
 */
export async function PATCH(request: Request, { params }: { params: Params }) {
  const { courseId } = params;
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is an instructor
  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsedCourseId = parseInt(courseId, 10);
    if (isNaN(parsedCourseId)) {
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    // Parse the request body
    const { name, passKey } = (await request.json()) as CourseUpdatePayload;

    // Ensure at least one field is provided for update
    if (!name && passKey === undefined) {
      return NextResponse.json(
        { error: 'At least one field (name or passKey) is required for update.' },
        { status: 400 }
      );
    }

    // Fetch the course including instructorId for ownership verification
    const existingCourse = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      select: {
        id: true,
        instructorId: true,
        name: true,
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // Verify ownership
    const instructorId = parseInt(session.user.id, 10);
    if (existingCourse.instructorId !== instructorId) {
      return NextResponse.json(
        { error: 'Access denied. You do not own this course.' },
        { status: 403 }
      );
    }

    const updateData: Prisma.CourseUpdateInput = {};

    // Validate and set the course name if provided
    if (name) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'Course name must be a non-empty string.' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    // Validate and set the passKey if provided
    if (passKey !== undefined) {
      if (passKey && !/^[a-zA-Z0-9]{0,6}$/.test(passKey.trim())) {
        return NextResponse.json(
          { error: 'PassKey must be alphanumeric and up to 6 characters.' },
          { status: 400 }
        );
      }
      updateData.passKey = passKey ? passKey.trim() : null;
    }

    // If name is being updated, check for duplicates
    if (name && name.trim() !== existingCourse.name) {
      const duplicateCourse = await prisma.course.findUnique({
        where: { name: name.trim() },
      });
      if (duplicateCourse && duplicateCourse.id !== parsedCourseId) {
        return NextResponse.json(
          { error: 'Another course with the same name already exists.' },
          { status: 409 }
        );
      }
    }

    // Update the course
    const updatedCourse = await prisma.course.update({
      where: { id: parsedCourseId },
      data: updateData,
      include: {
        topics: {
          select: { id: true, name: true },
        },
      },
    });

    // Exclude 'instructorId' from the response
    const { instructorId: _, ...updatedCourseData } = updatedCourse;

    return NextResponse.json(updatedCourseData, { status: 200 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Course name already exists.' },
          { status: 409 }
        );
      }
    }
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE Method: Delete a course along with related data (Instructor only)
 */
export async function DELETE(request: Request, { params }: { params: Params }) {
  const { courseId } = params;
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is an instructor
  if (!session || !session.user.isInstructor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsedCourseId = parseInt(courseId, 10);
    if (isNaN(parsedCourseId)) {
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    // Fetch the course including instructorId for ownership verification
    const existingCourse = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      select: {
        id: true,
        instructorId: true,
        topics: {
          include: {
            feedbacks: true,
          },
        },
        userCourses: true,
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // Verify ownership
    const instructorId = parseInt(session.user.id, 10);
    if (existingCourse.instructorId !== instructorId) {
      return NextResponse.json(
        { error: 'Access denied. You do not own this course.' },
        { status: 403 }
      );
    }

    // Begin transaction to delete related records
    await prisma.$transaction(async (prisma) => {
      // Delete Feedbacks associated with Topics of the course
      const topicIds = existingCourse.topics.map((topic) => topic.id);
      if (topicIds.length > 0) {
        await prisma.feedback.deleteMany({
          where: {
            topicId: { in: topicIds },
          },
        });

        // Delete Topics associated with the course
        await prisma.topic.deleteMany({
          where: {
            courseId: parsedCourseId,
          },
        });
      }

      // Delete UserCourse associations
      await prisma.userCourse.deleteMany({
        where: {
          courseId: parsedCourseId,
        },
      });

      // Finally, delete the course
      await prisma.course.delete({
        where: { id: parsedCourseId },
      });
    });

    return NextResponse.json({ message: 'Course deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Foreign key constraint violation or other Prisma-specific errors
      return NextResponse.json(
        { error: 'Cannot delete this course for security purposes.' },
        { status: 403 }
      );
    }
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
