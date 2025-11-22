'use client'

import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'
import { useState } from 'react'
import { Loan } from '@/types'

export function useFundLoan() {
  const [fundingLoanId, setFundingLoanId] = useState<string | null>(null)
  const [lenderAddress, setLenderAddress] = useState<string | null>(null)
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const fundLoan = (loan: Loan, address: string) => {
     if (!loan.contractLoanId) {
         alert("Loan ID not synced with contract yet.")
         return
     }
     
    setFundingLoanId(loan.id)
    setLenderAddress(address)
    writeContract({
      address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: MicroLoanDAOABI,
      functionName: 'fundLoan',
      args: [BigInt(loan.contractLoanId)],
      value: BigInt(loan.amount)
    })
  }

  useEffect(() => {
    if (isConfirmed && fundingLoanId && hash && lenderAddress) {
        fetch('/api/loans/fund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                loanId: fundingLoanId,
                lenderAddress,
                fundingTx: hash
            })
        }).then(() => {
            console.log('Funding synced')
            setFundingLoanId(null)
            setLenderAddress(null)
        })
    }
  }, [isConfirmed, fundingLoanId, hash, lenderAddress])

  return { fundLoan, isWritePending, fundingLoanId }
}
