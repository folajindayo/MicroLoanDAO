import { useState, useEffect } from 'react'

import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'
import { Loan } from '@/types/loan'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'

export function useFundLoan() {
    const { address } = useAccount()
    const [fundingLoanId, setFundingLoanId] = useState<string | null>(null)
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
    const { isSuccess: isConfirmed, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })
    const [dbError, setDbError] = useState<Error | null>(null)

    useEffect(() => {
        if (isConfirmed && fundingLoanId && hash && address) {
            fetch('/api/loans/fund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loanId: fundingLoanId,
                    lenderAddress: address,
                    fundingTx: hash
                })
            })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to sync funding')
                setFundingLoanId(null)
                setDbError(null)
            })
            .catch((err) => {
                console.error('DB Sync Error:', err)
                setDbError(err)
            })
        }
    }, [isConfirmed, fundingLoanId, hash, address])

    const fundLoan = (loan: Loan) => {
        if (loan.contractLoanId === null || loan.contractLoanId === undefined) {
            console.error("Loan ID not synced with contract yet.")
            return
        }
        setFundingLoanId(loan.id)
        writeContract({
            address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
            abi: MicroLoanDAOABI,
            functionName: 'fundLoan',
            args: [BigInt(loan.contractLoanId)],
            value: BigInt(loan.amount)
        })
    }

    return { fundLoan, isWritePending, isConfirming, isConfirmed, fundingLoanId, writeError, dbError }
}

