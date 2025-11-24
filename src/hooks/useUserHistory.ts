import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { User, Loan } from '@/types'

export function useUserHistory() {
    const { address } = useAccount()
    const [profile, setProfile] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (address) {
            setIsLoading(true)
            fetch(`/api/history?address=${address}`)
                .then(async (res) => {
                    if (!res.ok) throw new Error('Failed to fetch user history')
                    return res.json()
                })
                .then((data: User) => setProfile(data))
                .catch(err => setError(err instanceof Error ? err : new Error('Unknown error')))
                .finally(() => setIsLoading(false))
        } else {
            setProfile(null)
        }
    }, [address])

    return { profile, isLoading, error }
}

