import { formatEther } from 'viem'
import { Loan } from '@/types'

interface LoanCardProps {
  loan: Loan
  userAddress?: string
  onFund: (loan: Loan, address: string) => void
  isWritePending: boolean
  fundingLoanId: string | null
}

export default function LoanCard({ loan, userAddress, onFund, isWritePending, fundingLoanId }: LoanCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
      <div className="px-4 py-5 sm:p-6">
        <dl>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Borrower</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 truncate" title={loan.borrowerAddress}>
            {loan.borrowerAddress}
          </dd>
          
          <dt className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Amount</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
            {formatEther(BigInt(loan.amount))} ETH
          </dd>
          
          <dt className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Purpose</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{loan.purpose}</dd>

          <dt className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Duration</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {Number(loan.duration) / (24 * 60 * 60)} Days
          </dd>
        </dl>
        {loan.status === 'REQUESTED' && userAddress && loan.borrowerAddress !== userAddress && (
          <button
            onClick={() => onFund(loan, userAddress)}
            disabled={isWritePending}
            className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            aria-label={`Fund loan for ${loan.purpose}`}
          >
            {isWritePending && fundingLoanId === loan.id ? 'Processing...' : 'Fund Loan'}
          </button>
        )}
      </div>
    </div>
  )
}
