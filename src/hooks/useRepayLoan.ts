'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from 'wagmi';

import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json';
import { Loan } from '@/types/loan';
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config';

interface RepaymentDetails {
  principal: bigint;
  interest: bigint;
  total: bigint;
  principalFormatted: string;
  interestFormatted: string;
  totalFormatted: string;
}

interface ValidationError {
  code: string;
  message: string;
}

interface RepaymentReceipt {
  transactionHash: string;
  loanId: string;
  amount: string;
  timestamp: Date;
}

interface UseRepayLoanReturn {
  repayLoan: (loan: Loan) => void;
  isWritePending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  repayingLoanId: string | null;
  writeError: Error | null;
  dbError: Error | null;
  validationError: ValidationError | null;
  receipt: RepaymentReceipt | null;
  reset: () => void;
  canRepay: (loan: Loan) => boolean;
  calculateRepayment: (loan: Loan) => RepaymentDetails;
  getInsufficientAmount: (loan: Loan) => bigint | null;
}

/**
 * Calculate repayment amount including interest
 * Interest is calculated as: principal * (interestRate / 10000)
 * interestRate is in basis points (100 = 1%)
 */
function calculateRepaymentAmount(loan: Loan): RepaymentDetails {
  const principal = BigInt(loan.amount);
  const interestRate = BigInt(loan.interestRate); // basis points
  
  // Calculate interest: principal * interestRate / 10000
  const interest = (principal * interestRate) / BigInt(10000);
  const total = principal + interest;

  return {
    principal,
    interest,
    total,
    principalFormatted: formatEther(principal),
    interestFormatted: formatEther(interest),
    totalFormatted: formatEther(total),
  };
}

/**
 * Validates loan repayment eligibility
 */
function validateRepaymentEligibility(
  loan: Loan,
  address: string | undefined,
  balance: bigint | undefined
): ValidationError | null {
  // Check if wallet is connected
  if (!address) {
    return {
      code: 'WALLET_NOT_CONNECTED',
      message: 'Please connect your wallet to repay this loan',
    };
  }

  // Check if loan has contract ID
  if (loan.contractLoanId === null || loan.contractLoanId === undefined) {
    return {
      code: 'LOAN_NOT_SYNCED',
      message: 'Loan is not yet synced with the blockchain',
    };
  }

  // Check if loan is in correct status
  if (loan.status !== 'FUNDED') {
    return {
      code: 'INVALID_STATUS',
      message: `Cannot repay a loan with status: ${loan.status}`,
    };
  }

  // Check if user is the borrower
  if (loan.borrowerAddress.toLowerCase() !== address.toLowerCase()) {
    return {
      code: 'NOT_BORROWER',
      message: 'Only the borrower can repay this loan',
    };
  }

  // Check balance
  const repayment = calculateRepaymentAmount(loan);
  if (balance !== undefined && balance < repayment.total) {
    return {
      code: 'INSUFFICIENT_BALANCE',
      message: `Insufficient balance. Need ${repayment.totalFormatted} ETH, have ${formatEther(balance)} ETH`,
    };
  }

  return null;
}

/**
 * Hook for repaying loans with interest calculation and receipt handling
 */
export function useRepayLoan(): UseRepayLoanReturn {
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });

  const [repayingLoanId, setRepayingLoanId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [dbError, setDbError] = useState<Error | null>(null);
  const [receipt, setReceipt] = useState<RepaymentReceipt | null>(null);
  const [currentLoanAmount, setCurrentLoanAmount] = useState<string | null>(null);
  const [hasSynced, setHasSynced] = useState(false);

  const { 
    writeContract, 
    data: hash, 
    isPending: isWritePending, 
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();
  
  const { 
    isSuccess: isConfirmed, 
    isLoading: isConfirming,
  } = useWaitForTransactionReceipt({ hash });

  const reset = useCallback(() => {
    setRepayingLoanId(null);
    setValidationError(null);
    setDbError(null);
    setReceipt(null);
    setCurrentLoanAmount(null);
    setHasSynced(false);
    resetWrite();
  }, [resetWrite]);

  // Sync to database and create receipt after confirmation
  useEffect(() => {
    if (!isConfirmed || !repayingLoanId || !hash || hasSynced) return;

    const syncToDb = async () => {
      try {
        setHasSynced(true);
        
        const response = await fetch('/api/loans/repay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loanId: repayingLoanId,
            repaymentTx: hash,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to sync repayment to database');
        }

        // Create receipt
        setReceipt({
          transactionHash: hash,
          loanId: repayingLoanId,
          amount: currentLoanAmount || '0',
          timestamp: new Date(),
        });

        console.log('Repayment synced to database for loan:', repayingLoanId);
      } catch (err) {
        console.error('Database sync error:', err);
        setDbError(err instanceof Error ? err : new Error('Database sync failed'));
      }
    };

    syncToDb();
  }, [isConfirmed, repayingLoanId, hash, currentLoanAmount, hasSynced]);

  /**
   * Calculate repayment details for a loan
   */
  const calculateRepayment = useCallback((loan: Loan): RepaymentDetails => {
    return calculateRepaymentAmount(loan);
  }, []);

  /**
   * Check if a loan can be repaid
   */
  const canRepay = useCallback(
    (loan: Loan): boolean => {
      const error = validateRepaymentEligibility(loan, address, balanceData?.value);
      return error === null;
    },
    [address, balanceData?.value]
  );

  /**
   * Get the amount needed to repay (returns null if balance is sufficient)
   */
  const getInsufficientAmount = useCallback(
    (loan: Loan): bigint | null => {
      if (!balanceData?.value) return null;
      const repayment = calculateRepaymentAmount(loan);
      if (balanceData.value >= repayment.total) return null;
      return repayment.total - balanceData.value;
    },
    [balanceData?.value]
  );

  /**
   * Repay a loan
   */
  const repayLoan = useCallback(
    (loan: Loan) => {
      // Clear previous state
      setValidationError(null);
      setDbError(null);
      setReceipt(null);
      setHasSynced(false);

      // Validate repayment eligibility
      const error = validateRepaymentEligibility(loan, address, balanceData?.value);
      if (error) {
        setValidationError(error);
        console.error('Repayment validation error:', error.message);
        return;
      }

      // Calculate repayment amount with interest
      const repayment = calculateRepaymentAmount(loan);
      
      // Store loan info for receipt
      setRepayingLoanId(loan.id);
      setCurrentLoanAmount(repayment.totalFormatted);

      // Execute contract write
      writeContract({
        address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: MicroLoanDAOABI,
        functionName: 'repayLoan',
        args: [BigInt(loan.contractLoanId!)],
        value: repayment.total,
      });
    },
    [address, balanceData?.value, writeContract]
  );

  return {
    repayLoan,
    isWritePending,
    isConfirming,
    isConfirmed,
    repayingLoanId,
    writeError,
    dbError,
    validationError,
    receipt,
    reset,
    canRepay,
    calculateRepayment,
    getInsufficientAmount,
  };
}

export default useRepayLoan;
