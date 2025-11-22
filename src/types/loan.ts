export interface Loan {
  id: string
  contractLoanId: number | null
  borrowerAddress: string
  amount: string
  purpose: string
  duration: number
  interestRate?: number
  status: string
  createdAt: string
  lenderAddress?: string | null
  fundedAt?: string | null
  repaidAt?: string | null
}
