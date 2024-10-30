import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPasswordPage from '@/app/auth/reset-password/[token]/page';
import { useRouter } from 'next/router';

// Mock the next/router module
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('ResetPasswordPage', () => {
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
      query: { token: 'valid-token' }, // Simulate the token in the params
    });
    jest.clearAllMocks();
  });

  it('displays an error message when an error occurs', async () => {
    // Render the page
    render(<ResetPasswordPage />);

    // Simulate form submission (make sure the button label is correct)
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Ensure that the error message is shown
    await waitFor(() => {
      expect(screen.getByText('There was an error, please try again.')).toBeInTheDocument();
    });
  });
});
