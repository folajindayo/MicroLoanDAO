interface LoadingSkeletonProps {
    /** Number of lines to show */
    count?: number
    /** Custom class name for wrapper */
    className?: string
}

/**
 * LoadingSkeleton Component
 * Displays a placeholder UI while content is loading.
 */
export default function LoadingSkeleton({ count = 3, className = "" }: LoadingSkeletonProps) {
    return (
        <div className={`animate-pulse space-y-4 ${className}`} role="status" aria-label="Loading">
            {Array.from({ length: count }).map((_, i) => (
                <div 
                    key={i} 
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"
                    style={{ width: `${Math.random() * 50 + 50}%` }} 
                />
            ))}
            <span className="sr-only">Loading...</span>
        </div>
    )
}

