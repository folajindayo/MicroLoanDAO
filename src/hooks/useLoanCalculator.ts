import { useState, useMemo, useCallback } from 'react';
import { parseEther, formatEther } from 'viem';

interface LoanCalculation {
  principal: bigint;
  interest: bigint;
  totalRepayment: bigint;
  monthlyPayment: bigint;
  dailyInterest: bigint;
  formattedPrincipal: string;
  formattedInterest: string;
  formattedTotal: string;
  formattedMonthly: string;
}

interface UseLoanCalculatorReturn {
  calculation: LoanCalculation | null;
  calculate: (amount: string, interestRate: number, durationDays: number) => void;
  isValid: boolean;
  error: string | null;
}

/**
 * Calculate interest and repayment amounts for a loan
 */
function calculateLoan(
  amount: bigint,
  interestRateBps: number, // basis points (100 = 1%)
  durationDays: number
): LoanCalculation {
  const principal = amount;
  
  // Calculate interest: principal * rate * (days / 365)
  const annualInterest = (principal * BigInt(interestRateBps)) / 10000n;
  const interest = (annualInterest * BigInt(durationDays)) / 365n;
  
  const totalRepayment = principal + interest;
  const monthlyPayment = durationDays >= 30 
    ? (totalRepayment * 30n) / BigInt(durationDays)
    : totalRepayment;
  const dailyInterest = interest / BigInt(durationDays || 1);

  return {
    principal,
    interest,
    totalRepayment,
    monthlyPayment,
    dailyInterest,
    formattedPrincipal: formatEther(principal),
    formattedInterest: formatEther(interest),
    formattedTotal: formatEther(totalRepayment),
    formattedMonthly: formatEther(monthlyPayment),
  };
}

/**
 * Hook for calculating loan terms
 */
export function useLoanCalculator(): UseLoanCalculatorReturn {
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback((amount: string, interestRate: number, durationDays: number) => {
    setError(null);

    try {
      if (!amount || parseFloat(amount) <= 0) {
        setError('Amount must be greater than 0');
        setCalculation(null);
        return;
      }

      if (interestRate < 0 || interestRate > 10000) {
        setError('Interest rate must be between 0% and 100%');
        setCalculation(null);
        return;
      }

      if (durationDays < 1 || durationDays > 365) {
        setError('Duration must be between 1 and 365 days');
        setCalculation(null);
        return;
      }

      const amountWei = parseEther(amount);
      const result = calculateLoan(amountWei, interestRate, durationDays);
      setCalculation(result);
    } catch (err) {
      setError('Invalid input values');
      setCalculation(null);
    }
  }, []);

  const isValid = calculation !== null && error === null;

  return { calculation, calculate, isValid, error };
}

/**
 * Hook for displaying loan APR
 */
export function useAPRCalculator(interestRateBps: number, durationDays: number): number {
  return useMemo(() => {
    if (durationDays <= 0) return 0;
    // Annualized rate: (rate * 365) / days
    return (interestRateBps * 365) / durationDays;
  }, [interestRateBps, durationDays]);
}

/**
 * Hook for repayment schedule
 */
export function useRepaymentSchedule(
  principal: bigint,
  interestRateBps: number,
  durationDays: number
): Array<{ day: number; principal: bigint; interest: bigint; total: bigint }> {
  return useMemo(() => {
    if (principal === 0n || durationDays === 0) return [];

    const dailyPrincipal = principal / BigInt(durationDays);
    const dailyInterest = (principal * BigInt(interestRateBps)) / 10000n / 365n;
    
    const schedule = [];
    let remainingPrincipal = principal;

    for (let day = 1; day <= durationDays; day++) {
      const principalPayment = day === durationDays ? remainingPrincipal : dailyPrincipal;
      remainingPrincipal -= principalPayment;
      
      schedule.push({
        day,
        principal: principalPayment,
        interest: dailyInterest,
        total: principalPayment + dailyInterest,
      });
    }

    return schedule;
  }, [principal, interestRateBps, durationDays]);
}

export default useLoanCalculator;

