/**
 * Liquidation Service
 * Handle loan liquidations, auction processes, and collateral recovery
 */

import { formatEther, parseEther } from 'viem';

export interface LiquidationCandidate {
  loanId: string;
  borrower: string;
  lender: string;
  collateralValue: bigint;
  debtValue: bigint;
  healthFactor: number;
  liquidationThreshold: number;
  isLiquidatable: boolean;
  bonus: number;
}

export interface LiquidationResult {
  loanId: string;
  liquidator: string;
  collateralSeized: bigint;
  debtRepaid: bigint;
  bonus: bigint;
  timestamp: Date;
  transactionHash?: string;
}

export interface AuctionState {
  loanId: string;
  startTime: Date;
  endTime: Date;
  startingPrice: bigint;
  currentPrice: bigint;
  minimumPrice: bigint;
  highestBidder?: string;
  highestBid?: bigint;
  status: 'active' | 'completed' | 'cancelled';
}

export interface LiquidationConfig {
  liquidationThreshold: number;
  liquidationBonus: number;
  auctionDuration: number;
  priceDecayRate: number;
  minBidIncrement: number;
  gracePeriod: number;
}

// Default configuration
const DEFAULT_CONFIG: LiquidationConfig = {
  liquidationThreshold: 130, // 130% collateral ratio
  liquidationBonus: 5, // 5% bonus for liquidators
  auctionDuration: 86400, // 24 hours
  priceDecayRate: 1, // 1% per hour
  minBidIncrement: 1, // 1% minimum bid increment
  gracePeriod: 3600, // 1 hour grace period
};

// In-memory auction store
const auctions: Map<string, AuctionState> = new Map();
const liquidationHistory: LiquidationResult[] = [];

class LiquidationService {
  private config: LiquidationConfig;

