/**
 * Batch Service
 * Handle bulk operations for loans, payments, and data processing
 */

export type BatchOperationType = 
  | 'create_loans'
  | 'fund_loans'
  | 'process_payments'
  | 'update_rates'
  | 'liquidate'
  | 'distribute_rewards'
  | 'sync_data'
  | 'export_data';

export interface BatchJob<T = unknown> {
  id: string;
  type: BatchOperationType;
  status: BatchStatus;
  items: BatchItem<T>[];
  progress: number;
  totalItems: number;
  successCount: number;
  failureCount: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  error?: string;
}

export type BatchStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BatchItem<T = unknown> {
  index: number;
  data: T;
  status: 'pending' | 'processing' | 'success' | 'failed';
  result?: unknown;
  error?: string;
  processedAt?: Date;
}

export interface BatchOptions {
  concurrency: number;
  retryCount: number;
  retryDelay: number;
  onProgress?: (progress: number, completed: number, total: number) => void;
  onItemComplete?: (item: BatchItem) => void;
  abortSignal?: AbortSignal;
}

const DEFAULT_OPTIONS: BatchOptions = {
  concurrency: 5,
  retryCount: 3,
  retryDelay: 1000,
};

// Job storage
const jobs: Map<string, BatchJob> = new Map();
const runningJobs: Set<string> = new Set();

class BatchService {
  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new batch job
   */
  createJob<T>(
    type: BatchOperationType,
    items: T[]
  ): BatchJob<T> {
    const job: BatchJob<T> = {
      id: this.generateJobId(),
      type,
      status: 'pending',
      items: items.map((data, index) => ({
        index,
        data,
        status: 'pending',
      })),
      progress: 0,
      totalItems: items.length,
      successCount: 0,
      failureCount: 0,
      createdAt: new Date(),
    };

    jobs.set(job.id, job as BatchJob);
    return job;
  }

  /**
   * Execute a batch job
   */
  async executeJob<T, R>(
    jobId: string,
    processor: (item: T, index: number) => Promise<R>,
    options: Partial<BatchOptions> = {}
  ): Promise<BatchJob<T>> {
    const job = jobs.get(jobId) as BatchJob<T> | undefined;
    if (!job) {
      throw new Error('Job not found');
    }

    if (runningJobs.has(jobId)) {
      throw new Error('Job is already running');
    }

    const opts = { ...DEFAULT_OPTIONS, ...options };
    job.status = 'running';
    job.startedAt = new Date();
    runningJobs.add(jobId);

    try {
      await this.processItems(job, processor, opts);
      
      job.status = job.failureCount === 0 ? 'completed' : 
                   job.successCount === 0 ? 'failed' : 'completed';
      job.completedAt = new Date();
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
    } finally {
      runningJobs.delete(jobId);
    }

    return job;
  }

  /**
   * Process batch items with concurrency control
   */
  private async processItems<T, R>(
    job: BatchJob<T>,
    processor: (item: T, index: number) => Promise<R>,
    options: BatchOptions
  ): Promise<void> {
    const { concurrency, retryCount, retryDelay, onProgress, onItemComplete, abortSignal } = options;
    
    const pendingItems = [...job.items];
    const processing: Promise<void>[] = [];

    const processNext = async (): Promise<void> => {
      while (pendingItems.length > 0) {
        // Check for abort
        if (abortSignal?.aborted) {
          job.status = 'cancelled';
          return;
        }

        const item = pendingItems.shift();
        if (!item) break;

        item.status = 'processing';

        try {
          const result = await this.processWithRetry(
            () => processor(item.data, item.index),
            retryCount,
            retryDelay
          );

          item.status = 'success';
          item.result = result;
          item.processedAt = new Date();
          job.successCount++;
        } catch (error) {
          item.status = 'failed';
          item.error = error instanceof Error ? error.message : 'Unknown error';
          item.processedAt = new Date();
          job.failureCount++;
        }

        // Update progress
        const completed = job.successCount + job.failureCount;
        job.progress = Math.round((completed / job.totalItems) * 100);

        // Callbacks
        onProgress?.(job.progress, completed, job.totalItems);
        onItemComplete?.(item);
      }
    };

    // Start concurrent processors
    for (let i = 0; i < concurrency; i++) {
      processing.push(processNext());
    }

    await Promise.all(processing);
  }

