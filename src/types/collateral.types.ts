/**
 * Collateral Types
 * Type definitions for collateral management
 */

import { type Address } from 'viem';

/**
 * Collateral asset type
 */
export type CollateralAssetType = 'ERC20' | 'ERC721' | 'ERC1155' | 'Native';

/**
 * Collateral status
 */
export type CollateralStatus = 
  | 'pending'
  | 'locked'
  | 'released'
  | 'liquidated'
  | 'withdrawn';

/**
 * Collateral asset
 */
export interface CollateralAsset {
  id: string;
  type: CollateralAssetType;
  contractAddress: Address;
  tokenId?: bigint;
  amount: bigint;
  amountFormatted: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

/**
 * Collateral valuation
 */
export interface CollateralValuation {
  asset: CollateralAsset;
  priceUSD: number;
  valueUSD: number;
  lastUpdated: Date;
  source: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Collateral requirement
 */
export interface CollateralRequirement {
  loanId: bigint;
  minimumRatio: number;
  currentRatio: number;
  requiredValue: number;
  currentValue: number;
  healthFactor: number;
  isHealthy: boolean;
  warningThreshold: number;
  liquidationThreshold: number;
}

/**
 * Collateral deposit
 */
export interface CollateralDeposit {
  id: string;
  loanId: bigint;
  depositor: Address;
  asset: CollateralAsset;
  status: CollateralStatus;
  depositedAt: Date;
  transactionHash: string;
}

/**
 * Collateral withdrawal request
 */
export interface CollateralWithdrawal {
  id: string;
  loanId: bigint;
  requester: Address;
  asset: CollateralAsset;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: Date;
  processedAt?: Date;
  transactionHash?: string;
}

/**
 * Liquidation event
 */
export interface LiquidationEvent {
  id: string;
  loanId: bigint;
  collateral: CollateralAsset;
  liquidator: Address;
  liquidatedValue: number;
  debtRepaid: number;
  penalty: number;
  timestamp: Date;
  transactionHash: string;
}

/**
 * Collateral price feed
 */
export interface CollateralPriceFeed {
  asset: CollateralAsset;
  price: number;
  roundId: bigint;
  answeredAt: Date;
  decimals: number;
  description: string;
}

/**
 * Supported collateral token
 */
export interface SupportedCollateralToken {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  type: CollateralAssetType;
  isActive: boolean;
  minimumDeposit: bigint;
  maximumDeposit: bigint;
  liquidationPenalty: number;
  collateralFactor: number;
  priceFeedAddress?: Address;
}

/**
 * Collateral summary
 */
export interface CollateralSummary {
  totalValueUSD: number;
  assets: CollateralValuation[];
  healthFactor: number;
  safeWithdrawable: number;
  atRisk: boolean;
  liquidationPrice?: number;
}

/**
 * Collateral history item
 */
export interface CollateralHistoryItem {
  id: string;
  loanId: bigint;
  action: 'deposit' | 'withdraw' | 'liquidation' | 'top_up';
  asset: CollateralAsset;
  amount: bigint;
  valueUSD: number;
  timestamp: Date;
  transactionHash: string;
}

/**
 * Collateral analytics
 */
export interface CollateralAnalytics {
  totalLockedValue: number;
  averageCollateralRatio: number;
  totalLiquidations: number;
  liquidationVolume: number;
  mostUsedAssets: Array<{
    asset: SupportedCollateralToken;
    count: number;
    totalValue: number;
  }>;
  healthDistribution: {
    healthy: number;
    warning: number;
    atRisk: number;
  };
}

