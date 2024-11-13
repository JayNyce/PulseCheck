import { render, screen, waitFor } from '@testing-library/react';
import { Line, Bar } from 'react-chartjs-2';
import '@testing-library/jest-dom';
import DashboardPage from '@/app/dashboard/page';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Mock Chart Components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart"></div>,
  Bar: () => <div data-testid="mock-bar-chart"></div>,
}));

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('DashboardPage', () => {
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    global.fetch.mockClear();
  });

  it('redirects to login if user is not authenticated', () => {
    // Mock session as not authenticated
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<DashboardPage />);

    // Ensure redirection to login page
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('displays loading message when loading', () => {
    // Mock session as loading
    useSession.mockReturnValue({ data: null, status: 'loading' });

    render(<DashboardPage />);

    // Check if loading message is displayed
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('displays error message if data fetching fails', async () => {
    // Mock authenticated session
    useSession.mockReturnValue({
      data: { user: { id: '1' } },
      status: 'authenticated',
    });
  
    // Mock fetch error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Internal Server Error',
      })
    );
  
    render(<DashboardPage />);
  
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load aggregated feedback data.')).toBeInTheDocument();
    });
  });

  it('displays charts when data is fetched successfully', async () => {
    // Mock authenticated session
    useSession.mockReturnValue({
      data: { user: { id: '1' } },
      status: 'authenticated',
    });
  
    // Mock successful fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            averageRatings: [
              { created_at: '2024-10-01', _avg: { rating: 4 } },
              { created_at: '2024-10-02', _avg: { rating: 3.5 } },
            ],
            topicCounts: [
              { topic: 'Topic 1', count: 10 },
              { topic: 'Topic 2', count: 5 },
            ],
          }),
      })
    );
  
    render(<DashboardPage />);
  
    // Check if the charts are displayed correctly
    await waitFor(() => {
      expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    });
  });

  it('displays "No data available" message if no data is returned', async () => {
    // Mock authenticated session
    useSession.mockReturnValue({
      data: { user: { id: '1' } },
      status: 'authenticated',
    });
  
    // Mock fetch response with no data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            averageRatings: [],
            topicCounts: [],
          }),
      })
    );
  
    render(<DashboardPage />);
  
    // Check if the "No data available" message is displayed
    await waitFor(() => {
      expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });
  });
});
