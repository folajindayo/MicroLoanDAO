import { Loan } from '@/types/loan'

interface LoanCardFooterProps {
  loan: Loan
  userAddress?: string
  onFund: (loan: Loan) => void
  isWritePending: boolean
  fundingLoanId: string | null
}

export default function LoanCardFooter({ loan, userAddress, onFund, isWritePending, fundingLoanId }: LoanCardFooterProps) {
  if (loan.status !== 'REQUESTED' || !userAddress || loan.borrowerAddress === userAddress) {
    return null
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => onFund(loan)}
        disabled={isWritePending}
        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
        aria-label={`Fund loan for ${loan.purpose}`}
      >
        {isWritePending && fundingLoanId === loan.id ? 'Processing...' : 'Fund Loan'}
      </button>
    </div>
  )
}

