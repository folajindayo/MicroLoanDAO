import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'
import { parseEther, decodeEventLog } from 'viem'
import { useState, useEffect } from 'react'

interface CreateLoanParams {
    amount: string
    duration: string
    interestRate: string
    purpose: string
    address?: string
}

export function useCreateLoan() {
    const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({ hash })
    const [params, setParams] = useState<CreateLoanParams | null>(null)

    const createLoan = (params: CreateLoanParams) => {
        setParams(params)
        const rateBps = Number(params.interestRate) * 100
        writeContract({
            address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
            abi: MicroLoanDAOABI,
            functionName: 'createLoan',
            args: [parseEther(params.amount), BigInt(Number(params.duration) * 24 * 60 * 60), BigInt(rateBps), params.purpose],
        })
    }

    useEffect(() => {
        if (isConfirmed && receipt && params && params.address) {
            let loanId = null
            for (const log of receipt.logs) {
                try {
                    const decoded = decodeEventLog({
                        abi: MicroLoanDAOABI,
                        data: log.data,
                        topics: log.topics
                    })
                    if (decoded.eventName === 'LoanCreated') {
                        // @ts-expect-error args type is generic
                        loanId = Number(decoded.args.id)
                        break
                    }
                } catch {
                    // Ignore
                }
            }

            const rateBps = Number(params.interestRate) * 100;

            fetch('/api/loans/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    borrowerAddress: params.address,
                    amount: parseEther(params.amount).toString(),
                    purpose: params.purpose,
                    duration: Number(params.duration) * 24 * 60 * 60,
                    interestRate: rateBps,
                    creationTx: hash,
                    contractLoanId: loanId
                })
            }).then(() => console.log('Synced creation'))
        }
    }, [isConfirmed, receipt, hash, params])

    return { createLoan, isWritePending, isConfirming, isConfirmed, writeError }
}

