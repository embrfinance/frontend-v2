import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import useApp from '@/composables/useApp';
import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/embr/services/governance/governance-contracts.service';
import BigNumber from 'bignumber.js';

interface QueryResponse {
  totalXembrSupply: BigNumber;
  embrBalance: BigNumber;
  totalEmbrStaking: BigNumber;
  userBalance: BigNumber;
  userLocked: BigNumber;
  lockStart: BigNumber;
  lockEnd: BigNumber;
  allowance: BigNumber;
  rewardTokens: string[];
  activeRewardInfo: RewardInfo[];
  earned: Earned[]
}

interface Earned {
  amount: BigNumber
  address: string
  index: BigNumber
}


interface RewardInfo { 
  current: BigNumber
  last: BigNumber
  expiry: BigNumber
}

export default function useXEmbrQuery() {
  const { appLoading } = useApp();
  const { isWalletReady, account } = useWeb3();
  const enabled = computed(() => !appLoading.value && isWalletReady.value);
  const queryKey = reactive(QUERY_KEYS.xEMBR.all);

  const queryFn = async () => {
    const data = await governanceContractsService.xembr.getData(account.value);
    let earned: Earned[] = []
    for(let i=0; i < data.activeRewardInfo.length; i++) { 
     const res = await governanceContractsService.xembr.earned(i.toString(), account.value);
     earned.push({
        amount: new BigNumber(res.toString()),
        address:data.rewardTokens[data.activeRewardInfo[i].current.toString()],
        index: new BigNumber(data.activeRewardInfo[i].current.toString())
     })
    }
    return {
      totalXembrSupply: new BigNumber(data.totalXembrSupply.toString()),
      embrBalance: new BigNumber(data.embrBalance.toString()),
      userBalance: new BigNumber(data.userBalance.toString()),
      totalEmbrStaking: new BigNumber(data.totalEmbrStaking.toString()),
      userLocked: new BigNumber(data.userLocked.amount.toString()),
      lockStart: new BigNumber(data.userLocked.start.toString()),
      lockEnd: new BigNumber(data.userLocked.end.toString()),
      allowance: new BigNumber(data.allowance.toString()),
      rewardTokens: data.rewardTokens,
      activeRewardInfo: data.activeRewardInfo as any,
      earned: earned,
    };
  };

  const queryOptions = reactive({
    enabled
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
