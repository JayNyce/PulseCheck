// src/app/dashboard/page.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

// Mock next-auth and next/navigation
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

describe('DashboardPage', () => {
  it('redirects to login if user is not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<DashboardPage />);
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('displays loading indicator while fetching data', async () => {
    render(<DashboardPage />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('shows "No data available" message if dashboard data is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });
    
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByText('No data available.')).toBeInTheDocument());
  });

  it('fetches and displays dashboard data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        receivedFeedback: {
          averageRating: 4.2,
          topicDistribution: { 'Topic A': 30, 'Topic B': 20 },
          ratingDistribution: { '5': 15, '4': 10, '3': 5 },
        },
      }),
    });
  
    render(<DashboardPage />);
  
    // Wait for dashboard data to load and verify it is displayed
    await waitFor(() => expect(screen.getByText('Your Feedback Dashboard')).toBeInTheDocument());
  
    // Use regex to look for the average rating text with flexibility
    await waitFor(() => expect(screen.getByText(/4\.2/)).toBeInTheDocument());
    expect(screen.getByText('Topic Distribution')).toBeInTheDocument();
    expect(screen.getByText('Rating Distribution')).toBeInTheDocument();
  });
  

  it('displays an error message if data fetching fails', async () => {
    console.error = jest.fn(); // Suppress error logging in test output
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch dashboard data'));

    render(<DashboardPage />);

    // Wait for error handling to complete
    await waitFor(() => expect(screen.getByText('No data available.')).toBeInTheDocument());
    expect(console.error).toHaveBeenCalledWith('Error fetching dashboard data:', expect.any(Error));
  });
});
