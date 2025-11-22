import { Loan } from './loan'

export interface UserProfile {
    reputationScore: number
    loans: Loan[]
    fundedLoans: Loan[]
}

