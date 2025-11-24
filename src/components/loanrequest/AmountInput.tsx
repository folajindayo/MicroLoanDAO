interface AmountInputProps {
  value: string
  onChange: (value: string) => void
}

export default function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <div>
      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (ETH)</label>
      <input
        id="amount"
        type="number"
        step="0.0001"
        min="0.0001"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        placeholder="0.1"
        required
        aria-required="true"
      />
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Min: 0.0001 ETH</p>
    </div>
  )
}


