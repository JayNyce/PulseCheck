import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '@/app/admin/page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation');

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Authentication tests
  it('redirects to login if not authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<AdminDashboard />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login'));
  });

  it('redirects to dashboard if user is authenticated but not an admin', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isAdmin: false } },
      status: 'authenticated',
    });
    render(<AdminDashboard />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'));
  });

  it('does not redirect if user is an authenticated admin', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isAdmin: true } },
      status: 'authenticated',
    });
    render(<AdminDashboard />);
    await waitFor(() => expect(mockPush).not.toHaveBeenCalled());
  });

  // Loading state
  it('renders loading state while session is loading', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'loading' });
    render(<AdminDashboard />);
    expect(screen.getByText('Loading admin dashboard...')).toBeInTheDocument();
  });

  // Navigation buttons
  it('navigates to manage topics page when "Manage Topics" button is clicked', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isAdmin: true } },
      status: 'authenticated',
    });
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Manage Topics'));
    expect(mockPush).toHaveBeenCalledWith('/admin/topics');
  });

  it('navigates to manage courses page when "Manage Courses" button is clicked', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { isAdmin: true } },
      status: 'authenticated',
    });
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Manage Courses'));
    expect(mockPush).toHaveBeenCalledWith('/admin/courses');
  });
});
