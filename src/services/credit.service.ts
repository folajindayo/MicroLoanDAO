/**
 * Credit Service
 * Credit scoring, risk assessment, and borrower evaluation
 */

export interface CreditScore {
  score: number;
  grade: CreditGrade;
  factors: CreditFactor[];
  lastUpdated: Date;
  trend: 'improving' | 'stable' | 'declining';
}

export interface CreditFactor {
  name: string;
  weight: number;
  score: number;
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
}

export type CreditGrade = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D';

export interface CreditHistory {
  totalLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  activeLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  averageRepaymentTime: number;
  onTimePaymentRate: number;
}

export interface CreditLimit {
  maxLoanAmount: number;
  availableCredit: number;
  utilizationRate: number;
  recommendedAmount: number;
}

// Credit grade thresholds
const GRADE_THRESHOLDS: Record<CreditGrade, { min: number; max: number }> = {
  'AAA': { min: 95, max: 100 },
  'AA': { min: 90, max: 94 },
  'A': { min: 80, max: 89 },
  'BBB': { min: 70, max: 79 },
  'BB': { min: 60, max: 69 },
  'B': { min: 50, max: 59 },
  'CCC': { min: 40, max: 49 },
  'CC': { min: 30, max: 39 },
  'C': { min: 20, max: 29 },
  'D': { min: 0, max: 19 },
};

// Factor weights
const FACTOR_WEIGHTS = {
  paymentHistory: 0.35,
  creditUtilization: 0.15,
  accountAge: 0.15,
  loanDiversity: 0.10,
  recentActivity: 0.10,
  collateralHistory: 0.10,
  communityTrust: 0.05,
};

class CreditService {
  /**
   * Calculate credit score for a borrower
   */
  async calculateCreditScore(
    address: string,
    history: CreditHistory
  ): Promise<CreditScore> {
    const factors = this.evaluateCreditFactors(history);
    const score = this.computeWeightedScore(factors);
    const grade = this.scoreToGrade(score);
    const trend = this.determineTrend(history);

    return {
      score: Math.round(score),
      grade,
      factors,
      lastUpdated: new Date(),
      trend,
    };
  }

  /**
   * Evaluate individual credit factors
   */
  private evaluateCreditFactors(history: CreditHistory): CreditFactor[] {
    const factors: CreditFactor[] = [];

    // Payment History (35%)
    const paymentScore = history.onTimePaymentRate * 100;
    factors.push({
      name: 'Payment History',
      weight: FACTOR_WEIGHTS.paymentHistory,
      score: paymentScore,
      impact: paymentScore >= 90 ? 'positive' : paymentScore >= 70 ? 'neutral' : 'negative',
      description: `${history.onTimePaymentRate * 100}% on-time payment rate`,
    });

    // Credit Utilization (15%)
    const utilizationScore = history.activeLoans === 0 
      ? 100 
      : Math.max(0, 100 - (history.activeLoans / Math.max(1, history.completedLoans + history.activeLoans)) * 100);
    factors.push({
      name: 'Credit Utilization',
      weight: FACTOR_WEIGHTS.creditUtilization,
      score: utilizationScore,
      impact: utilizationScore >= 70 ? 'positive' : utilizationScore >= 50 ? 'neutral' : 'negative',
      description: `${history.activeLoans} active loans`,
    });

    // Account Age (15%)
    const ageScore = Math.min(100, history.totalLoans * 10);
    factors.push({
      name: 'Account History',
      weight: FACTOR_WEIGHTS.accountAge,
      score: ageScore,
      impact: ageScore >= 50 ? 'positive' : ageScore >= 20 ? 'neutral' : 'negative',
      description: `${history.totalLoans} total loans`,
    });

    // Loan Diversity (10%)
    const diversityScore = history.completedLoans >= 5 ? 100 : history.completedLoans * 20;
    factors.push({
      name: 'Loan Diversity',
      weight: FACTOR_WEIGHTS.loanDiversity,
      score: diversityScore,
      impact: diversityScore >= 60 ? 'positive' : diversityScore >= 30 ? 'neutral' : 'negative',
      description: `${history.completedLoans} completed loans`,
    });

    // Recent Activity (10%)
    const defaultRate = history.totalLoans > 0 
      ? history.defaultedLoans / history.totalLoans 
      : 0;
    const activityScore = Math.max(0, 100 - defaultRate * 200);
    factors.push({
      name: 'Default History',
      weight: FACTOR_WEIGHTS.recentActivity,
      score: activityScore,
      impact: defaultRate === 0 ? 'positive' : defaultRate < 0.1 ? 'neutral' : 'negative',
      description: defaultRate === 0 ? 'No defaults' : `${history.defaultedLoans} defaults`,
    });

    // Collateral History (10%)
    const repaymentRatio = history.totalBorrowed > 0 
      ? history.totalRepaid / history.totalBorrowed 
      : 0;
    const collateralScore = Math.min(100, repaymentRatio * 100);
    factors.push({
      name: 'Repayment Ratio',
      weight: FACTOR_WEIGHTS.collateralHistory,
      score: collateralScore,
      impact: collateralScore >= 90 ? 'positive' : collateralScore >= 70 ? 'neutral' : 'negative',
      description: `${Math.round(repaymentRatio * 100)}% repayment ratio`,
    });

    // Community Trust (5%)
    const trustScore = history.completedLoans > 0 && history.defaultedLoans === 0 ? 100 : 
      Math.max(0, 70 - history.defaultedLoans * 20);
    factors.push({
      name: 'Community Trust',
      weight: FACTOR_WEIGHTS.communityTrust,
      score: trustScore,
      impact: trustScore >= 80 ? 'positive' : trustScore >= 50 ? 'neutral' : 'negative',
      description: 'Based on community feedback',
    });

    return factors;
  }

