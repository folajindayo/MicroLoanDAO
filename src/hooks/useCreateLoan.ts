import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, decodeEventLog } from 'viem'
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config'
import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json'

interface CreateLoanParams {
    amount: string
    duration: string
    interestRate: string
    purpose: string
    address: string | undefined
}

export function useCreateLoan() {
    const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({ hash })
    const [pendingParams, setPendingParams] = useState<CreateLoanParams | null>(null)

    const createLoan = ({ amount, duration, interestRate, purpose, address }: CreateLoanParams) => {
        setPendingParams({ amount, duration, interestRate, purpose, address })
        const rateBps = Number(interestRate) * 100
        writeContract({
            address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
            abi: MicroLoanDAOABI,
            functionName: 'createLoan',
            args: [parseEther(amount), BigInt(Number(duration) * 24 * 60 * 60), BigInt(rateBps), purpose],
        })
    }

    useEffect(() => {
        if (isConfirmed && receipt && pendingParams) {
            let loanId = null;
            for (const log of receipt.logs) {
                try {
                    const decoded = decodeEventLog({
                        abi: MicroLoanDAOABI,
                        data: log.data,
                        topics: log.topics
                    })
                    if (decoded.eventName === 'LoanCreated') {
                        // @ts-expect-error args type is generic
                        loanId = Number(decoded.args.id);
                        break;
                    }
                } catch {
                    // Ignore
                }
            }

            const rateBps = Number(pendingParams.interestRate) * 100;

            fetch('/api/loans/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    borrowerAddress: pendingParams.address,
                    amount: parseEther(pendingParams.amount).toString(),
                    purpose: pendingParams.purpose,
                    duration: Number(pendingParams.duration) * 24 * 60 * 60,
                    interestRate: rateBps,
                    creationTx: hash,
                    contractLoanId: loanId
                })
            }).then(() => {
                console.log('Synced to DB with ID:', loanId)
                setPendingParams(null)
            })
        }
    }, [isConfirmed, receipt, hash, pendingParams])

    return { createLoan, isWritePending, isConfirming, isConfirmed, writeError }
}
