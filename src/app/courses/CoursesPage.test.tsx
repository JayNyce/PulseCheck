// src/app/courses/page.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoursesPage from './page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (useSession as jest.Mock).mockReturnValue({ data: { user: { id: '1' } }, status: 'authenticated' });
  global.fetch = jest.fn() as jest.Mock;
});

describe('CoursesPage', () => {
  it('redirects to login page if user is not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<CoursesPage />);
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('displays loading indicator while fetching courses', async () => {
    render(<CoursesPage />);
    expect(screen.getByText('Loading courses...')).toBeInTheDocument();
  });

  it('fetches and displays all courses and enrolled courses', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/courses') {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, name: 'Course 1' }, { id: 2, name: 'Course 2', passKey: 'abc123' }],
        });
      }
      if (url === '/api/users/1/courses') {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, name: 'Course 1' }],
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });

    render(<CoursesPage />);

    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument());
    expect(screen.getByText('Course 2 (Requires Passkey)')).toBeInTheDocument();
    expect(screen.getByText('Enrolled Courses')).toBeInTheDocument();
    expect(screen.getByText('Available Courses')).toBeInTheDocument();
  });

  
  it('displays available courses in the dropdown', async () => {
    const availableCourses = [
      { id: 1, name: 'Course 1', passKey: null },
      { id: 2, name: 'Course 2', passKey: '1234' }
    ];
    global.fetch = jest.fn() .mockResolvedValueOnce({ ok: true, json: async () => availableCourses });

    render(<CoursesPage />);

    // Verify that dropdown options include the available courses
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument());
    expect(screen.getByText('Course 2 (Requires Passkey)')).toBeInTheDocument();
  });
 
});
