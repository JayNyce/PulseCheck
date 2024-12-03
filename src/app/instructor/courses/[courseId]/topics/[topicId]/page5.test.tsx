// src/app/instructor/courses/[courseId]/topics/[topicId]/page.test.tsx

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EditTopicPage from './page';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation');

describe('EditTopicPage', () => {
  const mockPush = jest.fn();
  const mockParams = { courseId: '1', topicId: '2' };

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

  it('redirects to login if user is not an instructor', async () => {
    (useSession as jest.Mock).mockReturnValueOnce({
      data: { user: { id: '1', isInstructor: false } },
      status: 'authenticated',
    });

    render(<EditTopicPage />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login'));
  });

  it('fetches and displays topic details', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'Sample Topic' }),
    });

    render(<EditTopicPage />);
    await waitFor(() => expect(screen.getByDisplayValue('Sample Topic')).toBeInTheDocument());
  });

  it('displays error message if fetching topic fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch topic' }),
    });

    render(<EditTopicPage />);
    await waitFor(() => expect(screen.getByText('Failed to fetch topic')).toBeInTheDocument());
  });

  it('updates the topic name successfully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Sample Topic' }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<EditTopicPage />);
    await waitFor(() => expect(screen.getByDisplayValue('Sample Topic')).toBeInTheDocument());

    fireEvent.change(screen.getByDisplayValue('Sample Topic'), { target: { value: 'Updated Topic' } });
    fireEvent.click(screen.getByText('Update Topic'));

    await waitFor(() => expect(screen.getByText('Topic updated successfully.')).toBeInTheDocument());
  });

  it('displays error message if updating topic fails', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Sample Topic' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to update topic' }),
      });

    render(<EditTopicPage />);
    await waitFor(() => expect(screen.getByDisplayValue('Sample Topic')).toBeInTheDocument());

    fireEvent.change(screen.getByDisplayValue('Sample Topic'), { target: { value: 'New Topic Name' } });
    fireEvent.click(screen.getByText('Update Topic'));

    await waitFor(() => expect(screen.getByText('Failed to update topic')).toBeInTheDocument());
  });

  it('deletes the topic successfully and redirects', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Sample Topic' }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<EditTopicPage />);
    await waitFor(() => expect(screen.getByDisplayValue('Sample Topic')).toBeInTheDocument());

    // Mock confirm dialog
    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    fireEvent.click(screen.getByText('Delete Topic'));

    await waitFor(() => {
      expect(screen.getByText('Topic deleted successfully.')).toBeInTheDocument();
      expect(mockPush).toHaveBeenCalledWith('/instructor/courses/1/topics');
    });
  });

  it('displays error message if deleting topic fails', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Sample Topic' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to delete topic' }),
      });

    render(<EditTopicPage />);
    await waitFor(() => expect(screen.getByDisplayValue('Sample Topic')).toBeInTheDocument());

    // Mock confirm dialog
    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    fireEvent.click(screen.getByText('Delete Topic'));

    await waitFor(() => expect(screen.getByText('Failed to delete topic')).toBeInTheDocument());
  });
});
