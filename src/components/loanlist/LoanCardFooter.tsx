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

  const isFundingThis = isWritePending && fundingLoanId === loan.id

  return (
    <div className="mt-auto pt-4">
      <button
        onClick={() => onFund(loan)}
        disabled={isWritePending}
        className={`w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent font-semibold rounded-lg text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed
          ${isFundingThis ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700 hover:shadow-md active:transform active:scale-[0.98]'}
        `}
        aria-label={`Fund loan for ${loan.purpose}`}
        aria-busy={isFundingThis}
      >
        {isFundingThis ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          'Fund Loan'
        )}
      </button>
    </div>
  )
}


