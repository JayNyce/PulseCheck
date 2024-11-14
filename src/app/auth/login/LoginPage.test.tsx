// src/app/auth/login/page.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (signIn as jest.Mock).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with email, password, login, forgot password, and sign-up links', () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot your password\?/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('handles successful login and navigates to /feedbacks', async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockPush).toHaveBeenCalledWith('/feedbacks');
    });
  });

  it('shows an alert if login fails', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({ ok: false });
    window.alert = jest.fn();

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      expect(window.alert).toHaveBeenCalledWith('Login failed');
    });
  });

  it('renders the correct href for forgot password link', () => {
    render(<LoginPage />);
    const forgotPasswordLink = screen.getByText(/forgot your password\?/i);
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/auth/forgot-password');
  });

  it('navigates to signup page when the Sign Up button is clicked', () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByText(/sign up/i));

    expect(mockPush).toHaveBeenCalledWith('/auth/signup');
  });
});
