import { computed, ComputedRef, Ref, ref } from 'vue';

import { flatten } from 'lodash';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';
import useFarms from '@/embr/composables/farms/useFarms';
import { decorateFarms, getPoolApr } from '@/embr/utils/farmHelper';
import useAverageBlockTime from '@/embr/composables/blocks/useAverageBlockTime';
import useProtocolDataQuery from '@/embr/composables/queries/useProtocolDataQuery';
import { DecoratedPoolWithShares } from '@/services/balancer/subgraph/types';
import { uniqBy } from 'lodash';
import useTokens from '@/composables/useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import {
  DecoratedPoolWithFarm,
  DecoratedPoolWithRequiredFarm,
  Farm
} from '@/embr/services/subgraph/subgraph-types';

export default function usePools(poolsTokenList: Ref<string[]> = ref([])) {
  // COMPOSABLES
  const poolsQuery = usePoolsQuery(poolsTokenList, {}, { pageSize: 1000 });
  const userPoolsQuery = useUserPoolsQuery();
  const protocolDataQuery = useProtocolDataQuery();
  const { priceFor, dynamicDataLoaded } = useTokens();
  const { appNetworkConfig } = useWeb3();
  const embrPrice = computed(
    () => protocolDataQuery.data?.value?.embrPrice || 0
  );
  const rewardTokenPrice = computed(() =>
    dynamicDataLoaded.value ? priceFor(appNetworkConfig.addresses.hnd) : 0
  );

  const {
    farms,
    allFarmsForUser,
    isLoadingFarms,
    harvestAllFarms,
    refetchFarmsForUser
  } = useFarms();
  const { blocksPerYear, blocksPerDay } = useAverageBlockTime();

  // COMPUTED

  const pools = computed(() => {
    if (!poolsQuery.data.value) {
      return [];
    }

    const flattened = flatten(
      poolsQuery.data.value.pages.map(page => page.pools)
    );

    return flattened;
  });

  const decoratedFarms = computed(() => {
    //here we replace the old farm with the cembr farm on fidellio duetto.
    const mappedFarms = farms.value
      .filter(farm => farm.id !== appNetworkConfig.cEmbr.oldFarmId)
      .map(
        (farm): Farm =>
          farm.id === appNetworkConfig.cEmbr.farmId
            ? {
                ...farm,
                pair: appNetworkConfig.cEmbr.poolAddress.toLowerCase()
              }
            : farm
      );

    return decorateFarms(
      pools.value,
      mappedFarms,
      allFarmsForUser.value,
      blocksPerYear.value,
      blocksPerDay.value,
      embrPrice.value,
      rewardTokenPrice.value
    );
  });

  const poolsWithFarms: ComputedRef<DecoratedPoolWithFarm[]> = computed(() => {
    return pools.value.map(pool => {
      const farm = decoratedFarms.value.find(
        farm => pool.address.toLowerCase() === farm.pair.toLowerCase()
      );

      return {
        ...pool,
        farm,
        hasLiquidityMiningRewards: !!farm,
        dynamic: {
          ...pool.dynamic,
          apr: farm
            ? getPoolApr(
                pool,
                farm,
                blocksPerYear.value,
                embrPrice.value,
                rewardTokenPrice.value
              )
            : pool.dynamic.apr
        }
      };
    });
  });

  const onlyPoolsWithFarms: ComputedRef<DecoratedPoolWithRequiredFarm[]> = computed(
    () => {
      return poolsWithFarms.value.filter(
        pool => !!pool.farm
      ) as DecoratedPoolWithRequiredFarm[];
    }
  );

  const tokens = computed(() =>
    poolsQuery.data.value
      ? flatten(poolsQuery.data.value.pages.map(page => page.tokens))
      : []
  );

  const userPools = computed<DecoratedPoolWithShares[]>(() => {
    const userPools = userPoolsQuery.data.value?.pools || [];
    const userFarmPools = onlyPoolsWithFarms.value
      .filter(pool => pool.farm.stake > 0)
      .map(pool => ({ ...pool, shares: '0' }));

    return uniqBy([...userPools, ...userFarmPools], 'id').map(pool => {
      const farm = decoratedFarms.value.find(
        farm => pool.address.toLowerCase() === farm.pair.toLowerCase()
      );

      return {
        ...pool,
        farm,
        hasLiquidityMiningRewards: !!farm,
        dynamic: {
          ...pool.dynamic,
          apr: farm
            ? getPoolApr(
                pool,
                farm,
                blocksPerYear.value,
                embrPrice.value,
                rewardTokenPrice.value
              )
            : pool.dynamic.apr
        }
      };
    });
  });

  const totalInvestedAmount = computed(
    () => userPoolsQuery.data.value?.totalInvestedAmount
  );

  const isLoadingPools = computed(
    () => poolsQuery.isLoading.value || poolsQuery.isIdle.value
  );

  const isLoadingUserPools = computed(
    () => userPoolsQuery.isLoading.value || userPoolsQuery.isIdle.value
  );

  const poolsHasNextPage = computed(() => poolsQuery.hasNextPage?.value);
  const poolsIsFetchingNextPage = computed(
    () => poolsQuery.isFetchingNextPage?.value
  );

  // METHODS
  function loadMorePools() {
    poolsQuery.fetchNextPage.value();
  }

  function refetchPools() {
    poolsQuery.refetch.value();
  }

  return {
    // computed
    pools,
    tokens,
    userPools,
    totalInvestedAmount,
    isLoadingPools,
    isLoadingUserPools,
    poolsHasNextPage: false,
    poolsIsFetchingNextPage,
    isLoadingFarms,
    poolsWithFarms,
    onlyPoolsWithFarms,
    poolsQuery,

    // methods
    loadMorePools,
    refetchPools,

    harvestAllFarms,
    refetchFarmsForUser,
    farms,
    allFarmsForUser
  };
}
