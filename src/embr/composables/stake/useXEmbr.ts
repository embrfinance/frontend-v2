import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/embr/services/governance/governance-contracts.service';
import { erc20ContractService } from '@/embr/services/erc20/erc20-contracts.service';
import useXEmbrQuery from '@/embr/composables/stake/useXEmbrQuery';
import { computed } from 'vue';
import useTransactions from '@/composables/useTransactions';
import useFarmUser from '@/embr/composables/farms/useFarmUser';
import usePools from '@/composables/pools/usePools';
import { DecoratedFarm } from '@/embr/services/subgraph/subgraph-types';
import BigNumber from 'bignumber.js';

function bn(num: number) {
  return new BigNumber(num);
}

export function useXEmbr() {
  const { getProvider, appNetworkConfig } = useWeb3();
  const XEmbrQuery = useXEmbrQuery();
  const { addTransaction } = useTransactions();
 /* const { farmUser, farmUserLoading } = useFarmUser(
    appNetworkConfig.xEmbr.farmId
  );
  */

  const { isLoading, data, refetch } = XEmbrQuery;

  const xEmbrLoading = computed(() => {
    return (
      isLoading.value 
    );
  });

  const userXembrFarm = computed(() =>{
   /* allFarmsForUser.value?.find(
      userFarm => userFarm.pool.id === appNetworkConfig.xEmbr.farmId
    )*/
    return 0
   });
  
  const totalSupply = computed(
    () => data.value?.totalXembrSupply.div(1e18) ?? bn(0)
  );
  const totalBptStaked = computed(() => {
    return data.value?.totalBptStaked.div(1e18) ?? bn(0);
  });
  const userUnstakedXembrBalance = computed(() => {
    return data.value?.userBalance?.div(1e18) ?? bn(0);
  });
  const userXembrBalance = computed(() => {
    const userXembrInFarm = bn(userXembrFarm.value || 0).div(1e18);

    return userUnstakedXembrBalance.value.plus(userXembrInFarm);
  });
  const userBptTokenBalance = computed(
    () => data.value?.userBptTokenBalance?.div(1e18) ?? bn(0)
  );
  const userAllowance = computed(
    () => data.value?.allowance.div(1e18) ?? bn(0)
  );
  const currentExchangeRate = computed(() => {
    return totalSupply.value.eq(0)
      ? bn(0)
      : totalBptStaked.value.div(totalSupply.value);
  });

  /*const pool = computed(() => {
    return poolsWithFarms.value?.find(
      pool =>
        pool.address.toLowerCase() ===
        appNetworkConfig.xEmbr.poolAddress.toLowerCase()
    );
  });
  */

  /*const embr = computed(() =>
    pool.value?.tokens.find(
      token =>
        token.address.toLowerCase() ===
        appNetworkConfig.addresses.embr.toLowerCase()
    )
  );

  const wavax = computed(() =>
    pool.value?.tokens.find(
      token =>
        token.address.toLowerCase() ===
        appNetworkConfig.addresses.weth.toLowerCase()
    )
  );
  */

  const userStakedBptBalance = computed(() =>
    userXembrBalance.value.times(currentExchangeRate.value)
  );

  /*const userBptShare = computed(() => {
    if (!pool.value) {
      return bn(0);
    }

    return userStakedBptBalance.value.div(pool.value.totalShares);
  });

  const embrPerShare = computed(() => {
    return embr.value && pool.value
      ? `${parseFloat(embr.value.balance) / parseFloat(pool.value.totalShares)}`
      : '0';
  });

  const wavaxPerShare = computed(() => {
    return wavax.value && pool.value
      ? `${parseFloat(wavax.value.balance) / parseFloat(pool.value.totalShares)}`
      : '0';
  });

  const userStakedEmbrBalance = computed(() =>
    userBptShare.value.times(embr.value?.balance || '0')
  );
  const userStakedFtmBalance = computed(() =>
    userBptShare.value.times(embr.value?.balance || '0')
  );

  const totalEmbrStaked = computed(() => {
    if (!pool.value) {
      return '0';
    }

    const embr = pool.value.tokens.find(
      token =>
        token.address.toLowerCase() ===
        appNetworkConfig.addresses.embr.toLowerCase()
    );

    return totalBptStaked.value
      .div(pool.value.totalShares)
      .times(embr?.balance || '0')
      .toString();
  });

  const farm = computed(() => {
    return farms.value.find(farm => farm.id === appNetworkConfig.xEmbr.farmId);
  });

  const xembrDecoratedFarm = computed(
    (): DecoratedFarm | undefined => pool.value?.farm
  );
  */

  async function approve(amount?: string) {
    const tx = await erc20ContractService.erc20.approveToken(
      getProvider(),
      governanceContractsService.xembr.xembrAddress,
      governanceContractsService.xembr.bptTokenAddress,
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: `Approve EPT token`,
      details: {
        contractAddress: governanceContractsService.xembr.bptTokenAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;
  }

  /*const swapApr = computed(() =>
    pool.value ? parseFloat(pool.value.dynamic.apr.pool) : 0
  );
  const farmApr = computed(() =>
    xembrDecoratedFarm.value ? xembrDecoratedFarm.value.apr : 0
  );
  */
  const xembrApr = computed(() => 0);
  /*const totalApr = computed(
    () => swapApr.value + farmApr.value + xembrApr.value
  );*/


  async function stake(amount: string) {
    const tx = await governanceContractsService.xembr.enter(
      getProvider(),
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'deposit',
      summary: 'Stake EPT tokens for xEMBR',
      details: {
        contractAddress: governanceContractsService.xembr.bptTokenAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;
  }

  async function unStake(amount: string) {
    const tx = await governanceContractsService.xembr.leave(
      getProvider(),
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'claim',
      summary: 'Burn xEMBR and withdraw EPT tokens',
      details: {
        contractAddress: governanceContractsService.xembr.bptTokenAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;
  }

  return {
    xEmbrLoading,
    totalSupply,
    userXembrBalance,
    userBptTokenBalance,
    userAllowance,
    XEmbrQuery,
    currentExchangeRate,
    //xembrDecoratedFarm,
    //farm,
    //pool,
    //farmUser,
    totalBptStaked,
    //totalEmbrStaked,
    userStakedBptBalance,
    //userStakedEmbrBalance,
    //userStakedFtmBalance,
    //embrPerShare,
    //wavaxPerShare,
    userUnstakedXembrBalance,
    //swapApr,
    //farmApr,
    xembrApr,
    //totalApr,
    refetch,

    approve,
    stake,
    unStake
  };
}
