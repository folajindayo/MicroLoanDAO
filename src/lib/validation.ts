import { z } from 'zod';

/**
 * Common validation patterns
 */
export const PATTERNS = {
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TX_HASH: /^0x[a-fA-F0-9]{64}$/,
  HEX: /^0x[a-fA-F0-9]*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  POSITIVE_NUMBER: /^\d+(\.\d+)?$/,
  INTEGER: /^\d+$/,
} as const;

/**
 * Custom Zod refinements
 */
export const ethereumAddress = z
  .string()
  .regex(PATTERNS.ETH_ADDRESS, 'Invalid Ethereum address');

export const transactionHash = z
  .string()
  .regex(PATTERNS.TX_HASH, 'Invalid transaction hash');

export const positiveNumber = z
  .string()
  .regex(PATTERNS.POSITIVE_NUMBER, 'Must be a valid positive number');

/**
 * Schema for creating a new loan request
 */
export const CreateLoanSchema = z.object({
  borrowerAddress: ethereumAddress,
  amount: positiveNumber.refine(
    (val) => parseFloat(val) >= 0.001,
    'Minimum loan amount is 0.001 ETH'
  ).refine(
    (val) => parseFloat(val) <= 1000,
    'Maximum loan amount is 1000 ETH'
  ),
  purpose: z
    .string()
    .min(10, 'Purpose must be at least 10 characters')
    .max(500, 'Purpose cannot exceed 500 characters'),
  duration: z
    .number()
    .int()
    .positive('Duration must be positive')
    .min(86400, 'Minimum duration is 1 day')
    .max(31536000, 'Maximum duration is 365 days'),
  interestRate: z
    .number()
    .min(0, 'Interest rate cannot be negative')
    .max(10000, 'Interest rate cannot exceed 100%'), // in basis points
  creationTx: transactionHash,
  contractLoanId: z.number().nullable(),
});

export type CreateLoanInput = z.infer<typeof CreateLoanSchema>;

/**
 * Schema for funding a loan
 */
export const FundLoanSchema = z.object({
  loanId: z.string().uuid('Invalid Loan ID format'),
  lenderAddress: ethereumAddress,
  fundingTx: transactionHash,
});

export type FundLoanInput = z.infer<typeof FundLoanSchema>;

/**
 * Schema for repaying a loan
 */
export const RepayLoanSchema = z.object({
  loanId: z.string().uuid('Invalid Loan ID format'),
  repaymentTx: transactionHash,
});

export type RepayLoanInput = z.infer<typeof RepayLoanSchema>;

/**
 * Schema for loan query parameters
 */
export const LoanQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['REQUESTED', 'FUNDED', 'REPAID', 'DEFAULTED']).optional(),
  borrower: ethereumAddress.optional(),
  lender: ethereumAddress.optional(),
  sortBy: z.enum(['createdAt', 'amount', 'interestRate', 'duration']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type LoanQueryInput = z.infer<typeof LoanQuerySchema>;

/**
 * Schema for user profile
 */
export const UserProfileSchema = z.object({
  address: ethereumAddress,
  displayName: z
    .string()
    .min(3, 'Display name must be at least 3 characters')
    .max(50, 'Display name cannot exceed 50 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
});

export type UserProfileInput = z.infer<typeof UserProfileSchema>;

/**
 * Schema for loan calculation request
 */
export const LoanCalculationSchema = z.object({
  amount: positiveNumber,
  durationDays: z.coerce.number().int().positive().min(1).max(365),
  interestRate: z.coerce.number().min(0).max(100), // percentage
});

export type LoanCalculationInput = z.infer<typeof LoanCalculationSchema>;

/**
 * Schema for wallet connection
 */
export const WalletConnectionSchema = z.object({
  address: ethereumAddress,
  chainId: z.number().int().positive(),
  signature: z.string().optional(),
});

export type WalletConnectionInput = z.infer<typeof WalletConnectionSchema>;

/**
 * Schema for transaction history query
 */
export const TransactionHistorySchema = z.object({
  address: ethereumAddress,
  type: z.enum(['all', 'create', 'fund', 'repay']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type TransactionHistoryInput = z.infer<typeof TransactionHistorySchema>;

/**
 * Helper to validate and parse data
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
}

/**
 * Helper to validate partial updates
 */
export function validatePartial<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: Partial<T> } | { success: false; errors: Record<string, string> } {
  // Create a partial version of the schema
  const partialSchema = (schema as z.ZodObject<z.ZodRawShape>).partial();
  return validate(partialSchema, data);
}

export default {
  PATTERNS,
  ethereumAddress,
  transactionHash,
  positiveNumber,
  CreateLoanSchema,
  FundLoanSchema,
  RepayLoanSchema,
  LoanQuerySchema,
  UserProfileSchema,
  LoanCalculationSchema,
  WalletConnectionSchema,
  TransactionHistorySchema,
  validate,
  validatePartial,
};
