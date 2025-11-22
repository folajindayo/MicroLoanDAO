export interface Loan {
    id: string
    contractLoanId: number | null
    borrowerAddress: string
    lenderAddress?: string | null
    amount: string
    interestRate: number
    purpose: string
    duration: number
    status: 'REQUESTED' | 'FUNDED' | 'REPAID' | 'DEFAULTED'
    createdAt: string
    fundedAt?: string | null
    repaidAt?: string | null
    creationTx?: string | null
    fundingTx?: string | null
    repaymentTx?: string | null
}
