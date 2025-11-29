/**
 * Governance Service
 * DAO governance, proposals, and voting mechanisms
 */

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  type: ProposalType;
  status: ProposalStatus;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  quorum: bigint;
  startTime: Date;
  endTime: Date;
  executionTime?: Date;
  eta?: Date;
  actions: ProposalAction[];
  snapshot: number;
  createdAt: Date;
}

export type ProposalType = 
  | 'parameter_change'
  | 'treasury_allocation'
  | 'contract_upgrade'
  | 'new_feature'
  | 'emergency';

export type ProposalStatus = 
  | 'pending'
  | 'active'
  | 'succeeded'
  | 'defeated'
  | 'queued'
  | 'executed'
  | 'expired'
  | 'cancelled';

export interface ProposalAction {
  target: string;
  value: bigint;
  signature: string;
  calldata: string;
}

export interface Vote {
  proposalId: string;
  voter: string;
  support: VoteType;
  weight: bigint;
  reason?: string;
  timestamp: Date;
}

export type VoteType = 'for' | 'against' | 'abstain';

export interface VotingPower {
  address: string;
  balance: bigint;
  delegatedTo?: string;
  delegatedFrom: string[];
  totalVotingPower: bigint;
}

export interface GovernanceConfig {
  votingDelay: number;
  votingPeriod: number;
  proposalThreshold: bigint;
  quorumNumerator: number;
  timelockDelay: number;
}

// Default configuration
const DEFAULT_CONFIG: GovernanceConfig = {
  votingDelay: 1, // 1 block
  votingPeriod: 45818, // ~1 week in blocks
  proposalThreshold: BigInt('100000000000000000000'), // 100 tokens
  quorumNumerator: 4, // 4% quorum
  timelockDelay: 172800, // 2 days in seconds
};

// In-memory stores
const proposals: Map<string, Proposal> = new Map();
const votes: Map<string, Vote[]> = new Map();
const votingPower: Map<string, VotingPower> = new Map();

class GovernanceService {
  private config: GovernanceConfig;

