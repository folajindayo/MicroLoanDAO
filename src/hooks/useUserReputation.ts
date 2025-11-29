/**
 * useUserReputation Hook
 * Fetch and calculate user reputation score
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';

export interface ReputationFactors {
  loanCompletionRate: number;
  onTimePaymentRate: number;
  totalLoansCompleted: number;
  averageLoanAmount: number;
  accountAge: number;
  verificationLevel: number;
  communityScore: number;
}

export interface ReputationTier {
  name: string;
  minScore: number;
  maxScore: number;
  color: string;
  benefits: string[];
}

export interface UserReputationState {
  score: number;
  tier: ReputationTier;
  factors: ReputationFactors;
  history: Array<{ date: Date; score: number; change: number }>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseUserReputationOptions {
  address?: string;
  includeHistory?: boolean;
  historyDays?: number;
}

export interface UseUserReputationReturn extends UserReputationState {
  refresh: () => Promise<void>;
  calculatePotentialScore: (changes: Partial<ReputationFactors>) => number;
  getRecommendations: () => string[];
  getNextTier: () => ReputationTier | null;
  getScoreToNextTier: () => number;
}

// Reputation tiers
const REPUTATION_TIERS: ReputationTier[] = [
  {
    name: 'New',
    minScore: 0,
    maxScore: 20,
    color: '#6B7280',
    benefits: ['Basic loan access'],
  },
  {
    name: 'Bronze',
    minScore: 21,
    maxScore: 40,
    color: '#CD7F32',
    benefits: ['Lower collateral requirements', 'Faster approval'],
  },
  {
    name: 'Silver',
    minScore: 41,
    maxScore: 60,
    color: '#C0C0C0',
    benefits: ['Higher loan limits', 'Priority support'],
  },
  {
    name: 'Gold',
    minScore: 61,
    maxScore: 80,
    color: '#FFD700',
    benefits: ['Best rates', 'Flexible terms', 'VIP support'],
  },
  {
    name: 'Platinum',
    minScore: 81,
    maxScore: 100,
    color: '#E5E4E2',
    benefits: ['Maximum loan limits', 'Exclusive features', 'Zero fees'],
  },
];

// Factor weights for score calculation
const FACTOR_WEIGHTS = {
  loanCompletionRate: 0.25,
  onTimePaymentRate: 0.30,
  totalLoansCompleted: 0.15,
  averageLoanAmount: 0.05,
  accountAge: 0.10,
  verificationLevel: 0.10,
  communityScore: 0.05,
};

/**
 * Calculate reputation score from factors
 */
function calculateScore(factors: ReputationFactors): number {
  let score = 0;

  // Loan completion rate (0-100%)
  score += (factors.loanCompletionRate / 100) * FACTOR_WEIGHTS.loanCompletionRate * 100;

  // On-time payment rate (0-100%)
  score += (factors.onTimePaymentRate / 100) * FACTOR_WEIGHTS.onTimePaymentRate * 100;

  // Total loans completed (capped at 50 for full points)
  const loansFactor = Math.min(factors.totalLoansCompleted / 50, 1);
  score += loansFactor * FACTOR_WEIGHTS.totalLoansCompleted * 100;

  // Average loan amount (capped at $10000 for full points)
  const amountFactor = Math.min(factors.averageLoanAmount / 10000, 1);
  score += amountFactor * FACTOR_WEIGHTS.averageLoanAmount * 100;

  // Account age in days (capped at 365 for full points)
  const ageFactor = Math.min(factors.accountAge / 365, 1);
  score += ageFactor * FACTOR_WEIGHTS.accountAge * 100;

  // Verification level (0-3)
  const verificationFactor = factors.verificationLevel / 3;
  score += verificationFactor * FACTOR_WEIGHTS.verificationLevel * 100;

  // Community score (0-100)
  score += (factors.communityScore / 100) * FACTOR_WEIGHTS.communityScore * 100;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Get tier from score
 */
function getTierFromScore(score: number): ReputationTier {
  return REPUTATION_TIERS.find(
    tier => score >= tier.minScore && score <= tier.maxScore
  ) || REPUTATION_TIERS[0];
}

/**
 * Hook for user reputation
 */
export function useUserReputation(
  options: UseUserReputationOptions = {}
): UseUserReputationReturn {
  const { address: addressOverride, includeHistory = false, historyDays = 30 } = options;
  const { address: connectedAddress } = useAccount();
  
  const address = addressOverride || connectedAddress;

  const [factors, setFactors] = useState<ReputationFactors>({
    loanCompletionRate: 0,
    onTimePaymentRate: 0,
    totalLoansCompleted: 0,
    averageLoanAmount: 0,
    accountAge: 0,
    verificationLevel: 0,
    communityScore: 0,
  });
  const [history, setHistory] = useState<Array<{ date: Date; score: number; change: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Calculate score from factors
  const score = useMemo(() => calculateScore(factors), [factors]);
  
  // Get current tier
  const tier = useMemo(() => getTierFromScore(score), [score]);

  // Fetch reputation data
  const fetchReputation = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ address });
      if (includeHistory) {
        params.append('history', 'true');
        params.append('days', String(historyDays));
      }

      const response = await fetch(`/api/reputation?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reputation');
      }

      const data = await response.json();
      
      setFactors(data.factors || factors);
      if (data.history) {
        setHistory(data.history.map((h: any) => ({
          ...h,
          date: new Date(h.date),
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [address, includeHistory, historyDays]);

  // Calculate potential score with changes
  const calculatePotentialScore = useCallback((changes: Partial<ReputationFactors>): number => {
    const updatedFactors = { ...factors, ...changes };
    return calculateScore(updatedFactors);
  }, [factors]);

  // Get recommendations to improve score
  const getRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];

    if (factors.loanCompletionRate < 100) {
      recommendations.push('Complete all your active loans to improve completion rate');
    }
    if (factors.onTimePaymentRate < 95) {
      recommendations.push('Make payments on time to improve your payment rate');
    }
    if (factors.totalLoansCompleted < 5) {
      recommendations.push('Complete more loans to build your history');
    }
    if (factors.verificationLevel < 3) {
      recommendations.push('Complete identity verification for a score boost');
    }
    if (factors.communityScore < 50) {
      recommendations.push('Participate in the community to earn community points');
    }

    return recommendations;
  }, [factors]);

  // Get next tier
  const getNextTier = useCallback((): ReputationTier | null => {
    const currentIndex = REPUTATION_TIERS.findIndex(t => t.name === tier.name);
    return currentIndex < REPUTATION_TIERS.length - 1 
      ? REPUTATION_TIERS[currentIndex + 1] 
      : null;
  }, [tier]);

  // Get points needed for next tier
  const getScoreToNextTier = useCallback((): number => {
    const nextTier = getNextTier();
    if (!nextTier) return 0;
    return nextTier.minScore - score;
  }, [score, getNextTier]);

  // Initial fetch
  useEffect(() => {
    fetchReputation();
  }, [fetchReputation]);

  return {
    score,
    tier,
    factors,
    history,
    isLoading,
    error,
    refresh: fetchReputation,
    calculatePotentialScore,
    getRecommendations,
    getNextTier,
    getScoreToNextTier,
  };
}

export { REPUTATION_TIERS };
export default useUserReputation;

