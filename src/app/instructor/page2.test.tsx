// src/app/instructor/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InstructorDashboard from './page';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

describe('InstructorDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login if user is not authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    render(<InstructorDashboard />);
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('displays a list of courses for an authenticated instructor', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isInstructor: true } },
      status: 'authenticated',
    });

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, name: 'Course 1', passKey: 'ABC123' },
          { id: 2, name: 'Course 2', passKey: null },
        ],
      });

    render(<InstructorDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
      expect(screen.getByText('Passkey: ABC123')).toBeInTheDocument();
    });
  });

  it('handles course creation button click', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isInstructor: true } },
      status: 'authenticated',
    });

    render(<InstructorDashboard />);
    fireEvent.click(screen.getByText('Create New Course'));
    expect(mockPush).toHaveBeenCalledWith('/instructor/courses/create');
  });

  it('displays an error message if course fetch fails', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isInstructor: true } },
      status: 'authenticated',
    });

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to fetch courses.' }),
      });

    render(<InstructorDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch courses.')).toBeInTheDocument();
    });
  });

  it('opens edit modal with correct course details', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isInstructor: true } },
      status: 'authenticated',
    });

    const courses = [
      { id: 1, name: 'Course 1', passKey: 'ABC123' },
    ];

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => courses,
      });

    render(<InstructorDashboard />);
    await waitFor(() => screen.getByText('Course 1'));
    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByText('Edit Course')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Course 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ABC123')).toBeInTheDocument();
  });

  
});
