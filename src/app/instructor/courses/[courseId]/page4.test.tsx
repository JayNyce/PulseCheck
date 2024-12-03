// src/app/instructor/courses/[courseId]/CourseDetailPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CourseDetailPage from './page';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
(useParams as jest.Mock).mockReturnValue({ courseId: '1' });

describe('CourseDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login if user is not authenticated or not an instructor', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<CourseDetailPage />);
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('displays course details if the user is an authenticated instructor', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isInstructor: true } },
      status: 'authenticated',
    });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Course 1', passKey: 'ABC123' }),
    });

    render(<CourseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Passkey: ABC123')).toBeInTheDocument();
    });
  });

  it('displays an error message if fetching course details fails', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isInstructor: true } },
      status: 'authenticated',
    });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch course' }),
    });

    render(<CourseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch course')).toBeInTheDocument();
    });
  });

  it('navigates to Manage Students page when "Manage Students" button is clicked', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isInstructor: true } },
      status: 'authenticated',
    });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Course 1', passKey: null }),
    });

    render(<CourseDetailPage />);

    await waitFor(() => screen.getByText('Course 1'));
    fireEvent.click(screen.getByText('Manage Students'));

    expect(mockPush).toHaveBeenCalledWith('/instructor/courses/1/members');
  });

  it('navigates to Manage Topics page when "Manage Topics" button is clicked', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isInstructor: true } },
      status: 'authenticated',
    });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Course 1', passKey: null }),
    });

    render(<CourseDetailPage />);

    await waitFor(() => screen.getByText('Course 1'));
    fireEvent.click(screen.getByText('Manage Topics'));

    expect(mockPush).toHaveBeenCalledWith('/instructor/courses/1/topics');
  });

  it('displays loading indicator if course data is still being fetched', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isInstructor: true } },
      status: 'authenticated',
    });

    render(<CourseDetailPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
