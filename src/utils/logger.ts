/**
 * Logging utility for consistent logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  prefix: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '#9CA3AF',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
};

const config: LoggerConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  minLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  prefix: '[MicroLoan]',
};

/**
 * Checks if a log level should be logged
 */
function shouldLog(level: LogLevel): boolean {
  if (!config.enabled) return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
}

/**
 * Formats a log message for display
 */
function formatMessage(level: LogLevel, message: string): string {
  return `${config.prefix} [${level.toUpperCase()}] ${message}`;
}

/**
 * Logs a message with the specified level
 */
function log(level: LogLevel, message: string, data?: unknown): void {
  if (!shouldLog(level)) return;
  
  const formattedMessage = formatMessage(level, message);
  const color = LOG_COLORS[level];
  
  const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  
  if (typeof window !== 'undefined') {
    console[consoleMethod](
      `%c${formattedMessage}`,
      `color: ${color}; font-weight: ${level === 'error' ? 'bold' : 'normal'}`
    );
  } else {
    console[consoleMethod](formattedMessage);
  }
  
  if (data !== undefined) {
    console[consoleMethod](data);
  }
}

/**
 * Debug level logging
 */
export function debug(message: string, data?: unknown): void {
  log('debug', message, data);
}

/**
 * Info level logging
 */
export function info(message: string, data?: unknown): void {
  log('info', message, data);
}

/**
 * Warning level logging
 */
export function warn(message: string, data?: unknown): void {
  log('warn', message, data);
}

/**
 * Error level logging
 */
export function error(message: string, data?: unknown): void {
  log('error', message, data);
}

/**
 * Creates a timer for performance logging
 */
export function time(label: string): () => void {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    debug(`${label} completed in ${duration.toFixed(2)}ms`);
  };
}

/**
 * Creates a scoped logger with a custom prefix
 */
export function createLogger(scope: string) {
  const scopedPrefix = `${config.prefix} [${scope}]`;
  
  return {
    debug: (message: string, data?: unknown) => {
      if (!shouldLog('debug')) return;
      console.log(`%c${scopedPrefix} [DEBUG] ${message}`, `color: ${LOG_COLORS.debug}`, data ?? '');
    },
    info: (message: string, data?: unknown) => {
      if (!shouldLog('info')) return;
      console.log(`%c${scopedPrefix} [INFO] ${message}`, `color: ${LOG_COLORS.info}`, data ?? '');
    },
    warn: (message: string, data?: unknown) => {
      if (!shouldLog('warn')) return;
      console.warn(`%c${scopedPrefix} [WARN] ${message}`, `color: ${LOG_COLORS.warn}`, data ?? '');
    },
    error: (message: string, data?: unknown) => {
      if (!shouldLog('error')) return;
      console.error(`%c${scopedPrefix} [ERROR] ${message}`, `color: ${LOG_COLORS.error}; font-weight: bold`, data ?? '');
    },
  };
}

/**
 * Logs loan operations
 */
export const loanLogger = createLogger('Loan');

/**
 * Logs wallet interactions
 */
export const walletLogger = createLogger('Wallet');

/**
 * Logs API interactions
 */
export const apiLogger = createLogger('API');

/**
 * Logs contract interactions
 */
export const contractLogger = createLogger('Contract');

/**
 * Configures the logger
 */
export function configure(options: Partial<LoggerConfig>): void {
  Object.assign(config, options);
}

/**
 * Enables or disables logging
 */
export function setEnabled(enabled: boolean): void {
  config.enabled = enabled;
}

export default {
  debug,
  info,
  warn,
  error,
  time,
  createLogger,
  loanLogger,
  walletLogger,
  apiLogger,
  contractLogger,
  configure,
  setEnabled,
};

