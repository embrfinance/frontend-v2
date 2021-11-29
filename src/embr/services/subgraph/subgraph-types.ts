import { DecoratedPool } from '@/services/balancer/subgraph/types';

export interface Farm {
  id: string;
  pair: string;
  allocPoint: number;
  slpBalance: string;
  masterChef: {
    id: string;
    totalAllocPoint: number;
    embrPerBlock: string;
  };
  rewarder: {
    id: string;
    rewardToken: string;
    rewardPerSecond: string;
  };
}

export interface FarmUser {
  id: string;
  pendingEmbr: number;
  pendingEmbrValue: number;
  amount: number;
  rewardDebt: number;
  embrHarvested: number;
  pool: {
    id: string;
  };
  pendingRewardToken: number;
  pendingRewardTokenValue: number;
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

  pendingRewardToken: number;
  pendingRewardTokenValue: number;
}

export interface DecoratedPoolWithFarm extends DecoratedPool {
  farm?: DecoratedFarm;
}

export interface DecoratedPoolWithRequiredFarm extends DecoratedPool {
  farm: DecoratedFarm;
}
