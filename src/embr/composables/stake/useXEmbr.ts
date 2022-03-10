import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/embr/services/governance/governance-contracts.service';
import { erc20ContractService } from '@/embr/services/erc20/erc20-contracts.service';
import useXEmbrQuery from '@/embr/composables/stake/useXEmbrQuery';
import { computed } from 'vue';
import useTransactions from '@/composables/useTransactions';
//import useFarmUser from '@/embr/composables/farms/useFarmUser';
import usePools from '@/composables/pools/usePools';
//import { DecoratedFarm } from '@/embr/services/subgraph/subgraph-types';
import BigNumber from 'bignumber.js';

function bn(num: number) {
  return new BigNumber(num);
}

export function useXEmbr() {
  const { getProvider, appNetworkConfig } = useWeb3();
  const XEmbrQuery = useXEmbrQuery();
  const { addTransaction } = useTransactions();
  const {
    poolsWithFarms,
    isLoadingPools,
    isLoadingFarms
  } = usePools();

  const { isLoading, data, refetch } = XEmbrQuery;


  const xEmbrLoading = computed(() => {
    return (
      isLoading.value ||
      isLoadingPools.value ||
      isLoadingFarms.value 
    );
  });
  
  const totalSupply = computed(
    () => data.value?.totalXembrSupply ?? bn(0)
  );

  const userStakedEmbrBalance = computed(() => {
    return data.value?.userEmbrStaking?.div(1e18) ?? bn(0);
  });

  const weightedTimestamp = computed(() => {
    return data.value?.weightedTimestamp ?? bn(0);
  });

  const timeMultiplier = computed(() => {
    return data.value?.timeMultiplier ?? bn(0);
  });

  const questMultiplier = computed(() => {
    return data.value?.questMultiplier ?? bn(0);
  });

  const cooldownTimestamp = computed(() => {
    return data.value?.cooldownTimestamp ?? bn(0);
  });

  const cooldownUnits = computed(() => {
    return data.value?.cooldownUnits?.div(1e18) ?? bn(0);
  });

  const userUnstakedEmbrBalance = computed(() => {
    return data.value?.embrBalance?.div(1e18) ?? bn(0);
  });
  const userXembrBalance = computed(() => {
    return data.value?.userBalance?.div(1e18) ?? bn(0);
  });

  const totalEmbrStaking = computed(() => {
    return data.value?.totalEmbrStaking ?? bn(0);
  });

  const userAllowance = computed(
    () => data.value?.allowance.div(1e18) ?? bn(0)
  );

  const rewardTokens = computed(
    () => { 
      return data.value?.activeRewardTokens ?? []
    }
  )

  const totalXembrSupply = computed(
    () => data.value?.totalXembrSupply ?? bn(0)
  )

  const totalCoolingSupply = computed(
    () => data.value?.totalEmbrCooling ?? bn(0)
  )


  /*const currentExchangeRate = computed(() => {
    return totalSupply.value.eq(0)
      ? bn(0)
      : totalBptStaked.value.div(totalSupply.value);
  });*/

  const pool = computed(() => {
    return poolsWithFarms.value?.find(
      pool =>
        pool.address.toLowerCase() ===
        appNetworkConfig.xEmbr.poolAddress.toLowerCase()
    );
  });
  

  const embr = computed(() =>
    pool.value?.tokens.find(
      token =>
        token.address.toLowerCase() ===
        appNetworkConfig.addresses.embr.toLowerCase()
    )
  );

  const ausd = computed(() =>
    pool.value?.tokens.find(
      token =>
        token.address.toLowerCase() ===
        appNetworkConfig.addresses.weth.toLowerCase()
    )
  );
  




  /*

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
  */

  async function approve(amount?: string) {
    const tx = await erc20ContractService.erc20.approveToken(
      getProvider(),
      governanceContractsService.xembr.xembrAddress,
      governanceContractsService.xembr.embrAddress,
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: `Approve Embr Token for xEmbr`,
      details: {
        contractAddress: governanceContractsService.xembr.embrAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;
  }

  async function reviewTimestamp(account: string) {
    const tx = await governanceContractsService.xembr.reviewTimestamp(
      getProvider(),
      account
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'reviewTimestamp',
      summary: `Review timestamp for xEmbr`,
      details: {
        contractAddress: governanceContractsService.xembr.embrAddress,
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


  const ONE_DAY = bn(86400)
  const unstakeWindow = computed(() => {
    return bn(1209600)
  })

  const cooldownPeriod = computed(() => {
    return bn(7200)
  })

  const requireReviewTimestamp = computed(() => {
  //function requireReviewTimestamp() { 
    const currentTime = bn(Date.now() / 1000)
    const hodlLength = currentTime.minus(weightedTimestamp.value);
    if (hodlLength.lt(ONE_DAY)) { //13 weeks) {
        // 0-3 months = 1x
        return false;
    } else if (hodlLength.lt(ONE_DAY.times(2))) { //26 weeks) {
        // 3 months = 1.2x
        if (timeMultiplier.value.lt(20)) { 
          return true
        }
        return false
    } else if (hodlLength.lt(ONE_DAY.times(3))) { //52 weeks) {
        // 6 months = 1.3x
        if (timeMultiplier.value.lt(30)) { 
          return true
        }
        return false
    } else if (hodlLength.lt(ONE_DAY.times(4))) { //78 weeks) {
      if (timeMultiplier.value.lt(40)) { 
        return true
      }
        return false
    } else if (hodlLength.lt(ONE_DAY.times(3))) { //104 weeks) {
      if (timeMultiplier.value.lt(50)) { 
        return true
      }
        return false
    } else {
      if (timeMultiplier.value.lt(60)) { 
        return true
      }
      return false
    }
  })

  async function stake(amount: string) {
    const tx = await governanceContractsService.xembr.stake(
      getProvider(),
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'deposit',
      summary: 'Deposit EMBR tokens for xEMBR',
      details: {
        contractAddress: governanceContractsService.xembr.embrAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;
  }

  async function cooldown(amount: string) { 
    const tx = await governanceContractsService.xembr.startCooldown(
      getProvider(),
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'cooldown',
      summary: 'Cooldown Embr for withdrawing',
      details: {
        contractAddress: governanceContractsService.xembr.embrAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;

  }

  async function endCooldown() { 
    const tx = await governanceContractsService.xembr.endCooldown(
      getProvider()
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'endCooldown',
      summary: 'End cooldown for withdrawing Embr',
      details: {
        contractAddress: governanceContractsService.xembr.embrAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;
  }

  async function withdraw(amount: string, address: string, exitCoolDown: boolean) {
    const tx = await governanceContractsService.xembr.withdraw(
      getProvider(),
      amount,
      address,
      exitCoolDown
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'withdraw',
      summary: 'Burn xEMBR and withdraw EMBR tokens',
      details: {
        contractAddress: governanceContractsService.xembr.embrAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;
  }

  return {
    xEmbrLoading,
    totalSupply,
    userXembrBalance,
    userUnstakedEmbrBalance,
    userAllowance,
    XEmbrQuery,
    pool,
    totalEmbrStaking,
    totalXembrSupply,
    totalCoolingSupply,
    userStakedEmbrBalance,
    weightedTimestamp,
    timeMultiplier,
    questMultiplier,
    cooldownTimestamp,
    cooldownUnits,
    xembrApr,
    rewardTokens,
    refetch,
    embr, 
    ausd,
    //embrPerShare,
    //wavaxPerShare,
    //swapApr,
    //farmApr,
    //totalApr,
    //currentExchangeRate,
    requireReviewTimestamp,
    unstakeWindow,
    cooldownPeriod,
    reviewTimestamp,
    endCooldown,
    cooldown,
    approve,
    withdraw,
    stake
  };
}
