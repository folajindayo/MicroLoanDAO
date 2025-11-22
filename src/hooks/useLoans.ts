import { useState, useEffect } from 'react'

interface Loan {
  id: string
  contractLoanId: number | null
  borrowerAddress: string
  amount: string
  purpose: string
  duration: number
  status: string
  createdAt: string
}

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLoans = async () => {
    try {
        setIsLoading(true)
        const res = await fetch('/api/loans')
        const data = await res.json()
        setLoans(data)
    } catch (err) {
        setError(err as Error)
    } finally {
        setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  return { loans, isLoading, error, refetch: fetchLoans }
}

