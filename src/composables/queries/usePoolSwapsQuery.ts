import { reactive } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';

import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';

import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolSwap } from '@/services/balancer/subgraph/types';
import useNetwork from '../useNetwork';
import useWeb3 from '@/services/web3/useWeb3';

type PoolSwapsQueryResponse = {
  poolSwaps: PoolSwap[];
  skip?: number;
};

export default function usePoolSwapsQuery(
  id: string,
  options: UseInfiniteQueryOptions<PoolSwapsQueryResponse> = {}
) {
  // COMPOSABLES
  const { account, isWalletReady } = useWeb3();
  const { networkId } = useNetwork();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Pools.UserSwaps(networkId, id, account));

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const poolSwaps = await balancerSubgraphService.poolSwaps.get({
      first: POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {
        poolId: id
      }
    });

    return {
      poolSwaps,
      skip:
        poolSwaps.length >= POOLS.Pagination.PerPage
          ? pageParam + POOLS.Pagination.PerPage
          : undefined
    };
  };

  const queryOptions = reactive({
    getNextPageParam: (lastPage: PoolSwapsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<PoolSwapsQueryResponse>(
    queryKey,
    queryFn,
    queryOptions
  );
}
