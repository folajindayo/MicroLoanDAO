/**
 * CollateralDisplay Component
 * Display collateral assets with real-time values
 */

'use client';

import React, { useMemo } from 'react';

import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export interface CollateralAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  priceUSD: number;
  valueUSD: number;
  iconUrl?: string;
  change24h?: number;
}

export interface CollateralDisplayProps {
  assets: CollateralAsset[];
  requiredValue?: number;
  loanAmount?: number;
  liquidationThreshold?: number;
  className?: string;
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format token amount
 */
function formatAmount(amount: number, symbol: string): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(4)}M ${symbol}`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(4)}K ${symbol}`;
  }
  return `${amount.toFixed(4)} ${symbol}`;
}

/**
 * Get health factor color
 */
function getHealthColor(ratio: number, threshold: number): string {
  if (ratio >= threshold * 1.5) return 'text-green-400';
  if (ratio >= threshold * 1.2) return 'text-yellow-400';
  if (ratio >= threshold) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get health status
 */
function getHealthStatus(ratio: number, threshold: number): string {
  if (ratio >= threshold * 1.5) return 'Healthy';
  if (ratio >= threshold * 1.2) return 'Moderate';
  if (ratio >= threshold) return 'At Risk';
  return 'Critical';
}

/**
 * Individual collateral asset row
 */
function AssetRow({ asset }: { asset: CollateralAsset }) {
  const hasChange = typeof asset.change24h === 'number';
  const isPositive = hasChange && asset.change24h! >= 0;
  
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg">
      {/* Icon/Symbol */}
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
        {asset.iconUrl ? (
          <img src={asset.iconUrl} alt={asset.symbol} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-white">{asset.symbol.slice(0, 2)}</span>
        )}
      </div>
      
      {/* Asset info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{asset.name}</span>
          <Badge className="bg-gray-600/50 text-gray-300 text-xs">
            {asset.symbol}
          </Badge>
        </div>
        <div className="text-sm text-gray-400">
          {formatAmount(asset.amount, asset.symbol)}
        </div>
      </div>
      
      {/* Value */}
      <div className="text-right">
        <div className="font-semibold text-white">{formatCurrency(asset.valueUSD)}</div>
        {hasChange && (
          <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{asset.change24h!.toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Collateral display component
 */
export function CollateralDisplay({
  assets,
  requiredValue,
  loanAmount,
  liquidationThreshold = 1.5,
  className = '',
}: CollateralDisplayProps): React.ReactElement {
  // Calculate totals
  const totalValue = useMemo(
    () => assets.reduce((sum, asset) => sum + asset.valueUSD, 0),
    [assets]
  );
  
  // Calculate collateralization ratio
  const collateralRatio = loanAmount && loanAmount > 0 ? totalValue / loanAmount : 0;
  const healthColor = getHealthColor(collateralRatio, liquidationThreshold);
  const healthStatus = getHealthStatus(collateralRatio, liquidationThreshold);
  
  // Calculate liquidation price (simplified)
  const liquidationPrice = loanAmount && assets.length > 0
    ? (loanAmount * liquidationThreshold) / assets.reduce((sum, a) => sum + a.amount, 0)
    : 0;
  
  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-4">Collateral</h3>
      
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
          {requiredValue && (
            <div className="text-sm text-gray-400 mt-1">
              Required: {formatCurrency(requiredValue)}
            </div>
          )}
        </div>
        
        {loanAmount && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Collateral Ratio</div>
            <div className={`text-2xl font-bold ${healthColor}`}>
              {(collateralRatio * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Status: <span className={healthColor}>{healthStatus}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Health bar */}
      {loanAmount && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Health Factor</span>
            <span className={healthColor}>{collateralRatio.toFixed(2)}x</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                collateralRatio >= liquidationThreshold * 1.5
                  ? 'bg-green-500'
                  : collateralRatio >= liquidationThreshold
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (collateralRatio / (liquidationThreshold * 2)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0x</span>
            <span className="text-yellow-500">{liquidationThreshold}x Liquidation</span>
            <span>{(liquidationThreshold * 2).toFixed(1)}x+</span>
          </div>
        </div>
      )}
      
      {/* Asset list */}
      <div className="space-y-3">
        {assets.length > 0 ? (
          assets.map(asset => <AssetRow key={asset.id} asset={asset} />)
        ) : (
          <div className="text-center py-8 text-gray-500">
            No collateral deposited
          </div>
        )}
      </div>
      
      {/* Liquidation warning */}
      {loanAmount && liquidationPrice > 0 && collateralRatio < liquidationThreshold * 1.5 && (
        <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-orange-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Liquidation Risk</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Estimated liquidation price: {formatCurrency(liquidationPrice)} per token
          </p>
        </div>
      )}
    </Card>
  );
}

export default CollateralDisplay;

