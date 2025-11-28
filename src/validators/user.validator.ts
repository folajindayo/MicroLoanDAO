/**
 * User Validators
 * 
 * Validation schemas for user-related operations
 * including wallet addresses and user profiles.
 */

import { z } from 'zod';
import { EthereumAddressSchema } from './loan.validator';

/**
 * ENS name schema
 */
export const ENSNameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9-]+\.eth$/, 'Invalid ENS name format')
  .optional();

/**
 * Username schema
 */
export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .optional();

/**
 * Email schema
 */
export const EmailSchema = z
  .string()
  .email('Invalid email format')
  .optional();

/**
 * Avatar URL schema
 */
export const AvatarUrlSchema = z
  .string()
  .url('Invalid URL format')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:', 'ipfs:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    'Avatar URL must be HTTP, HTTPS, or IPFS'
  )
  .optional();

/**
 * Bio/Description schema
 */
export const BioSchema = z
  .string()
  .max(500, 'Bio cannot exceed 500 characters')
  .refine(
    (val) => !/[<>]/.test(val),
    'Bio cannot contain HTML characters'
  )
  .optional();

/**
 * User profile schema
 */
export const UserProfileSchema = z.object({
  walletAddress: EthereumAddressSchema,
  username: UsernameSchema,
  email: EmailSchema,
  ensName: ENSNameSchema,
  avatarUrl: AvatarUrlSchema,
  bio: BioSchema,
  isVerified: z.boolean().optional().default(false),
  notifications: z.object({
    loanFunded: z.boolean().default(true),
    loanRepaid: z.boolean().default(true),
    loanDefaulted: z.boolean().default(true),
    newLoanRequest: z.boolean().default(false),
  }).optional(),
});

/**
 * User profile update schema (partial)
 */
export const UpdateUserProfileSchema = UserProfileSchema.partial().omit({
  walletAddress: true,
  isVerified: true,
});

/**
 * User registration schema
 */
export const UserRegistrationSchema = z.object({
  walletAddress: EthereumAddressSchema,
  signature: z.string().min(1, 'Signature is required'),
  message: z.string().min(1, 'Message is required'),
  timestamp: z.number().int().positive(),
});

/**
 * User authentication schema
 */
export const UserAuthSchema = z.object({
  walletAddress: EthereumAddressSchema,
  signature: z.string().min(1, 'Signature is required'),
  nonce: z.string().min(1, 'Nonce is required'),
});

/**
 * User query schema
 */
export const UserQuerySchema = z.object({
  address: EthereumAddressSchema.optional(),
  username: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

/**
 * User history query schema
 */
export const UserHistoryQuerySchema = z.object({
  walletAddress: EthereumAddressSchema,
  type: z.enum(['borrowed', 'lent', 'all']).optional().default('all'),
  status: z.enum(['REQUESTED', 'FUNDED', 'REPAID', 'DEFAULTED', 'all']).optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

/**
 * Type exports
 */
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type UserAuth = z.infer<typeof UserAuthSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;
export type UserHistoryQuery = z.infer<typeof UserHistoryQuerySchema>;

/**
 * Validation helpers
 */
export function validateUserProfile(data: unknown): UserProfile {
  return UserProfileSchema.parse(data);
}

export function validateUpdateUserProfile(data: unknown): UpdateUserProfile {
  return UpdateUserProfileSchema.parse(data);
}

export function validateUserRegistration(data: unknown): UserRegistration {
  return UserRegistrationSchema.parse(data);
}

export function validateUserAuth(data: unknown): UserAuth {
  return UserAuthSchema.parse(data);
}

export function validateUserQuery(data: unknown): UserQuery {
  return UserQuerySchema.parse(data);
}

export function validateUserHistoryQuery(data: unknown): UserHistoryQuery {
  return UserHistoryQuerySchema.parse(data);
}

/**
 * Safe validation helpers
 */
export function safeValidateUserProfile(data: unknown) {
  return UserProfileSchema.safeParse(data);
}

export function safeValidateUpdateUserProfile(data: unknown) {
  return UpdateUserProfileSchema.safeParse(data);
}

export function safeValidateUserRegistration(data: unknown) {
  return UserRegistrationSchema.safeParse(data);
}

export function safeValidateUserAuth(data: unknown) {
  return UserAuthSchema.safeParse(data);
}

export function safeValidateUserQuery(data: unknown) {
  return UserQuerySchema.safeParse(data);
}

export function safeValidateUserHistoryQuery(data: unknown) {
  return UserHistoryQuerySchema.safeParse(data);
}

/**
 * Check if wallet address matches a user
 */
export function isWalletOwner(userAddress: string, targetAddress: string): boolean {
  return userAddress.toLowerCase() === targetAddress.toLowerCase();
}

/**
 * Validate signature timestamp is recent (within 5 minutes)
 */
export function isSignatureTimestampValid(timestamp: number, maxAgeMs: number = 300000): boolean {
  const now = Date.now();
  return timestamp <= now && now - timestamp <= maxAgeMs;
}

