'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, decodeEventLog } from 'viem'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'

export default function LoanRequestForm() {
  const { address } = useAccount()
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
    hash,
  })

  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [purpose, setPurpose] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !amount || !duration || !purpose) return

    // Call smart contract
    writeContract({
      address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: MicroLoanDAOABI,
      functionName: 'createLoan',
      args: [parseEther(amount), BigInt(Number(duration) * 24 * 60 * 60), purpose], // Duration in days to seconds
    })
  }

  useEffect(() => {
      if (isConfirmed && receipt) {
          // Parse logs to find LoanCreated event
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

         fetch('/api/loans/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                borrowerAddress: address,
                amount: parseEther(amount).toString(),
                purpose,
                duration: Number(duration) * 24 * 60 * 60,
                creationTx: hash,
                contractLoanId: loanId // Add this to the API
            })
         }).then(() => {
             setAmount('')
             setDuration('')
             setPurpose('')
             console.log('Synced to DB with ID:', loanId)
         })
      }
  }, [isConfirmed, receipt, hash, address, amount, duration, purpose])

  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Request a MicroLoan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (ETH)</label>
          <input
            type="number"
            step="0.0001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
            placeholder="0.1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (Days)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
            placeholder="30"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
            placeholder="Business expansion..."
            required
          />
        </div>
        <button
          type="submit"
          disabled={isWritePending || isConfirming}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isWritePending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Request Loan'}
        </button>
        {writeError && <p className="text-red-500 text-sm">{writeError.message}</p>}
        {isConfirmed && <p className="text-green-500 text-sm">Loan requested successfully!</p>}
      </form>
    </div>
  )
}
