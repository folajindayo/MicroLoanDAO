import { useState, useEffect } from 'react'

export function useLoans() {
  const [loans, setLoans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetch('/api/loans')
      .then(res => res.json())
      .then(data => {
          setLoans(data)
          setIsLoading(false)
      })
      .catch(err => {
          setError(err)
          setIsLoading(false)
      })
  }, [])

  return { loans, isLoading, error }
}
