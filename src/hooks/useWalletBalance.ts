'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance, usePublicClient } from 'wagmi';
import { type Address, formatEther } from 'viem';

interface WalletBalance {
  wei: bigint;
  ether: string;
  formatted: string;
  symbol: string;
}

interface UseWalletBalanceReturn {
  balance: WalletBalance | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

function formatBalance(value: bigint, symbol: string = 'ETH'): WalletBalance {
  const ether = formatEther(value);
  const num = parseFloat(ether);
  
  let formatted: string;
  if (num === 0) formatted = '0';
  else if (num < 0.0001) formatted = '< 0.0001';
  else if (num < 1) formatted = num.toFixed(4);
  else if (num < 1000) formatted = num.toFixed(2);
  else formatted = num.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return { wei: value, ether, formatted: `${formatted} ${symbol}`, symbol };
}

/**
 * Hook for getting connected wallet's native token balance
 */
export function useWalletBalance(): UseWalletBalanceReturn {
  const { address, isConnected } = useAccount();
  const { data, isLoading, error, refetch } = useBalance({
    address,
    query: { enabled: isConnected && !!address },
  });

  const balance = data ? formatBalance(data.value, data.symbol) : null;
  return { balance, isLoading, error: error as Error | null, refetch };
}

/**
 * Hook for getting any address's balance
 */
export function useAddressBalance(targetAddress?: Address): UseWalletBalanceReturn {
  const { data, isLoading, error, refetch } = useBalance({
    address: targetAddress,
    query: { enabled: !!targetAddress },
  });

  const balance = data ? formatBalance(data.value, data.symbol) : null;
  return { balance, isLoading, error: error as Error | null, refetch };
}

/**
 * Hook for watching balance changes
 */
export function useWatchBalance(address?: Address, pollInterval: number = 15000) {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  const fetchBalance = useCallback(async () => {
    if (!address || !publicClient) return;
    try {
      const value = await publicClient.getBalance({ address });
      setBalance(formatBalance(value));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch balance'));
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient]);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, pollInterval);
    return () => clearInterval(interval);
  }, [fetchBalance, pollInterval]);

  return { balance, isLoading, error, refetch: fetchBalance };
}

/**
 * Check if wallet has sufficient balance for loan
 */
export function useHasSufficientBalance(requiredAmount: bigint): {
  hasSufficient: boolean;
  shortfall: bigint;
  isLoading: boolean;
} {
  const { balance, isLoading } = useWalletBalance();
  const hasSufficient = balance ? balance.wei >= requiredAmount : false;
  const shortfall = balance 
    ? (requiredAmount > balance.wei ? requiredAmount - balance.wei : 0n) 
    : requiredAmount;
  return { hasSufficient, shortfall, isLoading };
}

export default useWalletBalance;

