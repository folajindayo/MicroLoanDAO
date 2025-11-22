import { UserProfile } from './user'
import { Loan } from './loan'

export type ApiResponse<T> = T | { error: string }

export type UserHistoryResponse = ApiResponse<UserProfile>
export type LoansResponse = ApiResponse<Loan[]>

