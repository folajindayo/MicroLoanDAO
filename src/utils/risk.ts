/**
 * Risk Assessment Utilities
 * Functions for evaluating loan and borrower risk
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskScore {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  impact: 'positive' | 'neutral' | 'negative';
}

// Risk thresholds
const RISK_THRESHOLDS: Record<RiskLevel, { min: number; max: number }> = {
  low: { min: 0, max: 25 },
  medium: { min: 25, max: 50 },
  high: { min: 50, max: 75 },
  critical: { min: 75, max: 100 },
};

/**
 * Get risk level from score
 */
export function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= RISK_THRESHOLDS.low.max) return 'low';
  if (score <= RISK_THRESHOLDS.medium.max) return 'medium';
  if (score <= RISK_THRESHOLDS.high.max) return 'high';
  return 'critical';
}

/**
 * Get risk level color
 */
export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: '#22C55E',
    medium: '#EAB308',
    high: '#F97316',
    critical: '#EF4444',
  };
  return colors[level];
}

/**
 * Get risk level CSS class
 */
export function getRiskClass(level: RiskLevel): string {
  const classes: Record<RiskLevel, string> = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return classes[level];
}

/**
 * Calculate weighted risk score
 */
export function calculateWeightedRiskScore(factors: RiskFactor[]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const factor of factors) {
    weightedSum += factor.score * factor.weight;
    totalWeight += factor.weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 50;
}

/**
 * Calculate loan risk score
 */
export function calculateLoanRisk(params: {
  collateralRatio: number;
  borrowerReputation: number;
  loanDuration: number;
  interestRate: number;
  loanAmount: number;
  daysRemaining?: number;
}): RiskScore {
  const factors: RiskFactor[] = [];

  // Collateral ratio (higher is safer)
  const collateralRisk = Math.max(0, 150 - params.collateralRatio);
  factors.push({
    name: 'Collateral Ratio',
    score: collateralRisk / 1.5,
    weight: 0.25,
    impact: params.collateralRatio >= 150 ? 'positive' : params.collateralRatio >= 120 ? 'neutral' : 'negative',
  });

  // Borrower reputation (higher is safer)
  factors.push({
    name: 'Borrower Reputation',
    score: 100 - params.borrowerReputation,
    weight: 0.20,
    impact: params.borrowerReputation >= 70 ? 'positive' : params.borrowerReputation >= 40 ? 'neutral' : 'negative',
  });

  // Loan duration (longer = higher risk)
  const durationRisk = Math.min(100, params.loanDuration / 3.65);
  factors.push({
    name: 'Loan Duration',
    score: durationRisk,
    weight: 0.15,
    impact: params.loanDuration <= 30 ? 'positive' : params.loanDuration <= 90 ? 'neutral' : 'negative',
  });

  // Interest rate (very high rates indicate risk)
  const rateRisk = params.interestRate > 20 ? Math.min(100, params.interestRate * 2) : params.interestRate;
  factors.push({
    name: 'Interest Rate',
    score: rateRisk,
    weight: 0.10,
    impact: params.interestRate <= 10 ? 'positive' : params.interestRate <= 20 ? 'neutral' : 'negative',
  });

  // Loan amount (larger = higher risk)
  const amountRisk = Math.min(100, (params.loanAmount / 100000) * 100);
  factors.push({
    name: 'Loan Amount',
    score: amountRisk,
    weight: 0.15,
    impact: params.loanAmount <= 10000 ? 'positive' : params.loanAmount <= 50000 ? 'neutral' : 'negative',
  });

  // Time remaining if applicable
  if (params.daysRemaining !== undefined) {
    const timeRisk = Math.max(0, 100 - (params.daysRemaining / params.loanDuration) * 100);
    factors.push({
      name: 'Time Remaining',
      score: timeRisk,
      weight: 0.15,
      impact: params.daysRemaining > 30 ? 'positive' : params.daysRemaining > 7 ? 'neutral' : 'negative',
    });
  }

  const score = calculateWeightedRiskScore(factors);

  return {
    score: Math.round(score * 100) / 100,
    level: scoreToRiskLevel(score),
    factors,
  };
}

/**
 * Calculate probability of default
 */
export function calculateDefaultProbability(riskScore: number): number {
  return Math.min(100, riskScore) / 100;
}

/**
 * Calculate expected loss
 */
export function calculateExpectedLoss(
  loanAmount: number,
  riskScore: number,
  recoveryRate: number = 0.4
): number {
  const defaultProb = calculateDefaultProbability(riskScore);
  const lossGivenDefault = 1 - recoveryRate;
  return loanAmount * defaultProb * lossGivenDefault;
}

/**
 * Determine if loan is acceptable risk
 */
export function isAcceptableRisk(riskScore: number, maxRiskScore: number = 75): boolean {
  return riskScore <= maxRiskScore;
}

/**
 * Get risk recommendations
 */
export function getRiskRecommendations(risk: RiskScore): string[] {
  const recommendations: string[] = [];

  for (const factor of risk.factors) {
    if (factor.impact === 'negative') {
      switch (factor.name) {
        case 'Collateral Ratio':
          recommendations.push('Consider increasing collateral to reduce risk');
          break;
        case 'Borrower Reputation':
          recommendations.push('Verify borrower identity and credentials');
          break;
        case 'Loan Duration':
          recommendations.push('Shorter loan terms may be safer');
          break;
        case 'Interest Rate':
          recommendations.push('High interest rates may indicate desperation');
          break;
        case 'Loan Amount':
          recommendations.push('Consider funding a smaller portion');
          break;
        case 'Time Remaining':
          recommendations.push('Monitor closely as deadline approaches');
          break;
      }
    }
  }

  if (risk.level === 'critical') {
    recommendations.push('Consider declining this loan request');
  } else if (risk.level === 'high') {
    recommendations.push('Request additional collateral or guarantees');
  }

  return recommendations;
}

/**
 * Compare two risk scores
 */
export function compareRisk(risk1: RiskScore, risk2: RiskScore): 'better' | 'worse' | 'similar' {
  const diff = risk1.score - risk2.score;
  if (Math.abs(diff) < 5) return 'similar';
  return diff < 0 ? 'better' : 'worse';
}

export { RISK_THRESHOLDS };

