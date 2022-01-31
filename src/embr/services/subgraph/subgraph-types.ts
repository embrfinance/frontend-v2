import { Pool } from '@/services/balancer/subgraph/types';

export interface Farm {
  id: string;
  pair: string;
  allocPoint: number;
  slpBalance: string;
  masterChef: {
    id: string;
    totalAllocPoint: number;
    embrPerSec: string;
  };
}

export interface FarmUser {
  id: string;
  pendingEmbr: number;
  pendingEmbrValue: number;
  amount: number;
  rewardDebt: number;
  embrHarvested: number;
  farmId: string;
}

export interface DecoratedFarm extends Farm {
  tvl: number;
  rewards: number;
  stake: number;
  pendingEmbr: number;
  pendingEmbrValue: number;
  apr: number;
  share: number;
  userBpt: number;
}

export interface DecoratedPoolWithFarm extends Pool {
  decoratedFarm?: DecoratedFarm;
}

export interface DecoratedPoolWithRequiredFarm extends Pool {
  decoratedFarm: DecoratedFarm;
}
