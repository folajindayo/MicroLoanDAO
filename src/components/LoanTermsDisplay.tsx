/**
 * LoanTermsDisplay Component
 * Summary card showing loan terms and conditions
 */

'use client';

import React from 'react';

import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { LoanStatusBadge, LoanStatus } from './LoanStatusBadge';

export interface LoanTerms {
  id: string;
  amount: number;
  currency: string;
  interestRate: number;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months';
  collateralRequired?: number;
  collateralType?: string;
  startDate?: Date;
  endDate?: Date;
  repaymentType: 'bullet' | 'installments' | 'interest-only';
  installmentCount?: number;
  latePaymentPenalty?: number;
  earlyRepaymentAllowed?: boolean;
  earlyRepaymentPenalty?: number;
  status?: LoanStatus;
}

export interface LoanTermsDisplayProps {
  terms: LoanTerms;
  borrowerAddress?: string;
  lenderAddress?: string;
  showActions?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onCounter?: () => void;
  className?: string;
}

/**
 * Format currency
 */
function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format date
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Format address
 */
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get repayment type label
 */
function getRepaymentLabel(type: string): string {
  switch (type) {
    case 'bullet': return 'Single Payment (Bullet)';
    case 'installments': return 'Regular Installments';
    case 'interest-only': return 'Interest Only + Principal';
    default: return type;
  }
}

/**
 * Term row component
 */
function TermRow({
  label,
  value,
  highlight = false,
  valueColor = 'text-white',
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  valueColor?: string;
}) {
  return (
    <div className={`flex justify-between items-center py-2 ${highlight ? 'bg-gray-800/30 -mx-4 px-4 rounded' : ''}`}>
      <span className="text-gray-400">{label}</span>
      <span className={`font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}

/**
 * Loan terms display component
 */
export function LoanTermsDisplay({
  terms,
  borrowerAddress,
  lenderAddress,
  showActions = false,
  onAccept,
  onReject,
  onCounter,
  className = '',
}: LoanTermsDisplayProps): React.ReactElement {
  // Calculate derived values
  const totalInterest = terms.amount * (terms.interestRate / 100) * (terms.duration / 365);
  const totalRepayment = terms.amount + totalInterest;
  const installmentAmount = terms.installmentCount
    ? totalRepayment / terms.installmentCount
    : totalRepayment;
  
  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Loan Terms</h3>
          <div className="text-sm text-gray-400 mt-1">ID: {terms.id}</div>
        </div>
        {terms.status && <LoanStatusBadge status={terms.status} />}
      </div>
      
      {/* Principal amount */}
      <div className="text-center py-6 bg-gray-800/50 rounded-lg mb-6">
        <div className="text-sm text-gray-400 mb-1">Loan Amount</div>
        <div className="text-4xl font-bold text-white">
          {formatCurrency(terms.amount, terms.currency)}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {terms.duration} {terms.durationUnit} at {terms.interestRate}% APR
        </div>
      </div>
      
      {/* Key terms */}
      <div className="space-y-1 mb-6">
        <TermRow
          label="Interest Rate"
          value={`${terms.interestRate}% APR`}
          valueColor="text-yellow-400"
          highlight
        />
        <TermRow
          label="Duration"
          value={`${terms.duration} ${terms.durationUnit}`}
        />
        <TermRow
          label="Repayment Type"
          value={getRepaymentLabel(terms.repaymentType)}
        />
        {terms.installmentCount && (
          <TermRow
            label="Installments"
            value={`${terms.installmentCount} payments of ${formatCurrency(installmentAmount, terms.currency)}`}
          />
        )}
      </div>
      
      {/* Collateral section */}
      {terms.collateralRequired && (
        <div className="border-t border-gray-700 pt-4 mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Collateral Requirements</h4>
          <TermRow
            label="Required Amount"
            value={formatCurrency(terms.collateralRequired, terms.currency)}
            valueColor="text-orange-400"
          />
          {terms.collateralType && (
            <TermRow
              label="Accepted Assets"
              value={
                <Badge className="bg-gray-700 text-gray-300">
                  {terms.collateralType}
                </Badge>
              }
            />
          )}
        </div>
      )}
      
      {/* Dates */}
      {(terms.startDate || terms.endDate) && (
        <div className="border-t border-gray-700 pt-4 mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Timeline</h4>
          {terms.startDate && (
            <TermRow
              label="Start Date"
              value={formatDate(terms.startDate)}
            />
          )}
          {terms.endDate && (
            <TermRow
              label="End Date"
              value={formatDate(terms.endDate)}
            />
          )}
        </div>
      )}
      
      {/* Penalties and options */}
      <div className="border-t border-gray-700 pt-4 mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Penalties & Options</h4>
        {terms.latePaymentPenalty !== undefined && (
          <TermRow
            label="Late Payment Penalty"
            value={`${terms.latePaymentPenalty}%`}
            valueColor="text-red-400"
          />
        )}
        <TermRow
          label="Early Repayment"
          value={
            terms.earlyRepaymentAllowed ? (
              <span className="text-green-400">
                Allowed {terms.earlyRepaymentPenalty ? `(${terms.earlyRepaymentPenalty}% fee)` : '(No fee)'}
              </span>
            ) : (
              <span className="text-red-400">Not Allowed</span>
            )
          }
        />
      </div>
      
      {/* Parties */}
      {(borrowerAddress || lenderAddress) && (
        <div className="border-t border-gray-700 pt-4 mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Parties</h4>
          {borrowerAddress && (
            <TermRow
              label="Borrower"
              value={
                <a
                  href={`https://etherscan.io/address/${borrowerAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {formatAddress(borrowerAddress)}
                </a>
              }
            />
          )}
          {lenderAddress && (
            <TermRow
              label="Lender"
              value={
                <a
                  href={`https://etherscan.io/address/${lenderAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {formatAddress(lenderAddress)}
                </a>
              }
            />
          )}
        </div>
      )}
      
      {/* Summary */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Total Interest</span>
          <span className="text-yellow-400 font-medium">
            {formatCurrency(totalInterest, terms.currency)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300 font-medium">Total Repayment</span>
          <span className="text-xl font-bold text-white">
            {formatCurrency(totalRepayment, terms.currency)}
          </span>
        </div>
      </div>
      
      {/* Actions */}
      {showActions && (
        <div className="flex gap-3">
          {onReject && (
            <button
              onClick={onReject}
              className="flex-1 py-2 px-4 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Reject
            </button>
          )}
          {onCounter && (
            <button
              onClick={onCounter}
              className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Counter
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-colors"
            >
              Accept
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

export default LoanTermsDisplay;

