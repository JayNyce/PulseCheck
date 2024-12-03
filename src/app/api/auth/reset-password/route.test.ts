// src/app/api/auth/reset-password/route.test.ts

import { POST } from './route';
import bcrypt from 'bcryptjs';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockFindFirst = jest.fn();
  const mockUpdate = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findFirst: mockFindFirst,
        update: mockUpdate,
      },
    })),
    __mock: { mockFindFirst, mockUpdate },
  };
});

const { mockFindFirst, mockUpdate } = require('@prisma/client').__mock;

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));
const hashMock = bcrypt.hash as jest.Mock;

// Mock NextResponse
jest.mock('next/server', () => {
  const json = jest.fn();
  return {
    NextResponse: {
      json,
    },
    __mock: {
      json,
    },
  };
});

const { json } = require('next/server').__mock;

// Helper function to create a mock request
const mockRequest = (data: any) => ({
  json: jest.fn().mockResolvedValue(data),
}) as unknown as Request;

describe('Reset Password API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reset the password if token is valid', async () => {
    // Mock data
    const hashedPassword = 'hashed_new_password';
    hashMock.mockResolvedValue(hashedPassword);
    mockFindFirst.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      resetPasswordToken: 'mocked_token',
      resetPasswordTokenExpiry: new Date(Date.now() + 3600000), // Token expiry 1 hour from now
    });

    const request = mockRequest({
      password: 'new_password',
      token: 'mocked_token',
    });

    await POST(request);

    // Verify password was hashed and user was updated
    expect(hashMock).toHaveBeenCalledWith('new_password', 10);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    // Verify response
    expect(json).toHaveBeenCalledWith(
      { message: 'Password successfully reset' },
      { status: 200 }
    );
  });

  it('should return 400 if token is invalid or expired', async () => {
    // Mock for expired or invalid token
    mockFindFirst.mockResolvedValue(null);

    const request = mockRequest({
      password: 'new_password',
      token: 'invalid_or_expired_token',
    });

    await POST(request);

    // Verify response
    expect(json).toHaveBeenCalledWith(
      { message: 'Token is invalid or has expired' },
      { status: 400 }
    );
  });

  it('should return 400 if password or token is missing', async () => {
    const request = mockRequest({ password: 'new_password' }); // No token provided

    await POST(request);

    // Verify response for missing token
    expect(json).toHaveBeenCalledWith(
      { message: 'Password and token are required' },
      { status: 400 }
    );
  });

  it('should return 500 for internal errors', async () => {
    const error = new Error('Database error');
    mockFindFirst.mockRejectedValueOnce(error);

    const request = mockRequest({
      password: 'new_password',
      token: 'mocked_token',
    });

    await POST(request);

    // Verify the error response
    expect(json).toHaveBeenCalledWith({ error: 'Internal server error' }, { status: 500 });
  });
});
