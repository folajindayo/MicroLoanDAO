/**
 * LoadingSkeleton Component
 * Displays a placeholder UI while content is loading.
 */
export default function LoadingSkeleton() {
    return (
        <div className="animate-pulse space-y-4" role="status" aria-label="Loading">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
    )
}
