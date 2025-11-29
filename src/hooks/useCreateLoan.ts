'use client';

/**
 * useCreateLoan Hook
 * Create loans with comprehensive validation, status tracking, and database sync
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { parseEther, decodeEventLog, formatEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useBalance, useAccount } from 'wagmi';

import MicroLoanDAOABI from '@/abi/MicroLoanDAO.json';
import { MICROLOAN_CONTRACT_ADDRESS } from '@/config';

// Validation constants
const MIN_AMOUNT = 0.001; // Minimum loan amount in ETH
const MAX_AMOUNT = 1000; // Maximum loan amount in ETH
const MIN_DURATION = 1; // Minimum duration in days
const MAX_DURATION = 365; // Maximum duration in days
const MAX_INTEREST_RATE = 100; // Maximum interest rate in percentage
const MIN_INTEREST_RATE = 0.01; // Minimum interest rate
const MIN_PURPOSE_LENGTH = 10;
const MAX_PURPOSE_LENGTH = 500;

export interface CreateLoanParams {
  amount: string;
  duration: string;
  interestRate: string;
  purpose: string;
  address?: string;
  /** Optional collateral address */
  collateralToken?: string;
  /** Optional collateral amount */
  collateralAmount?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
}

export type CreateLoanStatus = 
  | 'idle'
  | 'validating'
  | 'pending_signature'
  | 'confirming'
  | 'syncing'
  | 'success'
  | 'error';

export interface LoanEstimate {
  totalRepayment: string;
  interestAmount: string;
  dailyRepayment: string;
  effectiveAPR: number;
}

export interface UseCreateLoanReturn {
  createLoan: (params: CreateLoanParams) => void;
  status: CreateLoanStatus;
  isWritePending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  writeError: Error | null;
  dbError: Error | null;
  validationErrors: Record<string, string>;
  validationWarnings: string[];
  reset: () => void;
  loanId: number | null;
  transactionHash: string | null;
  estimate: LoanEstimate | null;
  validateParams: (params: CreateLoanParams) => ValidationResult;
  calculateEstimate: (params: CreateLoanParams) => LoanEstimate | null;
  progress: number;
}

/**
 * Validates loan creation parameters with comprehensive checks
 */
