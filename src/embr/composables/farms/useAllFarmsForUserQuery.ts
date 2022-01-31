import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import useApp from '@/composables/useApp';
import useTokens from '@/composables/useTokens';
import { masterChefContractsService } from '@/embr/services/farm/master-chef-contracts.service';
import { FarmUser } from '@/embr/services/subgraph/subgraph-types';
import useProtocolDataQuery from '@/embr/composables/queries/useProtocolDataQuery';
import { embrService } from '@/embr/services/embr/embr.service';
import { uniq } from 'lodash';

export default function useAllFarmsForUserQuery(
  options: QueryObserverOptions<FarmUser[]> = {}
) {
  const { account, isWalletReady } = useWeb3();
  const { appLoading } = useApp();
  const { dynamicDataLoading, loading } = useTokens();
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

      const farms = await embrService.getEmbrFarms();
      const userFarms = await embrService.getUserDataForAllFarms(
        account.value
      );
      const decoratedUserFarms: FarmUser[] = [];

      const farmIds = userFarms.map(farm => farm.farmId);
      const pendingEmbrForFarms = await masterChefContractsService.masterChef.getPendingEmbrForFarms(
        farmIds,
        account.value
      );

      for (const userFarm of userFarms) {
        const farm = farms.find(farm => farm.id === userFarm.farmId);
        const pendingEmbr = pendingEmbrForFarms[userFarm.farmId] || 0;

        decoratedUserFarms.push({
          ...userFarm,
          amount: parseFloat(userFarm.amount),
          rewardDebt: parseFloat(userFarm.rewardDebt),
          embrHarvested: parseFloat(userFarm.embrHarvested),
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
