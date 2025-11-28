'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePublicClient, useWaitForTransactionReceipt } from 'wagmi';
import { type Hash } from 'viem';

interface TransactionStatus {
  hash: Hash | null;
  status: 'idle' | 'pending' | 'confirming' | 'success' | 'error';
  confirmations: number;
  error: Error | null;
}

interface UseTransactionStatusReturn extends TransactionStatus {
  track: (hash: Hash) => void;
  reset: () => void;
}

/**
 * Hook for tracking transaction status
 */
export function useTransactionStatus(
  requiredConfirmations: number = 1
): UseTransactionStatusReturn {
  const [hash, setHash] = useState<Hash | null>(null);
  const [confirmations, setConfirmations] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  const { data: receipt, isLoading, isError, error: receiptError } = useWaitForTransactionReceipt({
    hash: hash ?? undefined,
    confirmations: requiredConfirmations,
    query: { enabled: !!hash },
  });

  // Determine status
  let status: TransactionStatus['status'] = 'idle';
  if (hash) {
    if (isLoading) {
      status = confirmations > 0 ? 'confirming' : 'pending';
    } else if (isError || error) {
      status = 'error';
    } else if (receipt) {
      status = receipt.status === 'success' ? 'success' : 'error';
    }
  }

  // Track confirmations
  useEffect(() => {
    if (!hash || !publicClient) return;

    const checkConfirmations = async () => {
      try {
        const tx = await publicClient.getTransactionReceipt({ hash });
        if (tx) {
          const block = await publicClient.getBlockNumber();
          const confs = Number(block - tx.blockNumber);
          setConfirmations(confs);
        }
      } catch {
        // Transaction not yet mined
      }
    };

    const interval = setInterval(checkConfirmations, 2000);
    return () => clearInterval(interval);
  }, [hash, publicClient]);

  // Handle receipt error
  useEffect(() => {
    if (receiptError) {
      setError(receiptError as Error);
    }
  }, [receiptError]);

  const track = useCallback((txHash: Hash) => {
    setHash(txHash);
    setConfirmations(0);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setHash(null);
    setConfirmations(0);
    setError(null);
  }, []);

  return {
    hash,
    status,
    confirmations,
    error,
    track,
    reset,
  };
}

/**
 * Hook for tracking multiple transactions
 */
export function useMultipleTransactionStatus(): {
  transactions: Map<Hash, TransactionStatus>;
  track: (hash: Hash) => void;
  remove: (hash: Hash) => void;
  clear: () => void;
} {
  const [transactions, setTransactions] = useState<Map<Hash, TransactionStatus>>(new Map());

  const track = useCallback((hash: Hash) => {
    setTransactions(prev => {
      const newMap = new Map(prev);
      newMap.set(hash, { hash, status: 'pending', confirmations: 0, error: null });
      return newMap;
    });
  }, []);

  const remove = useCallback((hash: Hash) => {
    setTransactions(prev => {
      const newMap = new Map(prev);
      newMap.delete(hash);
      return newMap;
    });
  }, []);

  const clear = useCallback(() => {
    setTransactions(new Map());
  }, []);

  return { transactions, track, remove, clear };
}

export default useTransactionStatus;

