'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from 'wagmi';

import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json';
import { Loan } from '@/types/loan';
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config';

interface ValidationError {
  code: string;
  message: string;
}

interface UseFundLoanReturn {
  fundLoan: (loan: Loan) => void;
  isWritePending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  fundingLoanId: string | null;
  writeError: Error | null;
  dbError: Error | null;
  validationError: ValidationError | null;
  reset: () => void;
  canFund: (loan: Loan) => boolean;
  getInsufficientAmount: (loan: Loan) => bigint | null;
}

/**
 * Validates loan funding eligibility
 */
function validateFundingEligibility(
  loan: Loan,
  address: string | undefined,
  balance: bigint | undefined
): ValidationError | null {
  // Check if wallet is connected
  if (!address) {
    return {
      code: 'WALLET_NOT_CONNECTED',
      message: 'Please connect your wallet to fund this loan',
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
  if (loan.status !== 'REQUESTED') {
    return {
      code: 'INVALID_STATUS',
      message: `Cannot fund a loan with status: ${loan.status}`,
    };
  }

  // Check if user is the borrower (can't fund own loan)
  if (loan.borrowerAddress.toLowerCase() === address.toLowerCase()) {
    return {
      code: 'SELF_FUND_NOT_ALLOWED',
      message: 'You cannot fund your own loan',
    };
  }

  // Check balance
  const loanAmount = BigInt(loan.amount);
  if (balance !== undefined && balance < loanAmount) {
    return {
      code: 'INSUFFICIENT_BALANCE',
      message: `Insufficient balance. Need ${formatEther(loanAmount)} ETH, have ${formatEther(balance)} ETH`,
    };
  }

  return null;
}

/**
 * Hook for funding loans with validation
 */
export function useFundLoan(): UseFundLoanReturn {
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  
  const [fundingLoanId, setFundingLoanId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [dbError, setDbError] = useState<Error | null>(null);
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
    setFundingLoanId(null);
    setValidationError(null);
    setDbError(null);
    setHasSynced(false);
    resetWrite();
  }, [resetWrite]);

  // Sync to database after confirmation
  useEffect(() => {
    if (!isConfirmed || !fundingLoanId || !hash || !address || hasSynced) return;

    const syncToDb = async () => {
      try {
        setHasSynced(true);
        
        const response = await fetch('/api/loans/fund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loanId: fundingLoanId,
            lenderAddress: address,
            fundingTx: hash,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to sync funding to database');
        }

        console.log('Funding synced to database for loan:', fundingLoanId);
      } catch (err) {
        console.error('Database sync error:', err);
        setDbError(err instanceof Error ? err : new Error('Database sync failed'));
      }
    };

    syncToDb();
  }, [isConfirmed, fundingLoanId, hash, address, hasSynced]);

  /**
   * Check if a loan can be funded
   */
  const canFund = useCallback(
    (loan: Loan): boolean => {
      const error = validateFundingEligibility(loan, address, balanceData?.value);
      return error === null;
    },
    [address, balanceData?.value]
  );

  /**
   * Get the amount needed to fund (returns null if balance is sufficient)
   */
  const getInsufficientAmount = useCallback(
    (loan: Loan): bigint | null => {
      if (!balanceData?.value) return null;
      const loanAmount = BigInt(loan.amount);
      if (balanceData.value >= loanAmount) return null;
      return loanAmount - balanceData.value;
    },
    [balanceData?.value]
  );

  /**
   * Fund a loan
   */
  const fundLoan = useCallback(
    (loan: Loan) => {
      // Clear previous state
      setValidationError(null);
      setDbError(null);
      setHasSynced(false);

      // Validate funding eligibility
      const error = validateFundingEligibility(loan, address, balanceData?.value);
      if (error) {
        setValidationError(error);
        console.error('Funding validation error:', error.message);
        return;
      }

      // Store loan ID for database sync
      setFundingLoanId(loan.id);

      // Execute contract write
      writeContract({
        address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: MicroLoanDAOABI,
        functionName: 'fundLoan',
        args: [BigInt(loan.contractLoanId!)],
        value: BigInt(loan.amount),
      });
    },
    [address, balanceData?.value, writeContract]
  );

  return {
    fundLoan,
    isWritePending,
    isConfirming,
    isConfirmed,
    fundingLoanId,
    writeError,
    dbError,
    validationError,
    reset,
    canFund,
    getInsufficientAmount,
  };
}

export default useFundLoan;
