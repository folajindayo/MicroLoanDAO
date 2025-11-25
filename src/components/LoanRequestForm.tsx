import { useState } from 'react'

import { CreateLoanSchema } from '@/lib/validation'
import { useAccount } from 'wagmi'
import { useCreateLoan } from '@/hooks/useCreateLoan'

import AmountInput from './loanrequest/AmountInput'
import DurationInput from './loanrequest/DurationInput'
import InterestRateInput from './loanrequest/InterestRateInput'
import PurposeInput from './loanrequest/PurposeInput'
import { Toast } from './ui/Toast'

export default function LoanRequestForm() {
  const { address } = useAccount()
  const { createLoan, isWritePending, isConfirming, isConfirmed, writeError } = useCreateLoan()

  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [purpose, setPurpose] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!address) {
      setValidationError('Please connect your wallet first.')
      return
    }

    const result = CreateLoanSchema.safeParse({
      borrowerAddress: address,
      amount,
      purpose,
      duration: Number(duration),
      interestRate: Number(interestRate),
      creationTx: '0x' + '0'.repeat(64), // Placeholder for validation check
      contractLoanId: null
    })

    if (!result.success) {
      const firstError = result.error.errors[0].message
      setValidationError(firstError)
      return
    }
    
    createLoan({ amount, duration, interestRate, purpose, address })
  }

  return (
    <div className="p-6 border rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700" role="form" aria-label="Loan Request Form">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <span className="text-indigo-600">📝</span> Request a MicroLoan
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <AmountInput value={amount} onChange={setAmount} />
          <DurationInput value={duration} onChange={setDuration} />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <InterestRateInput value={interestRate} onChange={setInterestRate} />
        </div>

        <PurposeInput value={purpose} onChange={setPurpose} />
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isWritePending || isConfirming}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
            aria-busy={isWritePending || isConfirming}
          >
            {isWritePending ? 'Confirming in Wallet...' : isConfirming ? 'Processing Transaction...' : 'Request Loan'}
          </button>
        </div>

        {writeError && (
          <div className="p-3 rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <p role="alert" className="text-red-600 dark:text-red-400 text-sm font-medium">
              {writeError.message}
            </p>
          </div>
        )}
        
        {isConfirmed && (
          <div className="p-3 rounded bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <p role="status" className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2">
              ✅ Loan requested successfully!
            </p>
          </div>
        )}
      </form>
      {validationError && <Toast message={validationError} type="error" onClose={() => setValidationError(null)} />}
    </div>
  )
}

