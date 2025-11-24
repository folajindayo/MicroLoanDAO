import { useMemo } from 'react'

/**
 * ReputationScore Component
 * Displays the user's reputation score with visual styling.
 * @param {Object} props - Component props
 * @param {number} props.score - The reputation score to display
 */
interface ReputationScoreProps {
    score: number
}

export default function ReputationScore({ score }: ReputationScoreProps) {
    const scoreColor = useMemo(() => {
        if (score >= 80) return 'text-green-600 dark:text-green-400'
        if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }, [score])

    return (
        <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reputation Score</p>
            <p className={`text-3xl font-bold ${scoreColor}`}>
                {score}
            </p>
        </div>
    )
}

