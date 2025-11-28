import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoanCardHeader from '@/components/loanlist/LoanCardHeader';

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

describe('LoanCardHeader', () => {
  it('renders header container', () => {
    render(<LoanCardHeader loan={mockLoan} />);
    expect(screen.getByTestId('loan-card-header')).toBeInTheDocument();
  });

  it('displays loan ID', () => {
    render(<LoanCardHeader loan={mockLoan} showId />);
    expect(screen.getByText(/#1/)).toBeInTheDocument();
  });

  it('displays status badge', () => {
    render(<LoanCardHeader loan={mockLoan} />);
    expect(screen.getByText('REQUESTED')).toBeInTheDocument();
  });

  it('displays borrower address', () => {
    render(<LoanCardHeader loan={mockLoan} />);
    expect(screen.getByText(/0x1234\.\.\.7890/)).toBeInTheDocument();
  });

  it('displays time since request', () => {
    render(<LoanCardHeader loan={mockLoan} />);
    expect(screen.getByText(/1 day ago/i)).toBeInTheDocument();
  });

  it('displays lender for funded loans', () => {
    render(<LoanCardHeader loan={fundedLoan} />);
    expect(screen.getByText(/lender/i)).toBeInTheDocument();
    expect(screen.getByText(/0xabcd\.\.\.abcd/)).toBeInTheDocument();
  });

  it('displays funded time for funded loans', () => {
    render(<LoanCardHeader loan={fundedLoan} />);
    expect(screen.getByText(/funded.*ago/i)).toBeInTheDocument();
  });

  it('renders with avatar when specified', () => {
    render(<LoanCardHeader loan={mockLoan} showAvatar />);
    expect(screen.getByTestId('borrower-avatar')).toBeInTheDocument();
  });

  it('handles copy address click', async () => {
    const user = userEvent.setup();
    const mockClipboard = { writeText: vi.fn() };
    Object.assign(navigator, { clipboard: mockClipboard });
    
    render(<LoanCardHeader loan={mockLoan} copyableAddress />);
    
    await user.click(screen.getByRole('button', { name: /copy/i }));
    expect(mockClipboard.writeText).toHaveBeenCalledWith(mockLoan.borrower);
  });

  it('renders different status colors', () => {
    const { rerender } = render(<LoanCardHeader loan={mockLoan} />);
    expect(screen.getByText('REQUESTED')).toHaveClass('bg-yellow-100');

    rerender(<LoanCardHeader loan={{ ...mockLoan, status: 'FUNDED' }} />);
    expect(screen.getByText('FUNDED')).toHaveClass('bg-green-100');

    rerender(<LoanCardHeader loan={{ ...mockLoan, status: 'REPAID' }} />);
    expect(screen.getByText('REPAID')).toHaveClass('bg-blue-100');

    rerender(<LoanCardHeader loan={{ ...mockLoan, status: 'DEFAULTED' }} />);
    expect(screen.getByText('DEFAULTED')).toHaveClass('bg-red-100');
  });

  it('displays menu when specified', async () => {
    const user = userEvent.setup();
    render(<LoanCardHeader loan={mockLoan} showMenu />);
    
    await user.click(screen.getByRole('button', { name: /menu/i }));
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(<LoanCardHeader loan={mockLoan} variant="compact" />);
    expect(screen.getByTestId('loan-card-header')).toHaveClass('py-2');
  });

  it('hides status when specified', () => {
    render(<LoanCardHeader loan={mockLoan} hideStatus />);
    expect(screen.queryByText('REQUESTED')).not.toBeInTheDocument();
  });
});

