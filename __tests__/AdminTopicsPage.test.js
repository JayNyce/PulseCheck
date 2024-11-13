import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminTopicsPage from '@/app/admin/topics/page';  // Correct the import
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('AdminTopicsPage', () => {
  const useRouterMock = useRouter;
  const pushMock = jest.fn();

  beforeEach(() => {
    useRouterMock.mockReturnValue({
      push: pushMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();  // Clear mocks after each test
  });

  test('redirects unauthenticated users to login', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<AdminTopicsPage />);

    expect(pushMock).toHaveBeenCalledWith('/auth/login');
  });

  test('redirects non-admin users to feedback page', () => {
    useSession.mockReturnValue({
      data: { user: { name: 'User', isAdmin: false } },
      status: 'authenticated',
    });

    render(<AdminTopicsPage />);

    expect(pushMock).toHaveBeenCalledWith('/feedbacks');
  });

  test('does not redirect admin users', () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Admin', isAdmin: true } },
      status: 'authenticated',
    });

    render(<AdminTopicsPage />);

    expect(pushMock).not.toHaveBeenCalled();
  });

  test('displays fetched topics', async () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Admin', isAdmin: true } },
      status: 'authenticated',
    });

    // Mocking the fetchTopics method
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ id: 1, name: 'Topic 1' }, { id: 2, name: 'Topic 2' }]),
      })
    );

    render(<AdminTopicsPage />);

    // Wait for topics to load and check they are rendered
    await waitFor(() => {
      expect(screen.getByText('Topic 1')).toBeInTheDocument();
      expect(screen.getByText('Topic 2')).toBeInTheDocument();
    });

    global.fetch.mockRestore();
  });

  test('updates newTopicName state when input changes', () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Admin', isAdmin: true } },
      status: 'authenticated',
    });

    render(<AdminTopicsPage />);
    const input = screen.getByPlaceholderText('New topic name');

    fireEvent.change(input, { target: { value: 'New Topic' } });

    expect(input.value).toBe('New Topic');
  });
});
