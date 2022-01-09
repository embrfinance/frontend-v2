<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { fNum } from '@/composables/useNumbers';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';
import { scaleDown } from '@/lib/utils';
import { BigNumber } from 'bignumber.js';
//import XEmbrBalances from '@/embr/components/pages/xembr/XEmbrBalances.vue';
import XEmbrHeader from '@/embr/components/pages/xembr/XEmbrHeader.vue';
//import XEmbrOldFarmAlert from '@/embr/components/pages/xembr/XEmbrOldFarmAlert.vue';
//import XEmbrStatCards from '@/embr/components/pages/xembr/XEmbrStatCards.vue';
import BalTabs from '@/components/_global/BalTabs/BalTabs.vue';
import useFarmUserQuery from '@/embr/composables/farms/useFarmUserQuery';
//import XEmbrDepositSteps from '@/embr/components/pages/xembr/XEmbrDepositSteps.vue';
//import XEmbrWithdrawSteps from '@/embr/components/pages/xembr/XEmbrWithdrawSteps.vue';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
import useFarmUser from '@/embr/composables/farms/useFarmUser';
import usePoolWithFarm from '@/embr/composables/pool/usePoolWithFarm';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';

const { appNetworkConfig, isLoadingProfile } = useWeb3();
/*const {
  xEmbrLoading,
  userXembrBalance,
  userBptTokenBalance,
  userUnstakedXembrBalance
} = useXEmbr();
*/
const {
  balanceFor,
  injectTokens,
  dynamicDataLoading,
  loading: tokensLoading
} = useTokens();

/*const { farmUser, farmUserLoading } = useFarmUser(
  appNetworkConfig.xEmbr.farmId
);
*/
const { pool, loadingPool } = usePoolWithFarm(appNetworkConfig.xEmbr.poolId);
/*
const xembrDeposited = computed(() => {
  const amount = farmUser.value?.amount;

  return amount ? scaleDown(new BigNumber(amount), 18) : new BigNumber(0);
});*/


const bptBalance = computed(() => {
  return fNum(
    scaleDown(
      new BigNumber(0),
      18
    ).toString(),
    'token'
  );
});

const userBptTokenBalance = computed(()=> fNum(0) )
const userUnstakedXembrBalance = computed(()=> fNum(0) )

const hasUnstakedXembr = computed(() => {
  return parseFloat((fNum(balanceFor(getAddress(appNetworkConfig.addresses.embr)), 'token') )) > 0
})
const hasBpt = computed(() => true)

const embrBalance = computed(() =>
  fNum(balanceFor(getAddress(appNetworkConfig.addresses.embr)), 'token')
);

const oldFarmUserQuery = useFarmUserQuery(appNetworkConfig.xEmbr.oldFarmId);
const oldFarmUser = computed(() => {
  return oldFarmUserQuery.data.value;
});

onMounted(() => {
  injectTokens([
    appNetworkConfig.xEmbr.poolAddress,
    appNetworkConfig.xEmbr.address
  ]);
});

const dataLoading = computed(
  () =>
    //xEmbrLoading.value ||
    //farmUserLoading.value ||
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
    <XEmbrHeader />

    <div class="flex justify-center">
      <div class="w-full max-w-3xl">
        <BalAlert
          v-if="userBptTokenBalance > 0"
          title="You have unstaked EBT in your wallet"
          description="If you stake your EPT, you will receive xEMBR and be eligible to earn a portion of Embr Protocol Revenue."
          type="warning"
          size="md"
          class="mb-4"
        />
        <BalAlert
          v-if="userBptTokenBalance == 0 && userUnstakedXembrBalance > 0"
          title="You have unstaked xEMBR in your wallet"
          description="If you deposit your xEMBR into the farm, you will earn additional rewards paid out in Embr."
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
        <!-- <div class="mb-6">
          <XEmbrStatCards /> 
        </div>-->
        <div class="mb-4">
          <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
        </div>
        <XEmbrDepositSteps
          v-if="activeTab === 'deposit'"
          :hasBpt="hasBpt"
          :hasUnstakedXembr="hasUnstakedXembr"
          :hasStakedXembr="xembrDeposited > 0"
          :loading="dataLoading"
        />
        <XEmbrWithdrawSteps
          v-if="activeTab === 'withdraw'"
          :hasBpt="hasBpt"
          :hasUnstakedXembr="hasUnstakedXembr"
          :hasStakedXembr="xembrDeposited > 0"
          :loading="dataLoading"
        />
      </div>
      <div class="w-full lg:max-w-xl mx-auto md:mx-0 lg:ml-6 md:block lg:w-72">
        <XEmbrBalances
          :loading="dataLoading"
          :f-embr-balance="userXembrBalance"
          :bpt-balance="bptBalance"
          :embr-balance="embrBalance"
        />
      </div>
    </div>
  </div>
</template>
