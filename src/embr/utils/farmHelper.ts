import { DecoratedPool, PoolApr } from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import useTokens from '@/composables/useTokens';
import BigNumber from 'bignumber.js';
import {
  DecoratedFarm,
  Farm,
  FarmUser
} from '@/embr/services/subgraph/subgraph-types';

export function calculateTvl(farm: Farm, pool: DecoratedPool) {
  const response = useTokens();

  if (!response) {
    return 0;
  }

  const { tokens, priceFor } = response;

  if (pool && pool.totalShares !== '0' && farm.slpBalance !== '0') {
    const valuePerShare =
      parseFloat(pool.totalLiquidity) / parseFloat(pool.totalShares);

    return Number(parseInt(farm.slpBalance) / 1e18) * valuePerShare;
  }

  const address = getAddress(farm.pair);
  const price = priceFor(address);

  if (tokens.value[address] && price) {
    return Number(parseInt(farm.slpBalance) / 1e18) * price;
  }

  return 0;
}

export function calculateRewardsPerDay(farm: Farm, secondsPerDay: number) {
  const totalEmbrPerDay = new BigNumber(
    farm.masterChef.embrPerSec
  ).multipliedBy(secondsPerDay);

  return totalEmbrPerDay
    .multipliedBy(farm.allocPoint / farm.masterChef.totalAllocPoint)
    .dividedBy(1e18)
    .toNumber();
}

export function calculateApr(
  farm: Farm,
  tvl: number,
  secPerYear: number,
  embrPrice: number
) {
  if (tvl === 0) {
    return 0;
  }

  const embrPerSec = Number(parseInt(farm.masterChef.embrPerSec) / 1e18) * 0.9;
  const embrPerYear = embrPerSec * secPerYear; //31540000;
  const farmEmbrPerYear =
    (farm.allocPoint / farm.masterChef.totalAllocPoint) * embrPerYear;

  const valuePerYear = embrPrice * farmEmbrPerYear;

  return valuePerYear / tvl;
}

export function getPoolApr(
  pool: DecoratedPool,
  farm: DecoratedFarm,
  secsPerYear: number,
  embrPrice: number
): PoolApr {
  const tvl = calculateTvl(farm, pool);
  const liquidityMiningApr = farm
    ? `${calculateApr(farm, tvl, secsPerYear, embrPrice)}`
    : '0';

  return {
    pool: pool.dynamic.apr.pool,
    liquidityMining: liquidityMiningApr,
    total: `${parseFloat(pool.dynamic.apr.pool) +
      parseFloat(liquidityMiningApr)}`,
    thirdParty: '',
    liquidityMiningBreakdown: {}
  };
}

export function decorateFarm(
  farm: Farm,
  pool: DecoratedPool,
  secsPerYear: number,
  secsPerDay: number,
  embrPrice: number,
  farmUser?: FarmUser
): DecoratedFarm {
  const tvl = calculateTvl(farm, pool);
  const apr = calculateApr(farm, tvl, secsPerYear, embrPrice);
  const userShare = new BigNumber(farmUser?.amount || 0)
    .div(farm.slpBalance)
    .toNumber();

  return {
    ...farm,
    tvl,
    rewards: calculateRewardsPerDay(farm, secsPerDay),
    apr,
    stake: tvl * userShare,
    pendingEmbr: farmUser?.pendingEmbr || 0,
    pendingEmbrValue: (farmUser?.pendingEmbr || 0) * embrPrice,
    share: userShare,
    userBpt: new BigNumber(farmUser?.amount || 0).div(1e18).toNumber()
  };
}

export function decorateFarms(
  pools: DecoratedPool[],
  farms: Farm[],
  allFarmsForUser: FarmUser[],
  secsPerYear: number,
  secsPerDay: number,
  embrPrice: number
) {
  if (farms.length === 0 || pools.length === 0) {
    return [];
  }

  const decorated: DecoratedFarm[] = [];

  for (const farm of farms) {
    const pool = pools.find(
      pool => pool.address.toLowerCase() === farm.pair.toLowerCase()
    );
    const farmUser = allFarmsForUser.find(
      userFarm => userFarm.pool.id === farm.id
    );

    if (pool) {
      decorated.push(
        decorateFarm(farm, pool, secsPerYear, secsPerDay, embrPrice, farmUser)
      );
    }
  }

  return decorated;
}
