import { Loan } from '@/types/loan'
import LoanCardHeader from './LoanCardHeader'
import LoanCardBody from './LoanCardBody'
import LoanCardFooter from './LoanCardFooter'

interface LoanCardProps {
  loan: Loan
  userAddress?: string
  onFund: (loan: Loan) => void
  isWritePending: boolean
  fundingLoanId: string | null
}

export default function LoanCard({ loan, userAddress, onFund, isWritePending, fundingLoanId }: LoanCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-md">
      <div className="px-4 py-5 sm:p-6">
        <LoanCardHeader borrowerAddress={loan.borrowerAddress} />
        <LoanCardBody 
          amount={loan.amount} 
          purpose={loan.purpose} 
          duration={loan.duration} 
          interestRate={loan.interestRate}
        />
        <LoanCardFooter 
          loan={loan} 
          userAddress={userAddress} 
          onFund={onFund} 
          isWritePending={isWritePending}
          fundingLoanId={fundingLoanId}
        />
      </div>
    </div>
  )
}
