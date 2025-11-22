interface DurationInputProps {
  value: string
  onChange: (value: string) => void
}

export default function DurationInput({ value, onChange }: DurationInputProps) {
  return (
    <div>
      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (Days)</label>
      <input
        id="duration"
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        placeholder="30"
        required
        aria-required="true"
      />
    </div>
  )
}

