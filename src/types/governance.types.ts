/**
 * Governance Types
 * Type definitions for DAO governance
 */

import { type Address } from 'viem';

/**
 * Proposal state
 */
export type ProposalState =
  | 'pending'
  | 'active'
  | 'canceled'
  | 'defeated'
  | 'succeeded'
  | 'queued'
  | 'expired'
  | 'executed';

/**
 * Vote type
 */
export type VoteType = 'for' | 'against' | 'abstain';

/**
 * Governance proposal
 */
export interface Proposal {
  id: bigint;
  proposer: Address;
  title: string;
  description: string;
  state: ProposalState;
  targets: Address[];
  values: bigint[];
  calldatas: string[];
  signatures: string[];
  startBlock: bigint;
  endBlock: bigint;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  quorum: bigint;
  eta?: bigint;
  createdAt: Date;
  executedAt?: Date;
}

/**
 * Vote
 */
export interface Vote {
  id: string;
  proposalId: bigint;
  voter: Address;
  support: VoteType;
  weight: bigint;
  reason?: string;
  transactionHash: string;
  blockNumber: bigint;
  timestamp: Date;
}

/**
 * Delegation
 */
export interface Delegation {
  delegator: Address;
  delegatee: Address;
  amount: bigint;
  timestamp: Date;
  transactionHash: string;
}

/**
 * Governance token
 */
export interface GovernanceToken {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

/**
 * Voter info
 */
export interface VoterInfo {
  address: Address;
  votingPower: bigint;
  delegatedPower: bigint;
  delegatee?: Address;
  delegators: Address[];
  proposalsCreated: number;
  proposalsVoted: number;
  participationRate: number;
}

/**
 * Create proposal request
 */
export interface CreateProposalRequest {
  title: string;
  description: string;
  targets: Address[];
  values: bigint[];
  calldatas: string[];
  signatures?: string[];
}

/**
 * Cast vote request
 */
export interface CastVoteRequest {
  proposalId: bigint;
  support: VoteType;
  reason?: string;
}

/**
 * Governance config
 */
export interface GovernanceConfig {
  votingDelay: bigint;
  votingPeriod: bigint;
  proposalThreshold: bigint;
  quorumNumerator: number;
  timelockDelay: bigint;
}

/**
 * Governance statistics
 */
export interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  failedProposals: number;
  totalVoters: number;
  averageParticipation: number;
  totalVotingPower: bigint;
  delegatedPower: bigint;
}

/**
 * Proposal action
 */
export interface ProposalAction {
  target: Address;
  value: bigint;
  signature: string;
  calldata: string;
  description: string;
}

/**
 * Timelock transaction
 */
export interface TimelockTransaction {
  id: string;
  proposalId?: bigint;
  target: Address;
  value: bigint;
  signature: string;
  data: string;
  eta: bigint;
  executed: boolean;
  canceled: boolean;
  queuedAt: Date;
  executedAt?: Date;
}

/**
 * Governance event
 */
export interface GovernanceEvent {
  id: string;
  type: GovernanceEventType;
  proposalId?: bigint;
  actor: Address;
  data: Record<string, unknown>;
  transactionHash: string;
  blockNumber: bigint;
  timestamp: Date;
}

/**
 * Governance event type
 */
export type GovernanceEventType =
  | 'proposal_created'
  | 'proposal_canceled'
  | 'proposal_queued'
  | 'proposal_executed'
  | 'vote_cast'
  | 'delegation_changed'
  | 'config_updated';

/**
 * Proposal filter
 */
export interface ProposalFilter {
  state?: ProposalState | ProposalState[];
  proposer?: Address;
  startBlockMin?: bigint;
  startBlockMax?: bigint;
  search?: string;
}

/**
 * Voting receipt
 */
export interface VotingReceipt {
  proposalId: bigint;
  hasVoted: boolean;
  support?: VoteType;
  votes?: bigint;
}

/**
 * Governance snapshot
 */
export interface GovernanceSnapshot {
  blockNumber: bigint;
  totalSupply: bigint;
  voters: {
    address: Address;
    balance: bigint;
    delegatedTo?: Address;
  }[];
  timestamp: Date;
}

/**
 * Parameter change proposal
 */
export interface ParameterChangeProposal {
  parameterName: string;
  currentValue: bigint | number | string;
  proposedValue: bigint | number | string;
  description: string;
  impact: string;
}

/**
 * Treasury action
 */
export interface TreasuryAction {
  type: 'transfer' | 'approval' | 'swap' | 'stake' | 'custom';
  token: Address;
  amount: bigint;
  recipient?: Address;
  description: string;
}

/**
 * Governance dashboard
 */
export interface GovernanceDashboard {
  stats: GovernanceStats;
  activeProposals: Proposal[];
  recentVotes: Vote[];
  topDelegates: VoterInfo[];
  config: GovernanceConfig;
  userInfo?: VoterInfo;
}

