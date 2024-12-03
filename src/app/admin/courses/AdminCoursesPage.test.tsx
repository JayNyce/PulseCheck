import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminCoursesPage from '@/app/admin/courses/page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation');

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

describe('AdminCoursesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Authentication tests
  it('redirects to login if not authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<AdminCoursesPage />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login'));
  });

  it('redirects to dashboard if user is authenticated but not an admin', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isAdmin: false } },
      status: 'authenticated',
    });
    render(<AdminCoursesPage />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'));
  });

  it('does not redirect if user is an authenticated admin', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isAdmin: true } },
      status: 'authenticated',
    });
    render(<AdminCoursesPage />);
    await waitFor(() => expect(mockPush).not.toHaveBeenCalled());
  });

  // Fetch courses
  it('fetches and displays courses', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isAdmin: true } },
      status: 'authenticated',
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, name: 'Test Course', passKey: '123456' }],
    });

    render(<AdminCoursesPage />);
    expect(await screen.findByText('Test Course')).toBeInTheDocument();
  });

  // Adding a new course
  it('adds a new course', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isAdmin: true } },
      status: 'authenticated',
    });
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, name: 'New Course', passKey: '654321' }),
      });

    render(<AdminCoursesPage />);

    // Enter new course data
    fireEvent.change(screen.getByPlaceholderText('New course name'), {
      target: { value: 'New Course' },
    });
    fireEvent.change(screen.getByPlaceholderText('PassKey (optional)'), {
      target: { value: '654321' },
    });
    fireEvent.click(screen.getByText('Add Course'));

    // Expect new course to be added and visible
    expect(await screen.findByText('New Course')).toBeInTheDocument();
  });

  // Editing a course
  it('opens edit modal and updates course', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isAdmin: true } },
      status: 'authenticated',
    });
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: 'Existing Course', passKey: '123456' }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'Updated Course', passKey: '654321' }),
      });

    render(<AdminCoursesPage />);

    // Wait for the initial course to load
    expect(await screen.findByText('Existing Course')).toBeInTheDocument();

    // Open the edit modal
    fireEvent.click(screen.getByText('Edit'));

    // Target the edit modal
    const editModal = await screen.findByRole('dialog', { name: 'Edit Course' });

    // Update course name and passkey within the modal
    fireEvent.change(within(editModal).getByPlaceholderText('Course name'), {
      target: { value: 'Updated Course' },
    });
    fireEvent.change(within(editModal).getByPlaceholderText('PassKey (optional)'), {
      target: { value: '654321' },
    });
    
    // Save the changes
    fireEvent.click(within(editModal).getByText('Save'));

    // Expect updated course to be displayed
    expect(await screen.findByText('Updated Course')).toBeInTheDocument();
  });
});
