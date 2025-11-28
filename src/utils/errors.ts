/**
 * Custom error classes for better error handling
 */

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  
  constructor(
    message: string,
    code = 'APP_ERROR',
    statusCode = 500,
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly errors: Record<string, string>;
  
  constructor(
    message: string,
    errors: Record<string, string> = {},
    field?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.field = field;
    this.errors = errors;
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  public readonly resource: string;
  
  constructor(resource: string, id?: string | number) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Loan-specific error
 */
export class LoanError extends AppError {
  public readonly loanId?: string;
  public readonly action?: string;
  
  constructor(message: string, loanId?: string, action?: string) {
    super(message, 'LOAN_ERROR', 400);
    this.name = 'LoanError';
    this.loanId = loanId;
    this.action = action;
  }
}

/**
 * Insufficient funds error
 */
export class InsufficientFundsError extends AppError {
  public readonly required: string;
  public readonly available: string;
  
  constructor(required: string, available: string) {
    super(`Insufficient funds: need ${required} ETH, have ${available} ETH`, 'INSUFFICIENT_FUNDS', 400);
    this.name = 'InsufficientFundsError';
    this.required = required;
    this.available = available;
  }
}

/**
 * Contract interaction error
 */
export class ContractError extends AppError {
  public readonly contractAddress?: string;
  public readonly functionName?: string;
  public readonly originalError?: Error;
  
  constructor(
    message: string,
    originalError?: Error,
    contractAddress?: string,
    functionName?: string
  ) {
    super(message, 'CONTRACT_ERROR', 500);
    this.name = 'ContractError';
    this.contractAddress = contractAddress;
    this.functionName = functionName;
    this.originalError = originalError;
  }
}

/**
 * Transaction error
 */
export class TransactionError extends AppError {
  public readonly txHash?: string;
  public readonly reason?: string;
  
  constructor(message: string, txHash?: string, reason?: string) {
    super(message, 'TRANSACTION_ERROR', 500);
    this.name = 'TransactionError';
    this.txHash = txHash;
    this.reason = reason;
  }
}

/**
 * Wallet connection error
 */
export class WalletError extends AppError {
  public readonly walletType?: string;
  
  constructor(message: string, walletType?: string) {
    super(message, 'WALLET_ERROR', 400);
    this.name = 'WalletError';
    this.walletType = walletType;
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  public readonly chainId?: number;
  public readonly expectedChainId?: number;
  
  constructor(message: string, chainId?: number, expectedChainId?: number) {
    super(message, 'NETWORK_ERROR', 400);
    this.name = 'NetworkError';
    this.chainId = chainId;
    this.expectedChainId = expectedChainId;
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;
  
  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Extracts error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Creates a user-friendly error message
 */
export function formatErrorForUser(error: unknown): string {
  if (error instanceof ValidationError) {
    return `Invalid input: ${error.message}`;
  }
  
  if (error instanceof LoanError) {
    return error.message;
  }
  
  if (error instanceof InsufficientFundsError) {
    return `Insufficient balance. You need ${error.required} ETH but only have ${error.available} ETH.`;
  }
  
  if (error instanceof WalletError) {
    return 'Wallet connection error. Please try reconnecting.';
  }
  
  if (error instanceof NetworkError) {
    return 'Please switch to a supported network.';
  }
  
  if (error instanceof ContractError) {
    return 'Transaction failed. Please try again.';
  }
  
  return getErrorMessage(error);
}

export default {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  LoanError,
  InsufficientFundsError,
  ContractError,
  TransactionError,
  WalletError,
  NetworkError,
  RateLimitError,
  isAppError,
  getErrorMessage,
  formatErrorForUser,
};

