// src/app/auth/login/LoginPage.test.js

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Correctly mock next/navigation for App Router
import LoginPage from '@/app/auth/login/page';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(), // Mock the signIn function from next-auth
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(), // Correctly mock useRouter from next/navigation
}));

describe('LoginPage', () => {
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn(); // Mock the router's push function
    useRouter.mockReturnValue({ push: mockPush }); // Mock return value of useRouter
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it('renders the login form correctly', () => {
    render(<LoginPage />);
  
    // Be specific with what you're querying
    // Get the h1 element with the text "Login"
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    
    // Get the input fields by their placeholder texts
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    
    // Get the button by its role (and optionally name if there are multiple buttons)
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  

  it('submits the form with valid credentials and redirects to /feedbacks', async () => {
    signIn.mockResolvedValueOnce({ ok: true });
    
    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
  
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      console.log(signIn.mock.calls); // Check if signIn was called with correct args
      console.log(mockPush.mock.calls); // Check if router.push was called
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockPush).toHaveBeenCalledWith('/feedbacks');
    });
  });
  

  it('shows an alert when login fails', async () => {
    // Mock signIn to return a failed login response
    signIn.mockResolvedValueOnce({ ok: false });

    // Mock window.alert
    window.alert = jest.fn();

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for the async actions to complete
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      // Ensure the alert was shown
      expect(window.alert).toHaveBeenCalledWith('Login failed');
    });
  });

  it('navigates to forgot password page on link click', () => {
    render(<LoginPage />);
  
    // Click on the "Forgot your password?" link
    fireEvent.click(screen.getByText('Forgot your password?'));
  
    // Log the router push calls
    console.log(mockPush.mock.calls);
  
    // Ensure the router was pushed to /auth/forgot-password
    expect(mockPush).toHaveBeenCalledWith('/auth/forgot-password');
  });
  

  it('navigates to sign up page on sign up button click', () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByText('Sign Up'));

    // Ensure the router was pushed to /auth/signup
    expect(mockPush).toHaveBeenCalledWith('/auth/signup');
  });
});
