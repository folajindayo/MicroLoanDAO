/**
 * Interest Service
 * Calculate interest rates, APR/APY conversions, and accrued interest
 */

export interface InterestCalculation {
  principal: number;
  rate: number;
  duration: number;
  simpleInterest: number;
  compoundInterest: number;
  totalRepayment: number;
  dailyInterest: number;
  effectiveAPR: number;
  effectiveAPY: number;
}

export interface RateRecommendation {
  minRate: number;
  maxRate: number;
  recommendedRate: number;
  marketAverage: number;
  reasoning: string;
}

export interface AccruedInterest {
  principal: bigint;
  startDate: Date;
  currentDate: Date;
  elapsedDays: number;
  accruedAmount: bigint;
  dailyRate: number;
}

export type InterestModel = 'simple' | 'compound' | 'continuous';

// Basis points constants
const BPS_PRECISION = 10000;
const DAYS_PER_YEAR = 365;
const SECONDS_PER_DAY = 86400;

class InterestService {
  /**
   * Convert basis points to percentage
   */
  bpsToPercent(bps: number): number {
    return bps / 100;
  }

  /**
   * Convert percentage to basis points
   */
  percentToBps(percent: number): number {
    return Math.round(percent * 100);
  }

  /**
   * Calculate simple interest
   */
  calculateSimpleInterest(
    principal: number,
    annualRatePercent: number,
    durationDays: number
  ): number {
    const rate = annualRatePercent / 100;
    const years = durationDays / DAYS_PER_YEAR;
    return principal * rate * years;
  }

  /**
   * Calculate compound interest (daily compounding)
   */
  calculateCompoundInterest(
    principal: number,
    annualRatePercent: number,
    durationDays: number,
    compoundsPerYear: number = DAYS_PER_YEAR
  ): number {
    const rate = annualRatePercent / 100;
    const n = compoundsPerYear;
    const t = durationDays / DAYS_PER_YEAR;
    const amount = principal * Math.pow(1 + rate / n, n * t);
    return amount - principal;
  }

  /**
   * Calculate continuous compound interest
   */
  calculateContinuousInterest(
    principal: number,
    annualRatePercent: number,
    durationDays: number
  ): number {
    const rate = annualRatePercent / 100;
    const t = durationDays / DAYS_PER_YEAR;
    const amount = principal * Math.exp(rate * t);
    return amount - principal;
  }

  /**
   * Get complete interest calculation breakdown
   */
  calculateInterest(
    principal: number,
    annualRatePercent: number,
    durationDays: number,
    model: InterestModel = 'simple'
  ): InterestCalculation {
    const simpleInterest = this.calculateSimpleInterest(principal, annualRatePercent, durationDays);
    const compoundInterest = this.calculateCompoundInterest(principal, annualRatePercent, durationDays);
    
    let interest: number;
    switch (model) {
      case 'compound':
        interest = compoundInterest;
        break;
      case 'continuous':
        interest = this.calculateContinuousInterest(principal, annualRatePercent, durationDays);
        break;
      default:
        interest = simpleInterest;
    }

    const totalRepayment = principal + interest;
    const dailyInterest = interest / durationDays;

    // Calculate effective APR (annualized)
    const effectiveAPR = durationDays > 0 
      ? ((interest / principal) / durationDays) * DAYS_PER_YEAR * 100
      : 0;

    // Calculate effective APY (with daily compounding)
    const dailyRate = annualRatePercent / 100 / DAYS_PER_YEAR;
    const effectiveAPY = (Math.pow(1 + dailyRate, DAYS_PER_YEAR) - 1) * 100;

    return {
      principal,
      rate: annualRatePercent,
      duration: durationDays,
      simpleInterest: Math.round(simpleInterest * 1e6) / 1e6,
      compoundInterest: Math.round(compoundInterest * 1e6) / 1e6,
      totalRepayment: Math.round(totalRepayment * 1e6) / 1e6,
      dailyInterest: Math.round(dailyInterest * 1e8) / 1e8,
      effectiveAPR: Math.round(effectiveAPR * 100) / 100,
      effectiveAPY: Math.round(effectiveAPY * 100) / 100,
    };
  }

  /**
   * Convert APR to APY
   */
  aprToApy(aprPercent: number, compoundsPerYear: number = DAYS_PER_YEAR): number {
    const apr = aprPercent / 100;
    const apy = Math.pow(1 + apr / compoundsPerYear, compoundsPerYear) - 1;
    return Math.round(apy * 10000) / 100;
  }

  /**
   * Convert APY to APR
   */
  apyToApr(apyPercent: number, compoundsPerYear: number = DAYS_PER_YEAR): number {
    const apy = apyPercent / 100;
    const apr = compoundsPerYear * (Math.pow(1 + apy, 1 / compoundsPerYear) - 1);
    return Math.round(apr * 10000) / 100;
  }

