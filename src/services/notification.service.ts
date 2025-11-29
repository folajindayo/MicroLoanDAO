/**
 * Notification Service
 * Manage alerts, notifications, and user communications
 */

export type NotificationType = 
  | 'loan_created'
  | 'loan_funded'
  | 'loan_approved'
  | 'payment_due'
  | 'payment_received'
  | 'payment_overdue'
  | 'liquidation_warning'
  | 'liquidation_executed'
  | 'collateral_low'
  | 'rate_change'
  | 'system_alert'
  | 'governance_proposal';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationChannel = 'in_app' | 'email' | 'push' | 'webhook';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  recipient: string;
  channels: NotificationChannel[];
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    in_app: boolean;
    email: boolean;
    push: boolean;
    webhook: boolean;
  };
  types: Record<NotificationType, boolean>;
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;
  };
  webhookUrl?: string;
}

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  defaultPriority: NotificationPriority;
}

// Default notification templates
const TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  loan_created: {
    type: 'loan_created',
    title: 'Loan Request Created',
    message: 'Your loan request for {{amount}} ETH has been created.',
    defaultPriority: 'medium',
  },
  loan_funded: {
    type: 'loan_funded',
    title: 'Loan Funded',
    message: 'Your loan has been funded! {{amount}} ETH has been transferred.',
    defaultPriority: 'high',
  },
  loan_approved: {
    type: 'loan_approved',
    title: 'Loan Approved',
    message: 'Your loan request has been approved.',
    defaultPriority: 'high',
  },
  payment_due: {
    type: 'payment_due',
    title: 'Payment Due Soon',
    message: 'Payment of {{amount}} ETH is due in {{days}} days.',
    defaultPriority: 'medium',
  },
  payment_received: {
    type: 'payment_received',
    title: 'Payment Received',
    message: 'Payment of {{amount}} ETH has been received.',
    defaultPriority: 'low',
  },
  payment_overdue: {
    type: 'payment_overdue',
    title: 'Payment Overdue',
    message: 'Your payment is {{days}} days overdue. Please repay immediately.',
    defaultPriority: 'urgent',
  },
  liquidation_warning: {
    type: 'liquidation_warning',
    title: 'Liquidation Warning',
    message: 'Your collateral is at risk. Health factor: {{healthFactor}}',
    defaultPriority: 'urgent',
  },
  liquidation_executed: {
    type: 'liquidation_executed',
    title: 'Liquidation Executed',
    message: 'Your position has been liquidated.',
    defaultPriority: 'urgent',
  },
  collateral_low: {
    type: 'collateral_low',
    title: 'Low Collateral Warning',
    message: 'Your collateral ratio is {{ratio}}%. Consider adding more collateral.',
    defaultPriority: 'high',
  },
  rate_change: {
    type: 'rate_change',
    title: 'Interest Rate Change',
    message: 'Interest rates have changed. New rate: {{rate}}%',
    defaultPriority: 'low',
  },
  system_alert: {
    type: 'system_alert',
    title: 'System Alert',
    message: '{{message}}',
    defaultPriority: 'medium',
  },
  governance_proposal: {
    type: 'governance_proposal',
    title: 'New Governance Proposal',
    message: 'A new proposal "{{title}}" is open for voting.',
    defaultPriority: 'low',
  },
};

// In-memory notification store (replace with DB in production)
const notifications: Map<string, Notification[]> = new Map();
const preferences: Map<string, NotificationPreferences> = new Map();