  /**
   * Process with retry logic
   */
  private async processWithRetry<R>(
    fn: () => Promise<R>,
    retries: number,
    delay: number
  ): Promise<R> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < retries) {
          await this.sleep(delay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): BatchJob | null {
    return jobs.get(jobId) || null;
  }

  /**
   * Get all jobs
   */
  getAllJobs(status?: BatchStatus): BatchJob[] {
    let allJobs = Array.from(jobs.values());
    
    if (status) {
      allJobs = allJobs.filter(j => j.status === status);
    }

    return allJobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Cancel a running job
   */
  cancelJob(jobId: string): boolean {
    const job = jobs.get(jobId);
    if (!job || job.status !== 'running') {
      return false;
    }

    job.status = 'cancelled';
    job.completedAt = new Date();
    runningJobs.delete(jobId);
    return true;
  }

  /**
   * Delete a job
   */
  deleteJob(jobId: string): boolean {
    if (runningJobs.has(jobId)) {
      return false;
    }
    return jobs.delete(jobId);
  }

  /**
   * Batch create loans
   */
  async batchCreateLoans(
    loans: Array<{
      borrower: string;
      amount: bigint;
      duration: number;
      interestRate: number;
      purpose: string;
    }>,
    options?: Partial<BatchOptions>
  ): Promise<BatchJob> {
    const job = this.createJob('create_loans', loans);

    return this.executeJob(job.id, async (loan, index) => {
      const response = await fetch('/api/loans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borrowerAddress: loan.borrower,
          amount: loan.amount.toString(),
          duration: loan.duration,
          interestRate: loan.interestRate,
          purpose: loan.purpose,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create loan ${index}`);
      }

      return response.json();
    }, options);
  }

  /**
   * Batch process payments
   */
  async batchProcessPayments(
    payments: Array<{
      loanId: string;
      amount: bigint;
      payer: string;
    }>,
    options?: Partial<BatchOptions>
  ): Promise<BatchJob> {
    const job = this.createJob('process_payments', payments);

    return this.executeJob(job.id, async (payment, index) => {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: payment.loanId,
          amount: payment.amount.toString(),
          payer: payment.payer,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process payment ${index}`);
      }

      return response.json();
    }, options);
  }

  /**
   * Batch update interest rates
   */
  async batchUpdateRates(
    updates: Array<{
      loanId: string;
      newRate: number;
    }>,
    options?: Partial<BatchOptions>
  ): Promise<BatchJob> {
    const job = this.createJob('update_rates', updates);

    return this.executeJob(job.id, async (update) => {
      const response = await fetch(`/api/loans/${update.loanId}/rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interestRate: update.newRate }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update rate for loan ${update.loanId}`);
      }

      return response.json();
    }, options);
  }

  /**
   * Batch data export
   */
  async batchExport(
    items: Array<{ type: string; id: string }>,
    format: 'json' | 'csv' = 'json',
    options?: Partial<BatchOptions>
  ): Promise<BatchJob> {
    const job = this.createJob('export_data', items);

    const results: unknown[] = [];

    await this.executeJob(job.id, async (item) => {
      const response = await fetch(`/api/${item.type}/${item.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${item.type} ${item.id}`);
      }
      const data = await response.json();
      results.push(data);
      return data;
    }, options);

    // Format results
    if (format === 'csv') {
      // Convert to CSV (simplified)
      const csv = JSON.stringify(results);
      return { ...job, items: [{ index: 0, data: csv, status: 'success', result: csv }] } as BatchJob;
    }

    return job;
  }

  /**
   * Get job statistics
   */
  getStatistics(): {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  } {
    const allJobs = Array.from(jobs.values());
    return {
      total: allJobs.length,
      pending: allJobs.filter(j => j.status === 'pending').length,
      running: allJobs.filter(j => j.status === 'running').length,
      completed: allJobs.filter(j => j.status === 'completed').length,
      failed: allJobs.filter(j => j.status === 'failed').length,
    };
  }

  /**
   * Clean up old jobs
   */
  cleanup(maxAge: number = 86400000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, job] of jobs) {
      if (job.status !== 'running' && 
          job.createdAt.getTime() < now - maxAge) {
        jobs.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Export singleton
export const batchService = new BatchService();
export { BatchService };
export default batchService;

