// src/app/auth/signup/page.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from './page';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();

beforeAll(() => {
  global.fetch = jest.fn() as jest.Mock;
});

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

  // Mock fetch for courses and signup
  (global.fetch as jest.Mock).mockImplementation((url) => {
    if (url === '/api/courses') {
      return Promise.resolve({
        ok: true,
        json: async () => [
          { id: 1, name: 'Course 1', passKey: null },
          { id: 2, name: 'Course 2', passKey: 'abc123' },
        ],
      });
    }
    if (url === '/api/auth/signup') {
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }
    return Promise.reject(new Error('Unhandled fetch request in test'));
  });
});

describe('SignupPage', () => {
  

  it('fetches and displays courses', async () => {
    render(<SignupPage />);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/courses'));
    const courseSelect = screen.getByLabelText(/Enroll in a Course/i);
    expect(courseSelect).toBeInTheDocument();
    fireEvent.change(courseSelect, { target: { value: '1' } });
    expect(screen.getByText(/Course 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Course 2 \(Requires PassKey\)/i)).toBeInTheDocument();
  });

  it('shows passKey input when selecting a course with passKey requirement', async () => {
    render(<SignupPage />);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/courses'));
    fireEvent.change(screen.getByLabelText(/Enroll in a Course/i), { target: { value: '2' } });
    expect(screen.getByPlaceholderText('Enter PassKey')).toBeInTheDocument();
  });
});
