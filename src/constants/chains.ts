/**
 * Chain Constants
 * 
 * Supported blockchain network configurations for the MicroLoan DAO application.
 */

import { type Chain } from 'viem';
import { mainnet, sepolia, hardhat, polygon, arbitrum, optimism, base } from 'viem/chains';

/**
 * Chain IDs enum for type-safe chain references
 */
export enum ChainId {
  MAINNET = 1,
  SEPOLIA = 11155111,
  POLYGON = 137,
  ARBITRUM = 42161,
  OPTIMISM = 10,
  BASE = 8453,
  HARDHAT = 31337,
}

/**
 * Supported chains configuration
 */
export const SUPPORTED_CHAINS: Chain[] = [
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  optimism,
  base,
  hardhat,
];

/**
 * Chain map for quick lookup by ID
 */
export const CHAIN_MAP: Record<number, Chain> = {
  [ChainId.MAINNET]: mainnet,
  [ChainId.SEPOLIA]: sepolia,
  [ChainId.POLYGON]: polygon,
  [ChainId.ARBITRUM]: arbitrum,
  [ChainId.OPTIMISM]: optimism,
  [ChainId.BASE]: base,
  [ChainId.HARDHAT]: hardhat,
};

/**
 * Default chain for the application
 */
export const DEFAULT_CHAIN = hardhat;

/**
 * Production chains (mainnet networks)
 */
export const PRODUCTION_CHAINS: Chain[] = [
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
];

/**
 * Testnet chains
 */
export const TESTNET_CHAINS: Chain[] = [
  sepolia,
  hardhat,
];

/**
 * Block explorer URLs by chain ID
 */
export const BLOCK_EXPLORERS: Record<number, string> = {
  [ChainId.MAINNET]: 'https://etherscan.io',
  [ChainId.SEPOLIA]: 'https://sepolia.etherscan.io',
  [ChainId.POLYGON]: 'https://polygonscan.com',
  [ChainId.ARBITRUM]: 'https://arbiscan.io',
  [ChainId.OPTIMISM]: 'https://optimistic.etherscan.io',
  [ChainId.BASE]: 'https://basescan.org',
  [ChainId.HARDHAT]: '',
};

/**
 * RPC URLs by chain ID (public endpoints)
 */
export const RPC_URLS: Record<number, string> = {
  [ChainId.MAINNET]: 'https://eth.llamarpc.com',
  [ChainId.SEPOLIA]: 'https://rpc.sepolia.org',
  [ChainId.POLYGON]: 'https://polygon-rpc.com',
  [ChainId.ARBITRUM]: 'https://arb1.arbitrum.io/rpc',
  [ChainId.OPTIMISM]: 'https://mainnet.optimism.io',
  [ChainId.BASE]: 'https://mainnet.base.org',
  [ChainId.HARDHAT]: 'http://127.0.0.1:8545',
};

/**
 * Native currency info by chain ID
 */
export const NATIVE_CURRENCIES: Record<number, { name: string; symbol: string; decimals: number }> = {
  [ChainId.MAINNET]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  [ChainId.SEPOLIA]: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  [ChainId.POLYGON]: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  [ChainId.ARBITRUM]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  [ChainId.OPTIMISM]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  [ChainId.BASE]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  [ChainId.HARDHAT]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
};

/**
 * Average block times in seconds
 */
export const BLOCK_TIMES: Record<number, number> = {
  [ChainId.MAINNET]: 12,
  [ChainId.SEPOLIA]: 12,
  [ChainId.POLYGON]: 2,
  [ChainId.ARBITRUM]: 0.25,
  [ChainId.OPTIMISM]: 2,
  [ChainId.BASE]: 2,
  [ChainId.HARDHAT]: 1,
};

/**
 * Get chain by ID
 */
export function getChainById(chainId: number): Chain | undefined {
  return CHAIN_MAP[chainId];
}

/**
 * Get block explorer URL for a chain
 */
export function getExplorerUrl(chainId: number): string {
  return BLOCK_EXPLORERS[chainId] || '';
}

/**
 * Get transaction URL on block explorer
 */
export function getTxUrl(chainId: number, txHash: string): string {
  const explorer = getExplorerUrl(chainId);
  return explorer ? `${explorer}/tx/${txHash}` : '';
}

/**
 * Get address URL on block explorer
 */
export function getAddressUrl(chainId: number, address: string): string {
  const explorer = getExplorerUrl(chainId);
  return explorer ? `${explorer}/address/${address}` : '';
}

/**
 * Check if chain is a testnet
 */
export function isTestnet(chainId: number): boolean {
  return TESTNET_CHAINS.some(chain => chain.id === chainId);
}

/**
 * Check if chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in CHAIN_MAP;
}

/**
 * Get chain display name
 */
export function getChainName(chainId: number): string {
  const chain = CHAIN_MAP[chainId];
  return chain?.name || `Chain ${chainId}`;
}

/**
 * Get native currency symbol
 */
export function getNativeCurrencySymbol(chainId: number): string {
  return NATIVE_CURRENCIES[chainId]?.symbol || 'ETH';
}

/**
 * Estimate confirmation time based on block time
 */
export function estimateConfirmationTime(chainId: number, blocks: number = 1): number {
  const blockTime = BLOCK_TIMES[chainId] || 12;
  return blockTime * blocks;
}

