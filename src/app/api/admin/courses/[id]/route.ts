// src/app/api/admin/courses/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

interface CourseUpdatePayload {
  name?: string;
  passKey?: string | null;
  instructorId?: string; // Change to string to match User.id as string
}

interface Params {
  id: string;
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is an admin
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const courseId = parseInt(id, 10);
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    const { name, passKey, instructorId } = (await request.json()) as CourseUpdatePayload;

    if (!name && passKey === undefined && instructorId === undefined) {
      return NextResponse.json(
        { error: 'At least one field (name, passKey, or instructorId) is required for update.' },
        { status: 400 }
      );
    }

    const updateData: Prisma.CourseUpdateInput = {};

    if (name) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'Course name must be a non-empty string.' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (passKey !== undefined) {
      if (passKey && !/^[a-zA-Z0-9]{0,6}$/.test(passKey.trim())) {
        return NextResponse.json(
          { error: 'PassKey must be alphanumeric and up to 6 characters.' },
          { status: 400 }
        );
      }
      updateData.passKey = passKey ? passKey.trim() : null;
    }

    if (instructorId !== undefined) {
      if (typeof instructorId !== 'string' || instructorId.trim() === '') {
        return NextResponse.json(
          { error: 'Valid instructorId is required.' },
          { status: 400 }
        );
      }

      // Convert instructorId from string to number
      const instructorIdNumber = parseInt(instructorId, 10);
      if (isNaN(instructorIdNumber)) {
        return NextResponse.json(
          { error: 'Instructor ID must be a valid number.' },
          { status: 400 }
        );
      }

      // Verify instructor exists and is an instructor
      const instructor = await prisma.user.findUnique({
        where: { id: instructorIdNumber },
      });

      if (!instructor || !instructor.isInstructor) {
        return NextResponse.json(
          { error: 'Instructor does not exist or is not an instructor.' },
          { status: 404 }
        );
      }

      // Correct way to update a relation in Prisma
      updateData.instructor = {
        connect: { id: instructorIdNumber },
      };
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // If name is being updated, check for duplicates
    if (name) {
      const duplicateCourse = await prisma.course.findUnique({
        where: { name: name.trim() },
      });
      if (duplicateCourse && duplicateCourse.id !== courseId) {
        return NextResponse.json(
          { error: 'Another course with the same name already exists.' },
          { status: 409 }
        );
      }
    }

    // Update the course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: { // Include relations in the response
        instructor: {
          select: { id: true, name: true, email: true },
        },
        topics: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updatedCourse, { status: 200 });
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
 * DELETE Method: Delete a course (Admin only)
 */
export async function DELETE(request: Request, { params }: { params: Params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is an admin
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const courseId = parseInt(id, 10);
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        userCourses: true,
        topics: {
          include: {
            feedbacks: true,
          },
        },
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
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
            courseId: courseId,
          },
        });
      }

      // Delete UserCourse associations
      await prisma.userCourse.deleteMany({
        where: {
          courseId: courseId,
        },
      });

      // Finally, delete the course
      await prisma.course.delete({
        where: { id: courseId },
      });
    });

    return NextResponse.json({ message: 'Course deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle any Prisma-specific errors if necessary
      return NextResponse.json(
        { error: 'Cannot delete this course due to existing dependencies.' },
        { status: 403 }
      );
    }
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
