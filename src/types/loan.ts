/**
 * Represents a loan in the system.
 */
export interface Loan {
    /** Unique identifier for the loan */
    id: string
    /** ID of the loan in the smart contract */
    contractLoanId: number | null
    /** Wallet address of the borrower */
    borrowerAddress: string
    /** Wallet address of the lender (if funded) */
    lenderAddress?: string | null
    /** Amount of the loan in wei or strict units */
    amount: string
    /** Interest rate in percentage */
    interestRate: number
    /** Reason for the loan */
    purpose: string
    /** Duration of the loan in seconds */
    duration: number
    /** Current status of the loan */
    status: 'REQUESTED' | 'FUNDED' | 'REPAID' | 'DEFAULTED'
    /** Timestamp when loan was requested */
    createdAt: string
    /** Timestamp when loan was funded */
    fundedAt?: string | null
    /** Timestamp when loan was repaid */
    repaidAt?: string | null
    /** Transaction hash for loan creation */
    creationTx?: string | null
    /** Transaction hash for loan funding */
    fundingTx?: string | null
    /** Transaction hash for loan repayment */
    repaymentTx?: string | null
}
