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
    return (
        <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Reputation Score</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{score}</p>
        </div>
    )
}
