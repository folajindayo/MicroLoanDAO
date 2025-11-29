/**
 * useDefaultRisk Hook
 * Calculate and monitor loan default risk
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loan } from '@/types';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskFactors {
  paymentHistory: number;
  collateralRatio: number;
  timeRemaining: number;
  borrowerReputation: number;
  marketVolatility: number;
  loanAmount: number;
  interestRate: number;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  factors: RiskFactors;
  recommendations: string[];
  probabilityOfDefault: number;
  expectedLoss: number;
}

export interface UseDefaultRiskState {
  assessment: RiskAssessment | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

export interface UseDefaultRiskOptions {
  /** Include market data in calculation */
  includeMarketData?: boolean;
  /** Auto-refresh interval in ms */
  refreshInterval?: number;
  /** Custom risk weights */
  weights?: Partial<Record<keyof RiskFactors, number>>;
}

export interface UseDefaultRiskReturn extends UseDefaultRiskState {
  calculateRisk: (loan: Loan, factors?: Partial<RiskFactors>) => RiskAssessment;
  getRiskColor: (level: RiskLevel) => string;
  refresh: () => Promise<void>;
}

// Default weights for risk factors
const DEFAULT_WEIGHTS: Record<keyof RiskFactors, number> = {
  paymentHistory: 0.25,
  collateralRatio: 0.20,
  timeRemaining: 0.15,
  borrowerReputation: 0.15,
  marketVolatility: 0.10,
  loanAmount: 0.10,
  interestRate: 0.05,
};

// Risk level thresholds
const RISK_THRESHOLDS: Record<RiskLevel, { min: number; max: number }> = {
  low: { min: 0, max: 25 },
  medium: { min: 25, max: 50 },
  high: { min: 50, max: 75 },
  critical: { min: 75, max: 100 },
};

// Risk colors
const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#22C55E',
  medium: '#EAB308',
  high: '#F97316',
  critical: '#EF4444',
};

/**
 * Get risk level from score
 */
function getRiskLevelFromScore(score: number): RiskLevel {
  if (score <= RISK_THRESHOLDS.low.max) return 'low';
  if (score <= RISK_THRESHOLDS.medium.max) return 'medium';
  if (score <= RISK_THRESHOLDS.high.max) return 'high';
  return 'critical';
}

/**
 * Calculate risk score from factors
 */
