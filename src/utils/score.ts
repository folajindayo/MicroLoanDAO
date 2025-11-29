/**
 * Reputation Scoring Utilities
 * Functions for calculating and managing reputation scores
 */

export interface ScoreComponents {
  paymentHistory: number;
  loanCompletion: number;
  timeOnPlatform: number;
  volumeScore: number;
  communityScore: number;
}

export interface ScoreResult {
  totalScore: number;
  grade: ScoreGrade;
  components: ScoreComponents;
  trend: 'improving' | 'stable' | 'declining';
  percentile: number;
}

export type ScoreGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

// Grade thresholds
const GRADE_THRESHOLDS: Record<ScoreGrade, { min: number; max: number }> = {
  'S': { min: 95, max: 100 },
  'A': { min: 85, max: 94 },
  'B': { min: 70, max: 84 },
  'C': { min: 55, max: 69 },
  'D': { min: 40, max: 54 },
  'F': { min: 0, max: 39 },
};

// Component weights
const COMPONENT_WEIGHTS: Record<keyof ScoreComponents, number> = {
  paymentHistory: 0.35,
  loanCompletion: 0.25,
  timeOnPlatform: 0.15,
  volumeScore: 0.15,
  communityScore: 0.10,
};

/**
 * Calculate payment history score
 */
export function calculatePaymentHistoryScore(
  onTimePayments: number,
  latePayments: number,
  missedPayments: number
): number {
  const totalPayments = onTimePayments + latePayments + missedPayments;
  if (totalPayments === 0) return 50; // Default for new users

  const onTimeWeight = 1.0;
  const lateWeight = 0.5;
  const missedWeight = 0;

  const weightedSum = onTimePayments * onTimeWeight + 
                      latePayments * lateWeight + 
                      missedPayments * missedWeight;

  return Math.round((weightedSum / totalPayments) * 100);
}

/**
 * Calculate loan completion score
 */
export function calculateLoanCompletionScore(
  completedLoans: number,
  defaultedLoans: number,
  activeLoans: number
): number {
  const totalLoans = completedLoans + defaultedLoans;
  if (totalLoans === 0) return 50; // Default for new users

  const completionRate = completedLoans / totalLoans;
  const baseScore = completionRate * 100;

  // Bonus for more completed loans
  const volumeBonus = Math.min(10, completedLoans);

  // Penalty for active loans at risk
  const activePenalty = activeLoans > 5 ? Math.min(10, (activeLoans - 5) * 2) : 0;

  return Math.min(100, Math.max(0, Math.round(baseScore + volumeBonus - activePenalty)));
}

/**
 * Calculate time on platform score
 */
export function calculateTimeOnPlatformScore(
  firstActivityTimestamp: number,
  currentTimestamp?: number
): number {
  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  const daysOnPlatform = (now - firstActivityTimestamp) / 86400;

  // Logarithmic scaling - diminishing returns after certain time
  const score = Math.min(100, Math.log10(daysOnPlatform + 1) * 40);
  return Math.round(score);
}

/**
 * Calculate volume score
 */
export function calculateVolumeScore(
  totalVolume: number,
  medianVolume: number = 10000
): number {
  if (totalVolume <= 0) return 0;

  // Logarithmic scaling relative to median
  const ratio = totalVolume / medianVolume;
  const score = Math.min(100, 50 + Math.log10(ratio) * 25);
  return Math.max(0, Math.round(score));
}

/**
 * Calculate community score
 */
export function calculateCommunityScore(
  upvotes: number,
  downvotes: number,
  referrals: number
): number {
  const totalVotes = upvotes + downvotes;
  let voteScore = 50;

  if (totalVotes > 0) {
    voteScore = Math.round((upvotes / totalVotes) * 100);
  }

  // Bonus for referrals (up to 20 points)
  const referralBonus = Math.min(20, referrals * 5);

  return Math.min(100, voteScore + referralBonus);
}

/**
 * Calculate total reputation score
 */
export function calculateTotalScore(components: ScoreComponents): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(COMPONENT_WEIGHTS)) {
    const componentKey = key as keyof ScoreComponents;
    weightedSum += components[componentKey] * weight;
    totalWeight += weight;
  }

  return Math.round(weightedSum / totalWeight);
}

/**
 * Get grade from score
 */
export function scoreToGrade(score: number): ScoreGrade {
  for (const [grade, threshold] of Object.entries(GRADE_THRESHOLDS)) {
    if (score >= threshold.min && score <= threshold.max) {
      return grade as ScoreGrade;
    }
  }
  return 'F';
}

/**
 * Calculate full score result
 */
export function calculateScore(params: {
  onTimePayments: number;
  latePayments: number;
  missedPayments: number;
  completedLoans: number;
  defaultedLoans: number;
  activeLoans: number;
  firstActivityTimestamp: number;
  totalVolume: number;
  upvotes: number;
  downvotes: number;
  referrals: number;
  previousScore?: number;
}): ScoreResult {
  const components: ScoreComponents = {
    paymentHistory: calculatePaymentHistoryScore(
      params.onTimePayments,
      params.latePayments,
      params.missedPayments
    ),
    loanCompletion: calculateLoanCompletionScore(
      params.completedLoans,
      params.defaultedLoans,
      params.activeLoans
    ),
    timeOnPlatform: calculateTimeOnPlatformScore(params.firstActivityTimestamp),
    volumeScore: calculateVolumeScore(params.totalVolume),
    communityScore: calculateCommunityScore(
      params.upvotes,
      params.downvotes,
      params.referrals
    ),
  };

  const totalScore = calculateTotalScore(components);
  const grade = scoreToGrade(totalScore);

  // Determine trend
  let trend: ScoreResult['trend'] = 'stable';
  if (params.previousScore !== undefined) {
    if (totalScore > params.previousScore + 5) trend = 'improving';
    else if (totalScore < params.previousScore - 5) trend = 'declining';
  }

  // Calculate percentile (mock - would need distribution data)
  const percentile = Math.min(99, Math.round(totalScore * 0.95));

  return {
    totalScore,
    grade,
    components,
    trend,
    percentile,
  };
}

/**
 * Get grade color
 */
export function getGradeColor(grade: ScoreGrade): string {
  const colors: Record<ScoreGrade, string> = {
    'S': '#FFD700',
    'A': '#22C55E',
    'B': '#3B82F6',
    'C': '#EAB308',
    'D': '#F97316',
    'F': '#EF4444',
  };
  return colors[grade];
}

/**
 * Get grade CSS class
 */
export function getGradeClass(grade: ScoreGrade): string {
  const classes: Record<ScoreGrade, string> = {
    'S': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'A': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'B': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'C': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'D': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'F': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return classes[grade];
}

/**
 * Format score for display
 */
export function formatScore(score: number): string {
  return `${score}/100`;
}

/**
 * Get score description
 */
export function getScoreDescription(grade: ScoreGrade): string {
  const descriptions: Record<ScoreGrade, string> = {
    'S': 'Exceptional - Top tier borrower/lender',
    'A': 'Excellent - Highly reliable',
    'B': 'Good - Solid track record',
    'C': 'Fair - Some concerns',
    'D': 'Poor - High risk',
    'F': 'Very Poor - Significant issues',
  };
  return descriptions[grade];
}

export { GRADE_THRESHOLDS, COMPONENT_WEIGHTS };