  /**
   * Compute weighted score from factors
   */
  private computeWeightedScore(factors: CreditFactor[]): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const factor of factors) {
      weightedSum += factor.score * factor.weight;
      totalWeight += factor.weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 50;
  }

  /**
   * Convert score to grade
   */
  scoreToGrade(score: number): CreditGrade {
    for (const [grade, threshold] of Object.entries(GRADE_THRESHOLDS)) {
      if (score >= threshold.min && score <= threshold.max) {
        return grade as CreditGrade;
      }
    }
    return 'D';
  }

  /**
   * Determine credit trend
   */
  private determineTrend(history: CreditHistory): 'improving' | 'stable' | 'declining' {
    // Simplified trend analysis
    if (history.defaultedLoans > 0) return 'declining';
    if (history.completedLoans > history.defaultedLoans * 5) return 'improving';
    return 'stable';
  }

  /**
   * Calculate credit limit for a borrower
   */
  calculateCreditLimit(
    creditScore: number,
    history: CreditHistory,
    baseLimit: number = 1000
  ): CreditLimit {
    // Scale base limit by credit score
    const scoreMultiplier = creditScore / 50; // 1x at score 50, 2x at score 100
    const maxLoanAmount = baseLimit * scoreMultiplier;

    // Calculate available credit based on active loans
    const activeValue = history.activeLoans * (history.totalBorrowed / Math.max(1, history.totalLoans));
    const availableCredit = Math.max(0, maxLoanAmount - activeValue);

    // Calculate utilization
    const utilizationRate = maxLoanAmount > 0 
      ? ((maxLoanAmount - availableCredit) / maxLoanAmount) * 100 
      : 0;

    // Recommended amount (conservative - 60% of available)
    const recommendedAmount = availableCredit * 0.6;

    return {
      maxLoanAmount: Math.round(maxLoanAmount * 100) / 100,
      availableCredit: Math.round(availableCredit * 100) / 100,
      utilizationRate: Math.round(utilizationRate * 10) / 10,
      recommendedAmount: Math.round(recommendedAmount * 100) / 100,
    };
  }

  /**
   * Check if borrower is eligible for a loan
   */
  checkEligibility(
    creditScore: CreditScore,
    requestedAmount: number,
    creditLimit: CreditLimit
  ): { eligible: boolean; reason: string } {
    // Grade D is not eligible
    if (creditScore.grade === 'D') {
      return { eligible: false, reason: 'Credit score too low' };
    }

    // Check against available credit
    if (requestedAmount > creditLimit.availableCredit) {
      return { 
        eligible: false, 
        reason: `Requested amount exceeds available credit ($${creditLimit.availableCredit.toFixed(2)})` 
      };
    }

    // Check utilization threshold
    if (creditLimit.utilizationRate > 80) {
      return { eligible: false, reason: 'Credit utilization too high' };
    }

    return { eligible: true, reason: 'Eligible for loan' };
  }

  /**
   * Get interest rate adjustment based on credit score
   */
  getInterestRateAdjustment(creditScore: number): number {
    // Higher score = lower rate adjustment (discount)
    // Lower score = higher rate adjustment (premium)
    if (creditScore >= 90) return -2.0;
    if (creditScore >= 80) return -1.0;
    if (creditScore >= 70) return 0;
    if (creditScore >= 60) return 1.0;
    if (creditScore >= 50) return 2.0;
    return 3.0;
  }

  /**
   * Get empty credit history for new borrowers
   */
  getEmptyCreditHistory(): CreditHistory {
    return {
      totalLoans: 0,
      completedLoans: 0,
      defaultedLoans: 0,
      activeLoans: 0,
      totalBorrowed: 0,
      totalRepaid: 0,
      averageRepaymentTime: 0,
      onTimePaymentRate: 1,
    };
  }
}

// Export singleton
export const creditService = new CreditService();
export { CreditService, GRADE_THRESHOLDS };
export default creditService;

