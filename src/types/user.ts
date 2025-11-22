import { Loan } from './loan'

export interface User {
  address: string
  reputationScore: number
  loans: Loan[]
  fundedLoans: Loan[]
}
