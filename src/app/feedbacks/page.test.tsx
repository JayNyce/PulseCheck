// src/app/feedbacks/page.test.tsx

import { render, waitFor } from '@testing-library/react';
import FeedbacksPage from './page';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import '@testing-library/jest-dom';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('FeedbacksPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('redirects to login page if user is not authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<FeedbacksPage />);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login'));
  });

  it('redirects to submit feedback page if user is authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({ data: { user: { id: '1' } }, status: 'authenticated' });

    render(<FeedbacksPage />);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/feedbacks/submit'));
  });

  it('does not redirect if session status is loading', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'loading' });

    render(<FeedbacksPage />);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
