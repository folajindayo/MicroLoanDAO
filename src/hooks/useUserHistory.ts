import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

interface UserProfile {
    reputationScore: number
    loans: any[]
    fundedLoans: any[]
}

export function useUserHistory() {
    const { address } = useAccount()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (address) {
            setIsLoading(true)
            fetch(`/api/history?address=${address}`)
                .then(res => res.json())
                .then(data => setProfile(data))
                .catch(err => setError(err))
                .finally(() => setIsLoading(false))
        }
    }, [address])

    return { profile, isLoading, error }
}
