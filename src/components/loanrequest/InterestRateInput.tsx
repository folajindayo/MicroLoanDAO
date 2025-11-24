interface InterestRateInputProps {
  value: string
  onChange: (value: string) => void
}

export default function InterestRateInput({ value, onChange }: InterestRateInputProps) {
  return (
    <div>
      <label htmlFor="interest" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interest Rate (%)</label>
      <input
        id="interest"
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        placeholder="5"
        required
        aria-required="true"
      />
    </div>
  )
}


