import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolSnapshots } from '@/services/balancer/subgraph/types';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import {
  embrService,
  HistoricalPrices
} from '@/embr/services/embr/embr.service';
import { GqlBalancerPoolSnapshot } from '@/embr/services/embr/embr-types';

/**
 * TYPES
 */
interface QueryResponse {
  prices: HistoricalPrices;
  snapshots: GqlBalancerPoolSnapshot[];
}

export default function usePoolSnapshotsQuery(
  id: string,
  days: number,
  options: QueryObserverOptions<QueryResponse> = {}
) {
  /**
   * QUERY DEPENDENCIES
   */
  const poolQuery = usePoolQuery(id);

  /**
   * COMPUTED
   */
  const pool = computed(() => poolQuery.data.value);
  const enabled = computed(() => !!pool.value?.id);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Snapshot(id);

  const queryFn = async () => {
    if (!pool.value) throw new Error('No pool');

    const prices = await embrService.getHistoricalTokenPrices(
      pool.value.tokensList
    );
    const snapshots = await embrService.getPoolSnapshots(id);;

    return { prices, snapshots };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
