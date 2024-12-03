// src/app/api/courses/[courseId]/members/[userId]/route.test.ts

import { DELETE } from '../[userId]/route';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  userCourse: {
    delete: jest.fn(),
  },
}));

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

// Helper function to create a mock request object
const mockRequest = () => ({
  json: jest.fn(),
}) as unknown as Request;

describe('DELETE /api/courses/[courseId]/members/[userId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated or not an admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const request = mockRequest();
    await DELETE(request, { params: { courseId: '1', userId: '2' } });

    expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
  });

  it('should return 400 for invalid course or user ID', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { isAdmin: true } });

    const request = mockRequest();
    await DELETE(request, { params: { courseId: 'invalid', userId: '2' } });

    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid course ID or user ID.' }, { status: 400 });
  });

  it('should return 200 and remove the member if user is an admin and IDs are valid', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { isAdmin: true } });
    (prisma.userCourse.delete as jest.Mock).mockResolvedValueOnce({});

    const request = mockRequest();
    await DELETE(request, { params: { courseId: '1', userId: '2' } });

    expect(prisma.userCourse.delete).toHaveBeenCalledWith({
      where: {
        userId_courseId: {
          userId: 2,
          courseId: 1,
        },
      },
    });
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Member removed successfully.' }, { status: 200 });
  });

  it('should return 500 if there is an error removing the member', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { isAdmin: true } });
    const error = new Error('Database error');
    (prisma.userCourse.delete as jest.Mock).mockRejectedValueOnce(error);

    const request = mockRequest();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await DELETE(request, { params: { courseId: '1', userId: '2' } });

    expect(consoleSpy).toHaveBeenCalledWith('Error removing member:', error);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to remove member.' }, { status: 500 });

    consoleSpy.mockRestore();
  });
});
