/**
 * Analytics Service
 * Track platform metrics, user behavior, and loan performance
 */

export interface PlatformMetrics {
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  totalVolume: number;
  totalInterestEarned: number;
  averageLoanSize: number;
  averageInterestRate: number;
  averageDuration: number;
  defaultRate: number;
  timestamp: Date;
}

export interface UserMetrics {
  address: string;
  totalBorrowed: number;
  totalLent: number;
  activeLoansAsBorrower: number;
  activeLoansAsLender: number;
  completedLoansAsBorrower: number;
  completedLoansAsLender: number;
  interestPaid: number;
  interestEarned: number;
  onTimePaymentRate: number;
  firstActivity: Date;
  lastActivity: Date;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

export interface LoanPerformance {
  loanId: string;
  repaymentProgress: number;
  daysRemaining: number;
  healthFactor: number;
  isOnTrack: boolean;
  projectedCompletion: Date;
}

export interface AnalyticsEvent {
  type: string;
  userId?: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

// In-memory analytics store
const events: AnalyticsEvent[] = [];
const metricsCache: Map<string, { data: unknown; expiry: number }> = new Map();
const CACHE_TTL = 60000; // 1 minute

class AnalyticsService {
  /**
   * Track an analytics event
   */
  trackEvent(
    type: string,
    data: Record<string, unknown>,
    userId?: string
  ): void {
    const event: AnalyticsEvent = {
      type,
      userId,
      data,
      timestamp: new Date(),
    };

    events.push(event);

    // Keep only last 10000 events in memory
    if (events.length > 10000) {
      events.shift();
    }

    // In production, send to analytics service
    console.log('[Analytics]', event);
  }

  /**
   * Track loan creation
   */
  trackLoanCreation(loanId: string, amount: number, duration: number, rate: number): void {
    this.trackEvent('loan_created', { loanId, amount, duration, rate });
  }

  /**
   * Track loan funding
   */
  trackLoanFunding(loanId: string, amount: number, lender: string): void {
    this.trackEvent('loan_funded', { loanId, amount, lender });
  }

  /**
   * Track loan repayment
   */
  trackRepayment(loanId: string, amount: number, remaining: number): void {
    this.trackEvent('repayment', { loanId, amount, remaining });
  }

  /**
   * Track loan default
   */
  trackDefault(loanId: string, amount: number, reason: string): void {
    this.trackEvent('loan_default', { loanId, amount, reason });
  }

  /**
   * Get platform metrics
   */
  async getPlatformMetrics(): Promise<PlatformMetrics> {
    const cacheKey = 'platform_metrics';
    const cached = this.getFromCache<PlatformMetrics>(cacheKey);
    if (cached) return cached;

    try {
      // In production, fetch from database
      const response = await fetch('/api/analytics/platform');
      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch platform metrics:', error);
    }

    // Return mock data
    const mockMetrics: PlatformMetrics = {
      totalLoans: 1250,
      activeLoans: 342,
      completedLoans: 856,
      defaultedLoans: 52,
      totalVolume: 15600000,
      totalInterestEarned: 780000,
      averageLoanSize: 12480,
      averageInterestRate: 8.5,
      averageDuration: 45,
      defaultRate: 4.16,
      timestamp: new Date(),
    };

    this.setCache(cacheKey, mockMetrics);
    return mockMetrics;
  }

  /**
   * Get user metrics
   */
  async getUserMetrics(address: string): Promise<UserMetrics> {
    const cacheKey = `user_metrics_${address}`;
    const cached = this.getFromCache<UserMetrics>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`/api/analytics/user/${address}`);
      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch user metrics:', error);
    }

    // Return empty metrics for new users
    const emptyMetrics: UserMetrics = {
      address,
      totalBorrowed: 0,
      totalLent: 0,
      activeLoansAsBorrower: 0,
      activeLoansAsLender: 0,
      completedLoansAsBorrower: 0,
      completedLoansAsLender: 0,
      interestPaid: 0,
      interestEarned: 0,
      onTimePaymentRate: 100,
      firstActivity: new Date(),
      lastActivity: new Date(),
    };

    return emptyMetrics;
  }

