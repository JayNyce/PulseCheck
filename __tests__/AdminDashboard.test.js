
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminDashboard from '@/src/app/admin/page';

// Mock the necessary hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('AdminDashboard', () => {
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });
  });

  test('redirects unauthenticated users to login', () => {
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<AdminDashboard />);
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  test('redirects non-admin users to dashboard', () => {
    useSession.mockReturnValue({
      data: { user: { isAdmin: false } },
      status: 'authenticated',
    });

    render(<AdminDashboard />);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  test('allows admin users to view the dashboard', () => {
    useSession.mockReturnValue({
      data: { user: { isAdmin: true } },
      status: 'authenticated',
    });

    render(<AdminDashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  

  test('displays success message on successful topic addition', async () => {
    useSession.mockReturnValue({
      data: { user: { isAdmin: true } },
      status: 'authenticated',
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ name: 'New Topic' }),
      })
    );

    render(<AdminDashboard />);
    fireEvent.change(screen.getByPlaceholderText('Enter new topic name'), {
      target: { value: 'New Topic' },
    });
    fireEvent.click(screen.getByText('Add Topic'));

    expect(await screen.findByText('Topic "New Topic" added successfully.')).toBeInTheDocument();
  });
});
