import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'
import { useEffect, useState } from 'react'

interface FundLoanParams {
    loanId: string
    contractLoanId: number
    amount: string
    lenderAddress?: string
}

export function useFundLoan() {
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })
    const [params, setParams] = useState<FundLoanParams | null>(null)

    const fundLoan = (params: FundLoanParams) => {
        setParams(params)
        writeContract({
            address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
            abi: MicroLoanDAOABI,
            functionName: 'fundLoan',
            args: [BigInt(params.contractLoanId)],
            value: BigInt(params.amount)
        })
    }

    useEffect(() => {
        if (isConfirmed && hash && params && params.lenderAddress) {
            fetch('/api/loans/fund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loanId: params.loanId,
                    lenderAddress: params.lenderAddress,
                    fundingTx: hash
                })
            }).then(() => console.log('Synced funding'))
        }
    }, [isConfirmed, hash, params])

    return { fundLoan, isWritePending, isConfirmed, hash, fundingLoanId: params?.loanId }
}

