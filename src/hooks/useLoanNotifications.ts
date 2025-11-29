/**
 * useLoanNotifications Hook
 * Manage loan-related notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';

export type NotificationType = 
  | 'loan_funded'
  | 'payment_due'
  | 'payment_received'
  | 'loan_completed'
  | 'loan_defaulted'
  | 'collateral_warning'
  | 'rate_change'
  | 'new_loan_match';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  loanId?: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: Record<NotificationType, boolean>;
}

export interface UseLoanNotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  preferences: NotificationPreferences;
}

export interface UseLoanNotificationsOptions {
  pollInterval?: number;
  autoMarkAsRead?: boolean;
  enablePolling?: boolean;
}

export interface UseLoanNotificationsReturn extends UseLoanNotificationsState {
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  refresh: () => Promise<void>;
  subscribeToLoan: (loanId: string) => void;
  unsubscribeFromLoan: (loanId: string) => void;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email: true,
  push: true,
  inApp: true,
  types: {
    loan_funded: true,
    payment_due: true,
    payment_received: true,
    loan_completed: true,
    loan_defaulted: true,
    collateral_warning: true,
    rate_change: true,
    new_loan_match: true,
  },
};

/**
 * Get notification priority based on type
 */
function getNotificationPriority(type: NotificationType): Notification['priority'] {
  switch (type) {
    case 'loan_defaulted':
    case 'collateral_warning':
      return 'urgent';
    case 'payment_due':
      return 'high';
    case 'loan_funded':
    case 'payment_received':
      return 'medium';
    default:
      return 'low';
  }
}

/**
 * Hook for managing loan notifications
 */
export function useLoanNotifications(
  options: UseLoanNotificationsOptions = {}
): UseLoanNotificationsReturn {
  const {
    pollInterval = 30000,
    autoMarkAsRead = false,
    enablePolling = true,
  } = options;

  const { address } = useAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const subscribedLoans = useRef<Set<string>>(new Set());
  const pollingRef = useRef<ReturnType<typeof setInterval>>();

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications?address=${address}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      
      const formattedNotifications: Notification[] = data.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
        priority: n.priority || getNotificationPriority(n.type),
      }));

      setNotifications(formattedNotifications);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );

    // Update server
    fetch(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    }).catch(console.error);
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );

    // Update server
    if (address) {
      fetch(`/api/notifications/read-all?address=${address}`, {
        method: 'POST',
      }).catch(console.error);
    }
  }, [address]);

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );

    // Update server
    fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    }).catch(console.error);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);

    if (address) {
      fetch(`/api/notifications/clear?address=${address}`, {
        method: 'DELETE',
      }).catch(console.error);
    }
  }, [address]);

  // Update preferences
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    const newPrefs = { ...preferences, ...prefs };
    setPreferences(newPrefs);

    if (address) {
      await fetch(`/api/notifications/preferences?address=${address}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });
    }
  }, [address, preferences]);

  // Subscribe to loan notifications
  const subscribeToLoan = useCallback((loanId: string) => {
    subscribedLoans.current.add(loanId);
  }, []);

  // Unsubscribe from loan notifications
  const unsubscribeFromLoan = useCallback((loanId: string) => {
    subscribedLoans.current.delete(loanId);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Setup polling
  useEffect(() => {
    if (!enablePolling || !address) return;

    pollingRef.current = setInterval(fetchNotifications, pollInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [enablePolling, address, pollInterval, fetchNotifications]);

  // Auto mark as read when viewing
  useEffect(() => {
    if (autoMarkAsRead && notifications.some(n => !n.isRead)) {
      markAllAsRead();
    }
  }, [autoMarkAsRead, notifications, markAllAsRead]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updatePreferences,
    refresh: fetchNotifications,
    subscribeToLoan,
    unsubscribeFromLoan,
  };
}

export default useLoanNotifications;

