import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoanCardBody from '@/components/loanlist/LoanCardBody';

const mockLoan = {
  id: '1',
  borrower: '0x1234567890123456789012345678901234567890',
  amount: '1.5',
  purpose: 'Starting a small business venture for local community',
  status: 'REQUESTED',
  interestRate: 500,
  duration: 2592000,
  requestedAt: Date.now() - 86400000,
};

describe('LoanCardBody', () => {
  it('renders body container', () => {
    render(<LoanCardBody loan={mockLoan} />);
    expect(screen.getByTestId('loan-card-body')).toBeInTheDocument();
  });

  it('displays loan purpose', () => {
    render(<LoanCardBody loan={mockLoan} />);
    expect(screen.getByText('Starting a small business venture for local community')).toBeInTheDocument();
  });

  it('displays loan amount', () => {
    render(<LoanCardBody loan={mockLoan} />);
    expect(screen.getByText(/1\.5/)).toBeInTheDocument();
    expect(screen.getByText(/ETH/)).toBeInTheDocument();
  });

  it('displays interest rate', () => {
    render(<LoanCardBody loan={mockLoan} />);
    expect(screen.getByText(/interest/i)).toBeInTheDocument();
    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });

  it('displays duration', () => {
    render(<LoanCardBody loan={mockLoan} />);
    expect(screen.getByText(/duration/i)).toBeInTheDocument();
    expect(screen.getByText(/30 days/i)).toBeInTheDocument();
  });

  it('calculates and displays total repayment', () => {
    render(<LoanCardBody loan={mockLoan} showTotalRepayment />);
    expect(screen.getByText(/total repayment/i)).toBeInTheDocument();
    // 1.5 + (1.5 * 0.05) = 1.575
    expect(screen.getByText(/1\.575/)).toBeInTheDocument();
  });

  it('truncates long purpose text', () => {
    const longPurposeLoan = {
      ...mockLoan,
      purpose: 'This is a very long purpose text that should be truncated when displayed in the card body component to prevent overflow issues',
    };
    render(<LoanCardBody loan={longPurposeLoan} maxPurposeLength={50} />);
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
  });

  it('renders compact layout', () => {
    render(<LoanCardBody loan={mockLoan} variant="compact" />);
    expect(screen.getByTestId('loan-card-body')).toHaveClass('gap-2');
  });

  it('renders detailed layout', () => {
    render(<LoanCardBody loan={mockLoan} variant="detailed" />);
    expect(screen.getByTestId('loan-card-body')).toHaveClass('gap-4');
  });

  it('displays interest in basis points when specified', () => {
    render(<LoanCardBody loan={mockLoan} showBasisPoints />);
    expect(screen.getByText(/500 bps/)).toBeInTheDocument();
  });

  it('displays APR when specified', () => {
    render(<LoanCardBody loan={mockLoan} showAPR />);
    expect(screen.getByText(/APR/)).toBeInTheDocument();
  });

  it('displays monthly payment estimate for longer durations', () => {
    const longDurationLoan = {
      ...mockLoan,
      duration: 7776000, // 90 days
    };
    render(<LoanCardBody loan={longDurationLoan} showMonthlyPayment />);
    expect(screen.getByText(/monthly/i)).toBeInTheDocument();
  });
});

