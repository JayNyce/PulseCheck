// src/app/feedbacks/layout.test.tsx

import { render, screen } from '@testing-library/react';
import FeedbacksLayout from './layout';
import { usePathname } from 'next/navigation';
import '@testing-library/jest-dom';
import Link from 'next/link';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('FeedbacksLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLayoutWithMockChildren = () =>
    render(
      <FeedbacksLayout>
        <div data-testid="mock-children">Mock Child Component</div>
      </FeedbacksLayout>
    );

  it('renders the sidebar with navigation links', () => {
    (usePathname as jest.Mock).mockReturnValue('/feedbacks/submit');
    renderLayoutWithMockChildren();

    expect(screen.getByText('Feedbacks')).toBeInTheDocument();
    expect(screen.getByText('Submit Feedback')).toBeInTheDocument();
    expect(screen.getByText('Received Feedback')).toBeInTheDocument();
    expect(screen.getByText('Given Feedback')).toBeInTheDocument();
  });

  it('applies active class to "Submit Feedback" link when pathname is /feedbacks/submit', () => {
    (usePathname as jest.Mock).mockReturnValue('/feedbacks/submit');
    renderLayoutWithMockChildren();

    const submitLink = screen.getByText('Submit Feedback');
    expect(submitLink).toHaveClass('bg-gray-200 font-semibold');
  });

  it('applies active class to "Received Feedback" link when pathname is /feedbacks/received', () => {
    (usePathname as jest.Mock).mockReturnValue('/feedbacks/received');
    renderLayoutWithMockChildren();

    const receivedLink = screen.getByText('Received Feedback');
    expect(receivedLink).toHaveClass('bg-gray-200 font-semibold');
  });

  it('applies active class to "Given Feedback" link when pathname is /feedbacks/given', () => {
    (usePathname as jest.Mock).mockReturnValue('/feedbacks/given');
    renderLayoutWithMockChildren();

    const givenLink = screen.getByText('Given Feedback');
    expect(givenLink).toHaveClass('bg-gray-200 font-semibold');
  });

  it('renders children components passed into the layout', () => {
    (usePathname as jest.Mock).mockReturnValue('/feedbacks/submit');
    renderLayoutWithMockChildren();

    expect(screen.getByTestId('mock-children')).toBeInTheDocument();
    expect(screen.getByTestId('mock-children')).toHaveTextContent('Mock Child Component');
  });
});
