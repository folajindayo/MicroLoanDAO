import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress, CircularProgress, LoanProgress } from '@/components/ui/Progress';

describe('Progress', () => {
  it('renders with default props', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders with correct value', () => {
    render(<Progress value={75} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('renders with label', () => {
    render(<Progress value={50} label="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with percentage label', () => {
    render(<Progress value={50} showPercentage />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('clamps value between 0 and max', () => {
    const { rerender } = render(<Progress value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

    rerender(<Progress value={150} max={100} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Progress value={50} size="sm" />);
    expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('h-1');

    rerender(<Progress value={50} size="md" />);
    expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('h-2');

    rerender(<Progress value={50} size="lg" />);
    expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('h-4');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Progress value={50} variant="primary" />);
    expect(screen.getByRole('progressbar').querySelector('[class*="bg-blue"]')).toBeInTheDocument();

    rerender(<Progress value={50} variant="success" />);
    expect(screen.getByRole('progressbar').querySelector('[class*="bg-green"]')).toBeInTheDocument();

    rerender(<Progress value={50} variant="warning" />);
    expect(screen.getByRole('progressbar').querySelector('[class*="bg-yellow"]')).toBeInTheDocument();

    rerender(<Progress value={50} variant="error" />);
    expect(screen.getByRole('progressbar').querySelector('[class*="bg-red"]')).toBeInTheDocument();
  });

  it('renders with animation', () => {
    render(<Progress value={50} animated />);
    expect(screen.getByRole('progressbar').querySelector('[class*="animate"]')).toBeInTheDocument();
  });

  it('renders with stripes', () => {
    render(<Progress value={50} striped />);
    expect(screen.getByRole('progressbar').querySelector('[class*="stripe"]')).toBeInTheDocument();
  });
});

describe('CircularProgress', () => {
  it('renders with default props', () => {
    render(<CircularProgress value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders with correct value', () => {
    render(<CircularProgress value={75} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('renders with percentage in center', () => {
    render(<CircularProgress value={50} showPercentage />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<CircularProgress value={50} size="sm" />);
    expect(screen.getByRole('progressbar')).toHaveClass('w-8', 'h-8');

    rerender(<CircularProgress value={50} size="lg" />);
    expect(screen.getByRole('progressbar')).toHaveClass('w-24', 'h-24');
  });

  it('renders with custom content', () => {
    render(<CircularProgress value={50}>Custom Label</CircularProgress>);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });
});

describe('LoanProgress', () => {
  it('renders loan progress bar', () => {
    render(<LoanProgress funded={500} total={1000} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    render(<LoanProgress funded={750} total={1000} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows funded and total amounts', () => {
    render(<LoanProgress funded={500} total={1000} showAmounts />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
    expect(screen.getByText(/1000/)).toBeInTheDocument();
  });

  it('renders with currency symbol', () => {
    render(<LoanProgress funded={500} total={1000} showAmounts currency="ETH" />);
    expect(screen.getByText(/ETH/)).toBeInTheDocument();
  });

  it('handles zero total gracefully', () => {
    render(<LoanProgress funded={0} total={0} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('caps at 100% when overfunded', () => {
    render(<LoanProgress funded={1500} total={1000} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});

