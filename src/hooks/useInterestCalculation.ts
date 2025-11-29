/**
 * useInterestCalculation Hook
 * Calculate loan interest with various methods
 */

import { useMemo, useCallback } from 'react';

export type InterestType = 'simple' | 'compound' | 'amortized';
export type CompoundFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';

export interface InterestCalculationParams {
  principal: number;
  annualRate: number;
  durationDays: number;
  interestType?: InterestType;
  compoundFrequency?: CompoundFrequency;
}

export interface InterestCalculationResult {
  totalInterest: number;
  totalRepayment: number;
  effectiveAPR: number;
  dailyInterest: number;
  monthlyInterest: number;
}

export interface AmortizationScheduleItem {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface UseInterestCalculationReturn {
  calculate: (params: InterestCalculationParams) => InterestCalculationResult;
  calculateSimpleInterest: (principal: number, rate: number, days: number) => number;
  calculateCompoundInterest: (principal: number, rate: number, days: number, frequency: CompoundFrequency) => number;
  generateAmortizationSchedule: (principal: number, rate: number, periods: number) => AmortizationScheduleItem[];
  getEffectiveAPR: (nominalRate: number, frequency: CompoundFrequency) => number;
  getRateForDuration: (annualRate: number, days: number) => number;
}

/**
 * Get number of compounding periods per year
 */
function getPeriodsPerYear(frequency: CompoundFrequency): number {
  switch (frequency) {
    case 'daily': return 365;
    case 'weekly': return 52;
    case 'monthly': return 12;
    case 'quarterly': return 4;
    case 'annually': return 1;
  }
}

/**
 * Hook for interest calculations
 */
export function useInterestCalculation(): UseInterestCalculationReturn {
  // Simple interest calculation
  const calculateSimpleInterest = useCallback((
    principal: number,
    annualRate: number,
    durationDays: number
  ): number => {
    const rate = annualRate / 100;
    const time = durationDays / 365;
    return principal * rate * time;
  }, []);

  // Compound interest calculation
  const calculateCompoundInterest = useCallback((
    principal: number,
    annualRate: number,
    durationDays: number,
    frequency: CompoundFrequency
  ): number => {
    const rate = annualRate / 100;
    const n = getPeriodsPerYear(frequency);
    const t = durationDays / 365;
    
    // A = P(1 + r/n)^(nt) - P
    const compoundFactor = Math.pow(1 + rate / n, n * t);
    return principal * compoundFactor - principal;
  }, []);

  // Main calculation function
  const calculate = useCallback((
    params: InterestCalculationParams
  ): InterestCalculationResult => {
    const {
      principal,
      annualRate,
      durationDays,
      interestType = 'simple',
      compoundFrequency = 'monthly',
    } = params;

    let totalInterest: number;

    switch (interestType) {
      case 'simple':
        totalInterest = calculateSimpleInterest(principal, annualRate, durationDays);
        break;
      case 'compound':
        totalInterest = calculateCompoundInterest(principal, annualRate, durationDays, compoundFrequency);
        break;
      case 'amortized':
        // For amortized, interest is included in periodic payments
        totalInterest = calculateCompoundInterest(principal, annualRate, durationDays, compoundFrequency);
        break;
      default:
        totalInterest = calculateSimpleInterest(principal, annualRate, durationDays);
    }

    const totalRepayment = principal + totalInterest;
    const effectiveAPR = principal > 0 ? (totalInterest / principal) * (365 / durationDays) * 100 : 0;
    const dailyInterest = durationDays > 0 ? totalInterest / durationDays : 0;
    const monthlyInterest = dailyInterest * 30;

    return {
      totalInterest,
      totalRepayment,
      effectiveAPR: Math.round(effectiveAPR * 100) / 100,
      dailyInterest,
      monthlyInterest,
    };
  }, [calculateSimpleInterest, calculateCompoundInterest]);

  // Generate amortization schedule
  const generateAmortizationSchedule = useCallback((
    principal: number,
    annualRate: number,
    periods: number
  ): AmortizationScheduleItem[] => {
    const monthlyRate = annualRate / 100 / 12;
    
    // Calculate fixed monthly payment using amortization formula
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, periods)) / 
                   (Math.pow(1 + monthlyRate, periods) - 1);
    
    const schedule: AmortizationScheduleItem[] = [];
    let balance = principal;

    for (let period = 1; period <= periods; period++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = payment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        period,
        payment: Math.round(payment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        balance: Math.max(0, Math.round(balance * 100) / 100),
      });
    }

    return schedule;
  }, []);

  // Get effective APR from nominal rate
  const getEffectiveAPR = useCallback((
    nominalRate: number,
    frequency: CompoundFrequency
  ): number => {
    const n = getPeriodsPerYear(frequency);
    const r = nominalRate / 100;
    // Effective APR = (1 + r/n)^n - 1
    return (Math.pow(1 + r / n, n) - 1) * 100;
  }, []);

  // Get rate for specific duration
  const getRateForDuration = useCallback((
    annualRate: number,
    days: number
  ): number => {
    return (annualRate * days) / 365;
  }, []);

  return {
    calculate,
    calculateSimpleInterest,
    calculateCompoundInterest,
    generateAmortizationSchedule,
    getEffectiveAPR,
    getRateForDuration,
  };
}

/**
 * Memoized interest calculation for a specific loan
 */
export function useLoanInterest(
  principal: number,
  annualRate: number,
  durationDays: number,
  interestType: InterestType = 'simple'
): InterestCalculationResult {
  const { calculate } = useInterestCalculation();

  return useMemo(
    () => calculate({ principal, annualRate, durationDays, interestType }),
    [calculate, principal, annualRate, durationDays, interestType]
  );
}

export default useInterestCalculation;

