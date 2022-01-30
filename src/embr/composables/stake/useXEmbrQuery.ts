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
  userEmbrStaking: BigNumber;
  allowance: BigNumber;
  activeRewardTokens: ActiveRewardToken[];

  weightedTimestamp: BigNumber;
  timeMultiplier: BigNumber;
  questMultiplier: BigNumber;
  cooldownTimestamp: BigNumber;
  cooldownUnits: BigNumber;
}

interface Earned {
  amount: BigNumber
  address: string
  index: BigNumber
}

interface ActiveRewardToken { 
  index: BigNumber
  address: string
}

export default function useXEmbrQuery() {
  const { appLoading } = useApp();
  const { isWalletReady, account } = useWeb3();
  const enabled = computed(() => !appLoading.value && isWalletReady.value);
  const queryKey = reactive(QUERY_KEYS.xEMBR.all);

  const queryFn = async () => {
    const data = await governanceContractsService.xembr.getData(account.value);

   
    const rewardTokens: ActiveRewardToken[] = []
    for(let i=0; i < data.activeTokenCount.toNumber(); i++) { 
      //const global = await governanceContractsService.xembr.getGlobalData(i.toString())
      const res = await governanceContractsService.xembr.getRewardToken(i.toString());
      rewardTokens.push({
        address: res,
        index: new BigNumber(i)
      })
    }
    const allowance = await governanceContractsService.xembr.allowance(account.value);

    console.log("xploited 111", data.userStaking.raw.toString(), data.userStaking.questMultiplier.toString(), data.userStaking.timeMultiplier.toString())
    return {
      totalXembrSupply: new BigNumber(data.totalXembrSupply.toString()),
      embrBalance: new BigNumber(data.embrBalance.toString()),
      userBalance: new BigNumber(data.userStaking.raw.toString()),
        //.times(new BigNumber(data.userStaking.timeMultiplier.toString()))
        //.times(new BigNumber(data.userStaking.questMultiplier.toString())),
      totalEmbrStaking: new BigNumber(data.totalEmbrStaking.toString()),
      userEmbrStaking: new BigNumber(data.userStaking.raw.toString()),
      allowance: new BigNumber(allowance.toString()),
      activeRewardTokens: rewardTokens,
      weightedTimestamp: new BigNumber(data.userStaking.weightedTimestamp.toString()),
      timeMultiplier: new BigNumber(data.userStaking.timeMultiplier.toString()),
      questMultiplier: new BigNumber(data.userStaking.questMultiplier.toString()),
      cooldownTimestamp: new BigNumber(data.userStaking.cooldownTimestamp.toString()),
      cooldownUnits: new BigNumber(data.userStaking.cooldownUnits.toString()),
      //rewardTokens: data.rewardTokens,
      //activeRewardInfo: data.activeRewardInfo as any,
      //earned: earned,
    };
  };

  const queryOptions = reactive({
    enabled
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
