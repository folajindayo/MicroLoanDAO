import { formatAddress } from '@/lib/api-utils'

interface LoanCardHeaderProps {
  borrowerAddress: string
}

export default function LoanCardHeader({ borrowerAddress }: LoanCardHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-2">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Borrower</dt>
      <dd className="text-sm text-gray-900 dark:text-gray-200 truncate font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded" title={borrowerAddress}>
        {formatAddress ? formatAddress(borrowerAddress) : borrowerAddress.slice(0, 6) + '...' + borrowerAddress.slice(-4)}
      </dd>
    </div>
  )
}


