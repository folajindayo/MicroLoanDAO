import { z } from 'zod';

/**
 * Schema for creating a new loan request
 */
export const CreateLoanSchema = z.object({
  borrowerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Amount must be a valid number'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters').max(500),
  duration: z.number().int().positive('Duration must be positive seconds'),
  interestRate: z.number().min(0).max(10000, 'Interest rate cannot exceed 100%'), // Basis points check? or percentage
  creationTx: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  contractLoanId: z.number().nullable(),
});

/**
 * Schema for funding a loan
 */
export const FundLoanSchema = z.object({
  loanId: z.string().uuid('Invalid Loan ID format'),
  lenderAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  fundingTx: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
});

/**
 * Schema for repaying a loan
 */
export const RepayLoanSchema = z.object({
  loanId: z.string().uuid('Invalid Loan ID format'),
  repaymentTx: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
});

