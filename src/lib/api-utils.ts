import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

/**
 * API Response types
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Creates a success response
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Creates an error response
 */
export function errorResponse(
  message: string,
  status = 500,
  details?: Record<string, string>
) {
  return NextResponse.json(
    { success: false, error: message, details },
    { status }
  );
}

/**
 * Creates a validation error response from Zod errors
 */
export function validationErrorResponse(error: ZodError) {
  const details: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    details[path] = err.message;
  });
  
  return errorResponse('Validation failed', 400, details);
}

/**
 * Validates request body against a schema
 */
export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: validationErrorResponse(err) };
    }
    return { data: null, error: errorResponse('Invalid JSON body', 400) };
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
  retryOn?: (error: unknown) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: 3,
  delay: 1000,
  backoff: 'exponential',
};

/**
 * Executes a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { attempts, delay, backoff, retryOn } = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (retryOn && !retryOn(error)) {
        throw error;
      }
      
      // Don't wait after the last attempt
      if (attempt < attempts) {
        const waitTime = backoff === 'exponential'
          ? delay * Math.pow(2, attempt - 1)
          : delay * attempt;
        
        await sleep(waitTime);
      }
    }
  }
  
  throw lastError;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * API request options
 */
export interface FetchOptions extends RequestInit {
  timeout?: number;
  retry?: Partial<RetryConfig>;
}

/**
 * Enhanced fetch with timeout and retry support
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, retry, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const fetchFn = () =>
    fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
  
  try {
    if (retry) {
      return await withRetry(fetchFn, retry);
    }
    return await fetchFn();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parses JSON response with error handling
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  
  return response.json();
}

/**
 * API error codes
 */
export const API_ERRORS = {
  VALIDATION_FAILED: { code: 'VALIDATION_FAILED', status: 400 },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
  NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
  CONFLICT: { code: 'CONFLICT', status: 409 },
  RATE_LIMITED: { code: 'RATE_LIMITED', status: 429 },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500 },
} as const;

/**
 * Creates a typed error response
 */
export function typedErrorResponse(
  error: keyof typeof API_ERRORS,
  message: string,
  details?: Record<string, string>
) {
  const { status } = API_ERRORS[error];
  return errorResponse(message, status, details);
}

/**
 * Wraps an API handler with error handling
 */
export function withErrorHandler(
  handler: (request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error) {
        return errorResponse(error.message, 500);
      }
      
      return errorResponse('An unexpected error occurred', 500);
    }
  };
}

/**
 * Rate limiting helper (in-memory, for development)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

export default {
  successResponse,
  errorResponse,
  validationErrorResponse,
  validateBody,
  withRetry,
  sleep,
  fetchWithTimeout,
  parseJsonResponse,
  API_ERRORS,
  typedErrorResponse,
  withErrorHandler,
  checkRateLimit,
};
