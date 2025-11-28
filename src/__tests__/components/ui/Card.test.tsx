import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card, CardHeader, CardBody, CardFooter, StatsCard } from '@/components/ui/Card';

describe('Card', () => {
  it('renders with children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders with default styling', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass(
      'bg-white',
      'rounded-lg',
      'shadow'
    );
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Card variant="elevated">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('shadow-lg');

    rerender(<Card variant="outlined">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('border');

    rerender(<Card variant="flat">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('shadow-none');
  });

  it('renders as clickable card', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<Card onClick={onClick}>Clickable Card</Card>);
    
    await user.click(screen.getByText('Clickable Card').parentElement!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders with hover effect when clickable', () => {
    render(<Card onClick={() => {}}>Hoverable</Card>);
    expect(screen.getByText('Hoverable').parentElement).toHaveClass('hover:shadow-md', 'cursor-pointer');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('custom-class');
  });

  it('renders with padding variants', () => {
    const { rerender } = render(<Card padding="none">Content</Card>);
    expect(screen.getByText('Content').parentElement).not.toHaveClass('p-4');

    rerender(<Card padding="sm">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('p-2');

    rerender(<Card padding="lg">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('p-6');
  });
});

describe('CardHeader', () => {
  it('renders header content', () => {
    render(<CardHeader>Header Content</CardHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('renders with title prop', () => {
    render(<CardHeader title="Card Title" />);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders with subtitle', () => {
    render(<CardHeader title="Title" subtitle="Subtitle text" />);
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('renders with action slot', () => {
    render(
      <CardHeader 
        title="Title" 
        action={<button>Action</button>} 
      />
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('applies border styling', () => {
    render(<CardHeader withBorder>Content</CardHeader>);
    expect(screen.getByText('Content').parentElement).toHaveClass('border-b');
  });
});

describe('CardBody', () => {
  it('renders body content', () => {
    render(<CardBody>Body Content</CardBody>);
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  it('applies default padding', () => {
    render(<CardBody>Content</CardBody>);
    expect(screen.getByText('Content').parentElement).toHaveClass('p-4');
  });

  it('applies custom className', () => {
    render(<CardBody className="custom-body">Content</CardBody>);
    expect(screen.getByText('Content').parentElement).toHaveClass('custom-body');
  });
});

describe('CardFooter', () => {
  it('renders footer content', () => {
    render(<CardFooter>Footer Content</CardFooter>);
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('applies border styling', () => {
    render(<CardFooter withBorder>Content</CardFooter>);
    expect(screen.getByText('Content').parentElement).toHaveClass('border-t');
  });

  it('renders with flex alignment', () => {
    render(<CardFooter align="end">Content</CardFooter>);
    expect(screen.getByText('Content').parentElement).toHaveClass('justify-end');
  });
});

describe('StatsCard', () => {
  it('renders with label and value', () => {
    render(<StatsCard label="Total Loans" value="1,234" />);
    expect(screen.getByText('Total Loans')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    const Icon = () => <svg data-testid="stat-icon" />;
    render(<StatsCard label="Stats" value="100" icon={<Icon />} />);
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
  });

  it('renders with trend indicator', () => {
    render(<StatsCard label="Growth" value="50%" trend={12.5} />);
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('renders negative trend', () => {
    render(<StatsCard label="Decline" value="30%" trend={-5.2} />);
    expect(screen.getByText('-5.2%')).toBeInTheDocument();
    expect(screen.getByText('-5.2%')).toHaveClass('text-red-600');
  });

  it('renders with description', () => {
    render(<StatsCard label="Stat" value="100" description="vs last month" />);
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    render(<StatsCard label="Loading" value="..." isLoading />);
    expect(screen.getByTestId('stats-skeleton')).toBeInTheDocument();
  });
});

