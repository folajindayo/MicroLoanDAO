/**
 * Collateral Service
 * Manage collateral assets, valuations, and liquidation thresholds
 */

import { formatEther, parseEther } from 'viem';

export interface CollateralAsset {
  tokenAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  amount: bigint;
  valueUSD: number;
  valueETH: number;
  liquidationThreshold: number;
  ltv: number;
  isSupported: boolean;
}

export interface CollateralPosition {
  loanId: string;
  borrower: string;
  assets: CollateralAsset[];
  totalValueUSD: number;
  totalValueETH: number;
  healthFactor: number;
  liquidationPrice: number;
  isAtRisk: boolean;
}

export interface CollateralRequirement {
  minCollateralRatio: number;
  liquidationThreshold: number;
  liquidationPenalty: number;
  maxLTV: number;
}

interface PriceData {
  [symbol: string]: {
    usd: number;
    eth: number;
  };
}

// Supported collateral tokens
const SUPPORTED_TOKENS: Record<string, { symbol: string; name: string; decimals: number; ltv: number; liquidationThreshold: number }> = {
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, ltv: 80, liquidationThreshold: 85 },
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, ltv: 70, liquidationThreshold: 75 },
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': { symbol: 'USDC', name: 'USD Coin', decimals: 6, ltv: 85, liquidationThreshold: 90 },
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': { symbol: 'USDT', name: 'Tether', decimals: 6, ltv: 85, liquidationThreshold: 90 },
  '0x6B175474E89094C44Da98b954EescdeCB5C7cB3d4': { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, ltv: 85, liquidationThreshold: 90 },
};

// Default requirements
const DEFAULT_REQUIREMENTS: CollateralRequirement = {
  minCollateralRatio: 150,
  liquidationThreshold: 130,
  liquidationPenalty: 10,
  maxLTV: 75,
};

// Price cache
let priceCache: PriceData = {};
let priceCacheTimestamp = 0;
const PRICE_CACHE_TTL = 60000; // 1 minute

class CollateralService {
  private requirements: CollateralRequirement;

  constructor(requirements: Partial<CollateralRequirement> = {}) {
    this.requirements = { ...DEFAULT_REQUIREMENTS, ...requirements };
  }

  /**
   * Check if a token is supported as collateral
   */
  isTokenSupported(tokenAddress: string): boolean {
    return tokenAddress.toLowerCase() in this.getSupportedTokens();
  }

  /**
   * Get supported collateral tokens
   */
  getSupportedTokens(): typeof SUPPORTED_TOKENS {
    const normalized: typeof SUPPORTED_TOKENS = {};
    for (const [address, data] of Object.entries(SUPPORTED_TOKENS)) {
      normalized[address.toLowerCase()] = data;
    }
    return normalized;
  }

