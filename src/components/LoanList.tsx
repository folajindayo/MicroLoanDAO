import LoadingSkeleton from '../ui/LoadingSkeleton'
import { useLoans } from '@/hooks/useLoans'
import { useFundLoan } from '@/hooks/useFundLoan'
import { useAccount } from 'wagmi'
import LoanCard from './loanlist/LoanCard'

export default function LoanList() {
  const { address } = useAccount()
  const { loans, isLoading, error } = useLoans()
  const { fundLoan, isWritePending, fundingLoanId } = useFundLoan()

  if (isLoading) return <LoadingSkeleton />
  if (error) return <div className="text-red-500 dark:text-red-400">Error loading loans</div>

  return (
    <div className="mt-8" role="region" aria-label="Active Loan Requests">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Active Loan Requests</h2>
      {loans.length === 0 && <p className="text-gray-500 dark:text-gray-400">No active requests.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loans.map((loan) => (
          <LoanCard 
            key={loan.id} 
            loan={loan} 
            userAddress={address} 
            onFund={fundLoan} 
            isWritePending={isWritePending}
            fundingLoanId={fundingLoanId}
          />
        ))}
      </div>
    </div>
  )
}
