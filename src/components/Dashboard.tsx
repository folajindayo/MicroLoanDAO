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

  if (!address) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">Please connect your wallet to view your dashboard.</p>
      </div>
    )
  }

  if (isLoading) return <LoadingSkeleton count={5} className="max-w-4xl mx-auto mt-8" />
  
  if (error || !profile) {
    return (
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
        <span className="font-medium">Error!</span> Failed to load user profile. Please try again later.
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 mb-8">
        <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-mono">{address}</p>
            </div>
            <ReputationScore score={profile.reputationScore} />
        </div>

        <div className="p-6 sm:p-8 grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                        My Requests
                    </h3>
                    <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300">
                        {profile.loans.length} Total
                    </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 min-h-[200px]">
                    <RequestHistory 
                        loans={profile.loans} 
                        onRepay={repayLoan} 
                        isWritePending={isWritePending} 
                        repayingLoanId={repayingLoanId} 
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                        Loans Funded
                    </h3>
                    <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300">
                        {profile.fundedLoans.length} Total
                    </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 min-h-[200px]">
                    <FundedHistory loans={profile.fundedLoans} />
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

