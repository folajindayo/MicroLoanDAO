/**
 * Liquidation Service
 * Handle loan liquidation operations
 */

import { type Address } from 'viem';

export interface LiquidationCandidate {
  loanId: bigint;
  borrower: Address;
  collateralValue: bigint;
  debtValue: bigint;
  healthFactor: number;
  collateralRatio: number;
  liquidationThreshold: number;
  maxLiquidatableDebt: bigint;
  liquidationBonus: number;
  collateralAsset: string;
  debtAsset: string;
}

export interface LiquidationParams {
  loanId: bigint;
  debtAmount: bigint;
  liquidator: Address;
  receiveCollateral: boolean;
}

export interface LiquidationResult {
  loanId: bigint;
  debtRepaid: bigint;
  collateralReceived: bigint;
  liquidationBonus: bigint;
  transactionHash: string;
  timestamp: Date;
}

export interface LiquidationConfig {
  liquidationThreshold: number;
  liquidationBonus: number;
  maxLiquidationRatio: number;
  protocolFee: number;
  gracePeriod: number;
}

export interface LiquidationAuction {
  id: string;
  loanId: bigint;
  collateralAmount: bigint;
  startingPrice: bigint;
  currentPrice: bigint;
  minPrice: bigint;
  duration: number;
  startTime: Date;
  endTime: Date;
  highestBidder?: Address;
  status: 'active' | 'completed' | 'cancelled';
}

class LiquidationService {
  private config: LiquidationConfig = {
    liquidationThreshold: 150, // 150% collateral ratio
    liquidationBonus: 5, // 5% bonus for liquidators
    maxLiquidationRatio: 50, // Can liquidate up to 50% of debt
    protocolFee: 1, // 1% protocol fee
    gracePeriod: 24 * 60 * 60, // 24 hours grace period
  };

  private liquidations: Map<string, LiquidationResult> = new Map();
  private auctions: Map<string, LiquidationAuction> = new Map();

  async getLiquidationCandidates(): Promise<LiquidationCandidate[]> {
    // In production, fetch from blockchain/indexer
    const mockCandidates: LiquidationCandidate[] = [
      {
        loanId: BigInt(1),
        borrower: '0x1234567890123456789012345678901234567890' as Address,
        collateralValue: BigInt('1400000000000000000'), // 1.4 ETH
        debtValue: BigInt('1000000000'), // 1000 USDC
        healthFactor: 0.98,
        collateralRatio: 140,
        liquidationThreshold: 150,
        maxLiquidatableDebt: BigInt('500000000'),
        liquidationBonus: 5,
        collateralAsset: 'ETH',
        debtAsset: 'USDC',
      },
    ];

    return mockCandidates.filter(c => c.healthFactor < 1);
  }

  async checkLiquidationEligibility(loanId: bigint): Promise<{
    isEligible: boolean;
    healthFactor: number;
    reason?: string;
  }> {
    // In production, check on-chain
    const candidate = (await this.getLiquidationCandidates())
      .find(c => c.loanId === loanId);

    if (!candidate) {
      return {
        isEligible: false,
        healthFactor: 1.5,
        reason: 'Loan not found or healthy',
      };
    }

    const isEligible = candidate.healthFactor < 1;

    return {
      isEligible,
      healthFactor: candidate.healthFactor,
      reason: isEligible ? undefined : 'Health factor above threshold',
    };
  }

  async calculateLiquidationAmount(
    loanId: bigint,
    debtAmount: bigint
  ): Promise<{
    debtToRepay: bigint;
    collateralToReceive: bigint;
    bonus: bigint;
    protocolFee: bigint;
    netCollateral: bigint;
  }> {
    const candidate = (await this.getLiquidationCandidates())
      .find(c => c.loanId === loanId);

    if (!candidate) {
      throw new Error('Loan not eligible for liquidation');
    }

    // Cap at max liquidatable amount
    const maxLiquidatable = (candidate.debtValue * BigInt(this.config.maxLiquidationRatio)) / BigInt(100);
    const debtToRepay = debtAmount > maxLiquidatable ? maxLiquidatable : debtAmount;

    // Calculate collateral value
    const collateralPrice = Number(candidate.collateralValue) / Number(candidate.debtValue);
    const baseCollateral = BigInt(Math.floor(Number(debtToRepay) * collateralPrice));

    // Add liquidation bonus
    const bonus = (baseCollateral * BigInt(this.config.liquidationBonus)) / BigInt(100);
    const protocolFee = (bonus * BigInt(this.config.protocolFee)) / BigInt(this.config.liquidationBonus);

    return {
      debtToRepay,
      collateralToReceive: baseCollateral + bonus,
      bonus,
      protocolFee,
      netCollateral: baseCollateral + bonus - protocolFee,
    };
  }

