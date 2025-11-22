import { formatEther } from 'viem'

interface Loan {
  id: string
  purpose: string
  amount: string
  borrowerAddress: string
}

interface FundedHistoryProps {
  loans: Loan[]
}

export default function FundedHistory({ loans }: FundedHistoryProps) {
  if (!loans || loans.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No loans funded yet.</p>
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {loans.map((loan) => (
        <li key={loan.id} className="py-3">
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">{loan.purpose}</span>
            <span className="text-gray-900 dark:text-white font-medium">{formatEther(BigInt(loan.amount))} ETH</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Borrower: {loan.borrowerAddress}</p>
        </li>
      ))}
    </ul>
  )
}