  /**
   * Get volume over time
   */
  async getVolumeTimeSeries(range: TimeRange): Promise<TimeSeriesPoint[]> {
    const cacheKey = `volume_${range}`;
    const cached = this.getFromCache<TimeSeriesPoint[]>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const points: TimeSeriesPoint[] = [];
    let dataPoints: number;
    let interval: number;

    switch (range) {
      case '24h':
        dataPoints = 24;
        interval = 3600000; // 1 hour
        break;
      case '7d':
        dataPoints = 7;
        interval = 86400000; // 1 day
        break;
      case '30d':
        dataPoints = 30;
        interval = 86400000;
        break;
      case '90d':
        dataPoints = 90;
        interval = 86400000;
        break;
      case '1y':
        dataPoints = 12;
        interval = 2592000000; // ~30 days
        break;
      default:
        dataPoints = 12;
        interval = 2592000000;
    }

    // Generate mock time series data
    for (let i = dataPoints - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * interval);
      const baseValue = 100000 + Math.random() * 50000;
      const trend = ((dataPoints - i) / dataPoints) * 30000;
      const value = baseValue + trend;

      points.push({
        timestamp,
        value: Math.round(value),
      });
    }

    this.setCache(cacheKey, points);
    return points;
  }

  /**
   * Get interest rate trends
   */
  async getInterestRateTrends(range: TimeRange): Promise<TimeSeriesPoint[]> {
    const cacheKey = `rates_${range}`;
    const cached = this.getFromCache<TimeSeriesPoint[]>(cacheKey);
    if (cached) return cached;

    // Generate mock interest rate trends
    const points = await this.getVolumeTimeSeries(range);
    const rateTrends = points.map(p => ({
      timestamp: p.timestamp,
      value: 5 + Math.random() * 8 + Math.sin(p.timestamp.getTime() / 86400000) * 2,
    }));

    this.setCache(cacheKey, rateTrends);
    return rateTrends;
  }

  /**
   * Get loan performance metrics
   */
  async getLoanPerformance(loanId: string): Promise<LoanPerformance | null> {
    try {
      const response = await fetch(`/api/analytics/loan/${loanId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch loan performance:', error);
    }

    // Return mock performance
    return {
      loanId,
      repaymentProgress: Math.random() * 100,
      daysRemaining: Math.floor(Math.random() * 90),
      healthFactor: 1 + Math.random(),
      isOnTrack: Math.random() > 0.2,
      projectedCompletion: new Date(Date.now() + Math.random() * 7776000000),
    };
  }

  /**
   * Get top lenders
   */
  async getTopLenders(limit: number = 10): Promise<Array<{ address: string; totalLent: number; returns: number }>> {
    // Mock top lenders
    return Array.from({ length: limit }, (_, i) => ({
      address: `0x${(i + 1).toString().padStart(40, '0')}`,
      totalLent: Math.floor(Math.random() * 1000000),
      returns: Math.floor(Math.random() * 100000),
    })).sort((a, b) => b.totalLent - a.totalLent);
  }

  /**
   * Get top borrowers
   */
  async getTopBorrowers(limit: number = 10): Promise<Array<{ address: string; totalBorrowed: number; reputation: number }>> {
    // Mock top borrowers
    return Array.from({ length: limit }, (_, i) => ({
      address: `0x${(i + 1).toString().padStart(40, '0')}`,
      totalBorrowed: Math.floor(Math.random() * 500000),
      reputation: 50 + Math.floor(Math.random() * 50),
    })).sort((a, b) => b.reputation - a.reputation);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string, limit: number = 100): AnalyticsEvent[] {
    return events
      .filter(e => e.type === type)
      .slice(-limit);
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string, limit: number = 100): AnalyticsEvent[] {
    return events
      .filter(e => e.userId === userId)
      .slice(-limit);
  }

  /**
   * Cache helpers
   */
  private getFromCache<T>(key: string): T | null {
    const cached = metricsCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    metricsCache.set(key, {
      data,
      expiry: Date.now() + CACHE_TTL,
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    metricsCache.clear();
  }
}

// Export singleton
export const analyticsService = new AnalyticsService();
export { AnalyticsService };
export default analyticsService;