class NotificationService {
  /**
   * Generate unique notification ID
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Replace template variables
   */
  private replaceTemplateVars(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return String(data[key] ?? `{{${key}}}`);
    });
  }

  /**
   * Create a notification
   */
  async createNotification(
    type: NotificationType,
    recipient: string,
    data: Record<string, unknown> = {},
    options: Partial<Pick<Notification, 'priority' | 'channels' | 'actionUrl'>> = {}
  ): Promise<Notification> {
    const template = TEMPLATES[type];
    const userPrefs = this.getPreferences(recipient);

    // Check if user has this type enabled
    if (!userPrefs.types[type]) {
      throw new Error('User has disabled this notification type');
    }

    // Determine active channels
    const activeChannels: NotificationChannel[] = (options.channels || ['in_app', 'email'])
      .filter(ch => userPrefs.channels[ch]);

    const notification: Notification = {
      id: this.generateId(),
      type,
      priority: options.priority || template.defaultPriority,
      title: this.replaceTemplateVars(template.title, data),
      message: this.replaceTemplateVars(template.message, data),
      data,
      recipient,
      channels: activeChannels,
      read: false,
      createdAt: new Date(),
      actionUrl: options.actionUrl,
    };

    // Store notification
    const userNotifications = notifications.get(recipient) || [];
    userNotifications.unshift(notification);
    
    // Keep only last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }
    
    notifications.set(recipient, userNotifications);

    // Send to channels
    await this.dispatchToChannels(notification, userPrefs);

    return notification;
  }

  /**
   * Dispatch notification to channels
   */
  private async dispatchToChannels(
    notification: Notification,
    prefs: NotificationPreferences
  ): Promise<void> {
    const dispatchers: Promise<void>[] = [];

    for (const channel of notification.channels) {
      switch (channel) {
        case 'email':
          dispatchers.push(this.sendEmail(notification, prefs));
          break;
        case 'push':
          dispatchers.push(this.sendPush(notification));
          break;
        case 'webhook':
          if (prefs.webhookUrl) {
            dispatchers.push(this.sendWebhook(notification, prefs.webhookUrl));
          }
          break;
        // in_app is handled by storage
      }
    }

    await Promise.allSettled(dispatchers);
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification, prefs: NotificationPreferences): Promise<void> {
    // In production, integrate with email service (SendGrid, etc.)
    console.log(`[Email] Sending to ${prefs.userId}: ${notification.title}`);
  }

  /**
   * Send push notification
   */
  private async sendPush(notification: Notification): Promise<void> {
    // In production, integrate with push service (Firebase, etc.)
    console.log(`[Push] Sending: ${notification.title}`);
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(notification: Notification, url: string): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          timestamp: notification.createdAt.toISOString(),
        }),
      });
    } catch (error) {
      console.error('Webhook delivery failed:', error);
    }
  }

  /**
   * Get notifications for a user
   */
  getNotifications(
    recipient: string,
    options: { unreadOnly?: boolean; limit?: number; offset?: number } = {}
  ): Notification[] {
    const { unreadOnly = false, limit = 20, offset = 0 } = options;
    let userNotifications = notifications.get(recipient) || [];

    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read);
    }

    return userNotifications.slice(offset, offset + limit);
  }

  /**
   * Get unread count
   */
  getUnreadCount(recipient: string): number {
    const userNotifications = notifications.get(recipient) || [];
    return userNotifications.filter(n => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(recipient: string, notificationId: string): boolean {
    const userNotifications = notifications.get(recipient);
    if (!userNotifications) return false;

    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(recipient: string): number {
    const userNotifications = notifications.get(recipient);
    if (!userNotifications) return 0;

    let count = 0;
    for (const notification of userNotifications) {
      if (!notification.read) {
        notification.read = true;
        count++;
      }
    }
    return count;
  }

  /**
   * Delete notification
   */
  deleteNotification(recipient: string, notificationId: string): boolean {
    const userNotifications = notifications.get(recipient);
    if (!userNotifications) return false;

    const index = userNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      userNotifications.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get user preferences
   */
  getPreferences(userId: string): NotificationPreferences {
    return preferences.get(userId) || this.getDefaultPreferences(userId);
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      channels: {
        in_app: true,
        email: true,
        push: false,
        webhook: false,
      },
      types: Object.fromEntries(
        Object.keys(TEMPLATES).map(type => [type, true])
      ) as Record<NotificationType, boolean>,
    };
  }

  /**
   * Update user preferences
   */
  updatePreferences(
    userId: string,
    updates: Partial<Omit<NotificationPreferences, 'userId'>>
  ): NotificationPreferences {
    const current = this.getPreferences(userId);
    const updated = {
      ...current,
      ...updates,
      channels: { ...current.channels, ...updates.channels },
      types: { ...current.types, ...updates.types },
    };
    preferences.set(userId, updated);
    return updated;
  }

  /**
   * Get notification templates
   */
  getTemplates(): Record<NotificationType, NotificationTemplate> {
    return { ...TEMPLATES };
  }
}

// Export singleton
export const notificationService = new NotificationService();
export { NotificationService };
export default notificationService;

