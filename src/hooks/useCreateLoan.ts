'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, decodeEventLog } from 'viem'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'

export function useCreateLoan() {
  const { address } = useAccount()
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
      if (isConfirmed && receipt) {
          let loanId = null;
          for (const log of receipt.logs) {
              try {
                  const decoded = decodeEventLog({
                      abi: MicroLoanDAOABI,
                      data: log.data,
                      topics: log.topics
                  })
                  if (decoded.eventName === 'LoanCreated') {
                      // @ts-expect-error args type is generic
                      loanId = Number(decoded.args.id);
                      break;
                  }
              } catch {
                  // Ignore logs that don't match
              }
          }

         // We need to pass the original input data here, but hooks are decoupled.
         // The solution is to pass the data to the hook function and store it in state or assume the component handles the API call.
         // For this refactor, I'll keep the API call inside the hook but we need to know the values.
         // Better pattern: The hook exposes a function that returns a promise or we use a separate effect with state.
      }
  }, [isConfirmed, receipt])

  const createLoan = async ({ amount, duration, interestRate, purpose, address }: { amount: string, duration: string, interestRate: string, purpose: string, address: string }) => {
    const rateBps = Number(interestRate) * 100
    
    writeContract({
      address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: MicroLoanDAOABI,
      functionName: 'createLoan',
      args: [parseEther(amount), BigInt(Number(duration) * 24 * 60 * 60), BigInt(rateBps), purpose], 
    })
    
    // NOTE: We need to persist the parameters to send to the API after confirmation. 
    // Storing them in localStorage or state is needed.
    localStorage.setItem('pendingLoanCreation', JSON.stringify({ amount, duration, interestRate, purpose, address }))
  }

  useEffect(() => {
      if (isConfirmed && receipt && hash) {
          const pendingData = localStorage.getItem('pendingLoanCreation')
          if (pendingData) {
              const { amount, duration, interestRate, purpose, address } = JSON.parse(pendingData)
              let loanId = null;
              for (const log of receipt.logs) {
                  try {
                      const decoded = decodeEventLog({
                          abi: MicroLoanDAOABI,
                          data: log.data,
                          topics: log.topics
                      })
                      if (decoded.eventName === 'LoanCreated') {
                          // @ts-expect-error args type is generic
                          loanId = Number(decoded.args.id);
                          break;
                      }
                  } catch { /* empty */ }
              }

              const rateBps = Number(interestRate) * 100;

              fetch('/api/loans/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    borrowerAddress: address,
                    amount: parseEther(amount).toString(),
                    purpose,
                    duration: Number(duration) * 24 * 60 * 60,
                    interestRate: rateBps,
                    creationTx: hash,
                    contractLoanId: loanId
                })
             }).then(() => {
                 console.log('Synced to DB with ID:', loanId)
                 localStorage.removeItem('pendingLoanCreation')
             })
          }
      }
  }, [isConfirmed, receipt, hash])

  return { createLoan, isWritePending, isConfirming, isConfirmed, writeError }
}
