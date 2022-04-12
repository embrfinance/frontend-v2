import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import useApp from '@/composables/useApp';
import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/embr/services/governance/governance-contracts.service';
import { xembrSubgraphClient } from '@/embr/services/subgraph/xembr-subgraph.client';

import BigNumber from 'bignumber.js';

interface QueryResponse {
  totalXembrSupply: BigNumber;
  embrBalance: BigNumber;
  totalEmbrStaking: BigNumber;
  totalEmbrCooling: BigNumber;
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
  const queryKey = reactive(QUERY_KEYS.xEMBR.All);

  const queryFn = async () => {
    const data = await governanceContractsService.xembr.getData(account.value);
    const xembrData = await xembrSubgraphClient.getXembr()
   
    const rewardTokens: ActiveRewardToken[] = []
    for(let i=0; i < xembrData.rewards.length; i++) { 
      if (xembrData.rewards[i].active) {
        rewardTokens.push({
          address: xembrData.rewards[i].address,
          index: new BigNumber(xembrData.rewards[i].index) //xploited, remove -1 from prod once contract is updated
        })
      }
    }
    const allowance = await governanceContractsService.xembr.allowance(account.value);


    console.log("xploited, got here", data, xembrData)
    return {
      totalXembrSupply: new BigNumber(xembrData.totalXembr.toString()),
      embrBalance: new BigNumber(data.embrBalance.toString()),
      userBalance: new BigNumber(data.xEmbrBalance.toString()),
      totalEmbrStaking: new BigNumber(xembrData.totalStaking.toString()),
      totalEmbrCooling: new BigNumber(xembrData.totalCooling.toString()),
      userEmbrStaking: new BigNumber(data.userStaking.raw.toString()),
      allowance: new BigNumber(allowance.toString()),
      activeRewardTokens: rewardTokens,
      weightedTimestamp: new BigNumber(data.userStaking.weightedTimestamp.toString()),
      timeMultiplier: new BigNumber(data.userStaking.timeMultiplier.toString()),
      questMultiplier: new BigNumber(data.userStaking.questMultiplier.toString()),
      cooldownTimestamp: new BigNumber(data.userStaking.cooldownTimestamp.toString()),
      cooldownUnits: new BigNumber(data.userStaking.cooldownUnits.toString()),
    };
  };

  const queryOptions = reactive({
    enabled
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
