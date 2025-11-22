import LoadingSkeleton from './ui/LoadingSkeleton'
import ReputationScore from './dashboard/ReputationScore'
import RequestHistory from './dashboard/RequestHistory'
import FundedHistory from './dashboard/FundedHistory'
import { useUserHistory } from '@/hooks/useUserHistory'
import { useRepayLoan } from '@/hooks/useRepayLoan'
import { useAccount } from 'wagmi'

export default function Dashboard() {
  const { address } = useAccount()
  const { profile, isLoading, error } = useUserHistory()
  const { repayLoan, isWritePending, repayingLoanId } = useRepayLoan()

  if (!address) return <div className="text-gray-600 dark:text-gray-400">Please connect wallet to see dashboard</div>
  if (isLoading) return <LoadingSkeleton />
  if (error || !profile) return <div className="text-red-500 dark:text-red-400">Error loading profile</div>

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700" role="region" aria-label="User Dashboard">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h2>
        <ReputationScore score={profile.reputationScore} />
      </div>

      <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">My Requests</h3>
            <RequestHistory 
                loans={profile.loans} 
                onRepay={repayLoan} 
                isWritePending={isWritePending} 
                repayingLoanId={repayingLoanId} 
            />
        </div>

        <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Loans Funded</h3>
            <FundedHistory loans={profile.fundedLoans} />
        </div>
      </div>
    </div>
  )
}