  /**
   * Fetch current prices for tokens
   */
  async fetchPrices(symbols: string[]): Promise<PriceData> {
    const now = Date.now();
    if (now - priceCacheTimestamp < PRICE_CACHE_TTL && Object.keys(priceCache).length > 0) {
      return priceCache;
    }

    try {
      // Fetch from CoinGecko or similar API
      const ids = symbols.map(s => s.toLowerCase()).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,eth`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();
      priceCache = data;
      priceCacheTimestamp = now;
      return data;
    } catch (error) {
      console.error('Price fetch error:', error);
      // Return cached data if available, otherwise mock data
      if (Object.keys(priceCache).length > 0) {
        return priceCache;
      }
      // Mock prices for development
      return {
        ethereum: { usd: 2000, eth: 1 },
        'wrapped-bitcoin': { usd: 45000, eth: 22.5 },
        'usd-coin': { usd: 1, eth: 0.0005 },
        tether: { usd: 1, eth: 0.0005 },
        dai: { usd: 1, eth: 0.0005 },
      };
    }
  }

  /**
   * Calculate collateral value for a single asset
   */
  async calculateAssetValue(
    tokenAddress: string,
    amount: bigint
  ): Promise<{ valueUSD: number; valueETH: number }> {
    const normalizedAddress = tokenAddress.toLowerCase();
    const tokenInfo = this.getSupportedTokens()[normalizedAddress];

    if (!tokenInfo) {
      return { valueUSD: 0, valueETH: 0 };
    }

    const prices = await this.fetchPrices([tokenInfo.symbol.toLowerCase()]);
    const priceData = prices[tokenInfo.symbol.toLowerCase()] || { usd: 0, eth: 0 };

    const decimals = tokenInfo.decimals;
    const amountNormalized = Number(amount) / Math.pow(10, decimals);

    return {
      valueUSD: amountNormalized * priceData.usd,
      valueETH: amountNormalized * priceData.eth,
    };
  }

  /**
   * Get complete collateral position for a loan
   */
  async getCollateralPosition(
    loanId: string,
    borrower: string,
    collateralData: Array<{ tokenAddress: string; amount: bigint }>,
    loanAmount: bigint
  ): Promise<CollateralPosition> {
    const assets: CollateralAsset[] = [];
    let totalValueUSD = 0;
    let totalValueETH = 0;

    for (const { tokenAddress, amount } of collateralData) {
      const normalizedAddress = tokenAddress.toLowerCase();
      const tokenInfo = this.getSupportedTokens()[normalizedAddress];

      if (!tokenInfo) continue;

      const { valueUSD, valueETH } = await this.calculateAssetValue(tokenAddress, amount);
      totalValueUSD += valueUSD;
      totalValueETH += valueETH;

      assets.push({
        tokenAddress,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        decimals: tokenInfo.decimals,
        amount,
        valueUSD,
        valueETH,
        liquidationThreshold: tokenInfo.liquidationThreshold,
        ltv: tokenInfo.ltv,
        isSupported: true,
      });
    }

    const loanValueETH = Number(formatEther(loanAmount));
    const healthFactor = loanValueETH > 0 ? totalValueETH / loanValueETH : Infinity;
    const liquidationPrice = this.calculateLiquidationPrice(totalValueETH, loanValueETH);
    const isAtRisk = healthFactor < this.requirements.liquidationThreshold / 100;

    return {
      loanId,
      borrower,
      assets,
      totalValueUSD,
      totalValueETH,
      healthFactor: Math.round(healthFactor * 100) / 100,
      liquidationPrice,
      isAtRisk,
    };
  }

  /**
   * Calculate required collateral for a loan amount
   */
  calculateRequiredCollateral(loanAmount: bigint): bigint {
    const ratio = this.requirements.minCollateralRatio;
    return (loanAmount * BigInt(ratio)) / BigInt(100);
  }

  /**
   * Calculate maximum borrowable amount for given collateral
   */
  calculateMaxBorrowable(collateralValue: bigint): bigint {
    const maxLTV = this.requirements.maxLTV;
    return (collateralValue * BigInt(maxLTV)) / BigInt(100);
  }

  /**
   * Calculate liquidation price
   */
  calculateLiquidationPrice(collateralValueETH: number, loanValueETH: number): number {
    if (collateralValueETH <= 0) return 0;
    const threshold = this.requirements.liquidationThreshold / 100;
    return (loanValueETH * threshold) / collateralValueETH;
  }

  /**
   * Check if position is healthy
   */
  isPositionHealthy(healthFactor: number): boolean {
    return healthFactor >= this.requirements.liquidationThreshold / 100;
  }

  /**
   * Calculate liquidation penalty
   */
  calculateLiquidationPenalty(collateralValue: bigint): bigint {
    const penalty = this.requirements.liquidationPenalty;
    return (collateralValue * BigInt(penalty)) / BigInt(100);
  }

  /**
   * Get collateral requirements
   */
  getRequirements(): CollateralRequirement {
    return { ...this.requirements };
  }

  /**
   * Update collateral requirements (admin only)
   */
  updateRequirements(updates: Partial<CollateralRequirement>): void {
    this.requirements = { ...this.requirements, ...updates };
  }

  /**
   * Validate collateral for a loan request
   */
  async validateCollateral(
    collateralData: Array<{ tokenAddress: string; amount: bigint }>,
    loanAmount: bigint
  ): Promise<{ isValid: boolean; message: string; details: { ratio: number; required: number } }> {
    let totalValueETH = 0;

    for (const { tokenAddress, amount } of collateralData) {
      if (!this.isTokenSupported(tokenAddress)) {
        return {
          isValid: false,
          message: `Token ${tokenAddress} is not supported as collateral`,
          details: { ratio: 0, required: this.requirements.minCollateralRatio },
        };
      }

      const { valueETH } = await this.calculateAssetValue(tokenAddress, amount);
      totalValueETH += valueETH;
    }

    const loanValueETH = Number(formatEther(loanAmount));
    const ratio = loanValueETH > 0 ? (totalValueETH / loanValueETH) * 100 : 0;
    const isValid = ratio >= this.requirements.minCollateralRatio;

    return {
      isValid,
      message: isValid
        ? 'Collateral is sufficient'
        : `Insufficient collateral. Required: ${this.requirements.minCollateralRatio}%, Current: ${ratio.toFixed(2)}%`,
      details: {
        ratio: Math.round(ratio * 100) / 100,
        required: this.requirements.minCollateralRatio,
      },
    };
  }
}

// Export singleton instance
export const collateralService = new CollateralService();

// Export class for custom instances
export { CollateralService };
export default collateralService;

