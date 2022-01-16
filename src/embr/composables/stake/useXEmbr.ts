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
    () => data.value?.totalXembrSupply.div(1e18) ?? bn(0)
  );

  const userStakedEmbrBalance = computed(() => {
    return data.value?.userLocked?.div(1e18) ?? bn(0);
  });

  const userUnstakedEmbrBalance = computed(() => {
    return data.value?.embrBalance?.div(1e18) ?? bn(0);
  });
  const userXembrBalance = computed(() => {
    return data.value?.userBalance?.div(1e18) ?? bn(0);
  });

  const totalEmbrStaking = computed(() => {
    return data.value?.totalEmbrStaking?.div(1e18) ?? bn(0);
  });

  const userAllowance = computed(
    () => data.value?.allowance.div(1e18) ?? bn(0)
  );


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
      governanceContractsService.xembr.embrAddress,
      governanceContractsService.xembr.xembrAddress,
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


  async function createLock(amount: string, unlock_time: string) {
    const tx = await governanceContractsService.xembr.createLock(
      getProvider(),
      amount,
      unlock_time
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'deposit',
      summary: 'Stake EMBR tokens for xEMBR',
      details: {
        contractAddress: governanceContractsService.xembr.embrAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;
  }

  async function increaseLockLength( unlock_time: string) {
    const tx = await governanceContractsService.xembr.increaseLockLength(
      getProvider(),
      unlock_time
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'deposit',
      summary: 'Increase lock length for xEMBR',
      details: {
        contractAddress: governanceContractsService.xembr.embrAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;
  }

  async function increaseLockAmount( amount: string) {
    const tx = await governanceContractsService.xembr.increaseLockAmount(
      getProvider(),
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'deposit',
      summary: 'Increase EMBR lock amount for xEMBR',
      details: {
        contractAddress: governanceContractsService.xembr.embrAddress,
        spender: governanceContractsService.xembr.xembrAddress
      }
    });

    return tx;
  }

  async function withdraw(address: string) {
    const tx = await governanceContractsService.xembr.withdraw(
      getProvider(),
      address
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'claim',
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
    userStakedEmbrBalance,
    xembrApr,
    refetch,
    embr, 
    ausd,
    //embrPerShare,
    //wavaxPerShare,
    //swapApr,
    //farmApr,
    //totalApr,
    //currentExchangeRate,

    approve,
    withdraw,
    createLock,
    increaseLockLength,
    increaseLockAmount
  };
}
