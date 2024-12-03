// src/app/api/courses/[courseId]/members/route.test.ts

import { GET, POST } from './route';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

// Mock NextResponse
jest.mock('next/server', () => {
  const jsonMock = jest.fn();
  return {
    NextResponse: { json: jsonMock },
    __esModule: true,
    jsonMock,
  };
});

const { jsonMock } = jest.requireMock('next/server');

// Mock getServerSession
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  course: {
    findUnique: jest.fn(),
  },
  userCourse: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

// Helper function to create a mock request object
const mockRequest = (data = {}) => ({
  json: jest.fn().mockResolvedValue(data),
}) as unknown as Request;

describe('GET /api/courses/[courseId]/members', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated or not an admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const request = mockRequest();
    await GET(request, { params: { courseId: '1' } });

    expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
  });

  it('should return 400 for invalid course ID', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { isAdmin: true } });

    const request = mockRequest();
    await GET(request, { params: { courseId: 'invalid' } });

    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid course ID.' }, { status: 400 });
  });

  it('should return 404 if the course is not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { isAdmin: true } });
    (prisma.course.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const request = mockRequest();
    await GET(request, { params: { courseId: '1' } });

    expect(jsonMock).toHaveBeenCalledWith({ error: 'Course not found.' }, { status: 404 });
  });

  it('should return a list of members if the course exists', async () => {
    const members = [{ id: 1, name: 'Member 1' }];
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { isAdmin: true } });
    (prisma.course.findUnique as jest.Mock).mockResolvedValueOnce({
      userCourses: members.map((user) => ({ user })),
    });

    const request = mockRequest();
    await GET(request, { params: { courseId: '1' } });

    expect(jsonMock).toHaveBeenCalledWith(members, { status: 200 });
  });

  it('should return 500 if there is an error fetching members', async () => {
    const error = new Error('Database error');
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { isAdmin: true } });
    (prisma.course.findUnique as jest.Mock).mockRejectedValueOnce(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const request = mockRequest();
    await GET(request, { params: { courseId: '1' } });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching course members:', error);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to fetch members.' }, { status: 500 });

    consoleSpy.mockRestore();
  });
});

describe('POST /api/courses/[courseId]/members', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated or not an admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const request = mockRequest({ userId: '2' });
    await POST(request, { params: { courseId: '1' } });

    expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
  });

  it('should return 400 for invalid course or user ID', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { isAdmin: true } });

    const request = mockRequest({ userId: 'invalid' });
    await POST(request, { params: { courseId: '1' } });

    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid course ID or user ID.' }, { status: 400 });
  });

  it('should return 400 if the user is already a member of the course', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { isAdmin: true } });
    (prisma.userCourse.findUnique as jest.Mock).mockResolvedValueOnce({});

    const request = mockRequest({ userId: '2' });
    await POST(request, { params: { courseId: '1' } });

    expect(jsonMock).toHaveBeenCalledWith(
      { error: 'User is already a member of this course.' },
      { status: 400 }
    );
  });

  it('should add the user to the course if they are not already a member', async () => {
    const user = { id: 2, name: 'New Member' };
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { isAdmin: true } });
    (prisma.userCourse.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.userCourse.create as jest.Mock).mockResolvedValueOnce({ user });

    const request = mockRequest({ userId: '2' });
    await POST(request, { params: { courseId: '1' } });

    expect(prisma.userCourse.create).toHaveBeenCalledWith({
      data: { userId: 2, courseId: 1 },
      include: { user: true },
    });
    expect(jsonMock).toHaveBeenCalledWith(user, { status: 201 });
  });

  it('should return 500 if there is an error adding a member', async () => {
    const error = new Error('Database error');
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { isAdmin: true } });
    (prisma.userCourse.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.userCourse.create as jest.Mock).mockRejectedValueOnce(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const request = mockRequest({ userId: '2' });
    await POST(request, { params: { courseId: '1' } });

    expect(consoleSpy).toHaveBeenCalledWith('Error adding member:', error);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to add member.' }, { status: 500 });

    consoleSpy.mockRestore();
  });
});
