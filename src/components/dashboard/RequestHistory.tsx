import { Loan } from '@/types'
import { formatEther } from 'viem'

interface RequestHistoryProps {
    loans: Loan[]
    onRepay: (loan: Loan) => void
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
        return <p className="text-gray-500 dark:text-gray-400 text-center py-4">No loan requests made.</p>
    }

    return (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {loans.map((loan) => (
                <li key={loan.id} className="py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded px-2">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{loan.purpose}</span>
                        <span className="text-gray-900 dark:text-white font-bold">{formatEther(BigInt(loan.amount))} ETH</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                            loan.status === 'FUNDED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            loan.status === 'REPAID' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                            {loan.status}
                        </span>
                        {loan.status === 'FUNDED' && (
                            <button 
                                onClick={() => onRepay(loan)}
                                disabled={isWritePending}
                                className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
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

