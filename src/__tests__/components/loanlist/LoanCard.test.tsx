import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoanCard from '@/components/loanlist/LoanCard';

const mockLoan = {
  id: '1',
  borrower: '0x1234567890123456789012345678901234567890',
  amount: '1.5',
  purpose: 'Starting a small business',
  status: 'REQUESTED',
  interestRate: 500, // 5% in basis points
  duration: 2592000, // 30 days in seconds
  requestedAt: Date.now() - 86400000, // 1 day ago
};

const fundedLoan = {
  ...mockLoan,
  id: '2',
  status: 'FUNDED',
  fundedAt: Date.now() - 43200000, // 12 hours ago
  lender: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
};

const repaidLoan = {
  ...mockLoan,
  id: '3',
  status: 'REPAID',
  fundedAt: Date.now() - 86400000,
  repaidAt: Date.now() - 3600000, // 1 hour ago
};

describe('LoanCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loan card container', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByTestId('loan-card')).toBeInTheDocument();
  });

  it('displays loan purpose', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText('Starting a small business')).toBeInTheDocument();
  });

  it('displays loan amount', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText(/1\.5/)).toBeInTheDocument();
  });

  it('displays loan status', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText('REQUESTED')).toBeInTheDocument();
  });

  it('displays borrower address truncated', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText(/0x1234\.\.\.7890/)).toBeInTheDocument();
  });

  it('displays interest rate', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });

  it('displays duration in days', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText(/30.*days/i)).toBeInTheDocument();
  });

  it('handles card click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<LoanCard loan={mockLoan} onClick={onClick} />);
    await user.click(screen.getByTestId('loan-card'));
    
    expect(onClick).toHaveBeenCalledWith(mockLoan);
  });

  it('renders fund button for requested loans', () => {
    render(<LoanCard loan={mockLoan} showActions />);
    expect(screen.getByRole('button', { name: /fund/i })).toBeInTheDocument();
  });

  it('does not render fund button for funded loans', () => {
    render(<LoanCard loan={fundedLoan} showActions />);
    expect(screen.queryByRole('button', { name: /fund/i })).not.toBeInTheDocument();
  });

  it('renders repay button for funded loans when user is borrower', () => {
    render(<LoanCard loan={fundedLoan} showActions userAddress={fundedLoan.borrower} />);
    expect(screen.getByRole('button', { name: /repay/i })).toBeInTheDocument();
  });

  it('displays lender for funded loans', () => {
    render(<LoanCard loan={fundedLoan} />);
    expect(screen.getByText(/lender/i)).toBeInTheDocument();
    expect(screen.getByText(/0xabcd\.\.\.abcd/)).toBeInTheDocument();
  });

  it('displays repaid status badge', () => {
    render(<LoanCard loan={repaidLoan} />);
    expect(screen.getByText('REPAID')).toBeInTheDocument();
  });

  it('displays time since request', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText(/1 day ago/i)).toBeInTheDocument();
  });

  it('applies different styles for different statuses', () => {
    const { rerender } = render(<LoanCard loan={mockLoan} />);
    expect(screen.getByTestId('loan-card')).toHaveClass('border-yellow-200');

    rerender(<LoanCard loan={fundedLoan} />);
    expect(screen.getByTestId('loan-card')).toHaveClass('border-green-200');

    rerender(<LoanCard loan={repaidLoan} />);
    expect(screen.getByTestId('loan-card')).toHaveClass('border-blue-200');
  });

  it('renders compact variant', () => {
    render(<LoanCard loan={mockLoan} variant="compact" />);
    expect(screen.getByTestId('loan-card')).toHaveClass('p-2');
  });

  it('renders detailed variant', () => {
    render(<LoanCard loan={mockLoan} variant="detailed" />);
    expect(screen.getByText(/total repayment/i)).toBeInTheDocument();
  });

  it('handles fund button click', async () => {
    const user = userEvent.setup();
    const onFund = vi.fn();
    
    render(<LoanCard loan={mockLoan} showActions onFund={onFund} />);
    await user.click(screen.getByRole('button', { name: /fund/i }));
    
    expect(onFund).toHaveBeenCalledWith(mockLoan);
  });

  it('handles repay button click', async () => {
    const user = userEvent.setup();
    const onRepay = vi.fn();
    
    render(<LoanCard loan={fundedLoan} showActions userAddress={fundedLoan.borrower} onRepay={onRepay} />);
    await user.click(screen.getByRole('button', { name: /repay/i }));
    
    expect(onRepay).toHaveBeenCalledWith(fundedLoan);
  });
});

