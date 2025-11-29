/**
 * Repayment Schedule Utilities
 * Functions for generating and managing loan repayment schedules
 */

export interface RepaymentScheduleItem {
  paymentNumber: number;
  dueDate: Date;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
  isPaid: boolean;
}

export interface RepaymentSchedule {
  loanId: string;
  borrower: string;
  totalPrincipal: number;
  totalInterest: number;
  totalPayment: number;
  numberOfPayments: number;
  paymentFrequency: PaymentFrequency;
  startDate: Date;
  endDate: Date;
  items: RepaymentScheduleItem[];
}

export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly' | 'lump_sum';

/**
 * Get interval in milliseconds for payment frequency
 */
function getFrequencyInterval(frequency: PaymentFrequency): number {
  const intervals: Record<PaymentFrequency, number> = {
    weekly: 7 * 24 * 60 * 60 * 1000,
    biweekly: 14 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
    lump_sum: 0,
  };
  return intervals[frequency];
}

/**
 * Generate amortization schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRatePercent: number,
  numberOfPayments: number,
  startDate: Date = new Date(),
  frequency: PaymentFrequency = 'monthly'
): RepaymentScheduleItem[] {
  if (frequency === 'lump_sum') {
    return generateLumpSumSchedule(principal, annualRatePercent, startDate, numberOfPayments);
  }

  const items: RepaymentScheduleItem[] = [];
  const periodsPerYear = frequency === 'weekly' ? 52 : frequency === 'biweekly' ? 26 : 12;
  const periodicRate = annualRatePercent / 100 / periodsPerYear;
  const interval = getFrequencyInterval(frequency);

  // Calculate fixed payment using PMT formula
  const payment = principal * (periodicRate * Math.pow(1 + periodicRate, numberOfPayments)) /
    (Math.pow(1 + periodicRate, numberOfPayments) - 1);

  let balance = principal;
  let currentDate = new Date(startDate);

  for (let i = 1; i <= numberOfPayments; i++) {
    const interest = balance * periodicRate;
    const principalPortion = payment - interest;
    balance = Math.max(0, balance - principalPortion);

    currentDate = new Date(currentDate.getTime() + interval);

    items.push({
      paymentNumber: i,
      dueDate: new Date(currentDate),
      principal: Math.round(principalPortion * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      totalPayment: Math.round(payment * 100) / 100,
      remainingBalance: Math.round(balance * 100) / 100,
      isPaid: false,
    });
  }

  return items;
}

/**
 * Generate lump sum repayment schedule
 */
export function generateLumpSumSchedule(
  principal: number,
  annualRatePercent: number,
  startDate: Date,
  durationDays: number
): RepaymentScheduleItem[] {
  const dueDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const interest = principal * (annualRatePercent / 100) * (durationDays / 365);
  const totalPayment = principal + interest;

  return [{
    paymentNumber: 1,
    dueDate,
    principal: Math.round(principal * 100) / 100,
    interest: Math.round(interest * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    remainingBalance: 0,
    isPaid: false,
  }];
}

/**
 * Create full repayment schedule object
 */
export function createRepaymentSchedule(
  loanId: string,
  borrower: string,
  principal: number,
  annualRatePercent: number,
  numberOfPayments: number,
  startDate: Date = new Date(),
  frequency: PaymentFrequency = 'monthly'
): RepaymentSchedule {
  const items = generateAmortizationSchedule(
    principal,
    annualRatePercent,
    numberOfPayments,
    startDate,
    frequency
  );

  const totalInterest = items.reduce((sum, item) => sum + item.interest, 0);
  const totalPayment = items.reduce((sum, item) => sum + item.totalPayment, 0);
  const endDate = items[items.length - 1]?.dueDate || startDate;

  return {
    loanId,
    borrower,
    totalPrincipal: principal,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    numberOfPayments,
    paymentFrequency: frequency,
    startDate,
    endDate,
    items,
  };
}

/**
 * Calculate next payment due
 */
export function getNextPaymentDue(schedule: RepaymentSchedule): RepaymentScheduleItem | null {
  return schedule.items.find(item => !item.isPaid) || null;
}

/**
 * Calculate total paid so far
 */
export function calculateTotalPaid(schedule: RepaymentSchedule): number {
  return schedule.items
    .filter(item => item.isPaid)
    .reduce((sum, item) => sum + item.totalPayment, 0);
}

/**
 * Calculate remaining balance
 */
export function calculateRemainingBalance(schedule: RepaymentSchedule): number {
  const unpaidItems = schedule.items.filter(item => !item.isPaid);
  if (unpaidItems.length === 0) return 0;
  return unpaidItems[0].remainingBalance + unpaidItems.slice(1).reduce((sum, item) => sum + item.principal, 0);
}

/**
 * Calculate payment progress percentage
 */
export function calculatePaymentProgress(schedule: RepaymentSchedule): number {
  const paidCount = schedule.items.filter(item => item.isPaid).length;
  return Math.round((paidCount / schedule.numberOfPayments) * 100);
}

/**
 * Mark payment as paid
 */
export function markPaymentPaid(
  schedule: RepaymentSchedule,
  paymentNumber: number
): RepaymentSchedule {
  const items = schedule.items.map(item => 
    item.paymentNumber === paymentNumber ? { ...item, isPaid: true } : item
  );
  return { ...schedule, items };
}

/**
 * Calculate early payoff amount
 */
export function calculateEarlyPayoffAmount(
  schedule: RepaymentSchedule,
  asOfDate: Date = new Date()
): number {
  let remaining = 0;
  
  for (const item of schedule.items) {
    if (!item.isPaid) {
      if (item.dueDate > asOfDate) {
        // Future payment - only count principal
        remaining += item.principal;
      } else {
        // Past due - full payment
        remaining += item.totalPayment;
      }
    }
  }

  return Math.round(remaining * 100) / 100;
}

/**
 * Get overdue payments
 */
export function getOverduePayments(
  schedule: RepaymentSchedule,
  asOfDate: Date = new Date()
): RepaymentScheduleItem[] {
  return schedule.items.filter(item => !item.isPaid && item.dueDate < asOfDate);
}

/**
 * Calculate late fees
 */
export function calculateLateFees(
  overduePayments: RepaymentScheduleItem[],
  lateFeeRate: number = 0.05,
  asOfDate: Date = new Date()
): number {
  let totalFees = 0;

  for (const payment of overduePayments) {
    const daysLate = Math.floor((asOfDate.getTime() - payment.dueDate.getTime()) / (24 * 60 * 60 * 1000));
    const fee = payment.totalPayment * lateFeeRate * Math.ceil(daysLate / 30);
    totalFees += fee;
  }

  return Math.round(totalFees * 100) / 100;
}

/**
 * Format payment frequency for display
 */
export function formatPaymentFrequency(frequency: PaymentFrequency): string {
  const labels: Record<PaymentFrequency, string> = {
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    lump_sum: 'Lump Sum',
  };
  return labels[frequency];
}

