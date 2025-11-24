import { Loan } from './loan'
import { User } from './user'

/**
 * Generic API response wrapper.
 */
export interface ApiResponse<T> {
    /** The data returned by the API */
    data?: T
    /** Error message if the request failed */
    error?: string
}

/** Response type for fetching a list of loans */
export type LoansResponse = Loan[]

/** Response type for fetching user history */
export type UserHistoryResponse = User
