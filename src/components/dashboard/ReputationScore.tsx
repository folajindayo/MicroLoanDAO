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
