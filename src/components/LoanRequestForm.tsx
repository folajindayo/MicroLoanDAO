import { useCreateLoan } from '@/hooks/useCreateLoan'
import { useAccount } from 'wagmi'
import { useState } from 'react'
import { Toast } from './ui/Toast'

export default function LoanRequestForm() {
  const { address } = useAccount()
  const { createLoan, isWritePending, isConfirming, isConfirmed, writeError } = useCreateLoan()

  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [purpose, setPurpose] = useState('')
  const [showError, setShowError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !amount || !duration || !interestRate || !purpose) return
    
    createLoan({ amount, duration, interestRate, purpose, address })
  }

  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-gray-800 dark:border-gray-700" role="form" aria-label="Loan Request Form">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Request a MicroLoan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (ETH)</label>
          <input
            id="amount"
            type="number"
            step="0.0001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="0.1"
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (Days)</label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="30"
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="interest" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interest Rate (%)</label>
          <input
            id="interest"
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="5"
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</label>
          <textarea
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Business expansion..."
            required
            aria-required="true"
          />
        </div>
        <button
          type="submit"
          disabled={isWritePending || isConfirming}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          aria-busy={isWritePending || isConfirming}
        >
          {isWritePending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Request Loan'}
        </button>
        {writeError && <p role="alert" className="text-red-500 text-sm mt-2">{writeError.message}</p>}
        {isConfirmed && <p role="status" className="text-green-500 text-sm mt-2">Loan requested successfully!</p>}
      </form>
      {showError && <Toast message="Error creating loan" onClose={() => setShowError(false)} />}
    </div>
  )
}
