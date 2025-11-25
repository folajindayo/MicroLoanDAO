import { formatEther } from 'viem'

interface LoanCardBodyProps {
  amount: string
  purpose: string
  duration: number
  interestRate?: number
}

export default function LoanCardBody({ amount, purpose, duration, interestRate }: LoanCardBodyProps) {
  return (
    <dl className="space-y-3">
      <div>
        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</dt>
        <dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {formatEther(BigInt(amount))} <span className="text-sm font-normal text-gray-500">ETH</span>
        </dd>
      </div>
      
      <div>
        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purpose</dt>
        <dd className="mt-1 text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
          {purpose}
        </dd>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</dt>
          <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-200">
            {Number(duration) / (24 * 60 * 60)} Days
          </dd>
        </div>
        {interestRate !== undefined && (
          <div>
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Interest</dt>
            <dd className="mt-1 text-sm font-semibold text-green-600 dark:text-green-400 text-right">
              {interestRate / 100}%
            </dd>
          </div>
        )}
      </div>
    </dl>
  )
}


