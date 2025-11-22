import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'
import { useEffect, useState } from 'react'

interface RepayLoanParams {
    loanId: string
    contractLoanId: number
    amount: string
}

export function useRepayLoan() {
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })
    const [params, setParams] = useState<RepayLoanParams | null>(null)

    const repayLoan = (params: RepayLoanParams) => {
        setParams(params)
        writeContract({
            address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
            abi: MicroLoanDAOABI,
            functionName: 'repayLoan',
            args: [BigInt(params.contractLoanId)],
            value: BigInt(params.amount)
        })
    }

    useEffect(() => {
        if (isConfirmed && hash && params) {
            fetch('/api/loans/repay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loanId: params.loanId,
                    repaymentTx: hash
                })
            }).then(() => console.log('Synced repayment'))
        }
    }, [isConfirmed, hash, params])

    return { repayLoan, isWritePending, isConfirmed, repayingLoanId: params?.loanId }
}