function validateLoanParams(
  params: CreateLoanParams,
  userBalance?: bigint
): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  // Validate address
  const address = params.address;
  if (!address) {
    errors.address = 'Wallet address is required';
  } else if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    errors.address = 'Invalid wallet address format';
  }

  // Validate amount
  const amount = parseFloat(params.amount);
  if (!params.amount || params.amount.trim() === '') {
    errors.amount = 'Amount is required';
  } else if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Amount must be a positive number';
  } else if (amount < MIN_AMOUNT) {
    errors.amount = `Minimum loan amount is ${MIN_AMOUNT} ETH`;
  } else if (amount > MAX_AMOUNT) {
    errors.amount = `Maximum loan amount is ${MAX_AMOUNT} ETH`;
  } else {
    // Check against user balance for collateral
    if (userBalance !== undefined) {
      const amountWei = parseEther(params.amount);
      if (amountWei > userBalance) {
        warnings.push('Amount exceeds your current balance');
      }
    }
    // High amount warning
    if (amount > 100) {
      warnings.push('Large loan amounts may take longer to fund');
    }
  }

  // Validate duration
  const duration = parseInt(params.duration, 10);
  if (!params.duration || params.duration.trim() === '') {
    errors.duration = 'Duration is required';
  } else if (isNaN(duration) || duration <= 0) {
    errors.duration = 'Duration must be a positive number';
  } else if (duration < MIN_DURATION) {
    errors.duration = `Minimum duration is ${MIN_DURATION} day`;
  } else if (duration > MAX_DURATION) {
    errors.duration = `Maximum duration is ${MAX_DURATION} days`;
  } else {
    // Duration warnings
    if (duration < 7) {
      warnings.push('Very short loan terms may be difficult to fund');
    }
    if (duration > 180) {
      warnings.push('Long-term loans may require additional collateral');
    }
  }

  // Validate interest rate
  const interestRate = parseFloat(params.interestRate);
  if (!params.interestRate || params.interestRate.trim() === '') {
    errors.interestRate = 'Interest rate is required';
  } else if (isNaN(interestRate) || interestRate < 0) {
    errors.interestRate = 'Interest rate must be a non-negative number';
  } else if (interestRate < MIN_INTEREST_RATE) {
    errors.interestRate = `Minimum interest rate is ${MIN_INTEREST_RATE}%`;
  } else if (interestRate > MAX_INTEREST_RATE) {
    errors.interestRate = `Maximum interest rate is ${MAX_INTEREST_RATE}%`;
  } else {
    // Interest rate warnings
    if (interestRate < 1) {
      warnings.push('Very low interest rates may not attract lenders');
    }
    if (interestRate > 30) {
      warnings.push('High interest rates significantly increase total repayment');
    }
  }

  // Validate purpose
  const purposeTrimmed = params.purpose?.trim() || '';
  if (!purposeTrimmed) {
    errors.purpose = 'Purpose is required';
  } else if (purposeTrimmed.length < MIN_PURPOSE_LENGTH) {
    errors.purpose = `Purpose must be at least ${MIN_PURPOSE_LENGTH} characters`;
  } else if (purposeTrimmed.length > MAX_PURPOSE_LENGTH) {
    errors.purpose = `Purpose cannot exceed ${MAX_PURPOSE_LENGTH} characters`;
  } else {
    // Purpose quality warnings
    if (purposeTrimmed.length < 30) {
      warnings.push('A more detailed purpose may increase funding chances');
    }
  }

  // Validate collateral if provided
  if (params.collateralToken) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(params.collateralToken)) {
      errors.collateralToken = 'Invalid collateral token address';
    }
    if (!params.collateralAmount || parseFloat(params.collateralAmount) <= 0) {
      errors.collateralAmount = 'Collateral amount is required when token is specified';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate loan estimates
 */
function calculateLoanEstimate(params: CreateLoanParams): LoanEstimate | null {
  const amount = parseFloat(params.amount);
  const duration = parseInt(params.duration, 10);
  const interestRate = parseFloat(params.interestRate);

  if (isNaN(amount) || isNaN(duration) || isNaN(interestRate)) {
    return null;
  }

  if (amount <= 0 || duration <= 0) {
    return null;
  }

  // Calculate interest for the period
  const periodInterestRate = (interestRate / 100) * (duration / 365);
  const interestAmount = amount * periodInterestRate;
  const totalRepayment = amount + interestAmount;
  const dailyRepayment = totalRepayment / duration;

  // Calculate effective APR
  const effectiveAPR = (interestRate / duration) * 365;

  return {
    totalRepayment: totalRepayment.toFixed(6),
    interestAmount: interestAmount.toFixed(6),
    dailyRepayment: dailyRepayment.toFixed(6),
    effectiveAPR: Math.round(effectiveAPR * 100) / 100,
  };
}

/**
 * Extracts loan ID from transaction receipt logs
 */
function extractLoanIdFromReceipt(
  logs: readonly { data: `0x${string}`; topics: readonly `0x${string}`[] }[]
): number | null {
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
  const { address: connectedAddress } = useAccount();
  const { data: balanceData } = useBalance({ address: connectedAddress });

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

  const [status, setStatus] = useState<CreateLoanStatus>('idle');
  const [pendingParams, setPendingParams] = useState<CreateLoanParams | null>(null);
  const [dbError, setDbError] = useState<Error | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [loanId, setLoanId] = useState<number | null>(null);
  const [hasSynced, setHasSynced] = useState(false);
  const [estimate, setEstimate] = useState<LoanEstimate | null>(null);

  // Calculate progress percentage
  const progress = useMemo(() => {
    switch (status) {
      case 'idle': return 0;
      case 'validating': return 10;
      case 'pending_signature': return 25;
      case 'confirming': return 50;
      case 'syncing': return 80;
      case 'success': return 100;
      case 'error': return 0;
      default: return 0;
    }
  }, [status]);

  const reset = useCallback(() => {
    setPendingParams(null);
    setDbError(null);
    setValidationErrors({});
    setValidationWarnings([]);
    setLoanId(null);
    setHasSynced(false);
    setEstimate(null);
    setStatus('idle');
    resetWrite();
  }, [resetWrite]);

  // Expose validation function
  const validateParams = useCallback((params: CreateLoanParams): ValidationResult => {
    return validateLoanParams(params, balanceData?.value);
  }, [balanceData?.value]);

  // Expose estimate calculation
  const calculateEstimate = useCallback((params: CreateLoanParams): LoanEstimate | null => {
    return calculateLoanEstimate(params);
  }, []);

  const createLoan = useCallback(
    (params: CreateLoanParams) => {
      // Clear previous state
      setDbError(null);
      setValidationErrors({});
      setValidationWarnings([]);
      setLoanId(null);
      setHasSynced(false);
      setStatus('validating');

      // Use connected address if not provided
      const loanParams: CreateLoanParams = {
        ...params,
        address: params.address || connectedAddress,
      };

      // Validate parameters
      const validation = validateLoanParams(loanParams, balanceData?.value);
      setValidationWarnings(validation.warnings);

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setStatus('error');
        return;
      }

      // Calculate and store estimate
      const loanEstimate = calculateLoanEstimate(loanParams);
      setEstimate(loanEstimate);

      // Store params for database sync after confirmation
      setPendingParams(loanParams);
      setStatus('pending_signature');

      // Convert interest rate to basis points (1% = 100 bps)
      const rateBps = Math.round(parseFloat(loanParams.interestRate) * 100);
      const durationSeconds = parseInt(loanParams.duration, 10) * 24 * 60 * 60;

      // Execute contract write
      writeContract({
        address: MICROLOAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: MicroLoanDAOABI,
        functionName: 'createLoan',
        args: [
          parseEther(loanParams.amount),
          BigInt(durationSeconds),
          BigInt(rateBps),
          loanParams.purpose.trim(),
        ],
      });
    },
    [writeContract, connectedAddress, balanceData?.value]
  );

  // Update status based on transaction state
  useEffect(() => {
    if (writeError) {
      setStatus('error');
    } else if (isConfirming) {
      setStatus('confirming');
    }
  }, [writeError, isConfirming]);

  // Sync to database after transaction confirmation
  useEffect(() => {
    if (!isConfirmed || !receipt || !pendingParams || hasSynced) return;

    const syncToDb = async () => {
      try {
        setHasSynced(true);
        setStatus('syncing');
        
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
        setStatus('success');
      } catch (err) {
        console.error('Database sync error:', err);
        setDbError(err instanceof Error ? err : new Error('Database sync failed'));
        // Still mark as success since blockchain transaction succeeded
        setStatus('success');
      }
    };

    syncToDb();
  }, [isConfirmed, receipt, hash, pendingParams, hasSynced]);

  return {
    createLoan,
    status,
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
    dbError,
    validationErrors,
    validationWarnings,
    reset,
    loanId,
    transactionHash: hash || null,
    estimate,
    validateParams,
    calculateEstimate,
    progress,
  };
}

export { MIN_AMOUNT, MAX_AMOUNT, MIN_DURATION, MAX_DURATION, MAX_INTEREST_RATE };
export default useCreateLoan;
