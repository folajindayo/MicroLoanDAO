import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface UserProfile {
    reputationScore: number
    loans: any[]
    fundedLoans: any[]
}

export function useUserHistory() {
  const { address } = useAccount()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchHistory = async () => {
    if (!address) return
    try {
        setIsLoading(true)
        const res = await fetch(`/api/history?address=${address}`)
        const data = await res.json()
        setProfile(data)
    } catch (err) {
        setError(err as Error)
    } finally {
        setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [address])

  return { profile, isLoading, error, refetch: fetchHistory }
}

