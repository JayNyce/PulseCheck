// src/app/api/auth/forgot-password/route.test.ts

import { POST } from './route';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const findFirstMock = jest.fn();
  const updateMock = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findFirst: findFirstMock,
        update: updateMock,
      },
    })),
    __mocks: { findFirstMock, updateMock },
  };
});

// Extract mocks for ease of use in tests
const { findFirstMock, updateMock } = require('@prisma/client').__mocks;

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => {
  const jsonMock = jest.fn();
  return {
    NextResponse: {
      json: jsonMock,
    },
    __mock: {
      jsonMock,
    },
  };
});

const { jsonMock } = require('next/server').__mock;

// Helper function to create a mock request
const mockRequest = (data: any) => ({
  json: jest.fn().mockResolvedValue(data),
}) as unknown as Request;

describe('Forgot Password API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 500 for internal errors', async () => {
    const error = new Error('Database error');
    
    // Set up mock to throw an error
    findFirstMock.mockRejectedValueOnce(error);

    // Include required fields to pass validation
    const request = mockRequest({ email: 'user@example.com' });

    await POST(request);

    // Verify the error response
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' }, { status: 500 });
  });
});
