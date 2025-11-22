export interface Loan {
  id: string
  contractLoanId: number | null
  borrowerAddress: string
  amount: string
  purpose: string
  duration: number
  status: string
  interestRate?: number
  createdAt?: string
}
