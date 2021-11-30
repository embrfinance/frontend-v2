import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/embr/services/governance/governance-contracts.service';
import { erc20ContractService } from '@/embr/services/erc20/erc20-contracts.service';
import useCharredEmbrQuery from '@/embr/composables/stake/useCharredEmbrQuery';
import { computed } from 'vue';
import useTransactions from '@/composables/useTransactions';
import useFarmUser from '@/embr/composables/farms/useFarmUser';
import usePools from '@/composables/pools/usePools';
import { DecoratedFarm } from '@/embr/services/subgraph/subgraph-types';
import BigNumber from 'bignumber.js';

function bn(num: number) {
  return new BigNumber(num);
}

export function useCharredEmbr() {
  const { getProvider, appNetworkConfig } = useWeb3();
  const CharredEmbrQuery = useCharredEmbrQuery();
  const { addTransaction } = useTransactions();
  const { farmUser, farmUserLoading } = useFarmUser(
    appNetworkConfig.cEmbr.farmId
  );
  const {
    poolsWithFarms,
    farms,
    allFarmsForUser,
    isLoadingPools,
    isLoadingFarms
  } = usePools();
  const { isLoading, data, refetch } = CharredEmbrQuery;

  const cEmbrLoading = computed(() => {
    return (
      isLoading.value ||
      isLoadingPools.value ||
      isLoadingFarms.value ||
      farmUserLoading.value
    );
  });

  const userCembrFarm = computed(() =>
    allFarmsForUser.value?.find(
      userFarm => userFarm.pool.id === appNetworkConfig.cEmbr.farmId
    )
  );
  const totalSupply = computed(
    () => data.value?.totalCembrSupply.div(1e18) ?? bn(0)
  );
  const totalBptStaked = computed(() => {
    return data.value?.totalBptStaked.div(1e18) ?? bn(0);
  });
  const userUnstakedCembrBalance = computed(() => {
    return data.value?.userBalance?.div(1e18) ?? bn(0);
  });
  const userCembrBalance = computed(() => {
    const userCembrInFarm = bn(userCembrFarm.value?.amount || 0).div(1e18);

    return userUnstakedCembrBalance.value.plus(userCembrInFarm);
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

  const pool = computed(() => {
    return poolsWithFarms.value?.find(
      pool =>
        pool.address.toLowerCase() ===
        appNetworkConfig.cEmbr.poolAddress.toLowerCase()
    );
  });

  const embr = computed(() =>
    pool.value?.tokens.find(
      token =>
        token.address.toLowerCase() ===
        appNetworkConfig.addresses.embr.toLowerCase()
    )
  );

  const ftm = computed(() =>
    pool.value?.tokens.find(
      token =>
        token.address.toLowerCase() ===
        appNetworkConfig.addresses.weth.toLowerCase()
    )
  );

  const userStakedBptBalance = computed(() =>
    userCembrBalance.value.times(currentExchangeRate.value)
  );

  const userBptShare = computed(() => {
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

  const ftmPerShare = computed(() => {
    return ftm.value && pool.value
      ? `${parseFloat(ftm.value.balance) / parseFloat(pool.value.totalShares)}`
      : '0';
  });

  const userStakedEmbrBalance = computed(() =>
    userBptShare.value.times(embr.value?.balance || '0')
  );
  const userStakedFtmBalance = computed(() =>
    userBptShare.value.times(ftm.value?.balance || '0')
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
    return farms.value.find(farm => farm.id === appNetworkConfig.cEmbr.farmId);
  });

  const cembrDecoratedFarm = computed(
    (): DecoratedFarm | undefined => pool.value?.farm
  );

  async function approve(amount?: string) {
    const tx = await erc20ContractService.erc20.approveToken(
      getProvider(),
      governanceContractsService.cembr.cembrAddress,
      governanceContractsService.cembr.bptTokenAddress,
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: `Approve LP token`,
      details: {
        contractAddress: governanceContractsService.cembr.bptTokenAddress,
        spender: governanceContractsService.cembr.cembrAddress
      }
    });

    return tx;
  }

  const swapApr = computed(() =>
    pool.value ? parseFloat(pool.value.dynamic.apr.pool) : 0
  );
  const farmApr = computed(() =>
    cembrDecoratedFarm.value ? cembrDecoratedFarm.value.apr : 0
  );
  const cembrApr = computed(() => 0);
  const totalApr = computed(
    () => swapApr.value + farmApr.value + cembrApr.value
  );

  async function stake(amount: string) {
    const tx = await governanceContractsService.cembr.enter(
      getProvider(),
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'deposit',
      summary: 'Stake LP tokens for cEMBR',
      details: {
        contractAddress: governanceContractsService.cembr.bptTokenAddress,
        spender: governanceContractsService.cembr.cembrAddress
      }
    });

    return tx;
  }

  async function unStake(amount: string) {
    const tx = await governanceContractsService.cembr.leave(
      getProvider(),
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'claim',
      summary: 'Burn cEMBR and withdraw LP tokens',
      details: {
        contractAddress: governanceContractsService.cembr.bptTokenAddress,
        spender: governanceContractsService.cembr.cembrAddress
      }
    });

    return tx;
  }

  return {
    cEmbrLoading,
    totalSupply,
    userCembrBalance,
    userBptTokenBalance,
    userAllowance,
    CharredEmbrQuery,
    currentExchangeRate,
    cembrDecoratedFarm,
    farm,
    pool,
    farmUser,
    totalBptStaked,
    totalEmbrStaked,
    userStakedBptBalance,
    userStakedEmbrBalance,
    userStakedFtmBalance,
    embrPerShare,
    ftmPerShare,
    userUnstakedCembrBalance,
    swapApr,
    farmApr,
    cembrApr,
    totalApr,
    refetch,

    approve,
    stake,
    unStake
  };
}
