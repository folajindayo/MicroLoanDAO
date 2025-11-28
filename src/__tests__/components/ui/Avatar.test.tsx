import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Avatar, WalletAvatar } from '@/components/ui/Avatar';

describe('Avatar', () => {
  it('renders with default props', () => {
    render(<Avatar />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
  });

  it('renders with src and alt', () => {
    render(<Avatar src="/test.jpg" alt="Test User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('alt', 'Test User');
  });

  it('renders with different sizes', () => {
    const { rerender, container } = render(<Avatar size="xs" />);
    expect(container.firstChild).toHaveClass('w-6');

    rerender(<Avatar size="sm" />);
    expect(container.firstChild).toHaveClass('w-8');

    rerender(<Avatar size="md" />);
    expect(container.firstChild).toHaveClass('w-10');

    rerender(<Avatar size="lg" />);
    expect(container.firstChild).toHaveClass('w-12');
  });

  it('renders fallback text when no src provided', () => {
    render(<Avatar fallbackText="JD" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders online status indicator', () => {
    const { container } = render(<Avatar showStatus status="online" />);
    const statusIndicator = container.querySelector('.bg-green-500');
    expect(statusIndicator).toBeInTheDocument();
  });

  it('handles image error and shows fallback', async () => {
    render(<Avatar src="/broken.jpg" fallbackText="FB" />);
    const img = screen.getByRole('img');
    
    fireEvent.error(img);
    
    await waitFor(() => {
      expect(screen.getByText('FB')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<Avatar className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('WalletAvatar', () => {
  it('renders with address', () => {
    render(<WalletAvatar address="0x1234567890123456789012345678901234567890" />);
    const avatar = screen.getByTestId('wallet-avatar');
    expect(avatar).toBeInTheDocument();
  });

  it('generates initials from address', () => {
    render(<WalletAvatar address="0x1234567890123456789012345678901234567890" />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('applies address-based color', () => {
    const { container } = render(
      <WalletAvatar address="0x1234567890123456789012345678901234567890" />
    );
    // The background color should be set based on the address hash
    expect(container.firstChild).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('renders with different sizes', () => {
    const { rerender, container } = render(
      <WalletAvatar address="0x1234567890123456789012345678901234567890" size="sm" />
    );
    expect(container.firstChild).toHaveClass('w-8');

    rerender(
      <WalletAvatar address="0x1234567890123456789012345678901234567890" size="lg" />
    );
    expect(container.firstChild).toHaveClass('w-12');
  });

  it('handles empty address gracefully', () => {
    render(<WalletAvatar address="" />);
    const avatar = screen.getByTestId('wallet-avatar');
    expect(avatar).toBeInTheDocument();
    expect(screen.getByText('??')).toBeInTheDocument();
  });

  it('shows connected status when showConnected is true', () => {
    const { container } = render(
      <WalletAvatar 
        address="0x1234567890123456789012345678901234567890" 
        showConnected 
      />
    );
    const statusIndicator = container.querySelector('.bg-green-500');
    expect(statusIndicator).toBeInTheDocument();
  });
});

