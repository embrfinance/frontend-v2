import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import { governanceContractsService } from '@/embr/services/governance/governance-contracts.service';
import { erc20ContractService } from '@/embr/services/erc20/erc20-contracts.service';
import useXEmbrRewardQuery from '@/embr/composables/stake/useXEmbrRewardQuery';
import { computed } from 'vue';
import BigNumber from 'bignumber.js';

function bn(num: number) {
  return new BigNumber(num);
}

export function useXEmbrReward() {
  const { getProvider, appNetworkConfig } = useWeb3();
  const XEmbrRewardQuery = useXEmbrRewardQuery();
  const { addTransaction } = useTransactions();

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

  async function claim(index: string, symbol: string) {
    const tx = await governanceContractsService.xembr.claim(
      getProvider(),
      index,
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'claim',
      summary: 'Claimed rewards for' + symbol,
      details: {
        contractAddress: governanceContractsService.xembr.xembrAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;
  }


  async function claimRedemption() { 
    const tx = await governanceContractsService.xembr.claimRedemption(
      getProvider()
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'claim',
      summary: 'Claimed rewards for EMBR',
      details: {
        contractAddress: governanceContractsService.xembr.xembrAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });
    

  }


  return {
    xEmbrRewardLoading,
    XEmbrRewardQuery,
    globalData,
    userData,
    earned,
    refetch,

    claim,
    claimRedemption
  };
}
