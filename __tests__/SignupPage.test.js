import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupPage from '@/app/auth/signup/page'; // Adjust the import to your actual path
import { useRouter } from 'next/router';

// Mock the next/router module
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('SignupPage', () => {
  let mockPush;

  beforeEach(() => {
    // Reset mockPush for each test
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  it('displays an error message on failed signup', async () => {
    // Render the page
    render(<SignupPage />);

    // Simulate form input for name, email, and password
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });

    // Click on the "Sign Up" button
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('There was an error, please try again.')).toBeInTheDocument();
    });
  });

  it('displays a generic error message when an unknown error occurs', async () => {
    // Render the page
    render(<SignupPage />);

    // Simulate form input for name, email, and password
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });

    // Click on the "Sign Up" button
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    // Wait for the generic error message to appear
    await waitFor(() => {
      expect(screen.getByText('An unknown error occurred.')).toBeInTheDocument();
    });
  });
});
