import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import useApp from '@/composables/useApp';
import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/embr/services/governance/governance-contracts.service';
import BigNumber from 'bignumber.js';

interface QueryResponse {
  totalXembrSupply: BigNumber;
  totalBptStaked: BigNumber;
  userBalance: BigNumber;
  userBptTokenBalance: BigNumber;
  allowance: BigNumber;
}

export default function useXEmbrQuery() {
  const { appLoading } = useApp();
  const { isWalletReady, account } = useWeb3();
  const enabled = computed(() => !appLoading.value && isWalletReady.value);
  const queryKey = reactive(QUERY_KEYS.xEMBR.all);

  const queryFn = async () => {
    const data = await governanceContractsService.xembr.getData(account.value);

    return {
      totalXembrSupply: new BigNumber(data.totalXembrSupply.toString()),
      totalBptStaked: new BigNumber(data.totalBptStaked.toString()),
      userBalance: new BigNumber(data.userBalance.toString()),
      userBptTokenBalance: new BigNumber(data.userBptTokenBalance.toString()),
      allowance: new BigNumber(data.allowance.toString())
    };
  };

  const queryOptions = reactive({
    enabled
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
