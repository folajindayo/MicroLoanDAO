'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'

interface Loan {
  id: string
  contractLoanId: number | null
  borrowerAddress: string
  amount: string
  purpose: string
  duration: number
  status: string
  createdAt: string
}

export default function LoanList() {
  const { address } = useAccount()
  const [loans, setLoans] = useState<Loan[]>([])
  const [fundingLoanId, setFundingLoanId] = useState<string | null>(null)
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    fetch('/api/loans')
      .then(res => res.json())
      .then(data => setLoans(data))
  }, [isConfirmed]) 

  // Sync funding to DB
  useEffect(() => {
    if (isConfirmed && fundingLoanId && hash && address) {
        fetch('/api/loans/fund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                loanId: fundingLoanId,
                lenderAddress: address,
                fundingTx: hash
            })
        }).then(() => {
            console.log('Funding synced')
            setFundingLoanId(null)
        })
    }
  }, [isConfirmed, fundingLoanId, hash, address])

  const handleFund = async (loan: Loan) => {
     if (!loan.contractLoanId) {
         alert("Loan ID not synced with contract yet.")
         return
     }
     
    setFundingLoanId(loan.id)
    writeContract({
      address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: MicroLoanDAOABI,
      functionName: 'fundLoan',
      args: [BigInt(loan.contractLoanId)],
      value: BigInt(loan.amount)
    })
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Active Loan Requests</h2>
      {loans.length === 0 && <p className="text-gray-500">No active requests.</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loans.map((loan) => (
          <div key={loan.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border p-4">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Borrower</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 truncate">{loan.borrowerAddress}</dd>
                
                <dt className="mt-4 text-sm font-medium text-gray-500 truncate">Amount</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{formatEther(BigInt(loan.amount))} ETH</dd>
                
                <dt className="mt-4 text-sm font-medium text-gray-500 truncate">Purpose</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{loan.purpose}</dd>

                <dt className="mt-4 text-sm font-medium text-gray-500 truncate">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{Number(loan.duration) / (24 * 60 * 60)} Days</dd>
              </dl>
              {loan.status === 'REQUESTED' && address && loan.borrowerAddress !== address && (
                  <button
                    onClick={() => handleFund(loan)}
                    disabled={isWritePending}
                    className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isWritePending && fundingLoanId === loan.id ? 'Processing...' : 'Fund Loan'}
                  </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
