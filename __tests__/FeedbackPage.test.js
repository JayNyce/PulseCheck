import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackPage from '@/app/feedbacks/page'; // Ensure this import matches your project structure
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock useSession from next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockRouterPush = jest.fn();
useRouter.mockReturnValue({ push: mockRouterPush });

describe('FeedbackPage', () => {
  const mockSession = {
    user: {
      id: '1',
      name: 'Test User',
      email: 'testuser@example.com',
      isAdmin: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(); // Reset fetch mock before each test
  });

  it('redirects to login if user is not authenticated', () => {
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<FeedbackPage />);

    expect(mockRouterPush).toHaveBeenCalledWith('/auth/login');
  });

  it('displays loading while session is loading', () => {
    useSession.mockReturnValue({ data: null, status: 'loading' });

    const { container } = render(<FeedbackPage />);

    expect(container).toBeEmptyDOMElement(); // The component should not render anything while loading
  });

  it('renders feedback form when session is authenticated', () => {
    useSession.mockReturnValue({ data: mockSession, status: 'authenticated' });

    render(<FeedbackPage />);

    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument();
    expect(screen.getByText('Recent Feedback')).toBeInTheDocument();
  });

  it('renders Admin button if user is admin', () => {
    useSession.mockReturnValue({ data: mockSession, status: 'authenticated' });

    render(<FeedbackPage />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});
