'use client';

import { useState, useEffect, useCallback } from 'react';
import { parseEther, decodeEventLog } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json';
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config';

// Validation constants
const MIN_AMOUNT = 0.001; // Minimum loan amount in ETH
const MAX_AMOUNT = 1000; // Maximum loan amount in ETH
const MIN_DURATION = 1; // Minimum duration in days
const MAX_DURATION = 365; // Maximum duration in days
const MAX_INTEREST_RATE = 100; // Maximum interest rate in percentage
const MIN_PURPOSE_LENGTH = 10;
const MAX_PURPOSE_LENGTH = 500;

interface CreateLoanParams {
  amount: string;
  duration: string;
  interestRate: string;
  purpose: string;
  address: string | undefined;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface UseCreateLoanReturn {
  createLoan: (params: CreateLoanParams) => void;
  isWritePending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  writeError: Error | null;
  dbError: Error | null;
  validationErrors: Record<string, string>;
  reset: () => void;
  loanId: number | null;
}

/**
 * Validates loan creation parameters
 */
function validateLoanParams(params: CreateLoanParams): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate address
  if (!params.address) {
    errors.address = 'Wallet address is required';
  } else if (!/^0x[a-fA-F0-9]{40}$/.test(params.address)) {
    errors.address = 'Invalid wallet address format';
  }

  // Validate amount
  const amount = parseFloat(params.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Amount must be a positive number';
  } else if (amount < MIN_AMOUNT) {
    errors.amount = `Minimum loan amount is ${MIN_AMOUNT} ETH`;
  } else if (amount > MAX_AMOUNT) {
    errors.amount = `Maximum loan amount is ${MAX_AMOUNT} ETH`;
  }

  // Validate duration
  const duration = parseInt(params.duration, 10);
  if (isNaN(duration) || duration <= 0) {
    errors.duration = 'Duration must be a positive number';
  } else if (duration < MIN_DURATION) {
    errors.duration = `Minimum duration is ${MIN_DURATION} day`;
  } else if (duration > MAX_DURATION) {
    errors.duration = `Maximum duration is ${MAX_DURATION} days`;
  }

  // Validate interest rate
  const interestRate = parseFloat(params.interestRate);
  if (isNaN(interestRate) || interestRate < 0) {
    errors.interestRate = 'Interest rate must be a non-negative number';
  } else if (interestRate > MAX_INTEREST_RATE) {
    errors.interestRate = `Maximum interest rate is ${MAX_INTEREST_RATE}%`;
  }

  // Validate purpose
  const purposeTrimmed = params.purpose.trim();
  if (!purposeTrimmed) {
    errors.purpose = 'Purpose is required';
  } else if (purposeTrimmed.length < MIN_PURPOSE_LENGTH) {
    errors.purpose = `Purpose must be at least ${MIN_PURPOSE_LENGTH} characters`;
  } else if (purposeTrimmed.length > MAX_PURPOSE_LENGTH) {
    errors.purpose = `Purpose cannot exceed ${MAX_PURPOSE_LENGTH} characters`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Extracts loan ID from transaction receipt logs
 */
function extractLoanIdFromReceipt(logs: readonly { data: `0x${string}`; topics: readonly `0x${string}`[] }[]): number | null {
  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: MicroLoanDAOABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === 'LoanCreated') {
        // @ts-expect-error - args type is generic from viem
        return Number(decoded.args.id);
      }
    } catch {
      // Ignore logs that don't match our ABI
    }
  }
  return null;
}

/**
 * Hook for creating loans with validation and database sync
 */
export function useCreateLoan(): UseCreateLoanReturn {
  const { 
    writeContract, 
    data: hash, 
    error: writeError, 
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();
  
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    data: receipt,
  } = useWaitForTransactionReceipt({ hash });

  const [pendingParams, setPendingParams] = useState<CreateLoanParams | null>(null);
  const [dbError, setDbError] = useState<Error | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loanId, setLoanId] = useState<number | null>(null);
  const [hasSynced, setHasSynced] = useState(false);

  const reset = useCallback(() => {
    setPendingParams(null);
    setDbError(null);
    setValidationErrors({});
    setLoanId(null);
    setHasSynced(false);
    resetWrite();
  }, [resetWrite]);

  const createLoan = useCallback(
    (params: CreateLoanParams) => {
      // Clear previous state
      setDbError(null);
      setValidationErrors({});
      setLoanId(null);
      setHasSynced(false);

      // Validate parameters
      const validation = validateLoanParams(params);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      // Store params for database sync after confirmation
      setPendingParams(params);

      // Convert interest rate to basis points (1% = 100 bps)
      const rateBps = Math.round(parseFloat(params.interestRate) * 100);
      const durationSeconds = parseInt(params.duration, 10) * 24 * 60 * 60;

      // Execute contract write
      writeContract({
        address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: MicroLoanDAOABI,
        functionName: 'createLoan',
        args: [
          parseEther(params.amount),
          BigInt(durationSeconds),
          BigInt(rateBps),
          params.purpose.trim(),
        ],
      });
    },
    [writeContract]
  );

  // Sync to database after transaction confirmation
  useEffect(() => {
    if (!isConfirmed || !receipt || !pendingParams || hasSynced) return;

    const syncToDb = async () => {
      try {
        setHasSynced(true);
        
        // Extract loan ID from receipt logs
        const extractedLoanId = extractLoanIdFromReceipt(receipt.logs);
        setLoanId(extractedLoanId);

        // Convert values for database
        const rateBps = Math.round(parseFloat(pendingParams.interestRate) * 100);
        const durationSeconds = parseInt(pendingParams.duration, 10) * 24 * 60 * 60;

        const response = await fetch('/api/loans/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            borrowerAddress: pendingParams.address,
            amount: parseEther(pendingParams.amount).toString(),
            purpose: pendingParams.purpose.trim(),
            duration: durationSeconds,
            interestRate: rateBps,
            creationTx: hash,
            contractLoanId: extractedLoanId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to sync loan to database');
        }

        console.log('Loan synced to database with ID:', extractedLoanId);
      } catch (err) {
        console.error('Database sync error:', err);
        setDbError(err instanceof Error ? err : new Error('Database sync failed'));
      }
    };

    syncToDb();
  }, [isConfirmed, receipt, hash, pendingParams, hasSynced]);

  return {
    createLoan,
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
    dbError,
    validationErrors,
    reset,
    loanId,
  };
}

export default useCreateLoan;
