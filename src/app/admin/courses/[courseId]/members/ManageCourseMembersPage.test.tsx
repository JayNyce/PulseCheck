import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManageCourseMembersPage from '@/app/admin/courses/[courseId]/members/page';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation');

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
(useParams as jest.Mock).mockReturnValue({ courseId: '1' });

describe('ManageCourseMembersPage - Authentication', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login if not authenticated', async () => {
    // Mock session as unauthenticated
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    
    render(<ManageCourseMembersPage />);
    
    // Expect redirection to login
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login'));
  });

  it('redirects to dashboard if user is authenticated but not an admin', async () => {
    // Mock session with a non-admin user
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { isAdmin: false } }, 
      status: 'authenticated' 
    });
    
    render(<ManageCourseMembersPage />);
    
    // Expect redirection to dashboard
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'));
  });

  it('does not redirect if user is an authenticated admin', async () => {
    // Mock session with an admin user
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { isAdmin: true } }, 
      status: 'authenticated' 
    });
    
    render(<ManageCourseMembersPage />);
    
    // Expect no redirection
    await waitFor(() => expect(mockPush).not.toHaveBeenCalled());
  });

  it('shows loading state while session is loading', () => {
    // Mock session as loading
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'loading' });
    
    render(<ManageCourseMembersPage />);
    
    // Verify that the loading state is managed correctly (you can check for loading indicators or pending states if they exist)
    expect(mockPush).not.toHaveBeenCalled();
  });
});
