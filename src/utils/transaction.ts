/**
 * Transaction utilities
 */

/**
 * Transaction status enum
 */
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

/**
 * Transaction type for loan operations
 */
export type LoanTransactionType = 'create' | 'fund' | 'repay';

/**
 * Transaction receipt info
 */
export interface TransactionInfo {
  hash: string;
  type: LoanTransactionType;
  status: TransactionStatus;
  timestamp: number;
  blockNumber?: number;
  gasUsed?: bigint;
}

/**
 * Truncates a transaction hash for display
 */
export function truncateTxHash(hash: string, chars = 8): string {
  if (!hash) return '';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Validates a transaction hash format
 */
export function isValidTxHash(hash: string | undefined | null): hash is `0x${string}` {
  if (!hash) return false;
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Creates an explorer URL for a transaction
 */
export function getExplorerTxUrl(txHash: string, chainId = 1): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    42161: 'https://arbiscan.io',
    10: 'https://optimistic.etherscan.io',
    8453: 'https://basescan.org',
    31337: '', // localhost
  };
  
  const baseUrl = explorers[chainId] || explorers[1];
  if (!baseUrl) return '';
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Creates an explorer URL for an address
 */
export function getExplorerAddressUrl(address: string, chainId = 1): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    42161: 'https://arbiscan.io',
    10: 'https://optimistic.etherscan.io',
    8453: 'https://basescan.org',
    31337: '', // localhost
  };
  
  const baseUrl = explorers[chainId] || explorers[1];
  if (!baseUrl) return '';
  return `${baseUrl}/address/${address}`;
}

/**
 * Formats gas used
 */
export function formatGasUsed(gas: bigint | number): string {
  const value = typeof gas === 'bigint' ? Number(gas) : gas;
  return value.toLocaleString();
}

/**
 * Calculates transaction fee from gas used and gas price
 */
export function calculateTxFee(gasUsed: bigint, gasPrice: bigint): bigint {
  return gasUsed * gasPrice;
}

/**
 * Estimates confirmation time based on gas price
 */
export function estimateConfirmationTime(gasPrice: bigint, baseGasPrice: bigint): string {
  const ratio = Number(gasPrice) / Number(baseGasPrice);
  
  if (ratio >= 1.5) return '< 30 seconds';
  if (ratio >= 1.2) return '~1 minute';
  if (ratio >= 1.0) return '~2-3 minutes';
  return '5+ minutes';
}

/**
 * Gets transaction status label
 */
export function getStatusLabel(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    [TransactionStatus.PENDING]: 'Pending',
    [TransactionStatus.CONFIRMING]: 'Confirming...',
    [TransactionStatus.CONFIRMED]: 'Confirmed',
    [TransactionStatus.FAILED]: 'Failed',
  };
  return labels[status];
}

/**
 * Gets transaction status color class
 */
export function getStatusColor(status: TransactionStatus): string {
  const colors: Record<TransactionStatus, string> = {
    [TransactionStatus.PENDING]: 'text-yellow-500',
    [TransactionStatus.CONFIRMING]: 'text-blue-500',
    [TransactionStatus.CONFIRMED]: 'text-green-500',
    [TransactionStatus.FAILED]: 'text-red-500',
  };
  return colors[status];
}

/**
 * Gets loan transaction type label
 */
export function getLoanTxTypeLabel(type: LoanTransactionType): string {
  const labels: Record<LoanTransactionType, string> = {
    create: 'Create Loan',
    fund: 'Fund Loan',
    repay: 'Repay Loan',
  };
  return labels[type];
}

/**
 * Parses revert reason from error
 */
export function parseRevertReason(error: unknown): string | null {
  if (error instanceof Error) {
    // Look for common patterns in error messages
    const message = error.message;
    
    // Viem error format
    const viemMatch = message.match(/reason: (.+?)(?:\n|$)/);
    if (viemMatch) return viemMatch[1];
    
    // Ethers error format
    const ethersMatch = message.match(/reason="([^"]+)"/);
    if (ethersMatch) return ethersMatch[1];
    
    // Generic revert
    if (message.includes('revert')) {
      return 'Transaction reverted';
    }
  }
  
  return null;
}

/**
 * Creates a transaction info object
 */
export function createTransactionInfo(
  hash: string,
  type: LoanTransactionType
): TransactionInfo {
  return {
    hash,
    type,
    status: TransactionStatus.PENDING,
    timestamp: Date.now(),
  };
}

/**
 * Updates transaction info with confirmation
 */
export function confirmTransactionInfo(
  info: TransactionInfo,
  blockNumber: number,
  gasUsed: bigint
): TransactionInfo {
  return {
    ...info,
    status: TransactionStatus.CONFIRMED,
    blockNumber,
    gasUsed,
  };
}

export default {
  TransactionStatus,
  truncateTxHash,
  isValidTxHash,
  getExplorerTxUrl,
  getExplorerAddressUrl,
  formatGasUsed,
  calculateTxFee,
  estimateConfirmationTime,
  getStatusLabel,
  getStatusColor,
  getLoanTxTypeLabel,
  parseRevertReason,
  createTransactionInfo,
  confirmTransactionInfo,
};

