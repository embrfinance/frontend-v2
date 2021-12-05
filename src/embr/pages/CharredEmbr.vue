<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { fNum } from '@/composables/useNumbers';
import { useCharredEmbr } from '@/embr/composables/stake/useCharredEmbr';
import { scaleDown } from '@/lib/utils';
import { BigNumber } from 'bignumber.js';
import CharredEmbrBalances from '@/embr/components/pages/cembr/CharredEmbrBalances.vue';
import CharredEmbrHeader from '@/embr/components/pages/cembr/CharredEmbrHeader.vue';
import CharredEmbrOldFarmAlert from '@/embr/components/pages/cembr/CharredEmbrOldFarmAlert.vue';
import CharredEmbrStatCards from '@/embr/components/pages/cembr/CharredEmbrStatCards.vue';
import BalTabs from '@/components/_global/BalTabs/BalTabs.vue';
import useFarmUserQuery from '@/embr/composables/farms/useFarmUserQuery';
import CharredEmbrDepositSteps from '@/embr/components/pages/cembr/CharredEmbrDepositSteps.vue';
import CharredEmbrWithdrawSteps from '@/embr/components/pages/cembr/CharredEmbrWithdrawSteps.vue';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
import useFarmUser from '@/embr/composables/farms/useFarmUser';
import usePoolWithFarm from '@/embr/composables/pool/usePoolWithFarm';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';

const { appNetworkConfig, isLoadingProfile } = useWeb3();
const {
  cEmbrLoading,
  userCembrBalance,
  userBptTokenBalance,
  userUnstakedCembrBalance
} = useCharredEmbr();
const {
  balanceFor,
  injectTokens,
  dynamicDataLoading,
  loading: tokensLoading
} = useTokens();

const { farmUser, farmUserLoading } = useFarmUser(
  appNetworkConfig.cEmbr.farmId
);
const { pool, loadingPool } = usePoolWithFarm(appNetworkConfig.cEmbr.poolId);
const cembrDeposited = computed(() => {
  const amount = farmUser.value?.amount;

  return amount ? scaleDown(new BigNumber(amount), 18) : new BigNumber(0);
});

const bptBalance = computed(() => {
  return fNum(
    scaleDown(
      new BigNumber(userBptTokenBalance.value.toString()),
      18
    ).toString(),
    'token'
  );
});

const hasUnstakedCembr = computed(() => userUnstakedCembrBalance.value.gt(0));
const hasBpt = computed(() => userBptTokenBalance.value.gt(0));

const embrBalance = computed(() =>
  fNum(balanceFor(getAddress(appNetworkConfig.addresses.embr)), 'token')
);

const oldFarmUserQuery = useFarmUserQuery(appNetworkConfig.cEmbr.oldFarmId);
const oldFarmUser = computed(() => {
  return oldFarmUserQuery.data.value;
});

onMounted(() => {
  injectTokens([
    appNetworkConfig.cEmbr.poolAddress,
    appNetworkConfig.cEmbr.address
  ]);
});

const dataLoading = computed(
  () =>
    cEmbrLoading.value ||
    farmUserLoading.value ||
    tokensLoading.value ||
    dynamicDataLoading.value
);

const tabs = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdraw', label: 'Withdraw' }
];

const activeTab = ref(tabs[0].value);
</script>

<template>
  <div class="lg:container lg:mx-auto pt-12 md:pt-12">
    <CharredEmbrHeader />
    <CharredEmbrOldFarmAlert v-if="oldFarmUser && oldFarmUser.amount > 0" />

    <div class="flex justify-center">
      <div class="w-full max-w-3xl">
        <BalAlert
          v-if="userBptTokenBalance.gt(0)"
          title="You have unstaked EBT in your wallet"
          description="If you stake your EPT, you will receive cEMBR and be eligible to earn a portion of Embr Protocol Revenue."
          type="warning"
          size="md"
          class="mb-4"
        />
        <BalAlert
          v-if="userBptTokenBalance.eq(0) && userUnstakedCembrBalance.gt(0)"
          title="You have unstaked cEMBR in your wallet"
          description="If you deposit your cEMBR into the farm, you will earn additional rewards paid out in Embr."
          type="warning"
          size="md"
          class="mb-4"
        />
      </div>
      <div
        class="hidden w-full max-w-xl mx-auto md:mx-0 md:ml-6 md:block md:w-72"
      />
    </div>

    <div class="lg:flex justify-center mb-8">
      <div class="w-full lg:max-w-3xl">
        <div class="mb-6">
          <CharredEmbrStatCards />
        </div>
        <div class="mb-4">
          <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
        </div>
        <CharredEmbrDepositSteps
          v-if="activeTab === 'deposit'"
          :hasBpt="hasBpt"
          :hasUnstakedCembr="hasUnstakedCembr"
          :hasStakedCembr="cembrDeposited.gt(0)"
          :loading="dataLoading"
        />
        <CharredEmbrWithdrawSteps
          v-if="activeTab === 'withdraw'"
          :hasBpt="hasBpt"
          :hasUnstakedCembr="hasUnstakedCembr"
          :hasStakedCembr="cembrDeposited.gt(0)"
          :loading="dataLoading"
        />
      </div>
      <div class="w-full lg:max-w-xl mx-auto md:mx-0 lg:ml-6 md:block lg:w-72">
        <CharredEmbrBalances
          :loading="dataLoading"
          :f-embr-balance="userCembrBalance"
          :bpt-balance="bptBalance"
          :embr-balance="embrBalance"
        />
      </div>
    </div>
  </div>
</template>
