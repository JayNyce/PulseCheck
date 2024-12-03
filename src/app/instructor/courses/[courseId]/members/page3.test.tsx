// src/app/instructor/courses/[courseId]/members/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageCourseMembersPage from './page';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import '@testing-library/jest-dom';
import debounce from 'lodash.debounce';

// Mock modules
jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('lodash.debounce', () => jest.fn((fn) => fn));

describe('ManageCourseMembersPage', () => {
  const mockPush = jest.fn();
  const mockParams = { courseId: '1' };
  const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
  const mockMembers = [mockUser];

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue(mockParams);
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '2', isInstructor: true } },
      status: 'authenticated',
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login if user is not an instructor', async () => {
    (useSession as jest.Mock).mockReturnValueOnce({
      data: { user: { id: '2', isInstructor: false } },
      status: 'authenticated',
    });

    render(<ManageCourseMembersPage />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login'));
  });

  it('fetches and displays course name and members', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/instructor/courses/1') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ name: 'Course 1' }),
        });
      }
      if (url === '/api/instructor/courses/1/members') {
        return Promise.resolve({
          ok: true,
          json: async () => mockMembers,
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });

    render(<ManageCourseMembersPage />);
    await waitFor(() => expect(screen.getByText('Manage Students for Course "Course 1"')).toBeInTheDocument());
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  it('displays error message if fetching course data fails', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isInstructor: true } },
      status: 'authenticated'
    });
    global.fetch=jest.fn().mockResolvedValueOnce({ ok: false });
    render(<ManageCourseMembersPage />);
    expect(await screen.findByText('Failed to fetch course data.')).toBeInTheDocument();
  });

  it('searches and displays users based on search query', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/instructor/users?search=Jane')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 2, name: 'Jane Doe', email: 'jane@example.com' }],
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });

    render(<ManageCourseMembersPage />);
    fireEvent.change(screen.getByPlaceholderText('Search users by name or email'), { target: { value: 'Jane' } });
    await waitFor(() => expect(screen.getByText('Jane Doe (jane@example.com)')).toBeInTheDocument());
  });


  it('displays an error message if adding a member fails', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/instructor/users?search=Jane')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 2, name: 'Jane Doe', email: 'jane@example.com' }],
        });
      }
      if (url === '/api/instructor/courses/1/members') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Failed to add member.' }),
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });

    render(<ManageCourseMembersPage />);
    fireEvent.change(screen.getByPlaceholderText('Search users by name or email'), { target: { value: 'Jane' } });
    await waitFor(() => expect(screen.getByText('Jane Doe (jane@example.com)')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Jane Doe (jane@example.com)'));
    await waitFor(() => expect(screen.getByText('Failed to add member.')).toBeInTheDocument());
  });

});
