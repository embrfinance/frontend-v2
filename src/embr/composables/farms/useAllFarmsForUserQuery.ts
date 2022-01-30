import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import useApp from '@/composables/useApp';
import useTokens from '@/composables/useTokens';
import { masterChefContractsService } from '@/embr/services/farm/master-chef-contracts.service';
import { farmSubgraphClient } from '@/embr/services/subgraph/farm-subgraph.client';
import { FarmUser } from '@/embr/services/subgraph/subgraph-types';
import useProtocolDataQuery from '@/embr/composables/queries/useProtocolDataQuery';

export default function useAllFarmsForUserQuery(
  options: QueryObserverOptions<FarmUser[]> = {}
) {
  const { account, isWalletReady, appNetworkConfig } = useWeb3();
  const { appLoading } = useApp();
  const { priceFor, dynamicDataLoading, loading } = useTokens();
  const protocolDataQuery = useProtocolDataQuery();
  const embrPrice = computed(
    () => protocolDataQuery.data?.value?.embrPrice || 0
  );
  const enabled = computed(
    () =>
      isWalletReady.value &&
      account.value != null &&
      !appLoading.value &&
      !loading.value &&
      !dynamicDataLoading.value
  );
  const queryKey = QUERY_KEYS.Farms.UserAllFarms(account);

  const queryFn = async () => {
    try {
      if (!account.value) {
        return [];
      }
      
      const userFarms = await farmSubgraphClient.getUserDataForAllFarms(
        account.value
      );
      const decoratedUserFarms: FarmUser[] = [];

      for (const userFarm of userFarms) {
        const pendingEmbr = await masterChefContractsService.masterChef.getPendingEmbrForFarm(
          userFarm.pool.id,
          account.value
        );

        decoratedUserFarms.push({
          ...userFarm,
          pendingEmbr,
          pendingEmbrValue: pendingEmbr * embrPrice.value
        });
      }

      return decoratedUserFarms;
    } catch (e) {
      console.log('ERROR', e);
      return [];
    }
  };

  const queryOptions = reactive({
    enabled,
    refetchInterval: 3000,
    ...options
  });

  return useQuery<FarmUser[]>(queryKey, queryFn, queryOptions);
}
