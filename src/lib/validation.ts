import { z } from 'zod'

export const loanSchema = z.object({
  borrowerAddress: z.string().min(1, "Borrower address is required"),
  amount: z.string().min(1, "Amount is required"),
  purpose: z.string().min(1, "Purpose is required"),
  duration: z.number().positive("Duration must be positive"),
  interestRate: z.number().min(0, "Interest rate cannot be negative"),
  creationTx: z.string().optional(),
  contractLoanId: z.number().nullable().optional()
})

export const fundSchema = z.object({
  loanId: z.string().uuid(),
  lenderAddress: z.string().min(1, "Lender address is required"),
  fundingTx: z.string().min(1, "Funding transaction hash is required")
})

export const repaySchema = z.object({
  loanId: z.string().uuid(),
  repaymentTx: z.string().min(1, "Repayment transaction hash is required")
})
