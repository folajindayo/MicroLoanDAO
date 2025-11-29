/**
 * LenderStats Component
 * Dashboard widget showing lender statistics
 */

'use client';

import React, { useMemo } from 'react';

import { Card } from './ui/Card';

export interface LenderStatsData {
  totalLent: number;
  activeLoans: number;
  completedLoans: number;
  totalEarnings: number;
  pendingReturns: number;
  averageAPY: number;
  defaultRate: number;
  portfolioValue: number;
}

export interface LenderStatsProps {
  stats: LenderStatsData;
  currency?: string;
  period?: 'all' | '30d' | '90d' | '1y';
  showChart?: boolean;
  className?: string;
}

/**
 * Format currency value
 */
function formatCurrency(value: number, currency: string): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Stat card component
 */
function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'text-white',
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  icon?: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="p-4 bg-gray-800/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{title}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
        {trend && (
          <span className={`text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Mini donut chart
 */
function DonutChart({
  active,
  completed,
  defaulted,
}: {
  active: number;
  completed: number;
  defaulted: number;
}) {
  const total = active + completed + defaulted;
  if (total === 0) return null;
  
  const activePercent = (active / total) * 100;
  const completedPercent = (completed / total) * 100;
  
  const activeOffset = 0;
  const completedOffset = activePercent;
  const defaultedOffset = activePercent + completedPercent;
  
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="rgba(239, 68, 68, 0.3)"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="rgb(34, 197, 94)"
          strokeWidth="3"
          strokeDasharray={`${completedPercent} ${100 - completedPercent}`}
          strokeDashoffset={-completedOffset}
          className="transition-all duration-500"
        />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="3"
          strokeDasharray={`${activePercent} ${100 - activePercent}`}
          strokeDashoffset={-activeOffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl font-bold text-white">{total}</div>
        <div className="text-xs text-gray-400">Loans</div>
      </div>
    </div>
  );
}

/**
 * Lender statistics dashboard widget
 */
export function LenderStats({
  stats,
  currency = 'USD',
  period = 'all',
  showChart = true,
  className = '',
}: LenderStatsProps): React.ReactElement {
  // Calculate derived stats
  const derived = useMemo(() => {
    const totalLoans = stats.activeLoans + stats.completedLoans;
    const successRate = totalLoans > 0
      ? ((stats.completedLoans / totalLoans) * 100).toFixed(1)
      : '100';
    const roi = stats.totalLent > 0
      ? ((stats.totalEarnings / stats.totalLent) * 100).toFixed(2)
      : '0';
    
    return { totalLoans, successRate, roi };
  }, [stats]);
  
  const defaultedLoans = Math.round(stats.activeLoans * stats.defaultRate);
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Lending Overview</h3>
        <div className="text-sm text-gray-400">
          {period === 'all' ? 'All Time' : `Last ${period}`}
        </div>
      </div>
      
      {/* Main stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Lent"
          value={formatCurrency(stats.totalLent, currency)}
          color="text-blue-400"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats.totalEarnings, currency)}
          subtitle={`${derived.roi}% ROI`}
          color="text-green-400"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        
        <StatCard
          title="Active Loans"
          value={String(stats.activeLoans)}
          subtitle={formatCurrency(stats.pendingReturns, currency)}
          color="text-yellow-400"
        />
        
        <StatCard
          title="Average APY"
          value={`${stats.averageAPY.toFixed(1)}%`}
          color="text-purple-400"
        />
      </div>
      
      {/* Chart and breakdown */}
      {showChart && (
        <div className="flex items-center gap-6 p-4 bg-gray-800/30 rounded-lg">
          <DonutChart
            active={stats.activeLoans}
            completed={stats.completedLoans}
            defaulted={defaultedLoans}
          />
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-400">Active</span>
              </div>
              <span className="text-white font-medium">{stats.activeLoans}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-400">Completed</span>
              </div>
              <span className="text-white font-medium">{stats.completedLoans}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/30" />
                <span className="text-sm text-gray-400">Defaulted</span>
              </div>
              <span className="text-white font-medium">{defaultedLoans}</span>
            </div>
            
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Success Rate</span>
                <span className="text-green-400 font-medium">{derived.successRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Portfolio value */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Portfolio Value</div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(stats.portfolioValue, currency)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Pending Returns</div>
            <div className="text-lg font-semibold text-green-400">
              +{formatCurrency(stats.pendingReturns, currency)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default LenderStats;

