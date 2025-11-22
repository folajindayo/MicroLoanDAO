export interface Loan {
    id: string
    contractLoanId: number | null
    borrowerAddress: string
    amount: string
    purpose: string
    duration: number
    status: 'REQUESTED' | 'FUNDED' | 'REPAID' | 'DEFAULTED'
    createdAt: string
    interestRate: number
}

