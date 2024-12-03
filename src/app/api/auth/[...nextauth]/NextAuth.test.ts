// src/app/api/auth/[...nextauth]/route.test.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GET, POST } from './route';

jest.mock('next-auth', () => jest.fn());
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('NextAuth API Route', () => {
  it('should call NextAuth with the correct options for a GET request', async () => {
    // Mock NextAuth implementation
    (NextAuth as jest.Mock).mockImplementation(() => (req: any, res: any) => {
      res.status(200).json({ message: 'Auth handler called' });
    });

    const req = { method: 'GET' }; // Mock GET request
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await GET(req as any, res as any); // Call GET handler

    // Verify NextAuth was called with the correct options
    expect(NextAuth).toHaveBeenCalledWith(authOptions);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Auth handler called' });
  });

  it('should handle POST requests correctly', async () => {
    // Set up mock for POST request
    (NextAuth as jest.Mock).mockImplementation(() => (req: any, res: any) => {
      res.status(200).json({ message: 'Auth handler POST called' });
    });

    const req = { method: 'POST' }; // Mock POST request
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await POST(req as any, res as any); // Call POST handler

    // Verify response
    expect(NextAuth).toHaveBeenCalledWith(authOptions);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Auth handler POST called' });
  });
});
