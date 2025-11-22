import { formatEther } from 'viem'

interface LoanCardBodyProps {
  amount: string
  purpose: string
  duration: number
  interestRate?: number
}

export default function LoanCardBody({ amount, purpose, duration, interestRate }: LoanCardBodyProps) {
  return (
    <dl className="space-y-2">
      <div>
        <dt className="text-xs text-gray-500 dark:text-gray-400">Amount</dt>
        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
          {formatEther(BigInt(amount))} ETH
        </dd>
      </div>
      
      <div>
        <dt className="text-xs text-gray-500 dark:text-gray-400">Purpose</dt>
        <dd className="text-sm text-gray-900 dark:text-gray-200 line-clamp-2">
          {purpose}
        </dd>
      </div>

      <div className="flex justify-between">
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Duration</dt>
          <dd className="text-sm text-gray-900 dark:text-gray-200">
            {Number(duration) / (24 * 60 * 60)} Days
          </dd>
        </div>
        {interestRate !== undefined && (
          <div className="text-right">
            <dt className="text-xs text-gray-500 dark:text-gray-400">Interest</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-200">
              {interestRate / 100}%
            </dd>
          </div>
        )}
      </div>
    </dl>
  )
}

