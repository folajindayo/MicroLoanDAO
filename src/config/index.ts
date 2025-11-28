/**
 * Application Configuration
 * 
 * Centralized configuration for the MicroLoan DAO application.
 * Includes wagmi/appkit setup and environment-based settings.
 */

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage } from 'wagmi';
import { getProjectId, getContractAddress } from '@/lib/env';
import { mainnet, arbitrum, sepolia, hardhat } from '@reown/appkit/networks';
import type { Address } from 'viem';

/**
 * WalletConnect Project ID
 */
export const projectId = getProjectId();

/**
 * Supported Networks Configuration
 */
export const networks = [mainnet, arbitrum, sepolia, hardhat] as const;

/**
 * Network type
 */
export type SupportedNetwork = (typeof networks)[number];

/**
 * Wagmi Adapter Configuration
 */
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

/**
 * Wagmi Configuration Export
 */
export const config = wagmiAdapter.wagmiConfig;

/**
 * MicroLoan Contract Address
 */
export const MICROLOAN_CONTRACT_ADDRESS: Address = getContractAddress() as Address;

/**
 * Application Metadata
 */
export const APP_METADATA = {
  name: 'MicroLoan DAO',
  description: 'Decentralized Microloan Platform',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  icons: ['/favicon.ico'],
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  maxPageSize: 100,
  defaultPage: 1,
} as const;

/**
 * Loan Configuration
 */
export const LOAN_CONFIG = {
  minAmount: '0.001', // ETH
  maxAmount: '100', // ETH
  minDuration: 1, // days
  maxDuration: 365, // days
  minInterestRate: 0, // basis points (0%)
  maxInterestRate: 10000, // basis points (100%)
  lateFeeRate: 500, // basis points (5%)
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  toastDuration: 5000,
  debounceDelay: 300,
  animationDuration: 200,
  maxPurposeLength: 500,
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  enableTestnet: process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableNotifications: true,
  maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
} as const;

/**
 * Environment Detection
 */
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_TEST = process.env.NODE_ENV === 'test';
export const IS_SERVER = typeof window === 'undefined';
export const IS_CLIENT = typeof window !== 'undefined';

