import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import useApp from '@/composables/useApp';
import useTokens from '@/composables/useTokens';
import { masterChefContractsService } from '@/embr/services/farm/master-chef-contracts.service';
import useProtocolDataQuery from '@/embr/composables/queries/useProtocolDataQuery';
import { farmSubgraphClient } from '@/embr/services/subgraph/farm-subgraph.client';
import { FarmUser } from '@/embr/services/subgraph/subgraph-types';
import { AddressZero } from '@ethersproject/constants';

export default function useFarmUserQuery(
  farmId: string,
  options: QueryObserverOptions<FarmUser> = {}
) {
  const { account, isWalletReady, appNetworkConfig } = useWeb3();
  const { appLoading } = useApp();
  const protocolDataQuery = useProtocolDataQuery();
  const embrPrice = computed(
    () => protocolDataQuery.data?.value?.embrPrice || 0
  );
  const { priceFor, dynamicDataLoading, loading } = useTokens();

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
      const userData = await farmSubgraphClient.getUserDataForFarm(
        farmId,
        address
      );
      const pendingBeets = await masterChefContractsService.masterChef.getPendingBeetsForFarm(
        farmId,
        address
      );

      const pendingRewardToken = await masterChefContractsService.hndRewarder.getPendingReward(
        farmId,
        address
      );

      const hndPrice = priceFor(appNetworkConfig.addresses.hnd);

      return {
        ...userData,
        pendingBeets,
        pendingBeetsValue: pendingBeets * embrPrice.value,
        pendingRewardToken,
        pendingRewardTokenValue: hndPrice * pendingRewardToken
      };
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const queryOptions = reactive({
    enabled,
    refetchInterval: 3000,
    ...options
  });

  return useQuery<FarmUser>(queryKey, queryFn, queryOptions);
}
