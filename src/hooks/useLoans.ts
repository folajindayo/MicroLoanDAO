import { useEffect, useState } from 'react'
import { Loan } from '@/types/loan'

export function useLoans() {
    const [loans, setLoans] = useState<Loan[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchLoans = async () => {
        try {
            const res = await fetch('/api/loans')
            if (!res.ok) {
                throw new Error('Failed to fetch loans')
            }
            const data = await res.json()
            setLoans(data)
        } catch (err: any) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLoans()
    }, [])

    return { loans, isLoading, error, refetch: fetchLoans }
}

