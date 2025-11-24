import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'
import { Loan } from '@/types/loan'

export function useRepayLoan() {
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
    const { isSuccess: isConfirmed, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })
    const [repayingLoanId, setRepayingLoanId] = useState<string | null>(null)

    useEffect(() => {
        if (isConfirmed && repayingLoanId && hash) {
            fetch('/api/loans/repay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loanId: repayingLoanId,
                    repaymentTx: hash
                })
            })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to sync repayment')
                setRepayingLoanId(null)
            })
            .catch(console.error)
        }
    }, [isConfirmed, repayingLoanId, hash])

    const repayLoan = (loan: Loan) => {
        if (loan.contractLoanId === null || loan.contractLoanId === undefined) {
            console.error("Contract Loan ID missing")
            return
        }
        
        setRepayingLoanId(loan.id)
        
        // TODO: Calculate exact repayment amount including interest
        const repaymentAmount = BigInt(loan.amount)

        writeContract({
            address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
            abi: MicroLoanDAOABI,
            functionName: 'repayLoan',
            args: [BigInt(loan.contractLoanId)],
            value: repaymentAmount
        })
    }

    return { repayLoan, isWritePending, isConfirming, isConfirmed, repayingLoanId, writeError }
}

