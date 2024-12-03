// src/app/instructor/courses/[courseId]/topics/create/page.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateTopicPage from './page';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import '@testing-library/jest-dom';

jest.mock('next-auth/react');
jest.mock('next/navigation');

describe('CreateTopicPage', () => {
  const mockPush = jest.fn();
  const mockParams = { courseId: '1' };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue(mockParams);
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '1', isInstructor: true } },
      status: 'authenticated',
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login if user is not authenticated or not an instructor', async () => {
    (useSession as jest.Mock).mockReturnValueOnce({
      data: { user: { id: '1', isInstructor: false } },
      status: 'authenticated',
    });

    render(<CreateTopicPage />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login'));
  });



  it('creates a new topic successfully and redirects', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'New Topic' }),
    });

    render(<CreateTopicPage />);
    fireEvent.change(screen.getByPlaceholderText('Enter topic name'), {
      target: { value: 'New Topic' },
    });
    fireEvent.click(screen.getByText('Create Topic'));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/instructor/courses/1/topics'));
  });

  it('shows an error message if topic creation fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to create topic.' }),
    });

    render(<CreateTopicPage />);
    fireEvent.change(screen.getByPlaceholderText('Enter topic name'), {
      target: { value: 'Test Topic' },
    });
    fireEvent.click(screen.getByText('Create Topic'));

    await waitFor(() =>
      expect(screen.getByText('Failed to create topic.')).toBeInTheDocument()
    );
  });

  it('displays a success message after creating a topic', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Sample Topic' }),
    });

    render(<CreateTopicPage />);
    fireEvent.change(screen.getByPlaceholderText('Enter topic name'), {
      target: { value: 'Sample Topic' },
    });
    fireEvent.click(screen.getByText('Create Topic'));

    await waitFor(() =>
      expect(screen.getByText('Topic created successfully!')).toBeInTheDocument()
    );
  });
});
