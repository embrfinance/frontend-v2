import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { XembrSnapshots } from '@/services/balancer/subgraph/types';
//import usePoolQuery from '@/composables/queries/usePoolQuery';
import {
  embrService
} from '@/embr/services/embr/embr.service';
import { GqlXEmbrSnapshot } from '@/embr/services/embr/embr-types';

/**
 * TYPES
 */
interface QueryResponse {
  snapshots: GqlXEmbrSnapshot[];
}

export default function useXembrSnapshotQuery(
  days: number,
  options: QueryObserverOptions<QueryResponse> = {}
) {
  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Xembr.Snapshot();

  const queryFn = async () => {
    //if (!pool.value) throw new Error('No pool');

    const snapshots = await embrService.getXEmbrSnapshots();

    return { snapshots };
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
