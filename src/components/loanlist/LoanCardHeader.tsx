interface LoanCardHeaderProps {
  borrowerAddress: string
}

export default function LoanCardHeader({ borrowerAddress }: LoanCardHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-2">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Borrower</dt>
      <dd className="text-sm text-gray-900 dark:text-gray-200 truncate max-w-[150px]" title={borrowerAddress}>
        {borrowerAddress}
      </dd>
    </div>
  )
}

