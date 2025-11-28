import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoanCardFooter from '@/components/loanlist/LoanCardFooter';

const mockLoan = {
  id: '1',
  borrower: '0x1234567890123456789012345678901234567890',
  amount: '1.5',
  purpose: 'Test loan',
  status: 'REQUESTED',
  interestRate: 500,
  duration: 2592000,
  requestedAt: Date.now() - 86400000,
};

const fundedLoan = {
  ...mockLoan,
  status: 'FUNDED',
  fundedAt: Date.now() - 43200000,
  lender: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
};

const defaultedLoan = {
  ...mockLoan,
  status: 'DEFAULTED',
  fundedAt: Date.now() - 5184000000, // 60 days ago
};

describe('LoanCardFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders footer container', () => {
    render(<LoanCardFooter loan={mockLoan} />);
    expect(screen.getByTestId('loan-card-footer')).toBeInTheDocument();
  });

  it('renders fund button for requested loans', () => {
    render(<LoanCardFooter loan={mockLoan} showActions />);
    expect(screen.getByRole('button', { name: /fund/i })).toBeInTheDocument();
  });

  it('renders repay button for funded loans when user is borrower', () => {
    render(<LoanCardFooter loan={fundedLoan} showActions userAddress={fundedLoan.borrower} />);
    expect(screen.getByRole('button', { name: /repay/i })).toBeInTheDocument();
  });

  it('does not render repay button when user is not borrower', () => {
    render(<LoanCardFooter loan={fundedLoan} showActions userAddress="0xdifferent" />);
    expect(screen.queryByRole('button', { name: /repay/i })).not.toBeInTheDocument();
  });

  it('handles fund button click', async () => {
    const user = userEvent.setup();
    const onFund = vi.fn();
    
    render(<LoanCardFooter loan={mockLoan} showActions onFund={onFund} />);
    await user.click(screen.getByRole('button', { name: /fund/i }));
    
    expect(onFund).toHaveBeenCalledWith(mockLoan);
  });

  it('handles repay button click', async () => {
    const user = userEvent.setup();
    const onRepay = vi.fn();
    
    render(<LoanCardFooter loan={fundedLoan} showActions userAddress={fundedLoan.borrower} onRepay={onRepay} />);
    await user.click(screen.getByRole('button', { name: /repay/i }));
    
    expect(onRepay).toHaveBeenCalledWith(fundedLoan);
  });

  it('shows view details link', () => {
    render(<LoanCardFooter loan={mockLoan} showViewDetails />);
    expect(screen.getByRole('link', { name: /view details/i })).toBeInTheDocument();
  });

  it('displays remaining time for funded loans', () => {
    const recentFundedLoan = {
      ...fundedLoan,
      fundedAt: Date.now() - 86400000, // 1 day ago
    };
    render(<LoanCardFooter loan={recentFundedLoan} showTimeRemaining />);
    expect(screen.getByText(/29 days remaining/i)).toBeInTheDocument();
  });

  it('shows overdue indicator for defaulted loans', () => {
    render(<LoanCardFooter loan={defaultedLoan} showActions />);
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it('disables fund button when user is borrower', () => {
    render(<LoanCardFooter loan={mockLoan} showActions userAddress={mockLoan.borrower} />);
    expect(screen.getByRole('button', { name: /fund/i })).toBeDisabled();
  });

  it('shows loading state for fund button', () => {
    render(<LoanCardFooter loan={mockLoan} showActions isFunding />);
    expect(screen.getByRole('button', { name: /fund/i })).toBeDisabled();
    expect(screen.getByTestId('fund-loading')).toBeInTheDocument();
  });

  it('shows loading state for repay button', () => {
    render(<LoanCardFooter loan={fundedLoan} showActions userAddress={fundedLoan.borrower} isRepaying />);
    expect(screen.getByRole('button', { name: /repay/i })).toBeDisabled();
  });

  it('renders share button when specified', async () => {
    const user = userEvent.setup();
    const onShare = vi.fn();
    
    render(<LoanCardFooter loan={mockLoan} showShare onShare={onShare} />);
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    expect(onShare).toHaveBeenCalledWith(mockLoan);
  });

  it('renders bookmark button when specified', async () => {
    const user = userEvent.setup();
    const onBookmark = vi.fn();
    
    render(<LoanCardFooter loan={mockLoan} showBookmark onBookmark={onBookmark} />);
    await user.click(screen.getByRole('button', { name: /bookmark/i }));
    
    expect(onBookmark).toHaveBeenCalledWith(mockLoan);
  });

  it('shows repayment progress for funded loans', () => {
    render(<LoanCardFooter loan={fundedLoan} showRepaymentProgress />);
    expect(screen.getByTestId('repayment-progress')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(<LoanCardFooter loan={mockLoan} variant="compact" />);
    expect(screen.getByTestId('loan-card-footer')).toHaveClass('py-2');
  });

  it('shows action buttons inline on large screens', () => {
    render(<LoanCardFooter loan={mockLoan} showActions inlineActions />);
    expect(screen.getByTestId('loan-card-footer')).toHaveClass('flex-row');
  });
});

