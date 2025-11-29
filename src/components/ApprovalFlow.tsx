/**
 * ApprovalFlow Component
 * Stepper component for loan approval process
 */

'use client';

import React from 'react';

import { Card } from './ui/Card';

export type ApprovalStep =
  | 'review'
  | 'collateral'
  | 'approval'
  | 'funding'
  | 'complete';

export interface ApprovalStepConfig {
  id: ApprovalStep;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  timestamp?: Date;
  txHash?: string;
}

export interface ApprovalFlowProps {
  steps: ApprovalStepConfig[];
  currentStep: ApprovalStep;
  vertical?: boolean;
  onStepClick?: (step: ApprovalStep) => void;
  className?: string;
}

/**
 * Default step configurations
 */
export const DEFAULT_STEPS: Omit<ApprovalStepConfig, 'status' | 'timestamp'>[] = [
  {
    id: 'review',
    title: 'Application Review',
    description: 'Your loan application is being reviewed',
  },
  {
    id: 'collateral',
    title: 'Collateral Deposit',
    description: 'Deposit collateral to secure your loan',
  },
  {
    id: 'approval',
    title: 'Loan Approval',
    description: 'Waiting for lender approval',
  },
  {
    id: 'funding',
    title: 'Funding',
    description: 'Loan is being funded to your wallet',
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Loan successfully disbursed',
  },
];

/**
 * Get step icon based on status
 */
function StepIcon({ status, stepNumber }: { status: string; stepNumber: number }) {
  switch (status) {
    case 'completed':
      return (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    case 'active':
      return (
        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
      );
    default:
      return (
        <span className="text-sm font-medium text-gray-400">{stepNumber}</span>
      );
  }
}

/**
 * Format timestamp
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

/**
 * Truncate transaction hash
 */
function truncateHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

/**
 * Horizontal step component
 */
function HorizontalStep({
  step,
  index,
  isLast,
  onClick,
}: {
  step: ApprovalStepConfig;
  index: number;
  isLast: boolean;
  onClick?: () => void;
}) {
  const statusColors = {
    pending: 'bg-gray-700 border-gray-600',
    active: 'bg-blue-500 border-blue-400 ring-4 ring-blue-500/30',
    completed: 'bg-green-500 border-green-400',
    error: 'bg-red-500 border-red-400',
  };
  
  const lineColors = {
    pending: 'bg-gray-700',
    active: 'bg-gray-700',
    completed: 'bg-green-500',
    error: 'bg-red-500',
  };
  
  return (
    <div className="flex items-center flex-1">
      <div
        className={`flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        {/* Step circle */}
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            border-2 transition-all duration-300
            ${statusColors[step.status]}
          `}
        >
          <StepIcon status={step.status} stepNumber={index + 1} />
        </div>
        
        {/* Step info */}
        <div className="mt-3 text-center">
          <div className={`text-sm font-medium ${
            step.status === 'active' ? 'text-white' : 'text-gray-400'
          }`}>
            {step.title}
          </div>
          {step.status === 'active' && (
            <div className="text-xs text-gray-500 mt-1 max-w-[120px]">
              {step.description}
            </div>
          )}
          {step.timestamp && step.status === 'completed' && (
            <div className="text-xs text-gray-500 mt-1">
              {formatTime(step.timestamp)}
            </div>
          )}
        </div>
      </div>
      
      {/* Connector line */}
      {!isLast && (
        <div className={`flex-1 h-0.5 mx-2 ${lineColors[step.status]}`} />
      )}
    </div>
  );
}

/**
 * Vertical step component
 */
function VerticalStep({
  step,
  index,
  isLast,
  onClick,
}: {
  step: ApprovalStepConfig;
  index: number;
  isLast: boolean;
  onClick?: () => void;
}) {
  const statusColors = {
    pending: 'bg-gray-700 border-gray-600',
    active: 'bg-blue-500 border-blue-400 ring-4 ring-blue-500/30',
    completed: 'bg-green-500 border-green-400',
    error: 'bg-red-500 border-red-400',
  };
  
  return (
    <div className={`flex ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      {/* Step indicator */}
      <div className="flex flex-col items-center mr-4">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            border-2 transition-all duration-300
            ${statusColors[step.status]}
          `}
        >
          <StepIcon status={step.status} stepNumber={index + 1} />
        </div>
        
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[40px] ${
            step.status === 'completed' ? 'bg-green-500' : 'bg-gray-700'
          }`} />
        )}
      </div>
      
      {/* Step content */}
      <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
        <div className={`font-medium ${
          step.status === 'active' ? 'text-white' : 'text-gray-400'
        }`}>
          {step.title}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {step.description}
        </div>
        
        {step.timestamp && (
          <div className="text-xs text-gray-600 mt-2">
            {formatTime(step.timestamp)}
          </div>
        )}
        
        {step.txHash && (
          <a
            href={`https://etherscan.io/tx/${step.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
            onClick={e => e.stopPropagation()}
          >
            Tx: {truncateHash(step.txHash)} ↗
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Approval flow stepper component
 */
export function ApprovalFlow({
  steps,
  currentStep,
  vertical = false,
  onStepClick,
  className = '',
}: ApprovalFlowProps): React.ReactElement {
  const StepComponent = vertical ? VerticalStep : HorizontalStep;
  
  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">Approval Progress</h3>
      
      <div className={vertical ? 'flex flex-col' : 'flex items-start'}>
        {steps.map((step, index) => (
          <StepComponent
            key={step.id}
            step={step}
            index={index}
            isLast={index === steps.length - 1}
            onClick={onStepClick ? () => onStepClick(step.id) : undefined}
          />
        ))}
      </div>
    </Card>
  );
}

export default ApprovalFlow;

