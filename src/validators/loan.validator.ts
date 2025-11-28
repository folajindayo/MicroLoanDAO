/**
 * Loan Validators
 * 
 * Comprehensive validation schemas for loan-related operations
 * using Zod for type-safe runtime validation.
 */

import { z } from 'zod';

/**
 * Common validation patterns
 */
const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
const transactionHashRegex = /^0x[a-fA-F0-9]{64}$/;

/**
 * Ethereum address schema
 */
export const EthereumAddressSchema = z
  .string()
  .regex(ethereumAddressRegex, 'Invalid Ethereum address format');

/**
 * Transaction hash schema
 */
export const TransactionHashSchema = z
  .string()
  .regex(transactionHashRegex, 'Invalid transaction hash format');

/**
 * Loan amount schema (in Wei as string)
 */
export const LoanAmountSchema = z
  .string()
  .regex(/^\d+$/, 'Amount must be a valid integer in Wei')
  .refine(
    (val) => BigInt(val) > 0n,
    'Amount must be greater than 0'
  )
  .refine(
    (val) => BigInt(val) <= BigInt('100000000000000000000'), // 100 ETH max
    'Amount cannot exceed 100 ETH'
  );

/**
 * Loan amount schema (in Ether as decimal string)
 */
export const LoanAmountEtherSchema = z
  .string()
  .regex(/^\d+(\.\d{1,18})?$/, 'Invalid amount format')
  .refine(
    (val) => parseFloat(val) > 0,
    'Amount must be greater than 0'
  )
  .refine(
    (val) => parseFloat(val) <= 100,
    'Amount cannot exceed 100 ETH'
  );

/**
 * Interest rate schema (in basis points, 100 = 1%)
 */
export const InterestRateSchema = z
  .number()
  .int('Interest rate must be an integer')
  .min(0, 'Interest rate cannot be negative')
  .max(10000, 'Interest rate cannot exceed 100%');

/**
 * Duration schema (in seconds)
 */
export const DurationSecondsSchema = z
  .number()
  .int('Duration must be an integer')
  .positive('Duration must be positive')
  .min(3600, 'Minimum duration is 1 hour')
  .max(31536000, 'Maximum duration is 1 year');

/**
 * Duration in days schema
 */
export const DurationDaysSchema = z
  .number()
  .int('Duration must be an integer')
  .positive('Duration must be positive')
  .min(1, 'Minimum duration is 1 day')
  .max(365, 'Maximum duration is 365 days');

/**
 * Loan purpose schema
 */
export const LoanPurposeSchema = z
  .string()
  .min(10, 'Purpose must be at least 10 characters')
  .max(500, 'Purpose cannot exceed 500 characters')
  .refine(
    (val) => !/[<>]/.test(val),
    'Purpose cannot contain HTML characters'
  );

/**
 * Schema for creating a new loan request
 */
export const CreateLoanSchema = z.object({
  borrowerAddress: EthereumAddressSchema,
  amount: LoanAmountEtherSchema,
  purpose: LoanPurposeSchema,
  duration: DurationSecondsSchema,
  interestRate: InterestRateSchema,
  creationTx: TransactionHashSchema,
  contractLoanId: z.number().nullable(),
});

/**
 * Schema for creating a loan from the frontend
 */
export const CreateLoanFormSchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,18})?$/, 'Invalid amount format')
    .refine(val => parseFloat(val) > 0, 'Amount must be greater than 0')
    .refine(val => parseFloat(val) <= 100, 'Amount cannot exceed 100 ETH'),
  duration: z.string()
    .min(1, 'Duration is required')
    .regex(/^\d+$/, 'Duration must be a number')
    .refine(val => parseInt(val) >= 1, 'Minimum duration is 1 day')
    .refine(val => parseInt(val) <= 365, 'Maximum duration is 365 days'),
  interestRate: z.string()
    .min(1, 'Interest rate is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid interest rate format')
    .refine(val => parseFloat(val) >= 0, 'Interest rate cannot be negative')
    .refine(val => parseFloat(val) <= 100, 'Interest rate cannot exceed 100%'),
  purpose: LoanPurposeSchema,
});

/**
 * Schema for funding a loan
 */
export const FundLoanSchema = z.object({
  loanId: z.string().uuid('Invalid Loan ID format'),
  lenderAddress: EthereumAddressSchema,
  fundingTx: TransactionHashSchema,
});

/**
 * Schema for funding a loan from contract
 */
export const FundLoanContractSchema = z.object({
  contractLoanId: z.number().int().positive('Invalid contract loan ID'),
  amount: LoanAmountSchema,
});

/**
 * Schema for repaying a loan
 */
export const RepayLoanSchema = z.object({
  loanId: z.string().uuid('Invalid Loan ID format'),
  repaymentTx: TransactionHashSchema,
});

/**
 * Schema for repaying a loan from contract
 */
export const RepayLoanContractSchema = z.object({
  contractLoanId: z.number().int().positive('Invalid contract loan ID'),
  amount: LoanAmountSchema,
});

/**
 * Schema for loan query parameters
 */
export const LoanQuerySchema = z.object({
  status: z.enum(['REQUESTED', 'FUNDED', 'REPAID', 'DEFAULTED', 'all']).optional(),
  borrower: EthereumAddressSchema.optional(),
  lender: EthereumAddressSchema.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(['requestedAt', 'amount', 'interestRate', 'duration']).optional().default('requestedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Type exports for TypeScript
 */
export type CreateLoanInput = z.infer<typeof CreateLoanSchema>;
export type CreateLoanFormInput = z.infer<typeof CreateLoanFormSchema>;
export type FundLoanInput = z.infer<typeof FundLoanSchema>;
export type FundLoanContractInput = z.infer<typeof FundLoanContractSchema>;
export type RepayLoanInput = z.infer<typeof RepayLoanSchema>;
export type RepayLoanContractInput = z.infer<typeof RepayLoanContractSchema>;
export type LoanQueryInput = z.infer<typeof LoanQuerySchema>;

/**
 * Validation helper functions
 */
export function validateCreateLoan(data: unknown): CreateLoanInput {
  return CreateLoanSchema.parse(data);
}

export function validateCreateLoanForm(data: unknown): CreateLoanFormInput {
  return CreateLoanFormSchema.parse(data);
}

export function validateFundLoan(data: unknown): FundLoanInput {
  return FundLoanSchema.parse(data);
}

export function validateRepayLoan(data: unknown): RepayLoanInput {
  return RepayLoanSchema.parse(data);
}

export function validateLoanQuery(data: unknown): LoanQueryInput {
  return LoanQuerySchema.parse(data);
}

/**
 * Safe validation (returns result object instead of throwing)
 */
export function safeValidateCreateLoan(data: unknown) {
  return CreateLoanSchema.safeParse(data);
}

export function safeValidateCreateLoanForm(data: unknown) {
  return CreateLoanFormSchema.safeParse(data);
}

export function safeValidateFundLoan(data: unknown) {
  return FundLoanSchema.safeParse(data);
}

export function safeValidateRepayLoan(data: unknown) {
  return RepayLoanSchema.safeParse(data);
}

export function safeValidateLoanQuery(data: unknown) {
  return LoanQuerySchema.safeParse(data);
}

