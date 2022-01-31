import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import useApp from '@/composables/useApp';
import useTokens from '@/composables/useTokens';
import { masterChefContractsService } from '@/embr/services/farm/master-chef-contracts.service';
import useProtocolDataQuery from '@/embr/composables/queries/useProtocolDataQuery';

import { FarmUser } from '@/embr/services/subgraph/subgraph-types';
import { AddressZero } from '@ethersproject/constants';
import { embrService } from '@/embr/services/embr/embr.service';

export default function useFarmUserQuery(
  farmId: string,
  options: QueryObserverOptions<FarmUser | null> = {}
) {
  const { account, isWalletReady } = useWeb3();
  const { appLoading } = useApp();
  const protocolDataQuery = useProtocolDataQuery();
  const embrPrice = computed(
    () => protocolDataQuery.data?.value?.embrPrice || 0
  );
  const { dynamicDataLoading, loading } = useTokens();

  const enabled = computed(
    () =>
      isWalletReady.value &&
      !appLoading.value &&
      !loading.value &&
      !dynamicDataLoading.value
  );
  const queryKey = QUERY_KEYS.Farms.User(farmId, account);

  const queryFn = async () => {
    const address = account.value || AddressZero;

    try {
      const farms = await embrService.getEmbrFarms();
      const farm = farms.find(farm => (farm.id = farmId));

      const userData = await embrService.getUserDataForFarm(
        farmId,
        address
      );
      const pendingEmbr = await masterChefContractsService.masterChef.getPendingEmbrForFarm(
        farmId,
        address
      );

      return {
        ...userData,
        amount: parseFloat(userData.amount),
        rewardDebt: parseFloat(userData.rewardDebt),
        embrHarvested: parseFloat(userData.embrHarvested),
        pendingEmbr,
        pendingEmbrValue: pendingEmbr * embrPrice.value
      };
    } catch (e) {
      console.log('ERROR', e);

      return null;
    }
  };

  const queryOptions = reactive({
    enabled,
    refetchInterval: 3000,
    ...options
  });

  return useQuery<FarmUser | null>(queryKey, queryFn, queryOptions);
}
