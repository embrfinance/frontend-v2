import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import useApp from '@/composables/useApp';
import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/embr/services/governance/governance-contracts.service';
import BigNumber from 'bignumber.js';

interface GlobalData {
    index: BigNumber
    periodFinish: BigNumber
    lastUpdateTime: BigNumber
    rewardRate: BigNumber
    rewardPerTokenStored: BigNumber
}

interface UserData {
  index: BigNumber
  rewardPerTokenPaid: BigNumber
  rewards: BigNumber
  rewardsPaid: BigNumber
}

interface Earned {
  amount: BigNumber
  index: BigNumber
}

interface QueryResponse {
  earned: Earned[];
  global: GlobalData[];
  userData: UserData[];
}

export default function useXEmbrRewardQuery() {
  const { appLoading } = useApp();
  const { isWalletReady, account } = useWeb3();
  const enabled = computed(() => !appLoading.value && isWalletReady.value);
  const queryKey = reactive(QUERY_KEYS.xEMBRewards.All);

  const queryFn = async () => {

    const activeTokenCount = await governanceContractsService.xembr.activeTokenCount()

    const global: GlobalData[] = []
    const earned: Earned[] = []
    const user: UserData[] = []
    for(let i=0; i < activeTokenCount.toNumber(); i++) { 
      
      const index = new BigNumber(i)
      const e = await governanceContractsService.xembr.earned(account.value, i.toString());
      earned.push({
        amount: new BigNumber(e.toString()), 
        index: index
      })

      const g = await governanceContractsService.xembr.getGlobalData(i.toString());
      global.push({
        index: index, 
        periodFinish: new BigNumber(g.periodFinish.toString()),
        lastUpdateTime: new BigNumber(g.lastUpdateTime.toString()),
        rewardRate: new BigNumber(g.rewardRate.toString()),
        rewardPerTokenStored: new BigNumber(g.rewardPerTokenStored.toString())
      })


      const u = await governanceContractsService.xembr.userData(i.toString(), account.value);
      user.push({
        index: new BigNumber(i),
        rewardPerTokenPaid: new BigNumber(u.rewardPerTokenPaid.toString()),
        rewards: new BigNumber(u.rewards.toString()),
        rewardsPaid: new BigNumber(u.rewardsPaid.toString())
      })
    }


    const index = new BigNumber("115792089237316195423570985008687907853269984665640564039457584007913129639935")
    const e = await governanceContractsService.xembr.earned(account.value, index.toString());
    earned.push({
      amount: new BigNumber(e.toString()), 
      index: index
    })

    const g = await governanceContractsService.xembr.getGlobalData(index.toString());
    global.push({
      index: index, 
      periodFinish: new BigNumber(g.periodFinish.toString()),
      lastUpdateTime: new BigNumber(g.lastUpdateTime.toString()),
      rewardRate: new BigNumber(g.rewardRate.toString()),
      rewardPerTokenStored: new BigNumber(g.rewardPerTokenStored.toString())
    })


    const u = await governanceContractsService.xembr.userData(index.toString(), account.value);
    user.push({
      index: index,
      rewardPerTokenPaid: new BigNumber(u.rewardPerTokenPaid.toString()),
      rewards: new BigNumber(u.rewards.toString()),
      rewardsPaid: new BigNumber(u.rewardsPaid.toString())
    })

    return {
      earned: earned,
      global: global,
      userData: user
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
