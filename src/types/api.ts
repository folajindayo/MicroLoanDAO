import { Loan } from './loan'
import { User } from './user'

export interface ApiResponse<T> {
    data?: T
    error?: string
}

export type LoansResponse = Loan[]
export type UserHistoryResponse = User
