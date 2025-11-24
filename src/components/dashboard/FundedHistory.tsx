import { formatEther } from 'viem'
import { Loan } from '@/types'

interface FundedHistoryProps {
    loans: Loan[]
}

/**
 * FundedHistory Component
 * Lists loans that the user has funded.
 * @param {Object} props - Component props
 * @param {Loan[]} props.loans - Array of funded loans
 */
export default function FundedHistory({ loans }: FundedHistoryProps) {
    if (loans.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400 text-center py-4">No loans funded yet.</p>
    }

    return (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {loans.map((loan) => (
                <li key={loan.id} className="py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded px-2">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{loan.purpose}</span>
                        <span className="text-gray-900 dark:text-white font-bold">{formatEther(BigInt(loan.amount))} ETH</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Borrower: <span className="font-mono">{loan.borrowerAddress}</span>
                    </p>
                </li>
            ))}
        </ul>
    )
}

