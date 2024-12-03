// src/app/api/courses/[courseId]/enroll/route.test.ts

import { POST, DELETE } from './route';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  course: { findUnique: jest.fn() },
  userCourse: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
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

// Helper function to create a mock request
const mockRequest = (data: any) => ({
  json: jest.fn().mockResolvedValue(data),
}) as unknown as Request;

describe('Enroll API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /enroll', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce(null);

      const request = mockRequest({});
      await POST(request, { params: { courseId: '1' } });

      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
    });

    it('should return 400 for invalid course ID', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });

      const request = mockRequest({});
      await POST(request, { params: { courseId: 'invalid' } });

      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid course ID.' }, { status: 400 });
    });

    it('should return 404 if course is not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      (prisma.course.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const request = mockRequest({});
      await POST(request, { params: { courseId: '1' } });

      expect(jsonMock).toHaveBeenCalledWith({ error: 'Course not found.' }, { status: 404 });
    });

    // Add additional test cases as needed
  });

  describe('DELETE /enroll', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce(null);

      const request = mockRequest({});
      await DELETE(request, { params: { courseId: '1' } });

      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
    });

    // Add additional test cases for DELETE method as needed
  });
});
