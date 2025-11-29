/**
 * RepaymentSchedule Component
 * Timeline visualization of loan repayment schedule
 */

'use client';

import React, { useMemo } from 'react';

import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export interface ScheduleItem {
  id: string;
  date: Date;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
  status: 'paid' | 'pending' | 'overdue' | 'upcoming';
}

export interface RepaymentScheduleProps {
  items: ScheduleItem[];
  currency?: string;
  onPaymentClick?: (item: ScheduleItem) => void;
  showBalance?: boolean;
  className?: string;
}

/**
 * Get status color for badge
 */
function getStatusColor(status: ScheduleItem['status']): string {
  switch (status) {
    case 'paid':
      return 'bg-green-500/20 text-green-400';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'overdue':
      return 'bg-red-500/20 text-red-400';
    case 'upcoming':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format currency value
 */
function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Individual schedule item component
 */
function ScheduleItemRow({
  item,
  currency,
  showBalance,
  isLast,
  onClick,
}: {
  item: ScheduleItem;
  currency: string;
  showBalance: boolean;
  isLast: boolean;
  onClick?: () => void;
}) {
  const isPaid = item.status === 'paid';
  
  return (
    <div
      className={`
        relative pl-8 pb-6 
        ${!isLast ? 'border-l-2 border-gray-700 ml-3' : 'ml-3'}
        ${onClick ? 'cursor-pointer hover:bg-gray-800/30 -mx-4 px-12 py-2 rounded-lg transition-colors' : ''}
      `}
      onClick={onClick}
    >
      {/* Timeline dot */}
      <div
        className={`
          absolute left-0 top-0 w-6 h-6 rounded-full 
          flex items-center justify-center -translate-x-1/2
          ${isPaid ? 'bg-green-500' : 'bg-gray-600'}
        `}
      >
        {isPaid && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      
      {/* Content */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-medium">{formatDate(item.date)}</span>
            <Badge className={getStatusColor(item.status)}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-400 space-x-4">
            <span>Principal: {formatCurrency(item.principal, currency)}</span>
            <span>Interest: {formatCurrency(item.interest, currency)}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {formatCurrency(item.amount, currency)}
          </div>
          {showBalance && (
            <div className="text-sm text-gray-500">
              Balance: {formatCurrency(item.balance, currency)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Repayment schedule timeline component
 */
export function RepaymentSchedule({
  items,
  currency = 'USD',
  onPaymentClick,
  showBalance = true,
  className = '',
}: RepaymentScheduleProps): React.ReactElement {
  // Calculate totals
  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        totalAmount: acc.totalAmount + item.amount,
        totalPrincipal: acc.totalPrincipal + item.principal,
        totalInterest: acc.totalInterest + item.interest,
        paidCount: acc.paidCount + (item.status === 'paid' ? 1 : 0),
      }),
      { totalAmount: 0, totalPrincipal: 0, totalInterest: 0, paidCount: 0 }
    );
  }, [items]);
  
  const progress = items.length > 0 ? (totals.paidCount / items.length) * 100 : 0;
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Repayment Schedule</h3>
        <div className="text-sm text-gray-400">
          {totals.paidCount} of {items.length} payments
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-400">
          <span>{progress.toFixed(0)}% Complete</span>
          <span>{formatCurrency(totals.totalAmount, currency)} Total</span>
        </div>
      </div>
      
      {/* Schedule items */}
      {items.length > 0 ? (
        <div className="space-y-0">
          {items.map((item, index) => (
            <ScheduleItemRow
              key={item.id}
              item={item}
              currency={currency}
              showBalance={showBalance}
              isLast={index === items.length - 1}
              onClick={onPaymentClick ? () => onPaymentClick(item) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No scheduled payments
        </div>
      )}
      
      {/* Summary */}
      {items.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-400">Total Principal</div>
            <div className="text-white font-semibold">
              {formatCurrency(totals.totalPrincipal, currency)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Interest</div>
            <div className="text-yellow-400 font-semibold">
              {formatCurrency(totals.totalInterest, currency)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Amount</div>
            <div className="text-green-400 font-semibold">
              {formatCurrency(totals.totalAmount, currency)}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default RepaymentSchedule;

