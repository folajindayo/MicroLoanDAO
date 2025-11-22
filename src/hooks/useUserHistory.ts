import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { UserProfile } from '@/types'

export function useUserHistory() {
  const { address } = useAccount()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (address) {
      setIsLoading(true)
      fetch(`/api/history?address=${address}`)
        .then(res => res.json())
        .then(data => {
            setProfile(data)
            setIsLoading(false)
        })
        .catch(err => {
            setError(err)
            setIsLoading(false)
        })
    }
  }, [address])

  return { profile, isLoading, error }
}
