import { useCreateLoan } from '@/hooks/useCreateLoan'
import { useAccount } from 'wagmi'
import { useState } from 'react'
import { Toast } from './ui/Toast'
import AmountInput from './loanrequest/AmountInput'
import DurationInput from './loanrequest/DurationInput'
import InterestRateInput from './loanrequest/InterestRateInput'
import PurposeInput from './loanrequest/PurposeInput'

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
        <AmountInput value={amount} onChange={setAmount} />
        <DurationInput value={duration} onChange={setDuration} />
        <InterestRateInput value={interestRate} onChange={setInterestRate} />
        <PurposeInput value={purpose} onChange={setPurpose} />
        
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
