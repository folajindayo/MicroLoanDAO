'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'

interface Loan {
    id: string
    contractLoanId: number | null
    borrowerAddress: string
    amount: string
    interestRate: number
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
              // Refresh profile handled by dependency on isConfirmed
          })
      }
  }, [isConfirmed, repayingLoanId, hash])

  const handleRepay = async (loan: Loan) => {
      if (!loan.contractLoanId) {
          alert("Contract Loan ID missing")
          return
      }
      
      const principal = BigInt(loan.amount)
      const interest = (principal * BigInt(loan.interestRate)) / 10000n
      const totalRepayment = principal + interest

      setRepayingLoanId(loan.id)
      writeContract({
          address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
          abi: MicroLoanDAOABI,
          functionName: 'repayLoan',
          args: [BigInt(loan.contractLoanId)],
          value: totalRepayment
      })
  }

  if (!address) return <div>Please connect wallet to see dashboard</div>
  if (!profile) return <div>Loading...</div>

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h2>
        <div className="text-right">
            <p className="text-sm text-gray-500">Reputation Score</p>
            <p className="text-3xl font-bold text-indigo-600">{profile.reputationScore}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">My Requests</h3>
            {profile.loans.length === 0 ? (
                <p className="text-gray-500">No loan requests made.</p>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {profile.loans.map((loan) => (
                        <li key={loan.id} className="py-3">
                            <div className="flex justify-between">
                                <span className="text-gray-700 dark:text-gray-300">{loan.purpose}</span>
                                <span className="text-gray-900 dark:text-white font-medium">{formatEther(BigInt(loan.amount))} ETH</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-sm text-gray-500">Status: {loan.status}</p>
                                <p className="text-xs text-gray-400">Rate: {loan.interestRate / 100}%</p>
                                {loan.status === 'FUNDED' && (
                                    <button 
                                        onClick={() => handleRepay(loan)}
                                        disabled={isWritePending}
                                        className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isWritePending && repayingLoanId === loan.id ? 'Processing...' : 'Repay'}
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Loans Funded</h3>
            {profile.fundedLoans.length === 0 ? (
                <p className="text-gray-500">No loans funded yet.</p>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {profile.fundedLoans.map((loan) => (
                        <li key={loan.id} className="py-3">
                             <div className="flex justify-between">
                                <span className="text-gray-700 dark:text-gray-300">{loan.purpose}</span>
                                <span className="text-gray-900 dark:text-white font-medium">{formatEther(BigInt(loan.amount))} ETH</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-sm text-gray-500">Borrower: {loan.borrowerAddress}</p>
                                <p className="text-xs text-gray-400">Rate: {loan.interestRate / 100}%</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  )
}
