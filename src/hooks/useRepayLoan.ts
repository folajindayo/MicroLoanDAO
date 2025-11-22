'use client'

import { useEffect, useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'
import { Loan } from '@/types'

export function useRepayLoan() {
  const [repayingLoanId, setRepayingLoanId] = useState<string | null>(null)
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const repayLoan = (loan: Loan) => {
      if (!loan.contractLoanId) {
          alert("Contract Loan ID missing")
          return
      }
      setRepayingLoanId(loan.id)
      // Calculate total with interest. Ideally we read this from contract, 
      // but for MVP we calculate locally or assume amount + interest.
      // Contract requires >= totalRepayment.
      const interestRate = loan.interestRate || 0
      const amount = BigInt(loan.amount)
      const interest = (amount * BigInt(interestRate)) / BigInt(10000)
      // Check late fee logic? Contract handles it. We should probably send extra buffer or read quote.
      // For this demo, sending amount + interest.
      const total = amount + interest

      writeContract({
          address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
          abi: MicroLoanDAOABI,
          functionName: 'repayLoan',
          args: [BigInt(loan.contractLoanId)],
          value: total
      })
  }

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

  return { repayLoan, isWritePending, repayingLoanId }
}
