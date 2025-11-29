/**
 * RiskIndicator Component
 * Gauge component for displaying risk levels
 */

'use client';

import React, { useMemo } from 'react';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskIndicatorProps {
  score: number;
  maxScore?: number;
  label?: string;
  showPercentage?: boolean;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gauge' | 'bar' | 'circular';
  factors?: Array<{
    name: string;
    impact: number;
    description?: string;
  }>;
  className?: string;
}

/**
 * Get risk level from score
 */
function getRiskLevel(score: number, maxScore: number): RiskLevel {
  const percentage = (score / maxScore) * 100;
  if (percentage <= 25) return 'low';
  if (percentage <= 50) return 'medium';
  if (percentage <= 75) return 'high';
  return 'critical';
}

/**
 * Get color configuration for risk level
 */
function getRiskColors(level: RiskLevel): {
  color: string;
  bgColor: string;
  gradient: string;
} {
  switch (level) {
    case 'low':
      return {
        color: 'text-green-400',
        bgColor: 'bg-green-500',
        gradient: 'from-green-500 to-green-400',
      };
    case 'medium':
      return {
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500',
        gradient: 'from-yellow-500 to-yellow-400',
      };
    case 'high':
      return {
        color: 'text-orange-400',
        bgColor: 'bg-orange-500',
        gradient: 'from-orange-500 to-orange-400',
      };
    case 'critical':
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500',
        gradient: 'from-red-500 to-red-400',
      };
  }
}

/**
 * Get risk label
 */
function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'Low Risk';
    case 'medium': return 'Medium Risk';
    case 'high': return 'High Risk';
    case 'critical': return 'Critical Risk';
  }
}

/**
 * Size configurations
 */
const SIZES = {
  sm: { gauge: 80, stroke: 6, text: 'text-sm', label: 'text-xs' },
  md: { gauge: 120, stroke: 8, text: 'text-xl', label: 'text-sm' },
  lg: { gauge: 160, stroke: 10, text: 'text-3xl', label: 'text-base' },
};

/**
 * Gauge variant component
 */
function GaugeVariant({
  score,
  maxScore,
  size,
  level,
  colors,
  showPercentage,
}: {
  score: number;
  maxScore: number;
  size: typeof SIZES.md;
  level: RiskLevel;
  colors: ReturnType<typeof getRiskColors>;
  showPercentage: boolean;
}) {
  const percentage = (score / maxScore) * 100;
  const circumference = Math.PI * (size.gauge - size.stroke);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size.gauge, height: size.gauge / 2 + 20 }}>
      <svg
        viewBox={`0 0 ${size.gauge} ${size.gauge / 2 + 10}`}
        className="w-full h-full"
      >
        {/* Background arc */}
        <path
          d={`M ${size.stroke / 2} ${size.gauge / 2} A ${(size.gauge - size.stroke) / 2} ${(size.gauge - size.stroke) / 2} 0 0 1 ${size.gauge - size.stroke / 2} ${size.gauge / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={size.stroke}
          strokeLinecap="round"
        />
        
        {/* Value arc */}
        <path
          d={`M ${size.stroke / 2} ${size.gauge / 2} A ${(size.gauge - size.stroke) / 2} ${(size.gauge - size.stroke) / 2} 0 0 1 ${size.gauge - size.stroke / 2} ${size.gauge / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={size.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${colors.color} transition-all duration-500`}
        />
        
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = (tick / 100) * 180 - 180;
          const rad = (angle * Math.PI) / 180;
          const outerR = size.gauge / 2 - 2;
          const innerR = outerR - 5;
          
          return (
            <line
              key={tick}
              x1={size.gauge / 2 + Math.cos(rad) * innerR}
              y1={size.gauge / 2 + Math.sin(rad) * innerR}
              x2={size.gauge / 2 + Math.cos(rad) * outerR}
              y2={size.gauge / 2 + Math.sin(rad) * outerR}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
            />
          );
        })}
      </svg>
      
      {/* Center value */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <span className={`font-bold ${colors.color} ${size.text}`}>
          {showPercentage ? `${percentage.toFixed(0)}%` : score}
        </span>
      </div>
    </div>
  );
}

/**
 * Bar variant component
 */
function BarVariant({
  score,
  maxScore,
  colors,
}: {
  score: number;
  maxScore: number;
  colors: ReturnType<typeof getRiskColors>;
}) {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="w-full">
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 bg-gradient-to-r ${colors.gradient}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Scale markers */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>0</span>
        <span className="text-green-500">Low</span>
        <span className="text-yellow-500">Med</span>
        <span className="text-orange-500">High</span>
        <span className="text-red-500">Critical</span>
      </div>
    </div>
  );
}

/**
 * Circular variant component
 */
function CircularVariant({
  score,
  maxScore,
  size,
  colors,
  showPercentage,
}: {
  score: number;
  maxScore: number;
  size: typeof SIZES.md;
  colors: ReturnType<typeof getRiskColors>;
  showPercentage: boolean;
}) {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * (size.gauge / 2 - size.stroke);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size.gauge, height: size.gauge }}>
      <svg viewBox={`0 0 ${size.gauge} ${size.gauge}`} className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size.gauge / 2}
          cy={size.gauge / 2}
          r={size.gauge / 2 - size.stroke}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={size.stroke}
        />
        
        {/* Value circle */}
        <circle
          cx={size.gauge / 2}
          cy={size.gauge / 2}
          r={size.gauge / 2 - size.stroke}
          fill="none"
          stroke="currentColor"
          strokeWidth={size.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${colors.color} transition-all duration-500`}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${colors.color} ${size.text}`}>
          {showPercentage ? `${percentage.toFixed(0)}%` : score}
        </span>
      </div>
    </div>
  );
}

/**
 * Risk indicator component
 */
export function RiskIndicator({
  score,
  maxScore = 100,
  label,
  showPercentage = true,
  showLevel = true,
  size = 'md',
  variant = 'gauge',
  factors,
  className = '',
}: RiskIndicatorProps): React.ReactElement {
  const level = useMemo(() => getRiskLevel(score, maxScore), [score, maxScore]);
  const colors = useMemo(() => getRiskColors(level), [level]);
  const sizeConfig = SIZES[size];
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Label */}
      {label && (
        <div className={`text-gray-400 mb-2 ${sizeConfig.label}`}>{label}</div>
      )}
      
      {/* Gauge */}
      {variant === 'gauge' && (
        <GaugeVariant
          score={score}
          maxScore={maxScore}
          size={sizeConfig}
          level={level}
          colors={colors}
          showPercentage={showPercentage}
        />
      )}
      
      {variant === 'bar' && (
        <BarVariant score={score} maxScore={maxScore} colors={colors} />
      )}
      
      {variant === 'circular' && (
        <CircularVariant
          score={score}
          maxScore={maxScore}
          size={sizeConfig}
          colors={colors}
          showPercentage={showPercentage}
        />
      )}
      
      {/* Risk level label */}
      {showLevel && (
        <div className={`mt-2 ${colors.color} font-medium ${sizeConfig.label}`}>
          {getRiskLabel(level)}
        </div>
      )}
      
      {/* Risk factors */}
      {factors && factors.length > 0 && (
        <div className="mt-4 w-full space-y-2">
          {factors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{factor.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getRiskColors(getRiskLevel(factor.impact, 100)).bgColor}`}
                    style={{ width: `${factor.impact}%` }}
                  />
                </div>
                <span className={getRiskColors(getRiskLevel(factor.impact, 100)).color}>
                  {factor.impact}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RiskIndicator;

