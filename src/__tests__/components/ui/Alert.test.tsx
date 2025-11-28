import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert, InlineAlert } from '@/components/ui/Alert';

describe('Alert', () => {
  const defaultProps = {
    children: 'Alert message',
  };

  it('renders with message', () => {
    render(<Alert {...defaultProps} />);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Alert {...defaultProps} title="Alert Title" />);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Alert {...defaultProps} variant="info" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50', 'border-blue-200');

    rerender(<Alert {...defaultProps} variant="success" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50', 'border-green-200');

    rerender(<Alert {...defaultProps} variant="warning" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50', 'border-yellow-200');

    rerender(<Alert {...defaultProps} variant="error" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('renders with custom icon', () => {
    const CustomIcon = () => <svg data-testid="custom-icon" />;
    render(<Alert {...defaultProps} icon={<CustomIcon />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders dismissible alert', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    
    render(<Alert {...defaultProps} dismissible onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    await user.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders with action button', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    
    render(
      <Alert {...defaultProps}>
        <button onClick={onAction}>Take Action</button>
      </Alert>
    );
    
    await user.click(screen.getByRole('button', { name: 'Take Action' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Alert {...defaultProps} className="custom-class" />);
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });
});

describe('InlineAlert', () => {
  it('renders as inline element', () => {
    render(<InlineAlert message="Inline message" />);
    expect(screen.getByText('Inline message')).toBeInTheDocument();
  });

  it('renders with appropriate variants', () => {
    const { rerender } = render(<InlineAlert message="Info" variant="info" />);
    expect(screen.getByText('Info')).toHaveClass('text-blue-600');

    rerender(<InlineAlert message="Error" variant="error" />);
    expect(screen.getByText('Error')).toHaveClass('text-red-600');
  });

  it('renders with icon', () => {
    render(<InlineAlert message="With icon" showIcon />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders small and compact', () => {
    render(<InlineAlert message="Small" />);
    expect(screen.getByText('Small').parentElement).toHaveClass('text-sm');
  });
});

