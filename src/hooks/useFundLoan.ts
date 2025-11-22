import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'

export function useFundLoan() {
    const { address } = useAccount()
    const [fundingLoanId, setFundingLoanId] = useState<string | null>(null)
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

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
            }).then(() => {
                setFundingLoanId(null)
            })
        }
    }, [isConfirmed, fundingLoanId, hash, address])

    const fundLoan = (loan: any) => {
        if (!loan.contractLoanId) {
            alert("Loan ID not synced with contract yet.")
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

    return { fundLoan, isWritePending, fundingLoanId }
}
