'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'

export default function Dashboard() {
  const { address } = useAccount()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (address) {
      fetch(`/api/history?address=${address}`)
        .then(res => res.json())
        .then(data => setProfile(data))
    }
  }, [address])

  if (!address) return <div>Please connect wallet to see dashboard</div>
  if (!profile) return <div>Loading...</div>

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h2>
        <div className="text-right">
            <p className="text-sm text-gray-500">Reputation Score</p>
            <p className="text-3xl font-bold text-indigo-600">{profile.reputationScore}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">My Requests</h3>
            {profile.loans?.length === 0 ? (
                <p className="text-gray-500">No loan requests made.</p>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {profile.loans?.map((loan: any) => (
                        <li key={loan.id} className="py-3">
                            <div className="flex justify-between">
                                <span className="text-gray-700 dark:text-gray-300">{loan.purpose}</span>
                                <span className="text-gray-900 dark:text-white font-medium">{formatEther(BigInt(loan.amount))} ETH</span>
                            </div>
                            <p className="text-sm text-gray-500">Status: {loan.status}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Loans Funded</h3>
            {profile.fundedLoans?.length === 0 ? (
                <p className="text-gray-500">No loans funded yet.</p>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {profile.fundedLoans?.map((loan: any) => (
                        <li key={loan.id} className="py-3">
                             <div className="flex justify-between">
                                <span className="text-gray-700 dark:text-gray-300">{loan.purpose}</span>
                                <span className="text-gray-900 dark:text-white font-medium">{formatEther(BigInt(loan.amount))} ETH</span>
                            </div>
                            <p className="text-sm text-gray-500">Borrower: {loan.borrowerAddress}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  )
}

