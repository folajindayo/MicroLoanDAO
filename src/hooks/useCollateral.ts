/**
 * useCollateral Hook
 * Manages collateral deposits and withdrawals
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contracts';

export interface CollateralAsset {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: bigint;
  balanceUSD: number;
  priceUSD: number;
  isApproved: boolean;
  allowance: bigint;
}

export interface CollateralState {
  assets: CollateralAsset[];
  totalValueUSD: number;
  isLoading: boolean;
  error: Error | null;
}

export interface UseCollateralOptions {
  requiredCollateralRatio?: number;
  supportedAssets?: string[];
  onDepositSuccess?: (txHash: string) => void;
  onWithdrawSuccess?: (txHash: string) => void;
}

export interface UseCollateralReturn extends CollateralState {
  deposit: (loanId: string, assetAddress: string, amount: bigint) => Promise<void>;
  withdraw: (loanId: string, assetAddress: string, amount: bigint) => Promise<void>;
  approve: (assetAddress: string, amount: bigint) => Promise<void>;
  calculateRequiredCollateral: (loanAmount: number, ratio?: number) => number;
  getHealthFactor: (loanAmount: number) => number;
  getLiquidationPrice: (loanAmount: number) => number;
  isDepositPending: boolean;
  isWithdrawPending: boolean;
  isApprovePending: boolean;
  refresh: () => Promise<void>;
}

// Mock price data - in production, fetch from oracle
const ASSET_PRICES: Record<string, number> = {
  'ETH': 2000,
  'WETH': 2000,
  'WBTC': 40000,
  'USDC': 1,
  'USDT': 1,
  'DAI': 1,
};

/**
 * Hook for managing collateral
 */
export function useCollateral(
  loanId?: string,
  options: UseCollateralOptions = {}
): UseCollateralReturn {
  const {
    requiredCollateralRatio = 150,
    onDepositSuccess,
    onWithdrawSuccess,
  } = options;

  const { address } = useAccount();
  const { data: ethBalance } = useBalance({ address });

  const [assets, setAssets] = useState<CollateralAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Contract interactions
  const {
    writeContract: depositWrite,
    isPending: isDepositPending,
    data: depositData,
  } = useWriteContract();

  const {
    writeContract: withdrawWrite,
    isPending: isWithdrawPending,
    data: withdrawData,
  } = useWriteContract();

  const {
    writeContract: approveWrite,
    isPending: isApprovePending,
  } = useWriteContract();

  // Wait for deposit confirmation
  const { isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositData,
  });

  // Wait for withdraw confirmation
  const { isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawData,
  });

  // Calculate total value
  const totalValueUSD = useMemo(
    () => assets.reduce((sum, asset) => sum + asset.balanceUSD, 0),
    [assets]
  );

  // Fetch collateral assets
  const fetchAssets = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build asset list with ETH balance
      const ethAsset: CollateralAsset = {
        symbol: 'ETH',
        name: 'Ethereum',
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        balance: ethBalance?.value || BigInt(0),
        balanceUSD: Number(ethBalance?.formatted || 0) * ASSET_PRICES['ETH'],
        priceUSD: ASSET_PRICES['ETH'],
        isApproved: true,
        allowance: BigInt(0),
      };

      setAssets([ethAsset]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch assets'));
    } finally {
      setIsLoading(false);
    }
  }, [address, ethBalance]);

  // Deposit collateral
  const deposit = useCallback(async (
    loanId: string,
    assetAddress: string,
    amount: bigint
  ) => {
    if (!address) throw new Error('Wallet not connected');

    try {
      depositWrite({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'depositCollateral',
        args: [BigInt(loanId)],
        value: amount,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Deposit failed'));
      throw err;
    }
  }, [address, depositWrite]);

  // Withdraw collateral
  const withdraw = useCallback(async (
    loanId: string,
    assetAddress: string,
    amount: bigint
  ) => {
    if (!address) throw new Error('Wallet not connected');

    try {
      withdrawWrite({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'withdrawCollateral',
        args: [BigInt(loanId), amount],
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Withdraw failed'));
      throw err;
    }
  }, [address, withdrawWrite]);

  // Approve token spending
  const approve = useCallback(async (
    assetAddress: string,
    amount: bigint
  ) => {
    if (!address) throw new Error('Wallet not connected');

    try {
      approveWrite({
        address: assetAddress as `0x${string}`,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ type: 'bool' }],
          },
        ],
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, amount],
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Approval failed'));
      throw err;
    }
  }, [address, approveWrite]);

  // Calculate required collateral for loan
  const calculateRequiredCollateral = useCallback((
    loanAmount: number,
    ratio: number = requiredCollateralRatio
  ): number => {
    return (loanAmount * ratio) / 100;
  }, [requiredCollateralRatio]);

  // Calculate health factor
  const getHealthFactor = useCallback((loanAmount: number): number => {
    if (loanAmount === 0) return Infinity;
    const threshold = requiredCollateralRatio / 100;
    return totalValueUSD / (loanAmount * threshold);
  }, [totalValueUSD, requiredCollateralRatio]);

  // Calculate liquidation price
  const getLiquidationPrice = useCallback((loanAmount: number): number => {
    if (assets.length === 0) return 0;
    const totalTokens = assets.reduce((sum, a) => sum + Number(a.balance) / Math.pow(10, a.decimals), 0);
    if (totalTokens === 0) return 0;
    
    const requiredValue = (loanAmount * requiredCollateralRatio) / 100;
    return requiredValue / totalTokens;
  }, [assets, requiredCollateralRatio]);

  // Handle success callbacks
  useEffect(() => {
    if (isDepositSuccess && depositData) {
      onDepositSuccess?.(depositData);
      fetchAssets();
    }
  }, [isDepositSuccess, depositData, onDepositSuccess, fetchAssets]);

  useEffect(() => {
    if (isWithdrawSuccess && withdrawData) {
      onWithdrawSuccess?.(withdrawData);
      fetchAssets();
    }
  }, [isWithdrawSuccess, withdrawData, onWithdrawSuccess, fetchAssets]);

  // Initial fetch
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    totalValueUSD,
    isLoading,
    error,
    deposit,
    withdraw,
    approve,
    calculateRequiredCollateral,
    getHealthFactor,
    getLiquidationPrice,
    isDepositPending,
    isWithdrawPending,
    isApprovePending,
    refresh: fetchAssets,
  };
}

export default useCollateral;

