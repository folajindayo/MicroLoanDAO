import { z } from 'zod'

export const createLoanSchema = z.object({
    borrowerAddress: z.string().min(1, "Borrower address is required"),
    amount: z.string().min(1, "Amount is required"),
    purpose: z.string().min(1, "Purpose is required"),
    duration: z.number().min(1, "Duration must be positive"),
    interestRate: z.number().min(0, "Interest rate must be positive"),
    creationTx: z.string().optional(),
    contractLoanId: z.number().nullable().optional()
})

export const fundLoanSchema = z.object({
    loanId: z.string().min(1, "Loan ID is required"),
    lenderAddress: z.string().min(1, "Lender address is required"),
    fundingTx: z.string().min(1, "Funding transaction hash is required")
})

export const repayLoanSchema = z.object({
    loanId: z.string().min(1, "Loan ID is required"),
    repaymentTx: z.string().min(1, "Repayment transaction hash is required")
})
