/**
 * BorrowerProfile Component
 * Display borrower information and reputation
 */

'use client';

import React from 'react';

import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';

export interface BorrowerStats {
  totalLoans: number;
  completedLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  onTimePayments: number;
  latePayments: number;
  defaultedLoans: number;
}

export interface BorrowerProfileProps {
  address: string;
  ensName?: string;
  avatarUrl?: string;
  reputationScore: number;
  memberSince: Date;
  isVerified?: boolean;
  stats: BorrowerStats;
  onViewHistory?: () => void;
  className?: string;
}

/**
 * Get reputation tier info
 */
function getReputationTier(score: number): {
  tier: string;
  color: string;
  bgColor: string;
} {
  if (score >= 90) return { tier: 'Excellent', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' };
  if (score >= 75) return { tier: 'Good', color: 'text-green-400', bgColor: 'bg-green-500/20' };
  if (score >= 60) return { tier: 'Fair', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
  if (score >= 40) return { tier: 'Risky', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
  return { tier: 'High Risk', color: 'text-red-400', bgColor: 'bg-red-500/20' };
}

/**
 * Format address for display
 */
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format date
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Stat item component
 */
function StatItem({
  label,
  value,
  color = 'text-white',
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

/**
 * Borrower profile card component
 */
export function BorrowerProfile({
  address,
  ensName,
  avatarUrl,
  reputationScore,
  memberSince,
  isVerified = false,
  stats,
  onViewHistory,
  className = '',
}: BorrowerProfileProps): React.ReactElement {
  const repTier = getReputationTier(reputationScore);
  const completionRate = stats.totalLoans > 0
    ? ((stats.completedLoans / stats.totalLoans) * 100).toFixed(0)
    : '0';
  const onTimeRate = (stats.onTimePayments + stats.latePayments) > 0
    ? ((stats.onTimePayments / (stats.onTimePayments + stats.latePayments)) * 100).toFixed(0)
    : '100';
  
  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar
          src={avatarUrl}
          alt={ensName || address}
          size="lg"
          fallback={address.slice(2, 4).toUpperCase()}
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">
              {ensName || formatAddress(address)}
            </h3>
            {isVerified && (
              <Badge className="bg-blue-500/20 text-blue-400">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Member since {formatDate(memberSince)}</span>
            <span>{stats.totalLoans} total loans</span>
          </div>
        </div>
        
        {/* Reputation score */}
        <div className={`text-center px-4 py-2 rounded-lg ${repTier.bgColor}`}>
          <div className={`text-2xl font-bold ${repTier.color}`}>{reputationScore}</div>
          <div className={`text-xs ${repTier.color}`}>{repTier.tier}</div>
        </div>
      </div>
      
      {/* Reputation bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Reputation Score</span>
          <span className={repTier.color}>{reputationScore}/100</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              reputationScore >= 75 ? 'bg-green-500' :
              reputationScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${reputationScore}%` }}
          />
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-800/50 rounded-lg">
        <StatItem
          label="Completion"
          value={`${completionRate}%`}
          color={Number(completionRate) >= 90 ? 'text-green-400' : 'text-yellow-400'}
        />
        <StatItem
          label="On-Time"
          value={`${onTimeRate}%`}
          color={Number(onTimeRate) >= 95 ? 'text-green-400' : 'text-yellow-400'}
        />
        <StatItem
          label="Borrowed"
          value={formatCurrency(stats.totalBorrowed)}
        />
        <StatItem
          label="Repaid"
          value={formatCurrency(stats.totalRepaid)}
        />
      </div>
      
      {/* Detailed stats */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex justify-between p-2 bg-gray-800/30 rounded">
          <span className="text-gray-400">Completed Loans</span>
          <span className="text-green-400 font-medium">{stats.completedLoans}</span>
        </div>
        <div className="flex justify-between p-2 bg-gray-800/30 rounded">
          <span className="text-gray-400">Late Payments</span>
          <span className="text-yellow-400 font-medium">{stats.latePayments}</span>
        </div>
        <div className="flex justify-between p-2 bg-gray-800/30 rounded">
          <span className="text-gray-400">Defaulted</span>
          <span className="text-red-400 font-medium">{stats.defaultedLoans}</span>
        </div>
      </div>
      
      {/* View history button */}
      {onViewHistory && (
        <button
          onClick={onViewHistory}
          className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View Full History →
        </button>
      )}
    </Card>
  );
}

export default BorrowerProfile;

