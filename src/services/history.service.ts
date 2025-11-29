/**
 * History Service
 * Track and manage historical records for loans, transactions, and user activity
 */

export type HistoryEventType = 
  | 'loan_created'
  | 'loan_funded'
  | 'loan_repaid'
  | 'loan_defaulted'
  | 'loan_liquidated'
  | 'collateral_added'
  | 'collateral_withdrawn'
  | 'payment_made'
  | 'payment_missed'
  | 'interest_accrued'
  | 'rate_changed'
  | 'terms_modified';

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  loanId?: string;
  userId: string;
  data: Record<string, unknown>;
  amount?: bigint;
  timestamp: Date;
  blockNumber?: number;
  transactionHash?: string;
}

export interface ActivitySummary {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  totalEvents: number;
  eventsByType: Record<HistoryEventType, number>;
  totalVolume: bigint;
  firstActivity: Date;
  lastActivity: Date;
}

export interface LoanHistory {
  loanId: string;
  events: HistoryEvent[];
  timeline: HistoryTimeline[];
  currentStatus: string;
  totalPayments: bigint;
  remainingBalance: bigint;
}

export interface HistoryTimeline {
  date: Date;
  event: string;
  description: string;
  amount?: string;
}

export interface HistoryQuery {
  userId?: string;
  loanId?: string;
  types?: HistoryEventType[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// In-memory history store
const historyEvents: HistoryEvent[] = [];
const eventCache: Map<string, HistoryEvent[]> = new Map();

class HistoryService {
  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Record a history event
   */
  recordEvent(
    type: HistoryEventType,
    userId: string,
    data: Record<string, unknown>,
    options: {
      loanId?: string;
      amount?: bigint;
      blockNumber?: number;
      transactionHash?: string;
    } = {}
  ): HistoryEvent {
    const event: HistoryEvent = {
      id: this.generateEventId(),
      type,
      loanId: options.loanId,
      userId,
      data,
      amount: options.amount,
      timestamp: new Date(),
      blockNumber: options.blockNumber,
      transactionHash: options.transactionHash,
    };

    historyEvents.push(event);

    // Update cache
    this.updateCache(event);

    // Keep memory usage reasonable
    if (historyEvents.length > 100000) {
      historyEvents.splice(0, 10000);
      eventCache.clear();
    }

    return event;
  }

  /**
   * Update cache with new event
   */
  private updateCache(event: HistoryEvent): void {
    // User cache
    const userKey = `user_${event.userId}`;
    const userEvents = eventCache.get(userKey) || [];
    userEvents.unshift(event);
    if (userEvents.length > 1000) userEvents.pop();
    eventCache.set(userKey, userEvents);

    // Loan cache
    if (event.loanId) {
      const loanKey = `loan_${event.loanId}`;
      const loanEvents = eventCache.get(loanKey) || [];
      loanEvents.unshift(event);
      eventCache.set(loanKey, loanEvents);
    }
  }

  /**
   * Query history events
   */
  queryHistory(query: HistoryQuery): HistoryEvent[] {
    let results = [...historyEvents];

    // Filter by user
    if (query.userId) {
      const cached = eventCache.get(`user_${query.userId}`);
      if (cached && !query.loanId && !query.types && !query.startDate) {
        return cached.slice(query.offset || 0, (query.offset || 0) + (query.limit || 50));
      }
      results = results.filter(e => e.userId === query.userId);
    }

    // Filter by loan
    if (query.loanId) {
      const cached = eventCache.get(`loan_${query.loanId}`);
      if (cached && !query.userId && !query.types && !query.startDate) {
        return cached.slice(query.offset || 0, (query.offset || 0) + (query.limit || 50));
      }
      results = results.filter(e => e.loanId === query.loanId);
    }

    // Filter by types
    if (query.types && query.types.length > 0) {
      results = results.filter(e => query.types!.includes(e.type));
    }

    // Filter by date range
    if (query.startDate) {
      results = results.filter(e => e.timestamp >= query.startDate!);
    }
    if (query.endDate) {
      results = results.filter(e => e.timestamp <= query.endDate!);
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    return results.slice(offset, offset + limit);
  }

  /**
   * Get user activity history
   */
  getUserHistory(userId: string, limit: number = 50): HistoryEvent[] {
    return this.queryHistory({ userId, limit });
  }

  /**
   * Get loan history
   */
  getLoanHistory(loanId: string): LoanHistory {
    const events = this.queryHistory({ loanId, limit: 1000 });
    const timeline = this.buildTimeline(events);

    // Calculate totals
    let totalPayments = BigInt(0);
    let remainingBalance = BigInt(0);

    for (const event of events) {
      if (event.type === 'payment_made' && event.amount) {
        totalPayments += event.amount;
      }
      if (event.type === 'loan_created' && event.amount) {
        remainingBalance = event.amount;
      }
    }

    remainingBalance = remainingBalance > totalPayments 
      ? remainingBalance - totalPayments 
      : BigInt(0);

    // Determine current status
    const statusEvent = events.find(e => 
      ['loan_repaid', 'loan_defaulted', 'loan_liquidated'].includes(e.type)
    );
    const currentStatus = statusEvent?.type.replace('loan_', '') || 'active';

    return {
      loanId,
      events,
      timeline,
      currentStatus,
      totalPayments,
      remainingBalance,
    };
  }

  /**
   * Build timeline from events
   */
  private buildTimeline(events: HistoryEvent[]): HistoryTimeline[] {
    return events.map(event => ({
      date: event.timestamp,
      event: this.getEventLabel(event.type),
      description: this.getEventDescription(event),
      amount: event.amount ? `${Number(event.amount) / 1e18} ETH` : undefined,
    }));
  }

  /**
   * Get human-readable event label
   */
  private getEventLabel(type: HistoryEventType): string {
    const labels: Record<HistoryEventType, string> = {
      loan_created: 'Loan Created',
      loan_funded: 'Loan Funded',
      loan_repaid: 'Loan Repaid',
      loan_defaulted: 'Loan Defaulted',
      loan_liquidated: 'Loan Liquidated',
      collateral_added: 'Collateral Added',
      collateral_withdrawn: 'Collateral Withdrawn',
      payment_made: 'Payment Made',
      payment_missed: 'Payment Missed',
      interest_accrued: 'Interest Accrued',
      rate_changed: 'Rate Changed',
      terms_modified: 'Terms Modified',
    };
    return labels[type] || type;
  }

  /**
   * Get event description from data
   */
  private getEventDescription(event: HistoryEvent): string {
    const { type, data } = event;

    switch (type) {
      case 'loan_created':
        return `Loan request created for ${data.amount || 'unknown'} amount`;
      case 'loan_funded':
        return `Loan funded by ${data.lender || 'lender'}`;
      case 'loan_repaid':
        return 'Loan fully repaid';
      case 'payment_made':
        return `Payment received`;
      case 'collateral_added':
        return `Collateral added: ${data.token || 'tokens'}`;
      case 'rate_changed':
        return `Interest rate changed to ${data.newRate || 'new rate'}%`;
      default:
        return data.description as string || 'Event recorded';
    }
  }

  /**
   * Get activity summary for a user
   */
  getActivitySummary(
    userId: string,
    period: ActivitySummary['period'] = 'all'
  ): ActivitySummary {
    let startDate: Date | undefined;
    const now = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 86400000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 604800000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 2592000000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 31536000000);
        break;
    }

    const events = this.queryHistory({
      userId,
      startDate,
      limit: 10000,
    });

    const eventsByType = {} as Record<HistoryEventType, number>;
    let totalVolume = BigInt(0);
    let firstActivity = new Date();
    let lastActivity = new Date(0);

    for (const event of events) {
      // Count by type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

      // Sum volume
      if (event.amount) {
        totalVolume += event.amount;
      }

      // Track first/last activity
      if (event.timestamp < firstActivity) {
        firstActivity = event.timestamp;
      }
      if (event.timestamp > lastActivity) {
        lastActivity = event.timestamp;
      }
    }

    return {
      userId,
      period,
      totalEvents: events.length,
      eventsByType,
      totalVolume,
      firstActivity,
      lastActivity,
    };
  }

  /**
   * Get recent activity across all users
   */
  getRecentActivity(limit: number = 50): HistoryEvent[] {
    return historyEvents
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Export history to JSON
   */
  exportHistory(query: HistoryQuery): string {
    const events = this.queryHistory({ ...query, limit: 10000 });
    return JSON.stringify(events, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    }, 2);
  }

  /**
   * Get event count by type for analytics
   */
  getEventCounts(
    startDate?: Date,
    endDate?: Date
  ): Record<HistoryEventType, number> {
    let events = [...historyEvents];

    if (startDate) {
      events = events.filter(e => e.timestamp >= startDate);
    }
    if (endDate) {
      events = events.filter(e => e.timestamp <= endDate);
    }

    const counts = {} as Record<HistoryEventType, number>;
    for (const event of events) {
      counts[event.type] = (counts[event.type] || 0) + 1;
    }

    return counts;
  }

  /**
   * Clear history (admin only)
   */
  clearHistory(): void {
    historyEvents.length = 0;
    eventCache.clear();
  }
}

// Export singleton
export const historyService = new HistoryService();
export { HistoryService };
export default historyService;

