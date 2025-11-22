import { z } from 'zod'

export const createLoanSchema = z.object({
    borrowerAddress: z.string().min(42),
    amount: z.string(),
    purpose: z.string().min(3),
    duration: z.number().positive(),
    interestRate: z.number().min(0).max(10000),
    creationTx: z.string().startsWith('0x'),
    contractLoanId: z.number().nullable().optional()
})

export const fundLoanSchema = z.object({
    loanId: z.string().uuid(),
    lenderAddress: z.string().min(42),
    fundingTx: z.string().startsWith('0x')
})

export const repayLoanSchema = z.object({
    loanId: z.string().uuid(),
    repaymentTx: z.string().startsWith('0x')
})