  constructor(config: Partial<GovernanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate unique proposal ID
   */
  private generateProposalId(): string {
    return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new proposal
   */
  async createProposal(
    proposer: string,
    title: string,
    description: string,
    type: ProposalType,
    actions: ProposalAction[]
  ): Promise<Proposal> {
    // Check proposer has sufficient voting power
    const power = await this.getVotingPower(proposer);
    if (power.totalVotingPower < this.config.proposalThreshold) {
      throw new Error('Insufficient voting power to create proposal');
    }

    const now = new Date();
    const startTime = new Date(now.getTime() + this.config.votingDelay * 12000); // 12s per block
    const endTime = new Date(startTime.getTime() + this.config.votingPeriod * 12000);

    const proposal: Proposal = {
      id: this.generateProposalId(),
      title,
      description,
      proposer,
      type,
      status: 'pending',
      forVotes: BigInt(0),
      againstVotes: BigInt(0),
      abstainVotes: BigInt(0),
      quorum: this.calculateQuorum(),
      startTime,
      endTime,
      actions,
      snapshot: Math.floor(Date.now() / 12000), // Block approximation
      createdAt: now,
    };

    proposals.set(proposal.id, proposal);
    return proposal;
  }

  /**
   * Get proposal by ID
   */
  getProposal(proposalId: string): Proposal | null {
    return proposals.get(proposalId) || null;
  }

  /**
   * Get all proposals
   */
  getAllProposals(
    status?: ProposalStatus,
    limit: number = 50,
    offset: number = 0
  ): Proposal[] {
    let allProposals = Array.from(proposals.values());

    if (status) {
      allProposals = allProposals.filter(p => p.status === status);
    }

    return allProposals
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  /**
   * Get active proposals
   */
  getActiveProposals(): Proposal[] {
    const now = new Date();
    return this.getAllProposals().filter(
      p => p.status === 'active' && p.startTime <= now && p.endTime > now
    );
  }

  /**
   * Cast vote on a proposal
   */
  async castVote(
    proposalId: string,
    voter: string,
    support: VoteType,
    reason?: string
  ): Promise<Vote> {
    const proposal = this.getProposal(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Check voting is active
    this.updateProposalStatus(proposal);
    if (proposal.status !== 'active') {
      throw new Error('Voting is not active for this proposal');
    }

    // Check if already voted
    const existingVotes = votes.get(proposalId) || [];
    if (existingVotes.some(v => v.voter.toLowerCase() === voter.toLowerCase())) {
      throw new Error('Already voted on this proposal');
    }

    // Get voting power at snapshot
    const power = await this.getVotingPower(voter);
    const weight = power.totalVotingPower;

    if (weight === BigInt(0)) {
      throw new Error('No voting power');
    }

    const vote: Vote = {
      proposalId,
      voter,
      support,
      weight,
      reason,
      timestamp: new Date(),
    };

    // Update vote counts
    switch (support) {
      case 'for':
        proposal.forVotes += weight;
        break;
      case 'against':
        proposal.againstVotes += weight;
        break;
      case 'abstain':
        proposal.abstainVotes += weight;
        break;
    }

    // Store vote
    existingVotes.push(vote);
    votes.set(proposalId, existingVotes);

    return vote;
  }

  /**
   * Get votes for a proposal
   */
  getProposalVotes(proposalId: string): Vote[] {
    return votes.get(proposalId) || [];
  }

  /**
   * Get vote for a specific voter on a proposal
   */
  getVote(proposalId: string, voter: string): Vote | null {
    const proposalVotes = votes.get(proposalId) || [];
    return proposalVotes.find(v => v.voter.toLowerCase() === voter.toLowerCase()) || null;
  }

  /**
   * Get voting power for an address
   */
  async getVotingPower(address: string): Promise<VotingPower> {
    const cached = votingPower.get(address.toLowerCase());
    if (cached) return cached;

    // In production, fetch from contract/subgraph
    try {
      const response = await fetch(`/api/governance/voting-power/${address}`);
      if (response.ok) {
        const data = await response.json();
        const power: VotingPower = {
          address,
          balance: BigInt(data.balance || '0'),
          delegatedTo: data.delegatedTo,
          delegatedFrom: data.delegatedFrom || [],
          totalVotingPower: BigInt(data.totalVotingPower || data.balance || '0'),
        };
        votingPower.set(address.toLowerCase(), power);
        return power;
      }
    } catch (error) {
      console.error('Failed to fetch voting power:', error);
    }

    // Return mock data
    const mockPower: VotingPower = {
      address,
      balance: BigInt('1000000000000000000000'), // 1000 tokens
      delegatedFrom: [],
      totalVotingPower: BigInt('1000000000000000000000'),
    };
    return mockPower;
  }

  /**
   * Delegate voting power
   */
  async delegate(from: string, to: string): Promise<boolean> {
    const fromPower = await this.getVotingPower(from);
    const toPower = await this.getVotingPower(to);

    // Remove from current delegation
    if (fromPower.delegatedTo) {
      const currentDelegate = await this.getVotingPower(fromPower.delegatedTo);
      currentDelegate.delegatedFrom = currentDelegate.delegatedFrom.filter(
        addr => addr.toLowerCase() !== from.toLowerCase()
      );
      currentDelegate.totalVotingPower -= fromPower.balance;
    }

    // Add to new delegation
    fromPower.delegatedTo = to;
    toPower.delegatedFrom.push(from);
    toPower.totalVotingPower += fromPower.balance;

    votingPower.set(from.toLowerCase(), fromPower);
    votingPower.set(to.toLowerCase(), toPower);

    return true;
  }

  /**
   * Calculate required quorum
   */
  calculateQuorum(): bigint {
    // In production, calculate from total supply
    const totalSupply = BigInt('10000000000000000000000000'); // 10M tokens
    return (totalSupply * BigInt(this.config.quorumNumerator)) / BigInt(100);
  }

  /**
   * Check if quorum is reached
   */
  isQuorumReached(proposal: Proposal): boolean {
    const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
    return totalVotes >= proposal.quorum;
  }

  /**
   * Update proposal status based on time and votes
   */
  updateProposalStatus(proposal: Proposal): ProposalStatus {
    const now = new Date();

    if (proposal.status === 'cancelled' || proposal.status === 'executed') {
      return proposal.status;
    }

    // Check if voting period started
    if (now < proposal.startTime) {
      proposal.status = 'pending';
      return proposal.status;
    }

    // Check if voting is active
    if (now < proposal.endTime) {
      proposal.status = 'active';
      return proposal.status;
    }

    // Voting ended - determine outcome
    if (!this.isQuorumReached(proposal)) {
      proposal.status = 'defeated';
      return proposal.status;
    }

    if (proposal.forVotes > proposal.againstVotes) {
      proposal.status = 'succeeded';
    } else {
      proposal.status = 'defeated';
    }

    return proposal.status;
  }

  /**
   * Queue successful proposal for execution
   */
  async queueProposal(proposalId: string): Promise<Proposal> {
    const proposal = this.getProposal(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    this.updateProposalStatus(proposal);
    if (proposal.status !== 'succeeded') {
      throw new Error('Proposal has not succeeded');
    }

    const eta = new Date(Date.now() + this.config.timelockDelay * 1000);
    proposal.eta = eta;
    proposal.status = 'queued';

    return proposal;
  }

  /**
   * Execute queued proposal
   */
  async executeProposal(proposalId: string): Promise<Proposal> {
    const proposal = this.getProposal(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'queued') {
      throw new Error('Proposal is not queued');
    }

    if (proposal.eta && new Date() < proposal.eta) {
      throw new Error('Timelock not expired');
    }

    // In production, execute on-chain actions
    console.log('Executing proposal actions:', proposal.actions);

    proposal.status = 'executed';
    proposal.executionTime = new Date();

    return proposal;
  }

  /**
   * Cancel a proposal
   */
  cancelProposal(proposalId: string, canceller: string): boolean {
    const proposal = this.getProposal(proposalId);
    if (!proposal) return false;

    // Only proposer can cancel (or guardian)
    if (proposal.proposer.toLowerCase() !== canceller.toLowerCase()) {
      throw new Error('Only proposer can cancel');
    }

    if (proposal.status === 'executed') {
      throw new Error('Cannot cancel executed proposal');
    }

    proposal.status = 'cancelled';
    return true;
  }

  /**
   * Get governance configuration
   */
  getConfig(): GovernanceConfig {
    return { ...this.config };
  }
}

// Export singleton
export const governanceService = new GovernanceService();
export { GovernanceService };
export default governanceService;

