/**
 * LoanCalculator Component
 * Interactive calculator for loan payments and interest
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';

import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export interface LoanCalculatorProps {
  minAmount?: number;
  maxAmount?: number;
  minDuration?: number;
  maxDuration?: number;
  defaultInterestRate?: number;
  onCalculate?: (result: CalculationResult) => void;
  className?: string;
}

export interface CalculationResult {
  principal: number;
  interestRate: number;
  duration: number;
  totalInterest: number;
  totalPayment: number;
  monthlyPayment: number;
  effectiveAPR: number;
}

/**
 * Calculate loan payment details
 */
function calculateLoan(
  principal: number,
  annualRate: number,
  durationDays: number
): CalculationResult {
  const monthlyRate = annualRate / 100 / 12;
  const durationMonths = durationDays / 30;
  
  // Simple interest calculation
  const totalInterest = principal * (annualRate / 100) * (durationDays / 365);
  const totalPayment = principal + totalInterest;
  const monthlyPayment = durationMonths > 0 ? totalPayment / durationMonths : totalPayment;
  
  // Effective APR
  const effectiveAPR = (totalInterest / principal) * (365 / durationDays) * 100;
  
  return {
    principal,
    interestRate: annualRate,
    duration: durationDays,
    totalInterest,
    totalPayment,
    monthlyPayment,
    effectiveAPR: isFinite(effectiveAPR) ? effectiveAPR : 0,
  };
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Interactive loan calculator component
 */
export function LoanCalculator({
  minAmount = 100,
  maxAmount = 100000,
  minDuration = 7,
  maxDuration = 365,
  defaultInterestRate = 10,
  onCalculate,
  className = '',
}: LoanCalculatorProps): React.ReactElement {
  const [amount, setAmount] = useState(1000);
  const [duration, setDuration] = useState(30);
  const [interestRate, setInterestRate] = useState(defaultInterestRate);
  
  // Calculate loan details
  const result = useMemo(
    () => calculateLoan(amount, interestRate, duration),
    [amount, interestRate, duration]
  );
  
  // Handle amount change
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(minAmount, Math.min(maxAmount, Number(e.target.value) || 0));
    setAmount(value);
  }, [minAmount, maxAmount]);
  
  // Handle duration change
  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(minDuration, Math.min(maxDuration, Number(e.target.value) || 0));
    setDuration(value);
  }, [minDuration, maxDuration]);
  
  // Handle interest rate change
  const handleRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(100, Number(e.target.value) || 0));
    setInterestRate(value);
  }, []);
  
  // Handle calculate button
  const handleCalculate = useCallback(() => {
    onCalculate?.(result);
  }, [onCalculate, result]);
  
  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-6">Loan Calculator</h3>
      
      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Loan Amount
          </label>
          <Input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            min={minAmount}
            max={maxAmount}
            className="w-full"
          />
          <input
            type="range"
            value={amount}
            onChange={handleAmountChange}
            min={minAmount}
            max={maxAmount}
            className="w-full mt-2 accent-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Duration (days)
          </label>
          <Input
            type="number"
            value={duration}
            onChange={handleDurationChange}
            min={minDuration}
            max={maxDuration}
            className="w-full"
          />
          <input
            type="range"
            value={duration}
            onChange={handleDurationChange}
            min={minDuration}
            max={maxDuration}
            className="w-full mt-2 accent-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Annual Interest Rate (%)
          </label>
          <Input
            type="number"
            value={interestRate}
            onChange={handleRateChange}
            min={0}
            max={100}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Results Section */}
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Principal</span>
          <span className="text-white font-medium">{formatCurrency(result.principal)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Interest</span>
          <span className="text-yellow-400 font-medium">{formatCurrency(result.totalInterest)}</span>
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-700 pt-3">
          <span className="text-gray-400">Total Payment</span>
          <span className="text-white font-bold text-lg">{formatCurrency(result.totalPayment)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Monthly Payment</span>
          <span className="text-green-400 font-medium">{formatCurrency(result.monthlyPayment)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Effective APR</span>
          <span className="text-blue-400 font-medium">{result.effectiveAPR.toFixed(2)}%</span>
        </div>
      </div>
      
      {onCalculate && (
        <Button
          onClick={handleCalculate}
          className="w-full mt-4"
        >
          Apply This Configuration
        </Button>
      )}
    </Card>
  );
}

export default LoanCalculator;

