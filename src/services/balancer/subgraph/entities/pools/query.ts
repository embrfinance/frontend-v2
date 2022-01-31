import { POOLS } from '@/constants/pools';
import { merge } from 'lodash';

const defaultArgs = {
  first: 1000,
  orderBy: 'totalLiquidity',
  orderDirection: 'desc'
  /*where: {
    totalShares_gt: 0.01,
    id_not_in: POOLS.BlockList,
    poolType_not: 'Element'
  }*/
};

const defaultAttrs = {
  id: true,
  name: true,
  address: true,
  poolType: true,
  swapFee: true,
  tokensList: true,
  totalLiquidity: true,
  totalSwapVolume: true,
  totalSwapFee: true,
  totalShares: true,
  owner: true,
  factory: true,
  amp: true,
  createTime: true,
  swapEnabled: true,
  farm: {
    id: true,
    pair: true,
    allocPoint: true,
    slpBalance: true,
    masterChef: {
      id: true,
      totalAllocPoint: true,
      embrPerSec: true
    },
  },
  volume24h: true,
  fees24h: true,
  isNewPool: true,
  apr: {
    total: true,
    hasRewardApr: true,
    swapApr: true,
    embrApr: true,
    thirdPartyApr: true,
    items: {
      title: true,
      apr: true,
      subItems: {
        title: true,
        apr: true
      }
    }
  },
  tokens: {
    name: true,
    symbol: true,
    decimals: true,
    address: true,
    balance: true,
    weight: true
    //TODO: uncomment for linear support
    //priceRate: true
  },
  //TODO: uncomment for linear support
  wrappedIndex: true,
  mainIndex: true,
  lowerTarget: true,
  upperTarget: true,
  tokenRates: true,
  linearPools: {
    id: true,
    address: true,
    priceRate: true,
    totalSupply: true,
    unwrappedTokenAddress: true,
    mainToken: {
      index: true,
      address: true,
      balance: true,
      name: true,
      symbol: true,
      decimals: true
    },
    wrappedToken: {
      index: true,
      address: true,
      balance: true,
      priceRate: true,
      name: true,
      symbol: true,
      decimals: true
    }
  }
};

export default (args = {}, attrs = {}) => ({
  pools: {
    ...merge({}, defaultAttrs, attrs)
  }
});

export const pastPoolsQuery = (args = {}, attrs = {}) => ({
  poolsPastPools: {
    ...merge({}, defaultAttrs, attrs)
  }
});
