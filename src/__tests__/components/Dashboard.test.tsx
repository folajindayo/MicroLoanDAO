import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/components/Dashboard';

// Mock the hooks used by Dashboard
vi.mock('@/hooks/useWalletBalance', () => ({
  useWalletBalance: () => ({
    balance: '1.5',
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useLoanCalculator', () => ({
  useLoanCalculator: () => ({
    totalInterest: 0.05,
    monthlyPayment: 0.1,
  }),
}));

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  }),
  useBalance: () => ({
    data: { formatted: '1.5', symbol: 'ETH' },
    isLoading: false,
  }),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard container', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('displays welcome section', () => {
    render(<Dashboard />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it('shows wallet balance when connected', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/1.5/)).toBeInTheDocument();
    });
  });

  it('displays loan statistics section', () => {
    render(<Dashboard />);
    expect(screen.getByText(/statistics/i)).toBeInTheDocument();
  });

  it('shows active loans count', () => {
    render(<Dashboard />);
    expect(screen.getByText(/active loans/i)).toBeInTheDocument();
  });

  it('displays quick actions section', () => {
    render(<Dashboard />);
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
  });

  it('shows create loan button', () => {
    render(<Dashboard />);
    expect(screen.getByRole('button', { name: /create.*loan/i })).toBeInTheDocument();
  });

  it('shows view loans button', () => {
    render(<Dashboard />);
    expect(screen.getByRole('button', { name: /view.*loans/i })).toBeInTheDocument();
  });

  it('displays recent activity section', () => {
    render(<Dashboard />);
    expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(<Dashboard />);
    const statsCards = screen.getAllByTestId('stats-card');
    expect(statsCards.length).toBeGreaterThan(0);
  });

  it('handles loading state', () => {
    vi.mock('@/hooks/useWalletBalance', () => ({
      useWalletBalance: () => ({
        balance: null,
        isLoading: true,
        error: null,
      }),
    }));

    render(<Dashboard />);
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
  });

  it('handles error state', () => {
    vi.mock('@/hooks/useWalletBalance', () => ({
      useWalletBalance: () => ({
        balance: null,
        isLoading: false,
        error: new Error('Failed to fetch'),
      }),
    }));

    render(<Dashboard />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('shows connect wallet prompt when not connected', () => {
    vi.mock('wagmi', () => ({
      useAccount: () => ({
        address: null,
        isConnected: false,
      }),
    }));

    render(<Dashboard />);
    expect(screen.getByText(/connect.*wallet/i)).toBeInTheDocument();
  });
});

