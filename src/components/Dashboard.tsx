'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'
import ReputationScore from './dashboard/ReputationScore'
import RequestHistory from './dashboard/RequestHistory'
import FundedHistory from './dashboard/FundedHistory'

interface Loan {
    id: string
    contractLoanId: number | null
    borrowerAddress: string
    amount: string
    purpose: string
    duration: number
    status: string
}

interface UserProfile {
    reputationScore: number
    loans: Loan[]
    fundedLoans: Loan[]
}

export default function Dashboard() {
  const { address } = useAccount()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })
  const [repayingLoanId, setRepayingLoanId] = useState<string | null>(null)

  useEffect(() => {
    if (address) {
      fetch(`/api/history?address=${address}`)
        .then(res => res.json())
        .then(data => setProfile(data))
    }
  }, [address, isConfirmed])

  // Sync repayment to DB
  useEffect(() => {
      if (isConfirmed && repayingLoanId && hash) {
          fetch('/api/loans/repay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  loanId: repayingLoanId,
                  repaymentTx: hash
              })
          }).then(() => {
              setRepayingLoanId(null)
          })
      }
  }, [isConfirmed, repayingLoanId, hash])

  const handleRepay = async (loan: Loan) => {
      if (!loan.contractLoanId) {
          alert("Contract Loan ID missing")
          return
      }
      setRepayingLoanId(loan.id)
      writeContract({
          address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
          abi: MicroLoanDAOABI,
          functionName: 'repayLoan',
          args: [BigInt(loan.contractLoanId)],
          value: BigInt(loan.amount) // Note: This should technically include interest + late fee calculated on-chain or fetched. MVP simplifies.
      })
  }

  if (!address) return <div>Please connect wallet to see dashboard</div>
  if (!profile) return <div>Loading...</div>

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h2>
        <ReputationScore score={profile.reputationScore} />
      </div>

      <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">My Requests</h3>
            <RequestHistory 
                loans={profile.loans} 
                onRepay={handleRepay} 
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
