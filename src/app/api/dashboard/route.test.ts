// src/app/api/dashboard/route.test.ts

import { GET } from './route';
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
  };
});
const jsonMock = NextResponse.json as jest.Mock;

// Mock getServerSession
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  feedback: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  course: {
    findMany: jest.fn(),
  },
}));

// Helper function to create a mock request object
const mockRequest = (data = {}) => ({
  json: jest.fn().mockResolvedValue(data),
}) as unknown as Request;

describe('GET /api/dashboard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const request = mockRequest();
    await GET(request);

    expect(jsonMock).toHaveBeenCalledWith(
      { error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  });

  it('should return 400 if user ID is invalid', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: 'invalid_id' } });

    const request = mockRequest();
    await GET(request);

    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid user ID.' }, { status: 400 });
  });

  it('should return aggregated dashboard data when request is successful', async () => {
    const mockUserId = '1';
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: mockUserId } });

    // Mock received feedbacks
    (prisma.feedback.findMany as jest.Mock).mockResolvedValueOnce([
      { rating: 5, topic: { name: 'JavaScript' } },
      { rating: 4, topic: { name: 'JavaScript' } },
      { rating: 3, topic: { name: 'Python' } },
    ]);

    (prisma.feedback.count as jest.Mock).mockResolvedValueOnce(10);
    (prisma.feedback.findMany as jest.Mock).mockResolvedValueOnce([
      { id: 1, toUser: { name: 'Alice' }, topic: { name: 'JavaScript' }, rating: 5, comment: 'Great job!', created_at: new Date() },
    ]);

    (prisma.course.findMany as jest.Mock).mockResolvedValueOnce([
      { id: 1, name: 'Course 1' },
      { id: 2, name: 'Course 2' },
    ]);

    const request = mockRequest();
    await GET(request);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        receivedFeedback: expect.objectContaining({
          averageRating: 4,
        }),
      }),
      { status: 200 }
    );
  });

  it('should return 500 if an error occurs', async () => {
    const error = new Error('Database error');
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
    (prisma.feedback.findMany as jest.Mock).mockRejectedValueOnce(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const request = mockRequest();
    await GET(request);

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching dashboard data:', error);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal Server Error' }, { status: 500 });

    consoleSpy.mockRestore();
  });
});
