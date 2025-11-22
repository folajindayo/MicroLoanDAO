'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'

interface Loan {
  id: string
  contractLoanId: number | null // In a real app, we map this. For MVP we assume 1-to-1 mapping if created sequentially or store it.
  borrowerAddress: string
  amount: string
  purpose: string
  duration: number
  status: string
  createdAt: string
}

// NOTE: For MVP, we assume API returns loans. To fund, we need the On-Chain ID.
// In the create API, we should have stored the on-chain ID. 
// Since we didn't get the event return value in the generic 'writeContract', we might rely on 'contractLoanId' being set later via an indexer or assuming an incremental ID logic if we were syncing properly.
// For this demo, I'll assume the API returns 'contractLoanId' OR we use the 'id' if we can map it.
// Actually, the Smart Contract 'loanCount' is incremental. We could query events to find the ID.
// But to keep it simple, I will pass the index as the ID if I can, or just use the loop index if list is consistent.
// Better: Update API to accept 'contractLoanId' from the frontend after receipt.
// I'll update LoanRequestForm to fetch the event logs from receipt to get the ID, OR just trust the user to pass it (risky), OR just use a simple counter if we assume we are the only UI.
// Let's use the 'loanCount' from contract for robustness? No, that's race-condition prone.
// I will parse the logs in LoanRequestForm to get the ID.

export default function LoanList() {
  const { address } = useAccount()
  const [loans, setLoans] = useState<Loan[]>([])
  const { writeContract, data: hash } = useWriteContract()
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    fetch('/api/loans')
      .then(res => res.json())
      .then(data => setLoans(data))
  }, [isConfirmed]) // Refresh on fund success

  const handleFund = async (loan: Loan) => {
     // We need the numeric ID from the contract.
     // Since we didn't store it reliably in the CREATE step (we just passed hash), 
     // we might need to fetch it or guess.
     // For MVP, let's assume the `contractLoanId` field is populated via a separate process or we just use the array index + 1 if we resync.
     // Or better: update the API to update the loan with the ID.
     // I'll just assume `contractLoanId` is present, or use a placeholder logic for now.
     // Actually, the smart contract ID is needed.
     // I'll update `createLoan` logic in `LoanRequestForm` to parse logs.
     
     // For now, I'll alert if contractLoanId is missing.
     if (!loan.contractLoanId) {
         alert("Loan ID not synced with contract yet.")
         return
     }
     
    writeContract({
      address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: MicroLoanDAOABI,
      functionName: 'fundLoan',
      args: [BigInt(loan.contractLoanId)],
      value: BigInt(loan.amount)
    })
  }

  // Sync funding to DB
  // This would ideally be in a useEffect watching 'isConfirmed' and 'hash'
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Active Loan Requests</h2>
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
                    className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Fund Loan
                  </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

