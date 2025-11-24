import { z } from 'zod';

export const CreateLoanSchema = z.object({
  borrowerAddress: z.string().min(1),
  amount: z.string().min(1),
  purpose: z.string().min(1),
  duration: z.number().positive(),
  interestRate: z.number().min(0),
  creationTx: z.string().min(1),
  contractLoanId: z.number().nullable(),
});

export const FundLoanSchema = z.object({
  loanId: z.string().min(1),
  lenderAddress: z.string().min(1),
  fundingTx: z.string().min(1),
});

export const RepayLoanSchema = z.object({
  loanId: z.string().min(1),
  repaymentTx: z.string().min(1),
});
