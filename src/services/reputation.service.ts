/**
 * Reputation Service
 * 
 * Handles reputation scoring and user credibility calculations
 * for the MicroLoan DAO platform.
 */

import { type Address } from 'viem';
import { type LoanData } from './loan.service';
import { LoanStatus } from '@/constants/contracts';

export interface ReputationScore {
  score: number; // 0-100
  tier: ReputationTier;
  totalLoans: number;
  repaidLoans: number;
  defaultedLoans: number;
  onTimePayments: number;
  latePayments: number;
  totalBorrowed: bigint;
  totalRepaid: bigint;
  totalLent: bigint;
}

export enum ReputationTier {
  NEW = 'new',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export interface ReputationHistory {
  timestamp: number;
  action: 'loan_created' | 'loan_funded' | 'loan_repaid' | 'loan_defaulted' | 'loan_repaid_late';
  loanId: bigint;
  scoreChange: number;
  newScore: number;
}

/**
 * Reputation tier thresholds
 */
const TIER_THRESHOLDS: Record<ReputationTier, number> = {
  [ReputationTier.NEW]: 0,
  [ReputationTier.BRONZE]: 20,
  [ReputationTier.SILVER]: 40,
  [ReputationTier.GOLD]: 60,
  [ReputationTier.PLATINUM]: 80,
  [ReputationTier.DIAMOND]: 95,
};

/**
 * Score weights for different actions
 */
const SCORE_WEIGHTS = {
  LOAN_REPAID_ON_TIME: 10,
  LOAN_REPAID_LATE: 3,
  LOAN_DEFAULTED: -25,
  LOAN_FUNDED: 5,
  BASE_SCORE: 50, // Starting score for new users
  MAX_SCORE: 100,
  MIN_SCORE: 0,
} as const;

/**
 * Get reputation tier from score
 */
export function getReputationTier(score: number): ReputationTier {
  if (score >= TIER_THRESHOLDS[ReputationTier.DIAMOND]) return ReputationTier.DIAMOND;
  if (score >= TIER_THRESHOLDS[ReputationTier.PLATINUM]) return ReputationTier.PLATINUM;
  if (score >= TIER_THRESHOLDS[ReputationTier.GOLD]) return ReputationTier.GOLD;
  if (score >= TIER_THRESHOLDS[ReputationTier.SILVER]) return ReputationTier.SILVER;
  if (score >= TIER_THRESHOLDS[ReputationTier.BRONZE]) return ReputationTier.BRONZE;
  return ReputationTier.NEW;
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: ReputationTier): string {
  const names: Record<ReputationTier, string> = {
    [ReputationTier.NEW]: 'New User',
    [ReputationTier.BRONZE]: 'Bronze',
    [ReputationTier.SILVER]: 'Silver',
    [ReputationTier.GOLD]: 'Gold',
    [ReputationTier.PLATINUM]: 'Platinum',
    [ReputationTier.DIAMOND]: 'Diamond',
  };
  return names[tier];
}

/**
 * Get tier color classes
 */
export function getTierColorClass(tier: ReputationTier): string {
  const colors: Record<ReputationTier, string> = {
    [ReputationTier.NEW]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    [ReputationTier.BRONZE]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    [ReputationTier.SILVER]: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    [ReputationTier.GOLD]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    [ReputationTier.PLATINUM]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    [ReputationTier.DIAMOND]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colors[tier];
}

/**
 * Calculate reputation score from loan history
 */
export function calculateReputationScore(
  loans: LoanData[],
  userAddress: Address
): ReputationScore {
  const userLoansAsBorrower = loans.filter(
    loan => loan.borrower.toLowerCase() === userAddress.toLowerCase()
  );
  
  const userLoansAsLender = loans.filter(
    loan => loan.lender.toLowerCase() === userAddress.toLowerCase()
  );
  
  let score = SCORE_WEIGHTS.BASE_SCORE;
  let repaidLoans = 0;
  let defaultedLoans = 0;
  let onTimePayments = 0;
  let latePayments = 0;
  let totalBorrowed = 0n;
  let totalRepaid = 0n;
  let totalLent = 0n;
  
  // Process borrower loans
  for (const loan of userLoansAsBorrower) {
    totalBorrowed += loan.amount;
    
    if (loan.status === LoanStatus.REPAID) {
      repaidLoans++;
      totalRepaid += loan.amount;
      
      // Check if repaid on time
      const wasLate = loan.repaidAt > loan.fundedAt + loan.duration;
      if (wasLate) {
        latePayments++;
        score += SCORE_WEIGHTS.LOAN_REPAID_LATE;
      } else {
        onTimePayments++;
        score += SCORE_WEIGHTS.LOAN_REPAID_ON_TIME;
      }
    } else if (loan.status === LoanStatus.DEFAULTED) {
      defaultedLoans++;
      score += SCORE_WEIGHTS.LOAN_DEFAULTED;
    }
  }
  
  // Process lender loans (positive reputation for funding)
  for (const loan of userLoansAsLender) {
    totalLent += loan.amount;
    score += SCORE_WEIGHTS.LOAN_FUNDED;
  }
  
  // Clamp score
  score = Math.max(SCORE_WEIGHTS.MIN_SCORE, Math.min(SCORE_WEIGHTS.MAX_SCORE, score));
  
  return {
    score,
    tier: getReputationTier(score),
    totalLoans: userLoansAsBorrower.length,
    repaidLoans,
    defaultedLoans,
    onTimePayments,
    latePayments,
    totalBorrowed,
    totalRepaid,
    totalLent,
  };
}

/**
 * Get recommended loan limit based on reputation
 */
export function getRecommendedLoanLimit(reputation: ReputationScore): bigint {
  const baseLimitWei = 10n ** 18n; // 1 ETH base
  
  const multipliers: Record<ReputationTier, bigint> = {
    [ReputationTier.NEW]: 1n,
    [ReputationTier.BRONZE]: 2n,
    [ReputationTier.SILVER]: 5n,
    [ReputationTier.GOLD]: 10n,
    [ReputationTier.PLATINUM]: 25n,
    [ReputationTier.DIAMOND]: 50n,
  };
  
  return baseLimitWei * multipliers[reputation.tier];
}

/**
 * Get recommended interest rate range based on reputation
 */
export function getRecommendedInterestRange(reputation: ReputationScore): { min: number; max: number } {
  const ranges: Record<ReputationTier, { min: number; max: number }> = {
    [ReputationTier.NEW]: { min: 500, max: 2000 }, // 5-20%
    [ReputationTier.BRONZE]: { min: 400, max: 1500 }, // 4-15%
    [ReputationTier.SILVER]: { min: 300, max: 1200 }, // 3-12%
    [ReputationTier.GOLD]: { min: 200, max: 1000 }, // 2-10%
    [ReputationTier.PLATINUM]: { min: 100, max: 800 }, // 1-8%
    [ReputationTier.DIAMOND]: { min: 50, max: 500 }, // 0.5-5%
  };
  
  return ranges[reputation.tier];
}

/**
 * Calculate trust score between two users
 */
export function calculateTrustScore(
  lenderReputation: ReputationScore,
  borrowerReputation: ReputationScore
): number {
  // Average of both scores with borrower weighted more
  const borrowerWeight = 0.7;
  const lenderWeight = 0.3;
  
  return Math.round(
    borrowerReputation.score * borrowerWeight +
    lenderReputation.score * lenderWeight
  );
}

/**
 * Get reputation badge emoji
 */
export function getReputationBadge(tier: ReputationTier): string {
  const badges: Record<ReputationTier, string> = {
    [ReputationTier.NEW]: '🌱',
    [ReputationTier.BRONZE]: '🥉',
    [ReputationTier.SILVER]: '🥈',
    [ReputationTier.GOLD]: '🥇',
    [ReputationTier.PLATINUM]: '💎',
    [ReputationTier.DIAMOND]: '👑',
  };
  return badges[tier];
}

/**
 * Get next tier requirements
 */
export function getNextTierRequirements(currentTier: ReputationTier): {
  nextTier: ReputationTier | null;
  scoreNeeded: number;
  description: string;
} | null {
  const tierOrder: ReputationTier[] = [
    ReputationTier.NEW,
    ReputationTier.BRONZE,
    ReputationTier.SILVER,
    ReputationTier.GOLD,
    ReputationTier.PLATINUM,
    ReputationTier.DIAMOND,
  ];
  
  const currentIndex = tierOrder.indexOf(currentTier);
  if (currentIndex === tierOrder.length - 1) {
    return null; // Already at max tier
  }
  
  const nextTier = tierOrder[currentIndex + 1];
  const scoreNeeded = TIER_THRESHOLDS[nextTier];
  
  const descriptions: Record<ReputationTier, string> = {
    [ReputationTier.NEW]: 'Complete your first loan',
    [ReputationTier.BRONZE]: 'Repay 2 loans on time',
    [ReputationTier.SILVER]: 'Maintain consistent repayments',
    [ReputationTier.GOLD]: 'Build a strong repayment history',
    [ReputationTier.PLATINUM]: 'Achieve excellent standing',
    [ReputationTier.DIAMOND]: 'Reach maximum reputation',
  };
  
  return {
    nextTier,
    scoreNeeded,
    description: descriptions[nextTier],
  };
}

