import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner, PageSpinner, InlineSpinner } from '@/components/ui/Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with accessible label', () => {
    render(<Spinner label="Loading data" />);
    expect(screen.getByText('Loading data')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Spinner size="sm" />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('w-4', 'h-4');

    rerender(<Spinner size="md" />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('w-8', 'h-8');

    rerender(<Spinner size="lg" />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('w-12', 'h-12');
  });

  it('renders with different color variants', () => {
    const { rerender } = render(<Spinner variant="primary" />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('text-blue-600');

    rerender(<Spinner variant="secondary" />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('text-gray-600');

    rerender(<Spinner variant="white" />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('text-white');
  });

  it('renders with animation', () => {
    render(<Spinner />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('animate-spin');
  });

  it('hides label visually when showLabel is false', () => {
    render(<Spinner label="Loading" showLabel={false} />);
    expect(screen.getByText('Loading')).toHaveClass('sr-only');
  });
});

describe('PageSpinner', () => {
  it('renders centered on page', () => {
    render(<PageSpinner />);
    expect(screen.getByRole('status').parentElement).toHaveClass(
      'fixed',
      'inset-0',
      'flex',
      'items-center',
      'justify-center'
    );
  });

  it('renders with backdrop', () => {
    render(<PageSpinner />);
    expect(screen.getByRole('status').parentElement).toHaveClass('bg-black/50');
  });

  it('renders with optional message', () => {
    render(<PageSpinner message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders large spinner', () => {
    render(<PageSpinner />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('w-12', 'h-12');
  });
});

describe('InlineSpinner', () => {
  it('renders inline with text', () => {
    render(<InlineSpinner />);
    expect(screen.getByRole('status')).toHaveClass('inline-flex');
  });

  it('renders small by default', () => {
    render(<InlineSpinner />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('w-4', 'h-4');
  });

  it('renders with text', () => {
    render(<InlineSpinner text="Saving..." />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('positions text correctly', () => {
    render(<InlineSpinner text="Processing" textPosition="left" />);
    const container = screen.getByRole('status');
    expect(container).toHaveClass('flex-row-reverse');
  });
});

