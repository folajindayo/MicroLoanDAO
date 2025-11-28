import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, IconButton } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border', 'border-gray-300');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('renders disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('renders loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
  });

  it('renders with loading text', () => {
    render(<Button isLoading loadingText="Saving...">Save</Button>);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('renders with left icon', () => {
    const Icon = () => <svg data-testid="left-icon" />;
    render(<Button leftIcon={<Icon />}>With Icon</Button>);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const Icon = () => <svg data-testid="right-icon" />;
    render(<Button rightIcon={<Icon />}>With Icon</Button>);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('renders full width', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('renders as anchor when href is provided', () => {
    render(<Button href="/path">Link Button</Button>);
    expect(screen.getByRole('link', { name: 'Link Button' })).toHaveAttribute('href', '/path');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('IconButton', () => {
  const Icon = () => <svg data-testid="icon" />;

  it('renders icon button', () => {
    render(<IconButton icon={<Icon />} aria-label="Action" />);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<IconButton icon={<Icon />} size="sm" aria-label="Small" />);
    expect(screen.getByRole('button')).toHaveClass('p-1');

    rerender(<IconButton icon={<Icon />} size="md" aria-label="Medium" />);
    expect(screen.getByRole('button')).toHaveClass('p-2');

    rerender(<IconButton icon={<Icon />} size="lg" aria-label="Large" />);
    expect(screen.getByRole('button')).toHaveClass('p-3');
  });

  it('renders with rounded variant', () => {
    render(<IconButton icon={<Icon />} rounded aria-label="Rounded" />);
    expect(screen.getByRole('button')).toHaveClass('rounded-full');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<IconButton icon={<Icon />} onClick={onClick} aria-label="Click" />);
    await user.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled state', () => {
    render(<IconButton icon={<Icon />} disabled aria-label="Disabled" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders loading state', () => {
    render(<IconButton icon={<Icon />} isLoading aria-label="Loading" />);
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
  });

  it('renders with tooltip', () => {
    render(<IconButton icon={<Icon />} aria-label="With Tooltip" tooltip="Action tooltip" />);
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Action tooltip');
  });
});

