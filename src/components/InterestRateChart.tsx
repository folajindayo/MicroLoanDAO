/**
 * InterestRateChart Component
 * Visualization of interest rate trends and comparisons
 */

'use client';

import React, { useMemo } from 'react';

import { Card } from './ui/Card';

export interface RateDataPoint {
  date: Date;
  rate: number;
  volume?: number;
}

export interface InterestRateChartProps {
  data: RateDataPoint[];
  currentRate: number;
  averageRate?: number;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  height?: number;
  showVolume?: boolean;
  className?: string;
}

/**
 * Format date based on range
 */
function formatDate(date: Date, range: string): string {
  if (range === '7d') {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  }
  if (range === '30d') {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
}

/**
 * Calculate chart points from data
 */
function calculateChartPath(
  data: RateDataPoint[],
  width: number,
  height: number,
  padding: number
): { path: string; points: Array<{ x: number; y: number; rate: number }> } {
  if (data.length === 0) {
    return { path: '', points: [] };
  }
  
  const rates = data.map(d => d.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const rateRange = maxRate - minRate || 1;
  
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.rate - minRate) / rateRange) * chartHeight;
    return { x, y, rate: d.rate };
  });
  
  // Create smooth path
  const path = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cpX = (point.x + prev.x) / 2;
    return `${acc} Q ${cpX} ${prev.y}, ${point.x} ${point.y}`;
  }, '');
  
  return { path, points };
}

/**
 * Time range selector
 */
function TimeRangeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
}) {
  const ranges: Array<{ value: '7d' | '30d' | '90d' | '1y'; label: string }> = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' },
  ];
  
  return (
    <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
      {ranges.map(range => (
        <button
          key={range.value}
          onClick={() => onChange?.(range.value)}
          className={`
            px-3 py-1 text-sm rounded-md transition-colors
            ${value === range.value
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
            }
          `}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Interest rate chart component
 */
export function InterestRateChart({
  data,
  currentRate,
  averageRate,
  timeRange = '30d',
  onTimeRangeChange,
  height = 200,
  showVolume = false,
  className = '',
}: InterestRateChartProps): React.ReactElement {
  const width = 600; // Will be scaled by CSS
  const padding = 40;
  
  // Calculate chart data
  const { path, points } = useMemo(
    () => calculateChartPath(data, width, height, padding),
    [data, height]
  );
  
  // Calculate stats
  const stats = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0, change: 0 };
    const rates = data.map(d => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const first = rates[0];
    const last = rates[rates.length - 1];
    const change = first > 0 ? ((last - first) / first) * 100 : 0;
    return { min, max, change };
  }, [data]);
  
  const isPositiveChange = stats.change >= 0;
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Interest Rate</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl font-bold text-white">{currentRate.toFixed(2)}%</span>
            <span className={`text-sm ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
              {isPositiveChange ? '↑' : '↓'} {Math.abs(stats.change).toFixed(2)}%
            </span>
          </div>
        </div>
        
        <TimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />
      </div>
      
      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(ratio => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + (height - padding * 2) * ratio}
              x2={width - padding}
              y2={padding + (height - padding * 2) * ratio}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="4"
            />
          ))}
          
          {/* Gradient fill */}
          <defs>
            <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          {path && (
            <path
              d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
              fill="url(#rateGradient)"
            />
          )}
          
          {/* Line */}
          {path && (
            <path
              d={path}
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Points */}
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="rgb(59, 130, 246)"
              className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            />
          ))}
          
          {/* Average line */}
          {averageRate && data.length > 0 && (
            <>
              <line
                x1={padding}
                y1={padding + (height - padding * 2) * (1 - (averageRate - stats.min) / (stats.max - stats.min || 1))}
                x2={width - padding}
                y2={padding + (height - padding * 2) * (1 - (averageRate - stats.min) / (stats.max - stats.min || 1))}
                stroke="rgba(251, 191, 36, 0.5)"
                strokeDasharray="8"
              />
            </>
          )}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-gray-500 py-8">
          <span>{stats.max.toFixed(1)}%</span>
          <span>{((stats.max + stats.min) / 2).toFixed(1)}%</span>
          <span>{stats.min.toFixed(1)}%</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-400">Current Rate</span>
          </div>
          {averageRate && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-yellow-400" />
              <span className="text-sm text-gray-400">Average ({averageRate.toFixed(2)}%)</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-gray-500">Min:</span>
            <span className="text-white ml-1">{stats.min.toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-gray-500">Max:</span>
            <span className="text-white ml-1">{stats.max.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default InterestRateChart;

