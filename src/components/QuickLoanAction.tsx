/**
 * QuickLoanAction Component
 * Button group for quick loan actions
 */

'use client';

import React, { useState, useCallback } from 'react';

import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

export type LoanActionType = 'fund' | 'repay' | 'extend' | 'withdraw' | 'cancel';

export interface QuickLoanActionProps {
  loanId: string;
  availableActions: LoanActionType[];
  onAction: (action: LoanActionType, loanId: string, data?: Record<string, unknown>) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Action configuration
 */
const ACTION_CONFIG: Record<LoanActionType, {
  label: string;
  icon: React.ReactNode;
  color: string;
  confirmMessage: string;
}> = {
  fund: {
    label: 'Fund',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-green-500 hover:bg-green-400 text-white',
    confirmMessage: 'Are you sure you want to fund this loan?',
  },
  repay: {
    label: 'Repay',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
    color: 'bg-blue-500 hover:bg-blue-400 text-white',
    confirmMessage: 'Are you sure you want to repay this loan?',
  },
  extend: {
    label: 'Extend',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-yellow-500 hover:bg-yellow-400 text-white',
    confirmMessage: 'Are you sure you want to extend this loan?',
  },
  withdraw: {
    label: 'Withdraw',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
    color: 'bg-purple-500 hover:bg-purple-400 text-white',
    confirmMessage: 'Are you sure you want to withdraw funds?',
  },
  cancel: {
    label: 'Cancel',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    color: 'bg-red-500 hover:bg-red-400 text-white',
    confirmMessage: 'Are you sure you want to cancel this loan? This action cannot be undone.',
  },
};

/**
 * Confirmation modal component
 */
function ConfirmationModal({
  isOpen,
  action,
  onConfirm,
  onCancel,
  loading,
}: {
  isOpen: boolean;
  action: LoanActionType | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!action) return null;
  
  const config = ACTION_CONFIG[action];
  
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={`Confirm ${config.label}`}>
      <div className="p-4">
        <p className="text-gray-300 mb-6">{config.confirmMessage}</p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className={config.color}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Confirm ${config.label}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Quick loan action button group component
 */
export function QuickLoanAction({
  loanId,
  availableActions,
  onAction,
  disabled = false,
  loading = false,
  className = '',
}: QuickLoanActionProps): React.ReactElement {
  const [pendingAction, setPendingAction] = useState<LoanActionType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle action click
  const handleActionClick = useCallback((action: LoanActionType) => {
    setPendingAction(action);
  }, []);
  
  // Handle confirmation
  const handleConfirm = useCallback(async () => {
    if (!pendingAction) return;
    
    setIsProcessing(true);
    try {
      await onAction(pendingAction, loanId);
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
    }
  }, [pendingAction, onAction, loanId]);
  
  // Handle cancel
  const handleCancel = useCallback(() => {
    setPendingAction(null);
  }, []);
  
  // Check if any actions are available
  if (availableActions.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No actions available
      </div>
    );
  }
  
  // Single action - render as single button
  if (availableActions.length === 1) {
    const action = availableActions[0];
    const config = ACTION_CONFIG[action];
    
    return (
      <>
        <Button
          className={`${config.color} ${className}`}
          onClick={() => handleActionClick(action)}
          disabled={disabled || loading}
        >
          <span className="mr-2">{config.icon}</span>
          {config.label}
        </Button>
        
        <ConfirmationModal
          isOpen={!!pendingAction}
          action={pendingAction}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          loading={isProcessing}
        />
      </>
    );
  }
  
  // Multiple actions - render as button group
  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        {availableActions.map(action => {
          const config = ACTION_CONFIG[action];
          
          return (
            <Button
              key={action}
              className={config.color}
              onClick={() => handleActionClick(action)}
              disabled={disabled || loading}
              size="sm"
            >
              <span className="mr-1.5">{config.icon}</span>
              {config.label}
            </Button>
          );
        })}
      </div>
      
      <ConfirmationModal
        isOpen={!!pendingAction}
        action={pendingAction}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={isProcessing}
      />
    </>
  );
}

/**
 * Dropdown variant for space-constrained layouts
 */
export function QuickLoanActionDropdown({
  loanId,
  availableActions,
  onAction,
  disabled = false,
  className = '',
}: QuickLoanActionProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<LoanActionType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleActionClick = (action: LoanActionType) => {
    setIsOpen(false);
    setPendingAction(action);
  };
  
  const handleConfirm = async () => {
    if (!pendingAction) return;
    
    setIsProcessing(true);
    try {
      await onAction(pendingAction, loanId);
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
    }
  };
  
  return (
    <>
      <div className={`relative ${className}`}>
        <Button
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || availableActions.length === 0}
        >
          Actions
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
        
        {isOpen && (
          <div className="absolute top-full right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
            {availableActions.map(action => {
              const config = ACTION_CONFIG[action];
              
              return (
                <button
                  key={action}
                  onClick={() => handleActionClick(action)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  {config.icon}
                  {config.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      <ConfirmationModal
        isOpen={!!pendingAction}
        action={pendingAction}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
        loading={isProcessing}
      />
    </>
  );
}

export default QuickLoanAction;

