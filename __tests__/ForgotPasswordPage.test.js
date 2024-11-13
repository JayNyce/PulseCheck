import { render, screen, fireEvent } from '@testing-library/react';
import ForgotPasswordPage from '@/app/auth/forgot-password/page';

describe('ForgotPasswordPage', () => {
  it('renders the Forgot Password form', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
  });

  it('submits the form with a valid email and shows success message', async () => {
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    const message = await screen.findByText('If this email exists, a password reset link will be sent.');
    expect(message).toBeInTheDocument();
  });

  it('shows an error message when form submission fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    const message = await screen.findByText('There was an error, please try again.');
    expect(message).toBeInTheDocument();
  });

  it('displays an error when submitting with an invalid email', async () => {
    render(<ForgotPasswordPage />);

    // Simulate an invalid email (empty value)
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    // Ensure that fetch is NOT called due to validation failure
    expect(global.fetch).not.toHaveBeenCalled();

    // Ensure the error message for invalid email is displayed
    expect(screen.getByText('Please enter a valid email.')).toBeInTheDocument();
  });
});