  constructor(config: Partial<LiquidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if a loan is liquidatable
   */
  isLiquidatable(
    collateralValue: bigint,
    debtValue: bigint,
    threshold?: number
  ): boolean {
    if (debtValue === BigInt(0)) return false;
    
    const effectiveThreshold = threshold || this.config.liquidationThreshold;
    const ratio = (Number(collateralValue) / Number(debtValue)) * 100;
    return ratio < effectiveThreshold;
  }

  /**
   * Calculate health factor
   */
  calculateHealthFactor(collateralValue: bigint, debtValue: bigint): number {
    if (debtValue === BigInt(0)) return Infinity;
    return (Number(collateralValue) / Number(debtValue)) * 100;
  }

  /**
   * Get liquidation candidates
   */
  async getLiquidationCandidates(): Promise<LiquidationCandidate[]> {
    // In production, fetch from database/blockchain
    try {
      const response = await fetch('/api/loans/at-risk');
      if (response.ok) {
        const loans = await response.json();
        return loans.map((loan: any) => this.evaluateLiquidationCandidate(loan));
      }
    } catch (error) {
      console.error('Failed to fetch liquidation candidates:', error);
    }
    return [];
  }

  /**
   * Evaluate a single loan for liquidation
   */
  evaluateLiquidationCandidate(loan: {
    id: string;
    borrower: string;
    lender: string;
    collateralValue: string;
    debtValue: string;
  }): LiquidationCandidate {
    const collateralValue = BigInt(loan.collateralValue);
    const debtValue = BigInt(loan.debtValue);
    const healthFactor = this.calculateHealthFactor(collateralValue, debtValue);
    const isLiquidatable = this.isLiquidatable(collateralValue, debtValue);

    return {
      loanId: loan.id,
      borrower: loan.borrower,
      lender: loan.lender,
      collateralValue,
      debtValue,
      healthFactor: Math.round(healthFactor * 100) / 100,
      liquidationThreshold: this.config.liquidationThreshold,
      isLiquidatable,
      bonus: this.config.liquidationBonus,
    };
  }

  /**
   * Calculate liquidation amounts
   */
  calculateLiquidationAmounts(
    collateralValue: bigint,
    debtValue: bigint
  ): { collateralToSeize: bigint; debtToRepay: bigint; bonus: bigint } {
    const bonus = (collateralValue * BigInt(this.config.liquidationBonus)) / BigInt(100);
    const collateralToSeize = collateralValue;
    const debtToRepay = debtValue;

    return {
      collateralToSeize,
      debtToRepay,
      bonus,
    };
  }

  /**
   * Initiate liquidation
   */
  async initiateLiquidation(
    loanId: string,
    liquidator: string
  ): Promise<LiquidationResult | null> {
    // Verify loan is liquidatable
    const candidates = await this.getLiquidationCandidates();
    const candidate = candidates.find(c => c.loanId === loanId);

    if (!candidate || !candidate.isLiquidatable) {
      throw new Error('Loan is not eligible for liquidation');
    }

    const { collateralToSeize, debtToRepay, bonus } = this.calculateLiquidationAmounts(
      candidate.collateralValue,
      candidate.debtValue
    );

    const result: LiquidationResult = {
      loanId,
      liquidator,
      collateralSeized: collateralToSeize,
      debtRepaid: debtToRepay,
      bonus,
      timestamp: new Date(),
    };

    // Store in history
    liquidationHistory.push(result);

    // In production, execute smart contract transaction
    console.log('Liquidation initiated:', result);

    return result;
  }

  /**
   * Start Dutch auction for liquidation
   */
  startAuction(
    loanId: string,
    startingPrice: bigint,
    minimumPrice: bigint
  ): AuctionState {
    if (auctions.has(loanId)) {
      throw new Error('Auction already exists for this loan');
    }

    const now = new Date();
    const auction: AuctionState = {
      loanId,
      startTime: now,
      endTime: new Date(now.getTime() + this.config.auctionDuration * 1000),
      startingPrice,
      currentPrice: startingPrice,
      minimumPrice,
      status: 'active',
    };

    auctions.set(loanId, auction);
    return auction;
  }

  /**
   * Get current auction price (Dutch auction decay)
   */
  getCurrentAuctionPrice(loanId: string): bigint {
    const auction = auctions.get(loanId);
    if (!auction || auction.status !== 'active') {
      throw new Error('No active auction for this loan');
    }

    const now = Date.now();
    const elapsed = (now - auction.startTime.getTime()) / 1000;
    const hoursElapsed = elapsed / 3600;

    // Calculate price decay
    const decayMultiplier = Math.max(
      0,
      1 - (hoursElapsed * this.config.priceDecayRate) / 100
    );

    const currentPrice = BigInt(
      Math.floor(Number(auction.startingPrice) * decayMultiplier)
    );

    // Ensure price doesn't go below minimum
    return currentPrice > auction.minimumPrice ? currentPrice : auction.minimumPrice;
  }

  /**
   * Place bid in auction
   */
  placeBid(loanId: string, bidder: string, amount: bigint): boolean {
    const auction = auctions.get(loanId);
    if (!auction || auction.status !== 'active') {
      throw new Error('No active auction for this loan');
    }

    const currentPrice = this.getCurrentAuctionPrice(loanId);
    
    // For Dutch auction, any bid at or above current price wins
    if (amount >= currentPrice) {
      auction.highestBidder = bidder;
      auction.highestBid = amount;
      auction.status = 'completed';
      return true;
    }

    return false;
  }

  /**
   * Cancel auction (admin only)
   */
  cancelAuction(loanId: string): boolean {
    const auction = auctions.get(loanId);
    if (!auction || auction.status !== 'active') {
      return false;
    }

    auction.status = 'cancelled';
    return true;
  }

  /**
   * Get auction state
   */
  getAuction(loanId: string): AuctionState | null {
    return auctions.get(loanId) || null;
  }

  /**
   * Get all active auctions
   */
  getActiveAuctions(): AuctionState[] {
    return Array.from(auctions.values()).filter(a => a.status === 'active');
  }

  /**
   * Get liquidation history
   */
  getLiquidationHistory(limit: number = 50): LiquidationResult[] {
    return liquidationHistory.slice(-limit);
  }

  /**
   * Get liquidation history for a specific loan
   */
  getLoanLiquidationHistory(loanId: string): LiquidationResult[] {
    return liquidationHistory.filter(l => l.loanId === loanId);
  }

  /**
   * Calculate maximum liquidatable amount
   */
  calculateMaxLiquidation(
    collateralValue: bigint,
    debtValue: bigint,
    closeFactorPercent: number = 50
  ): bigint {
    // Close factor limits how much can be liquidated at once
    const maxLiquidation = (debtValue * BigInt(closeFactorPercent)) / BigInt(100);
    return maxLiquidation;
  }

  /**
   * Get configuration
   */
  getConfig(): LiquidationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (admin only)
   */
  updateConfig(updates: Partial<LiquidationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Format liquidation for display
   */
  formatLiquidation(result: LiquidationResult): {
    collateralSeizedETH: string;
    debtRepaidETH: string;
    bonusETH: string;
  } {
    return {
      collateralSeizedETH: formatEther(result.collateralSeized),
      debtRepaidETH: formatEther(result.debtRepaid),
      bonusETH: formatEther(result.bonus),
    };
  }
}

// Export singleton
export const liquidationService = new LiquidationService();
export { LiquidationService };
export default liquidationService;

