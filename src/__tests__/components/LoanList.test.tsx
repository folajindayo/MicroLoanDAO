import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoanList from '@/components/LoanList';

const mockLoans = [
  {
    id: '1',
    borrower: '0x1234567890123456789012345678901234567890',
    amount: '1.0',
    purpose: 'Test loan 1',
    status: 'REQUESTED',
    interestRate: 500,
    duration: 2592000,
    requestedAt: Date.now() - 86400000,
  },
  {
    id: '2',
    borrower: '0x0987654321098765432109876543210987654321',
    amount: '2.5',
    purpose: 'Test loan 2',
    status: 'FUNDED',
    interestRate: 300,
    duration: 5184000,
    requestedAt: Date.now() - 172800000,
    fundedAt: Date.now() - 86400000,
    lender: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  },
];

vi.mock('@/lib/api-utils', () => ({
  fetchLoans: vi.fn(() => Promise.resolve(mockLoans)),
}));

describe('LoanList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loan list container', async () => {
    render(<LoanList loans={mockLoans} />);
    expect(screen.getByTestId('loan-list')).toBeInTheDocument();
  });

  it('displays list of loans', async () => {
    render(<LoanList loans={mockLoans} />);
    await waitFor(() => {
      expect(screen.getByText('Test loan 1')).toBeInTheDocument();
      expect(screen.getByText('Test loan 2')).toBeInTheDocument();
    });
  });

  it('renders loan cards for each loan', async () => {
    render(<LoanList loans={mockLoans} />);
    await waitFor(() => {
      const loanCards = screen.getAllByTestId('loan-card');
      expect(loanCards).toHaveLength(2);
    });
  });

  it('shows empty state when no loans', () => {
    render(<LoanList loans={[]} />);
    expect(screen.getByText(/no loans/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<LoanList loans={[]} isLoading />);
    expect(screen.getByTestId('loan-list-loading')).toBeInTheDocument();
  });

  it('displays error state', () => {
    render(<LoanList loans={[]} error="Failed to load loans" />);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('handles loan click', async () => {
    const user = userEvent.setup();
    const onLoanClick = vi.fn();
    
    render(<LoanList loans={mockLoans} onLoanClick={onLoanClick} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test loan 1')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Test loan 1'));
    expect(onLoanClick).toHaveBeenCalledWith(mockLoans[0]);
  });

  it('filters loans by status', async () => {
    const user = userEvent.setup();
    render(<LoanList loans={mockLoans} showFilters />);
    
    const statusFilter = screen.getByRole('combobox', { name: /status/i });
    await user.selectOptions(statusFilter, 'FUNDED');
    
    await waitFor(() => {
      expect(screen.queryByText('Test loan 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test loan 2')).toBeInTheDocument();
    });
  });

  it('sorts loans by amount', async () => {
    const user = userEvent.setup();
    render(<LoanList loans={mockLoans} showSort />);
    
    const sortButton = screen.getByRole('button', { name: /sort.*amount/i });
    await user.click(sortButton);
    
    const loanCards = screen.getAllByTestId('loan-card');
    expect(loanCards[0]).toHaveTextContent('2.5');
  });

  it('paginates long lists', async () => {
    const manyLoans = Array.from({ length: 25 }, (_, i) => ({
      ...mockLoans[0],
      id: String(i),
      purpose: `Loan ${i}`,
    }));
    
    render(<LoanList loans={manyLoans} pageSize={10} />);
    
    expect(screen.getByText('Loan 0')).toBeInTheDocument();
    expect(screen.queryByText('Loan 15')).not.toBeInTheDocument();
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);
    
    expect(screen.getByText('Loan 10')).toBeInTheDocument();
  });

  it('shows loan status badges', async () => {
    render(<LoanList loans={mockLoans} />);
    
    await waitFor(() => {
      expect(screen.getByText('REQUESTED')).toBeInTheDocument();
      expect(screen.getByText('FUNDED')).toBeInTheDocument();
    });
  });

  it('displays loan amounts correctly', async () => {
    render(<LoanList loans={mockLoans} />);
    
    await waitFor(() => {
      expect(screen.getByText(/1\.0/)).toBeInTheDocument();
      expect(screen.getByText(/2\.5/)).toBeInTheDocument();
    });
  });
});