  async executeLiquidation(params: LiquidationParams): Promise<LiquidationResult> {
    const eligibility = await this.checkLiquidationEligibility(params.loanId);
    
    if (!eligibility.isEligible) {
      throw new Error(`Loan not eligible: ${eligibility.reason}`);
    }

    const calculation = await this.calculateLiquidationAmount(params.loanId, params.debtAmount);

    // In production, execute blockchain transaction
    await this.simulateBlockchainDelay();

    const result: LiquidationResult = {
      loanId: params.loanId,
      debtRepaid: calculation.debtToRepay,
      collateralReceived: calculation.netCollateral,
      liquidationBonus: calculation.bonus,
      transactionHash: `0x${Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`,
      timestamp: new Date(),
    };

    this.liquidations.set(result.transactionHash, result);
    return result;
  }

  async startDutchAuction(loanId: bigint): Promise<LiquidationAuction> {
    const candidate = (await this.getLiquidationCandidates())
      .find(c => c.loanId === loanId);

    if (!candidate) {
      throw new Error('Loan not eligible for auction');
    }

    const auctionId = `auction_${Date.now()}`;
    const now = new Date();
    const duration = 6 * 60 * 60; // 6 hours

    const auction: LiquidationAuction = {
      id: auctionId,
      loanId,
      collateralAmount: candidate.collateralValue,
      startingPrice: candidate.collateralValue,
      currentPrice: candidate.collateralValue,
      minPrice: (candidate.collateralValue * BigInt(70)) / BigInt(100), // 70% minimum
      duration,
      startTime: now,
      endTime: new Date(now.getTime() + duration * 1000),
      status: 'active',
    };

    this.auctions.set(auctionId, auction);
    return auction;
  }

  async getAuction(auctionId: string): Promise<LiquidationAuction | null> {
    return this.auctions.get(auctionId) || null;
  }

  async getActiveAuctions(): Promise<LiquidationAuction[]> {
    return Array.from(this.auctions.values())
      .filter(a => a.status === 'active');
  }

  async placeBid(auctionId: string, bidder: Address, amount: bigint): Promise<boolean> {
    const auction = this.auctions.get(auctionId);
    
    if (!auction || auction.status !== 'active') {
      throw new Error('Auction not active');
    }

    const currentPrice = this.calculateCurrentDutchPrice(auction);
    
    if (amount < currentPrice) {
      throw new Error('Bid below current price');
    }

    // Complete auction
    auction.status = 'completed';
    auction.highestBidder = bidder;
    auction.currentPrice = amount;
    this.auctions.set(auctionId, auction);

    return true;
  }

  calculateCurrentDutchPrice(auction: LiquidationAuction): bigint {
    const now = Date.now();
    const elapsed = now - auction.startTime.getTime();
    const totalDuration = auction.endTime.getTime() - auction.startTime.getTime();

    if (elapsed >= totalDuration) {
      return auction.minPrice;
    }

    const priceRange = auction.startingPrice - auction.minPrice;
    const priceDrop = (priceRange * BigInt(elapsed)) / BigInt(totalDuration);

    return auction.startingPrice - priceDrop;
  }

  async getLiquidationHistory(
    loanId?: bigint,
    limit: number = 10
  ): Promise<LiquidationResult[]> {
    let results = Array.from(this.liquidations.values());

    if (loanId !== undefined) {
      results = results.filter(r => r.loanId === loanId);
    }

    return results
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getProtocolStats(): Promise<{
    totalLiquidations: number;
    totalDebtRepaid: bigint;
    totalCollateralSeized: bigint;
    totalProtocolFees: bigint;
  }> {
    const liquidations = Array.from(this.liquidations.values());

    return {
      totalLiquidations: liquidations.length,
      totalDebtRepaid: liquidations.reduce((sum, l) => sum + l.debtRepaid, BigInt(0)),
      totalCollateralSeized: liquidations.reduce((sum, l) => sum + l.collateralReceived, BigInt(0)),
      totalProtocolFees: BigInt(0), // Would calculate from history
    };
  }

  updateConfig(newConfig: Partial<LiquidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): LiquidationConfig {
    return { ...this.config };
  }

  private async simulateBlockchainDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  }
}

export const liquidationService = new LiquidationService();
export default liquidationService;
