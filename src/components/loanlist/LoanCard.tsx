import LoanCardHeader from './LoanCardHeader'
import LoanCardBody from './LoanCardBody'
import LoanCardFooter from './LoanCardFooter'
import { Loan } from '@/types/loan'

interface LoanCardProps {
    loan: Loan
    userAddress: string | undefined
    onFund: (loan: Loan) => void
    isWritePending: boolean
    fundingLoanId: string | null
}

/**
 * LoanCard Component
 * Displays individual loan details and funding action using atomic subcomponents.
 * @param {Object} props - Component props
 * @param {Object} props.loan - Loan data object
 * @param {string} props.userAddress - Connected user's wallet address
 */
export default function LoanCard({ loan, userAddress, onFund, isWritePending, fundingLoanId }: LoanCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-md flex flex-col h-full" role="article" aria-labelledby={`loan-title-${loan.id}`}>
            <div className="px-4 py-5 sm:p-6 flex flex-col h-full">
                <LoanCardHeader borrowerAddress={loan.borrowerAddress} />
                
                <div className="flex-grow mt-4">
                    <LoanCardBody 
                        amount={loan.amount} 
                        purpose={loan.purpose} 
                        duration={loan.duration}
                        interestRate={loan.interestRate}
                    />
                </div>

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

