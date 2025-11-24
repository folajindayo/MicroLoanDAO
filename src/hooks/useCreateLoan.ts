import { useState, useEffect, useCallback } from 'react'
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
    const [dbError, setDbError] = useState<Error | null>(null)

    const createLoan = useCallback(({ amount, duration, interestRate, purpose, address }: CreateLoanParams) => {
        setPendingParams({ amount, duration, interestRate, purpose, address })
        setDbError(null)
        
        const rateBps = Math.round(Number(interestRate) * 100)
        
        writeContract({
            address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
            abi: MicroLoanDAOABI,
            functionName: 'createLoan',
            args: [parseEther(amount), BigInt(Number(duration) * 24 * 60 * 60), BigInt(rateBps), purpose],
        })
    }, [writeContract])

    useEffect(() => {
        if (isConfirmed && receipt && pendingParams) {
            const syncToDb = async () => {
                try {
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

                    const rateBps = Math.round(Number(pendingParams.interestRate) * 100);

                    const res = await fetch('/api/loans/create', {
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
                    })
                    
                    if (!res.ok) {
                        throw new Error('Failed to sync loan to database')
                    }

                    console.log('Synced to DB with ID:', loanId)
                    setPendingParams(null)
                } catch (err) {
                    console.error('DB Sync Error:', err)
                    setDbError(err instanceof Error ? err : new Error('Database sync failed'))
                }
            }

            syncToDb()
        }
    }, [isConfirmed, receipt, hash, pendingParams])

    return { createLoan, isWritePending, isConfirming, isConfirmed, writeError, dbError }
}

