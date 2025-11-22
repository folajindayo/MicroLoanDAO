import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'

export function useRepayLoan() {
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })
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
            }).then(() => {
                setRepayingLoanId(null)
            })
        }
    }, [isConfirmed, repayingLoanId, hash])

    const repayLoan = (loan: any) => {
        if (!loan.contractLoanId) {
            alert("Contract Loan ID missing")
            return
        }
        setRepayingLoanId(loan.id)
        writeContract({
            address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
            abi: MicroLoanDAOABI,
            functionName: 'repayLoan',
            args: [BigInt(loan.contractLoanId)],
            value: BigInt(loan.amount) // Note: Contract calculates interest, value should ideally be calculated here too or fetched
        })
    }

    return { repayLoan, isWritePending, repayingLoanId }
}
