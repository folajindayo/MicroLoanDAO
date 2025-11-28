import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge, LoanStatusBadge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="primary">Primary</Badge>);
    expect(screen.getByText('Primary')).toHaveClass('bg-indigo-100');

    rerender(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-100');

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100');

    rerender(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('bg-red-100');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('px-2');

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium')).toHaveClass('px-2.5');

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('px-3');
  });

  it('renders as pill shape', () => {
    render(<Badge pill>Pill</Badge>);
    expect(screen.getByText('Pill')).toHaveClass('rounded-full');
  });

  it('renders with icon', () => {
    const Icon = () => <span data-testid="icon">★</span>;
    render(<Badge icon={<Icon />}>With Icon</Badge>);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });
});

describe('LoanStatusBadge', () => {
  it('renders REQUESTED status correctly', () => {
    render(<LoanStatusBadge status="REQUESTED" />);
    const badge = screen.getByText('Requested');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100');
  });

  it('renders FUNDED status correctly', () => {
    render(<LoanStatusBadge status="FUNDED" />);
    const badge = screen.getByText('Funded');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('renders REPAID status correctly', () => {
    render(<LoanStatusBadge status="REPAID" />);
    const badge = screen.getByText('Repaid');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
  });

  it('renders DEFAULTED status correctly', () => {
    render(<LoanStatusBadge status="DEFAULTED" />);
    const badge = screen.getByText('Defaulted');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100');
  });

  it('renders unknown status as default', () => {
    // @ts-expect-error Testing invalid status
    render(<LoanStatusBadge status="UNKNOWN" />);
    const badge = screen.getByText('Unknown');
    expect(badge).toBeInTheDocument();
  });
});

