// src/app/api/auth/signup/route.test.ts

import { POST } from './route';
import bcrypt from 'bcryptjs';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockFindUnique = jest.fn();
  const mockCreateUser = jest.fn();
  const mockCreateUserCourse = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: mockFindUnique,
        create: mockCreateUser,
      },
      course: {
        findUnique: mockFindUnique,
      },
      userCourse: {
        create: mockCreateUserCourse,
      },
    })),
    __mock: { mockFindUnique, mockCreateUser, mockCreateUserCourse },
  };
});

const { mockFindUnique, mockCreateUser, mockCreateUserCourse } = require('@prisma/client').__mock;

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn().mockReturnValue('hashed_password'),
}));

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

describe('Signup API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for missing required fields', async () => {
    const request = mockRequest({});
    await POST(request);

    expect(json).toHaveBeenCalledWith({ error: 'Missing required fields' }, { status: 400 });
  });

  it('should return 400 if user already exists', async () => {
    mockFindUnique.mockResolvedValueOnce({ id: 1, email: 'existing@example.com' });

    const request = mockRequest({ name: 'John Doe', email: 'existing@example.com', password: 'password123' });
    await POST(request);

    expect(json).toHaveBeenCalledWith({ error: 'User already exists' }, { status: 400 });
  });

  it('should create a user without course enrollment if no courseId provided', async () => {
    mockFindUnique.mockResolvedValueOnce(null); // User does not exist
    mockCreateUser.mockResolvedValueOnce({ id: 1 });

    const request = mockRequest({ name: 'John Doe', email: 'new@example.com', password: 'password123' });
    await POST(request);

    expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 10);
    expect(mockCreateUser).toHaveBeenCalledWith({
      data: { name: 'John Doe', email: 'new@example.com', password: 'hashed_password' },
    });
    expect(json).toHaveBeenCalledWith({ message: 'User created successfully' }, { status: 201 });
  });

  it('should return 404 if course does not exist', async () => {
    mockFindUnique.mockResolvedValueOnce(null); // User does not exist
    mockFindUnique.mockResolvedValueOnce(null); // Course does not exist

    const request = mockRequest({
      name: 'John Doe',
      email: 'new@example.com',
      password: 'password123',
      courseId: '123',
    });
    await POST(request);

    expect(json).toHaveBeenCalledWith({ error: 'Course not found.' }, { status: 404 });
  });

  it('should return 400 if passKey is required but not provided', async () => {
    mockFindUnique.mockResolvedValueOnce(null); // User does not exist
    mockFindUnique.mockResolvedValueOnce({ id: 123, passKey: 'required_pass' }); // Course exists with passKey

    const request = mockRequest({
      name: 'John Doe',
      email: 'new@example.com',
      password: 'password123',
      courseId: '123',
    });
    await POST(request);

    expect(json).toHaveBeenCalledWith({ error: 'PassKey is required for this course.' }, { status: 400 });
  });

  it('should return 400 for invalid passKey', async () => {
    mockFindUnique.mockResolvedValueOnce(null); // User does not exist
    mockFindUnique.mockResolvedValueOnce({ id: 123, passKey: 'correct_pass' }); // Course exists with passKey

    const request = mockRequest({
      name: 'John Doe',
      email: 'new@example.com',
      password: 'password123',
      courseId: '123',
      passKey: 'wrong_pass',
    });
    await POST(request);

    expect(json).toHaveBeenCalledWith({ error: 'Invalid PassKey.' }, { status: 400 });
  });

  it('should create a user and enroll them in a course if passKey is valid', async () => {
    mockFindUnique.mockResolvedValueOnce(null); // User does not exist
    mockFindUnique.mockResolvedValueOnce({ id: 123, passKey: 'correct_pass' }); // Course exists with passKey
    mockCreateUser.mockResolvedValueOnce({ id: 1 });
    mockCreateUserCourse.mockResolvedValueOnce({});

    const request = mockRequest({
      name: 'John Doe',
      email: 'new@example.com',
      password: 'password123',
      courseId: '123',
      passKey: 'correct_pass',
    });
    await POST(request);

    expect(mockCreateUser).toHaveBeenCalledWith({
      data: { name: 'John Doe', email: 'new@example.com', password: 'hashed_password' },
    });
    expect(mockCreateUserCourse).toHaveBeenCalledWith({
      data: { userId: 1, courseId: 123 },
    });
    expect(json).toHaveBeenCalledWith({ message: 'User created successfully' }, { status: 201 });
  });
/*
  it('should return 500 for internal server errors', async () => {
    const error = new Error('Database error');
    mockFindUnique.mockRejectedValueOnce(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const request = mockRequest({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    });
    await POST(request);

    expect(consoleSpy).toHaveBeenCalledWith('Error during signup:', error);
    expect(json).toHaveBeenCalledWith({ error: 'Signup failed' }, { status: 500 });

    consoleSpy.mockRestore();
  });*/
});
