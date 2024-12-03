// src/app/api/courses/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET Method: Fetch all courses (Public Access)
 */
export async function GET(request: Request) {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        passKey: true, // Include passKey to indicate if required
      },
    });

    // Transform passKey to indicate if a passKey is required without exposing its value
    const transformedCourses = courses.map((course) => ({
      id: course.id,
      name: course.name,
      requiresPassKey: course.passKey ? true : false,
    }));

    return NextResponse.json(transformedCourses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses.' }, { status: 500 });
  }
}

/**
 * POST Method: Create a new course (Admin or Instructor Only)
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions); // Ensure you have imported getServerSession and authOptions

  // Check if the user is authenticated and has the right role
  if (!session || (!session.user.isAdmin && !session.user.isInstructor)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, passKey, instructorId } = await request.json();

    // Basic validation
    if (!name) {
      return NextResponse.json({ error: 'Course name is required.' }, { status: 400 });
    }

    // Check for duplicate course name
    const existingCourse = await prisma.course.findUnique({ where: { name } });
    if (existingCourse) {
      return NextResponse.json({ error: 'Course with this name already exists.' }, { status: 409 });
    }

    // If instructorId is provided, verify the instructor exists
    let finalInstructorId: number;
    if (session.user.isAdmin) {
      if (!instructorId) {
        return NextResponse.json({ error: 'Instructor ID is required for admins.' }, { status: 400 });
      }
      finalInstructorId = parseInt(instructorId, 10);
      if (isNaN(finalInstructorId)) {
        return NextResponse.json({ error: 'Invalid instructor ID.' }, { status: 400 });
      }

      const instructor = await prisma.user.findUnique({ where: { id: finalInstructorId } });
      if (!instructor || !instructor.isInstructor) {
        return NextResponse.json({ error: 'Instructor not found or not an instructor.' }, { status: 400 });
      }
    } else {
      // If the user is an instructor, they are the course instructor
      finalInstructorId = parseInt(session.user.id, 10);
    }

    // Create the new course
    const newCourse = await prisma.course.create({
      data: {
        name,
        passKey: passKey ? passKey.trim() : null,
        instructorId: finalInstructorId,
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course.' }, { status: 500 });
  }
}

/**
 * PATCH Method: Update a course (Admin or Course Owner Only)
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions); // Ensure you have imported getServerSession and authOptions

  // Check if the user is authenticated and has the right role
  if (!session || (!session.user.isAdmin && !session.user.isInstructor)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { courseId, name, passKey, instructorId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required.' }, { status: 400 });
    }

    const parsedCourseId = parseInt(courseId, 10);
    if (isNaN(parsedCourseId)) {
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    // Fetch the course to verify ownership
    const course = await prisma.course.findUnique({ where: { id: parsedCourseId } });
    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // If user is not admin, ensure they own the course
    if (!session.user.isAdmin && course.instructorId !== parseInt(session.user.id, 10)) {
      return NextResponse.json({ error: 'Access denied. You do not own this course.' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    if (name) {
      updateData.name = name.trim();
    }
    if (passKey !== undefined) {
      updateData.passKey = passKey ? passKey.trim() : null;
    }
    if (instructorId) {
      // Only admins can change the instructor
      if (!session.user.isAdmin) {
        return NextResponse.json({ error: 'Only admins can change the instructor.' }, { status: 403 });
      }
      const parsedInstructorId = parseInt(instructorId, 10);
      if (isNaN(parsedInstructorId)) {
        return NextResponse.json({ error: 'Invalid instructor ID.' }, { status: 400 });
      }
      const instructor = await prisma.user.findUnique({ where: { id: parsedInstructorId } });
      if (!instructor || !instructor.isInstructor) {
        return NextResponse.json({ error: 'Instructor not found or not an instructor.' }, { status: 400 });
      }
      updateData.instructorId = parsedInstructorId;
    }

    // Update the course
    const updatedCourse = await prisma.course.update({
      where: { id: parsedCourseId },
      data: updateData,
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course.' }, { status: 500 });
  }
}

/**
 * DELETE Method: Delete a course (Admin or Course Owner Only)
 */
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions); // Ensure you have imported getServerSession and authOptions

  // Check if the user is authenticated and has the right role
  if (!session || (!session.user.isAdmin && !session.user.isInstructor)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required.' }, { status: 400 });
    }

    const parsedCourseId = parseInt(courseId, 10);
    if (isNaN(parsedCourseId)) {
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    // Fetch the course to verify ownership
    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      include: {
        topics: {
          include: {
            feedbacks: true,
          },
        },
        userCourses: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // If user is not admin, ensure they own the course
    if (!session.user.isAdmin && course.instructorId !== parseInt(session.user.id, 10)) {
      return NextResponse.json({ error: 'Access denied. You do not own this course.' }, { status: 403 });
    }

    // Begin transaction to delete related records
    await prisma.$transaction(async (prisma) => {
      // Delete Feedbacks associated with Topics of the course
      const topicIds = course.topics.map((topic) => topic.id);
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
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course.' }, { status: 500 });
  }
}
