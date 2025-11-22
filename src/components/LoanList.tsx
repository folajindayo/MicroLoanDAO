'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'
import LoanCard from './loanlist/LoanCard'

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
      {loans.length === 0 && <p className="text-gray-500 dark:text-gray-400">No active requests.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loans.map((loan) => (
          <LoanCard 
            key={loan.id} 
            loan={loan} 
            userAddress={address} 
            onFund={handleFund} 
            isWritePending={isWritePending}
            fundingLoanId={fundingLoanId}
          />
        ))}
      </div>
    </div>
  )
}
