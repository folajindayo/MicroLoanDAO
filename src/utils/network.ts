/**
 * Network utilities for chain management
 */

/**
 * Supported chain IDs
 */
export const CHAIN_IDS = {
  MAINNET: 1,
  GOERLI: 5,
  SEPOLIA: 11155111,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BASE: 8453,
  LOCALHOST: 31337,
} as const;

/**
 * Chain configuration
 */
export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrl: string;
  testnet: boolean;
}

/**
 * Chain configurations
 */
export const CHAINS: Record<number, ChainConfig> = {
  [CHAIN_IDS.MAINNET]: {
    id: CHAIN_IDS.MAINNET,
    name: 'Ethereum Mainnet',
    shortName: 'ETH',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorerUrl: 'https://etherscan.io',
    testnet: false,
  },
  [CHAIN_IDS.SEPOLIA]: {
    id: CHAIN_IDS.SEPOLIA,
    name: 'Sepolia Testnet',
    shortName: 'SEP',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    testnet: true,
  },
  [CHAIN_IDS.POLYGON]: {
    id: CHAIN_IDS.POLYGON,
    name: 'Polygon',
    shortName: 'MATIC',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrl: 'https://polygonscan.com',
    testnet: false,
  },
  [CHAIN_IDS.ARBITRUM]: {
    id: CHAIN_IDS.ARBITRUM,
    name: 'Arbitrum One',
    shortName: 'ARB',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrl: 'https://arbiscan.io',
    testnet: false,
  },
  [CHAIN_IDS.OPTIMISM]: {
    id: CHAIN_IDS.OPTIMISM,
    name: 'Optimism',
    shortName: 'OP',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    testnet: false,
  },
  [CHAIN_IDS.BASE]: {
    id: CHAIN_IDS.BASE,
    name: 'Base',
    shortName: 'BASE',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrl: 'https://basescan.org',
    testnet: false,
  },
  [CHAIN_IDS.LOCALHOST]: {
    id: CHAIN_IDS.LOCALHOST,
    name: 'Localhost',
    shortName: 'LOCAL',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrl: '',
    testnet: true,
  },
};

/**
 * Gets chain config by ID
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return CHAINS[chainId];
}

/**
 * Gets chain name by ID
 */
export function getChainName(chainId: number): string {
  return CHAINS[chainId]?.name ?? `Chain ${chainId}`;
}

/**
 * Gets chain short name by ID
 */
export function getChainShortName(chainId: number): string {
  return CHAINS[chainId]?.shortName ?? `#${chainId}`;
}

/**
 * Checks if a chain is supported
 */
export function isSupportedChain(chainId: number): boolean {
  return chainId in CHAINS;
}

/**
 * Checks if a chain is a testnet
 */
export function isTestnet(chainId: number): boolean {
  return CHAINS[chainId]?.testnet ?? false;
}

/**
 * Gets the native currency symbol for a chain
 */
export function getNativeCurrencySymbol(chainId: number): string {
  return CHAINS[chainId]?.nativeCurrency.symbol ?? 'ETH';
}

/**
 * Gets the block explorer URL for a chain
 */
export function getBlockExplorerUrl(chainId: number): string {
  return CHAINS[chainId]?.blockExplorerUrl ?? '';
}

/**
 * Gets the RPC URL for a chain
 */
export function getRpcUrl(chainId: number): string {
  const chain = CHAINS[chainId];
  return chain?.rpcUrls[0] ?? '';
}

/**
 * Supported chains for the application
 */
export const SUPPORTED_CHAIN_IDS = [
  CHAIN_IDS.MAINNET,
  CHAIN_IDS.SEPOLIA,
  CHAIN_IDS.LOCALHOST,
] as const;

/**
 * Checks if a chain ID is supported by the application
 */
export function isAppSupportedChain(chainId: number): boolean {
  return (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId);
}

/**
 * Gets the default chain ID
 */
export function getDefaultChainId(): number {
  if (process.env.NODE_ENV === 'development') {
    return CHAIN_IDS.LOCALHOST;
  }
  return CHAIN_IDS.SEPOLIA;
}

/**
 * Network status type
 */
export type NetworkStatus = 'connected' | 'disconnected' | 'wrong_network';

/**
 * Gets the network status based on connected chain
 */
export function getNetworkStatus(
  connectedChainId: number | undefined,
  requiredChainId?: number
): NetworkStatus {
  if (connectedChainId === undefined) {
    return 'disconnected';
  }
  
  if (requiredChainId && connectedChainId !== requiredChainId) {
    return 'wrong_network';
  }
  
  if (!isAppSupportedChain(connectedChainId)) {
    return 'wrong_network';
  }
  
  return 'connected';
}

/**
 * Formats chain ID for display
 */
export function formatChainId(chainId: number): string {
  const chain = CHAINS[chainId];
  if (chain) {
    return `${chain.name} (${chainId})`;
  }
  return `Unknown Chain (${chainId})`;
}

export default {
  CHAIN_IDS,
  CHAINS,
  SUPPORTED_CHAIN_IDS,
  getChainConfig,
  getChainName,
  getChainShortName,
  isSupportedChain,
  isTestnet,
  getNativeCurrencySymbol,
  getBlockExplorerUrl,
  getRpcUrl,
  isAppSupportedChain,
  getDefaultChainId,
  getNetworkStatus,
  formatChainId,
};

