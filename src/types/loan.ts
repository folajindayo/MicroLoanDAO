/**
 * Loan data structure retrieved from the API and smart contract events.
 */
export interface Loan {
    /** Unique identifier from the database (UUID) */
    id: string
    /** ID of the loan in the smart contract, null if not yet synced */
    contractLoanId: number | null
    /** Wallet address of the borrower */
    borrowerAddress: string
    /** Amount of the loan in Wei (as string to preserve precision) */
    amount: string
    /** Reason for the loan request */
    purpose: string
    /** Duration of the loan in seconds */
    duration: number
    /** Current status of the loan */
    status: 'REQUESTED' | 'FUNDED' | 'REPAID' | 'DEFAULTED'
    /** Timestamp of creation */
    createdAt: string
    /** Interest rate in basis points (100 = 1%) */
    interestRate: number
}
