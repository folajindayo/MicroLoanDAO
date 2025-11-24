import { Loan } from './loan'

/**
 * Represents a user in the system.
 */
export interface User {
    /** Wallet address of the user */
    address: string
    /** Calculated reputation score based on loan history */
    reputationScore: number
    /** History of loans requested by this user */
    loans: Loan[]
    /** History of loans funded by this user */
    fundedLoans: Loan[]
}
