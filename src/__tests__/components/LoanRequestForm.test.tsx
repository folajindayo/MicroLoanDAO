import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoanRequestForm from '@/components/LoanRequestForm';

// Mock the useCreateLoan hook
vi.mock('@/hooks/useCreateLoan', () => ({
  useCreateLoan: () => ({
    createLoan: vi.fn().mockResolvedValue({ id: '1' }),
    isLoading: false,
    error: null,
  }),
}));

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  }),
}));

describe('LoanRequestForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form container', () => {
    render(<LoanRequestForm />);
    expect(screen.getByTestId('loan-request-form')).toBeInTheDocument();
  });

  it('displays form title', () => {
    render(<LoanRequestForm />);
    expect(screen.getByText(/request.*loan/i)).toBeInTheDocument();
  });

  it('renders amount input', () => {
    render(<LoanRequestForm />);
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
  });

  it('renders purpose input', () => {
    render(<LoanRequestForm />);
    expect(screen.getByLabelText(/purpose/i)).toBeInTheDocument();
  });

  it('renders duration select', () => {
    render(<LoanRequestForm />);
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
  });

  it('renders interest rate input', () => {
    render(<LoanRequestForm />);
    expect(screen.getByLabelText(/interest.*rate/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<LoanRequestForm />);
    expect(screen.getByRole('button', { name: /submit|request/i })).toBeInTheDocument();
  });

  it('validates amount is required', async () => {
    const user = userEvent.setup();
    render(<LoanRequestForm />);
    
    await user.click(screen.getByRole('button', { name: /submit|request/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/amount.*required/i)).toBeInTheDocument();
    });
  });

  it('validates amount is positive', async () => {
    const user = userEvent.setup();
    render(<LoanRequestForm />);
    
    await user.type(screen.getByLabelText(/amount/i), '-1');
    await user.click(screen.getByRole('button', { name: /submit|request/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/positive/i)).toBeInTheDocument();
    });
  });

  it('validates purpose minimum length', async () => {
    const user = userEvent.setup();
    render(<LoanRequestForm />);
    
    await user.type(screen.getByLabelText(/purpose/i), 'Short');
    await user.click(screen.getByRole('button', { name: /submit|request/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/at least.*10.*characters/i)).toBeInTheDocument();
    });
  });

  it('validates interest rate range', async () => {
    const user = userEvent.setup();
    render(<LoanRequestForm />);
    
    await user.clear(screen.getByLabelText(/interest.*rate/i));
    await user.type(screen.getByLabelText(/interest.*rate/i), '150');
    await user.click(screen.getByRole('button', { name: /submit|request/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/cannot exceed 100%/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoanRequestForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/amount/i), '1.5');
    await user.type(screen.getByLabelText(/purpose/i), 'This is a valid purpose for a loan request');
    await user.selectOptions(screen.getByLabelText(/duration/i), '30');
    await user.clear(screen.getByLabelText(/interest.*rate/i));
    await user.type(screen.getByLabelText(/interest.*rate/i), '5');
    
    await user.click(screen.getByRole('button', { name: /submit|request/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('shows loading state during submission', async () => {
    vi.mock('@/hooks/useCreateLoan', () => ({
      useCreateLoan: () => ({
        createLoan: vi.fn(),
        isLoading: true,
        error: null,
      }),
    }));
    
    render(<LoanRequestForm />);
    expect(screen.getByRole('button', { name: /submit|request/i })).toBeDisabled();
  });

  it('displays error message on submission failure', async () => {
    vi.mock('@/hooks/useCreateLoan', () => ({
      useCreateLoan: () => ({
        createLoan: vi.fn().mockRejectedValue(new Error('Submission failed')),
        isLoading: false,
        error: 'Submission failed',
      }),
    }));
    
    render(<LoanRequestForm />);
    expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
  });

  it('calculates and displays total repayment', async () => {
    const user = userEvent.setup();
    render(<LoanRequestForm />);
    
    await user.type(screen.getByLabelText(/amount/i), '1');
    await user.clear(screen.getByLabelText(/interest.*rate/i));
    await user.type(screen.getByLabelText(/interest.*rate/i), '10');
    
    await waitFor(() => {
      expect(screen.getByText(/total.*repayment/i)).toBeInTheDocument();
      expect(screen.getByText(/1\.1/)).toBeInTheDocument();
    });
  });

  it('resets form on cancel', async () => {
    const user = userEvent.setup();
    render(<LoanRequestForm />);
    
    await user.type(screen.getByLabelText(/amount/i), '1.5');
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    
    expect(screen.getByLabelText(/amount/i)).toHaveValue('');
  });
});

