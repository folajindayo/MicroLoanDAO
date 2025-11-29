/**
 * useRepayment Hook
 * Manages loan repayment logic and transactions
 */

import { useState, useCallback, useMemo } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contracts';
import { Loan } from '@/types';

export interface RepaymentState {
  isRepaying: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash: string | null;
}

export interface RepaymentScheduleItem {
  id: string;
  dueDate: Date;
  amount: number;
  principal: number;
  interest: number;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: Date;
  txHash?: string;
}

export interface UseRepaymentOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export interface UseRepaymentReturn extends RepaymentState {
  repay: (loanId: string, amount: bigint) => Promise<void>;
  repayFull: (loanId: string) => Promise<void>;
  calculateRepaymentAmount: (loan: Loan) => bigint;
  generateSchedule: (loan: Loan, installments: number) => RepaymentScheduleItem[];
  reset: () => void;
}

/**
 * Calculate simple interest
 */
function calculateInterest(
  principal: bigint,
  ratePercent: number,
  durationDays: number
): bigint {
  // Interest = Principal * Rate * Time
  const rate = BigInt(Math.floor(ratePercent * 100)); // Rate in basis points
  const time = BigInt(durationDays);
  const yearDays = BigInt(365);
  const basisPoints = BigInt(10000);

  return (principal * rate * time) / (yearDays * basisPoints);
}

/**
 * Hook for managing loan repayments
 */
export function useRepayment(
  options: UseRepaymentOptions = {}
): UseRepaymentReturn {
  const { onSuccess, onError } = options;
  const { address } = useAccount();

  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Contract write
  const {
    writeContract,
    isPending: isWritePending,
    data: writeData,
    reset: resetWrite,
  } = useWriteContract();

  // Transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Repay specific amount
  const repay = useCallback(async (loanId: string, amount: bigint) => {
    if (!address) {
      const err = new Error('Wallet not connected');
      setError(err);
      onError?.(err);
      return;
    }

    setError(null);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'repayLoan',
        args: [BigInt(loanId)],
        value: amount,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Repayment failed');
      setError(error);
      onError?.(error);
    }
  }, [address, writeContract, onError]);

  // Repay full amount
  const repayFull = useCallback(async (loanId: string) => {
    // Fetch loan details to get full repayment amount
    try {
      const response = await fetch(`/api/loans/${loanId}`);
      if (!response.ok) throw new Error('Failed to fetch loan');
      
      const loan = await response.json();
      const totalAmount = calculateRepaymentAmount(loan);
      
      await repay(loanId, totalAmount);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to calculate repayment');
      setError(error);
      onError?.(error);
    }
  }, [repay, onError]);

  // Calculate total repayment amount
  const calculateRepaymentAmount = useCallback((loan: Loan): bigint => {
    const principal = BigInt(loan.amount);
    const interest = calculateInterest(
      principal,
      Number(loan.interestRate),
      Number(loan.duration)
    );
    return principal + interest;
  }, []);

  // Generate repayment schedule
  const generateSchedule = useCallback((
    loan: Loan,
    installments: number
  ): RepaymentScheduleItem[] => {
    const principal = Number(loan.amount);
    const totalInterest = principal * (Number(loan.interestRate) / 100) * (Number(loan.duration) / 365);
    const totalAmount = principal + totalInterest;
    const installmentAmount = totalAmount / installments;
    const installmentPrincipal = principal / installments;
    const installmentInterest = totalInterest / installments;
    
    const startDate = loan.createdAt ? new Date(loan.createdAt) : new Date();
    const durationDays = Number(loan.duration);
    const intervalDays = durationDays / installments;
    const now = new Date();

    return Array.from({ length: installments }, (_, i) => {
      const dueDate = new Date(startDate.getTime() + intervalDays * (i + 1) * 24 * 60 * 60 * 1000);
      const isPast = now > dueDate;
      
      return {
        id: `${loan.id}-${i + 1}`,
        dueDate,
        amount: installmentAmount,
        principal: installmentPrincipal,
        interest: installmentInterest,
        status: isPast && loan.status !== 'COMPLETED' ? 'overdue' : 
                loan.status === 'COMPLETED' ? 'paid' : 'pending',
      };
    });
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setError(null);
    setTxHash(null);
    resetWrite();
  }, [resetWrite]);

  // Update txHash when write completes
  useMemo(() => {
    if (writeData) {
      setTxHash(writeData);
      onSuccess?.(writeData);
    }
  }, [writeData, onSuccess]);

  return {
    isRepaying: isWritePending || isConfirming,
    isPending: isWritePending,
    isConfirming,
    isSuccess,
    error,
    txHash,
    repay,
    repayFull,
    calculateRepaymentAmount,
    generateSchedule,
    reset,
  };
}

export default useRepayment;

