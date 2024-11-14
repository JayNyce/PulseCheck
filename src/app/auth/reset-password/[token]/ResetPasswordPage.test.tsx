// src/app/auth/reset-password/[token]/page.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordPage from './page';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ResetPasswordPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  const renderComponent = (token: string = 'valid-token') =>
    render(<ResetPasswordPage params={{ token }} />);

  it('renders reset password form with password inputs', () => {
    renderComponent();

    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('displays an error message if passwords do not match', async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: 'password456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('displays success message and redirects to login on successful password reset', async () => {
    jest.useFakeTimers(); // Enable fake timers for this test

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password reset successful!' }),
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText('Password reset successful! Redirecting to login...')).toBeInTheDocument();

    // Fast-forward the timer by 2000ms to trigger the redirect
    jest.advanceTimersByTime(2000);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login'));

    jest.useRealTimers(); // Restore real timers after this test
  });

  it('displays error message on unsuccessful password reset', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Token is invalid or has expired.' }),
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText('Token is invalid or has expired.')).toBeInTheDocument();
  });

  it('displays a generic error message on fetch failure', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText('An unexpected error occurred.')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Error resetting password:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