function calculateRiskScore(
  factors: RiskFactors,
  weights: Record<keyof RiskFactors, number>
): number {
  let score = 0;

  // Payment history (lower is better, invert)
  score += (100 - factors.paymentHistory) * weights.paymentHistory;

  // Collateral ratio (higher is safer, invert)
  const collateralRisk = Math.max(0, 150 - factors.collateralRatio);
  score += (collateralRisk / 1.5) * weights.collateralRatio;

  // Time remaining (less time = higher risk)
  const timeRisk = Math.max(0, 100 - factors.timeRemaining);
  score += timeRisk * weights.timeRemaining;

  // Borrower reputation (lower = higher risk, invert)
  score += (100 - factors.borrowerReputation) * weights.borrowerReputation;

  // Market volatility (direct correlation)
  score += factors.marketVolatility * weights.marketVolatility;

  // Loan amount risk (higher amounts = higher risk)
  score += factors.loanAmount * weights.loanAmount;

  // Interest rate risk (very high rates can indicate desperation)
  const rateRisk = factors.interestRate > 20 ? Math.min(100, factors.interestRate * 2) : factors.interestRate;
  score += rateRisk * weights.interestRate;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate risk recommendations
 */
function generateRecommendations(factors: RiskFactors, level: RiskLevel): string[] {
  const recommendations: string[] = [];

  if (factors.collateralRatio < 150) {
    recommendations.push('Consider increasing collateral to reduce risk');
  }

  if (factors.paymentHistory < 80) {
    recommendations.push('Request updated payment history verification');
  }

  if (factors.timeRemaining < 30) {
    recommendations.push('Monitor closely - loan approaching maturity');
  }

  if (factors.borrowerReputation < 50) {
    recommendations.push('Verify borrower identity and credentials');
  }

  if (factors.marketVolatility > 50) {
    recommendations.push('High market volatility - consider hedging');
  }

  if (level === 'critical') {
    recommendations.push('Consider early intervention or restructuring');
    recommendations.push('Prepare for potential default proceedings');
  } else if (level === 'high') {
    recommendations.push('Increase monitoring frequency');
    recommendations.push('Contact borrower to discuss repayment plan');
  }

  return recommendations;
}

/**
 * Hook for calculating default risk
 */
export function useDefaultRisk(
  loan: Loan | null,
  options: UseDefaultRiskOptions = {}
): UseDefaultRiskReturn {
  const {
    includeMarketData = true,
    refreshInterval,
    weights = {},
  } = options;

  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Merged weights
  const mergedWeights = useMemo(
    () => ({ ...DEFAULT_WEIGHTS, ...weights }),
    [weights]
  );

  // Calculate risk from loan and factors
  const calculateRisk = useCallback((
    loanData: Loan,
    factorOverrides: Partial<RiskFactors> = {}
  ): RiskAssessment => {
    // Calculate base factors from loan data
    const durationDays = Number(loanData.duration);
    const startDate = loanData.createdAt ? new Date(loanData.createdAt) : new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysRemaining = Math.max(0, (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const timeRemainingPercent = (daysRemaining / durationDays) * 100;

    // Normalize loan amount to 0-100 scale (assuming max $100k)
    const normalizedAmount = Math.min(100, (Number(loanData.amount) / 100000) * 100);

    const factors: RiskFactors = {
      paymentHistory: 85, // Default assumption
      collateralRatio: 150, // Default assumption
      timeRemaining: timeRemainingPercent,
      borrowerReputation: 70, // Default assumption
      marketVolatility: 30, // Default assumption
      loanAmount: normalizedAmount,
      interestRate: Number(loanData.interestRate),
      ...factorOverrides,
    };

    const score = calculateRiskScore(factors, mergedWeights);
    const level = getRiskLevelFromScore(score);
    const recommendations = generateRecommendations(factors, level);

    // Calculate probability of default (simplified model)
    const probabilityOfDefault = score / 100;
    const expectedLoss = probabilityOfDefault * Number(loanData.amount);

    return {
      score: Math.round(score * 100) / 100,
      level,
      factors,
      recommendations,
      probabilityOfDefault: Math.round(probabilityOfDefault * 10000) / 100,
      expectedLoss: Math.round(expectedLoss * 100) / 100,
    };
  }, [mergedWeights]);

  // Fetch additional data and calculate risk
  const fetchAndCalculateRisk = useCallback(async () => {
    if (!loan) {
      setAssessment(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let factorData: Partial<RiskFactors> = {};

      if (includeMarketData) {
        // Fetch market data if needed
        try {
          const response = await fetch('/api/market/volatility');
          if (response.ok) {
            const data = await response.json();
            factorData.marketVolatility = data.volatilityIndex || 30;
          }
        } catch {
          // Use default if API fails
        }
      }

      // Fetch borrower reputation if available
      if (loan.borrower) {
        try {
          const response = await fetch(`/api/reputation?address=${loan.borrower}`);
          if (response.ok) {
            const data = await response.json();
            factorData.borrowerReputation = data.score || 70;
          }
        } catch {
          // Use default if API fails
        }
      }

      const riskAssessment = calculateRisk(loan, factorData);
      setAssessment(riskAssessment);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to calculate risk'));
    } finally {
      setIsLoading(false);
    }
  }, [loan, includeMarketData, calculateRisk]);

  // Get risk color
  const getRiskColor = useCallback((level: RiskLevel): string => {
    return RISK_COLORS[level];
  }, []);

  // Initial calculation
  useEffect(() => {
    fetchAndCalculateRisk();
  }, [fetchAndCalculateRisk]);

  // Auto refresh
  useEffect(() => {
    if (!refreshInterval || !loan) return;

    const interval = setInterval(fetchAndCalculateRisk, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, loan, fetchAndCalculateRisk]);

  return {
    assessment,
    isLoading,
    error,
    lastUpdated,
    calculateRisk,
    getRiskColor,
    refresh: fetchAndCalculateRisk,
  };
}

/**
 * Quick risk level calculation without API calls
 */
export function useQuickRiskLevel(loan: Loan | null): RiskLevel | null {
  const { calculateRisk } = useDefaultRisk(null);

  return useMemo(() => {
    if (!loan) return null;
    const assessment = calculateRisk(loan);
    return assessment.level;
  }, [loan, calculateRisk]);
}

export { RISK_COLORS, RISK_THRESHOLDS };
export default useDefaultRisk;