  /**
   * Calculate accrued interest on a loan
   */
  calculateAccruedInterest(
    principalWei: bigint,
    rateBps: number,
    startTimestamp: number,
    currentTimestamp?: number
  ): AccruedInterest {
    const now = currentTimestamp || Math.floor(Date.now() / 1000);
    const elapsedSeconds = Math.max(0, now - startTimestamp);
    const elapsedDays = elapsedSeconds / SECONDS_PER_DAY;

    const dailyRate = rateBps / BPS_PRECISION / DAYS_PER_YEAR;
    
    // Calculate accrued in wei (using bigint math to avoid precision loss)
    const rateMultiplier = BigInt(Math.floor(dailyRate * elapsedDays * 1e18));
    const accruedAmount = (principalWei * rateMultiplier) / BigInt(1e18);

    return {
      principal: principalWei,
      startDate: new Date(startTimestamp * 1000),
      currentDate: new Date(now * 1000),
      elapsedDays: Math.round(elapsedDays * 100) / 100,
      accruedAmount,
      dailyRate,
    };
  }

  /**
   * Get rate recommendation based on loan parameters
   */
  getRecommendedRate(
    loanAmount: number,
    durationDays: number,
    collateralRatio: number,
    borrowerReputation: number = 50
  ): RateRecommendation {
    // Base rate calculation
    let baseRate = 5; // 5% base

    // Adjust for amount (larger loans = slightly lower rate)
    if (loanAmount > 10) baseRate -= 0.5;
    if (loanAmount > 100) baseRate -= 0.5;

    // Adjust for duration (longer = higher rate)
    if (durationDays > 30) baseRate += 1;
    if (durationDays > 90) baseRate += 1;
    if (durationDays > 180) baseRate += 2;

    // Adjust for collateral (more collateral = lower rate)
    if (collateralRatio >= 200) baseRate -= 2;
    else if (collateralRatio >= 150) baseRate -= 1;
    else if (collateralRatio < 130) baseRate += 2;

    // Adjust for reputation
    if (borrowerReputation >= 80) baseRate -= 1;
    else if (borrowerReputation < 30) baseRate += 2;

    // Ensure reasonable bounds
    const minRate = Math.max(1, baseRate - 2);
    const maxRate = Math.min(30, baseRate + 5);
    const recommendedRate = Math.max(minRate, Math.min(maxRate, baseRate));

    // Generate reasoning
    const reasons: string[] = [];
    if (collateralRatio >= 150) reasons.push('Good collateral coverage');
    if (borrowerReputation >= 70) reasons.push('High reputation score');
    if (durationDays <= 30) reasons.push('Short loan term');
    if (loanAmount < 10) reasons.push('Small loan amount');

    return {
      minRate: Math.round(minRate * 10) / 10,
      maxRate: Math.round(maxRate * 10) / 10,
      recommendedRate: Math.round(recommendedRate * 10) / 10,
      marketAverage: 8.5, // Mock market average
      reasoning: reasons.length > 0 
        ? reasons.join('. ') + '.'
        : 'Based on market conditions.',
    };
  }

  /**
   * Calculate early repayment discount
   */
  calculateEarlyRepaymentDiscount(
    remainingInterest: number,
    daysRemaining: number,
    totalDuration: number
  ): number {
    // Linear discount based on time remaining
    const discountRate = Math.min(0.3, (daysRemaining / totalDuration) * 0.5);
    return Math.round(remainingInterest * discountRate * 100) / 100;
  }

  /**
   * Calculate late payment penalty
   */
  calculateLatePenalty(
    principal: number,
    daysLate: number,
    penaltyRatePercent: number = 1
  ): number {
    // Penalty increases with days late
    const escalationFactor = Math.min(3, 1 + (daysLate / 30) * 0.5);
    const penalty = principal * (penaltyRatePercent / 100) * daysLate * escalationFactor;
    return Math.round(penalty * 100) / 100;
  }

  /**
   * Generate amortization schedule
   */
  generateAmortizationSchedule(
    principal: number,
    annualRatePercent: number,
    payments: number
  ): Array<{ payment: number; principal: number; interest: number; balance: number }> {
    const schedule: Array<{ payment: number; principal: number; interest: number; balance: number }> = [];
    const monthlyRate = annualRatePercent / 100 / 12;
    
    // Calculate fixed payment (PMT formula)
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) /
      (Math.pow(1 + monthlyRate, payments) - 1);

    let balance = principal;

    for (let i = 1; i <= payments; i++) {
      const interest = balance * monthlyRate;
      const principalPortion = payment - interest;
      balance = Math.max(0, balance - principalPortion);

      schedule.push({
        payment: Math.round(payment * 100) / 100,
        principal: Math.round(principalPortion * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        balance: Math.round(balance * 100) / 100,
      });
    }

    return schedule;
  }
}

// Export singleton
export const interestService = new InterestService();
export { InterestService };
export default interestService;

