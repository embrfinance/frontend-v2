import { governanceContractsService } from '@/embr/services/governance/governance-contracts.service';
import { erc20ContractService } from '@/embr/services/erc20/erc20-contracts.service';
import useXEmbrRewardQuery from '@/embr/composables/stake/useXEmbrRewardQuery';
import { computed } from 'vue';
import BigNumber from 'bignumber.js';

function bn(num: number) {
  return new BigNumber(num);
}

export function useXEmbrReward() {
  const XEmbrRewardQuery = useXEmbrRewardQuery();

  const { isLoading, data, refetch } = XEmbrRewardQuery;


  const xEmbrRewardLoading = computed(() => {
    return (
      isLoading.value
    );
  });
  
  const globalData = computed(
    () => data.value?.global ?? []
  );

  const userData = computed(
    () => data.value?.global ?? []
  );

  const earned = computed(
    () => data.value?.earned ?? []
  );




  return {
    xEmbrRewardLoading,
    XEmbrRewardQuery,
    globalData,
    userData,
    earned,
    refetch,
  };
}
