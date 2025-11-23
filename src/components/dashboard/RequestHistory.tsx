import { formatEther } from 'viem'

interface Loan {
    id: string
    purpose: string
    amount: string
    status: string
}

interface RequestHistoryProps {
    loans: Loan[]
    onRepay: (loan: any) => void
    isWritePending: boolean
    repayingLoanId: string | null
}

/**
 * RequestHistory Component
 * Lists loans requested by the user with repayment options.
 * @param {Object} props - Component props
 * @param {Loan[]} props.loans - Array of requested loans
 * @param {Function} props.onRepay - Callback for repaying a loan
 */
export default function RequestHistory({ loans, onRepay, isWritePending, repayingLoanId }: RequestHistoryProps) {
    if (loans.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400">No loan requests made.</p>
    }

    return (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {loans.map((loan) => (
                <li key={loan.id} className="py-3">
                    <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">{loan.purpose}</span>
                        <span className="text-gray-900 dark:text-white font-medium">{formatEther(BigInt(loan.amount))} ETH</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status: {loan.status}</p>
                        {loan.status === 'FUNDED' && (
                            <button 
                                onClick={() => onRepay(loan)}
                                disabled={isWritePending}
                                className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                aria-label={`Repay loan for ${loan.purpose}`}
                            >
                                {isWritePending && repayingLoanId === loan.id ? 'Processing...' : 'Repay'}
                            </button>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    )
}
