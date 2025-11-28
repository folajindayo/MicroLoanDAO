/**
 * Contract Constants
 * 
 * Centralized contract addresses and ABIs for the MicroLoan DAO application.
 */

import { type Address } from 'viem';

/**
 * Network-specific contract addresses
 */
export const CONTRACT_ADDRESSES: Record<number, Address> = {
  // Mainnet
  1: '0x0000000000000000000000000000000000000000' as Address,
  // Sepolia Testnet
  11155111: '0x0000000000000000000000000000000000000000' as Address,
  // Hardhat Local
  31337: (process.env.NEXT_PUBLIC_MICROLOAN_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3') as Address,
};

/**
 * Get contract address for a specific chain
 */
export function getContractAddressForChain(chainId: number): Address {
  const address = CONTRACT_ADDRESSES[chainId];
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error(`Contract not deployed on chain ${chainId}`);
  }
  return address;
}

/**
 * Loan status enum matching contract
 */
export enum LoanStatus {
  REQUESTED = 0,
  FUNDED = 1,
  REPAID = 2,
  DEFAULTED = 3,
}

/**
 * Loan status labels for display
 */
export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  [LoanStatus.REQUESTED]: 'Requested',
  [LoanStatus.FUNDED]: 'Funded',
  [LoanStatus.REPAID]: 'Repaid',
  [LoanStatus.DEFAULTED]: 'Defaulted',
};

/**
 * Loan status colors for UI
 */
export const LOAN_STATUS_COLORS: Record<LoanStatus, string> = {
  [LoanStatus.REQUESTED]: 'bg-yellow-100 text-yellow-800',
  [LoanStatus.FUNDED]: 'bg-blue-100 text-blue-800',
  [LoanStatus.REPAID]: 'bg-green-100 text-green-800',
  [LoanStatus.DEFAULTED]: 'bg-red-100 text-red-800',
};

/**
 * MicroLoan DAO Contract ABI
 */
export const MICROLOAN_DAO_ABI = [
  // Read Functions
  {
    inputs: [],
    name: 'loanCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'loans',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'address', name: 'borrower', type: 'address' },
      { internalType: 'address', name: 'lender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'interestRate', type: 'uint256' },
      { internalType: 'string', name: 'purpose', type: 'string' },
      { internalType: 'uint256', name: 'duration', type: 'uint256' },
      { internalType: 'uint256', name: 'requestedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'fundedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'repaidAt', type: 'uint256' },
      { internalType: 'uint8', name: 'status', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_id', type: 'uint256' }],
    name: 'getLoanDetails',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'address', name: 'borrower', type: 'address' },
          { internalType: 'address', name: 'lender', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'interestRate', type: 'uint256' },
          { internalType: 'string', name: 'purpose', type: 'string' },
          { internalType: 'uint256', name: 'duration', type: 'uint256' },
          { internalType: 'uint256', name: 'requestedAt', type: 'uint256' },
          { internalType: 'uint256', name: 'fundedAt', type: 'uint256' },
          { internalType: 'uint256', name: 'repaidAt', type: 'uint256' },
          { internalType: 'uint8', name: 'status', type: 'uint8' },
        ],
        internalType: 'struct MicroLoanDAO.Loan',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Write Functions
  {
    inputs: [
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint256', name: '_duration', type: 'uint256' },
      { internalType: 'uint256', name: '_interestRate', type: 'uint256' },
      { internalType: 'string', name: '_purpose', type: 'string' },
    ],
    name: 'createLoan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_id', type: 'uint256' }],
    name: 'fundLoan',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_id', type: 'uint256' }],
    name: 'repayLoan',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'borrower', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'duration', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'interestRate', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'purpose', type: 'string' },
    ],
    name: 'LoanCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'lender', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'fundedAt', type: 'uint256' },
    ],
    name: 'LoanFunded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'repaidAt', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'totalRepayment', type: 'uint256' },
    ],
    name: 'LoanRepaid',
    type: 'event',
  },
] as const;

/**
 * Contract deployment block numbers
 */
export const DEPLOYMENT_BLOCKS: Record<number, number> = {
  1: 0,
  11155111: 0,
  31337: 0,
};

/**
 * Contract metadata
 */
export const CONTRACT_METADATA = {
  name: 'MicroLoanDAO',
  version: '1.0.0',
  maxInterestRate: 10000, // 100% in basis points
  lateFeeRate: 500, // 5% in basis points
} as const;

