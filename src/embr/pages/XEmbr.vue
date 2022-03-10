
<template>
  <div class="lg:container lg:mx-auto pt-12 md:pt-12">
    <XEmbrHeader />

    <div class="lg:flex justify-center mb-8">
      <div class="w-full lg:max-w-3xl">
        <!-- <div class="mb-6">
          <XEmbrStatCards /> 
        </div>-->

        <XEmbrDepositSteps
          v-if="activeTab === 'deposit'"
          :hasUnstakedEmbr="hasUnstakedEmbr"
          :hasStakedXembr="userXembrBalance > 0"
          :hasCoolingEmbr="hasCoolingEmbr"
          :hasWithdrawableEmbr="hasWithdrawableEmbr"
          :total-embr-staking="totalEmbrStaking"
          :total-xembr="totalXembrSupply"
          :total-embr-cooling="totalCoolingSupply"
          :loading="dataLoading"
        />
      </div>
      <div class="w-full lg:max-w-xl mx-auto md:mx-0 lg:ml-6 md:block lg:w-72">
        <XEmbrBalances
          :loading="dataLoading"
          :x-embr-balance="userXembrBalance.toString()"
          :embr-locked-balance="userStakedEmbrBalance.toString()"
          :embr-balance="userXembrBalance.toString()"
        />

        <XEmbrRewards
          v-if="dataLoading === false"
          :loading="dataLoading"
          :reward-tokens="rewardTokens"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { fNum } from '@/composables/useNumbers';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';

import { scaleDown } from '@/lib/utils';
import { BigNumber } from 'bignumber.js';
import XEmbrBalances from '@/embr/components/pages/xembr/XEmbrBalances.vue';
import XEmbrRewards from '@/embr/components/pages/xembr/XEmbrRewards.vue';

import XEmbrHeader from '@/embr/components/pages/xembr/XEmbrHeader.vue';
//import XEmbrOldFarmAlert from '@/embr/components/pages/xembr/XEmbrOldFarmAlert.vue';
//import XEmbrStatCards from '@/embr/components/pages/xembr/XEmbrStatCards.vue';
import BalTabs from '@/components/_global/BalTabs/BalTabs.vue';
//import useFarmUserQuery from '@/embr/composables/farms/useFarmUserQuery';
import XEmbrDepositSteps from '@/embr/components/pages/xembr/XEmbrDepositSteps.vue';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
//import useFarmUser from '@/embr/composables/farms/useFarmUser';
import usePoolWithFarm from '@/embr/composables/pool/usePoolWithFarm';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';


const { appNetworkConfig, isLoadingProfile } = useWeb3();
const {
  xEmbrLoading,
  userXembrBalance,
  userStakedEmbrBalance,
  userUnstakedEmbrBalance,
  totalEmbrStaking,
  totalXembrSupply,
  rewardTokens,
  totalCoolingSupply,
  cooldownUnits,
  cooldownTimestamp,
  cooldownPeriod,
  unstakeWindow
} = useXEmbr();

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
//const { pool, loadingPool } = usePoolWithFarm(appNetworkConfig.xEmbr.poolId);


/*
const xembrDeposited = computed(() => {
  const amount = farmUser.value?.amount;

  return amount ? scaleDown(new BigNumber(amount), 18) : new BigNumber(0);
});*/

function bn(num: number) {
  return new BigNumber(num);
}

const unstakedEmbrBalance = computed(()=> {
  return fNum(
    scaleDown(
      new BigNumber(userUnstakedEmbrBalance.toString()),
      18
    ).toString(),
    'token'
  );
})

const hasUnstakedEmbr = computed(() => {
  return parseFloat((fNum(balanceFor(getAddress(appNetworkConfig.addresses.embr)), 'token') )) > 0
})

const hasCoolingEmbr = computed(() => {
    return cooldownUnits.value.gt(0)
})

const embrBalance = computed(() =>
  fNum(balanceFor(getAddress(appNetworkConfig.addresses.embr)), 'token')
);

const ONE_DAY = bn(86400)
const hasWithdrawableEmbr = computed(() => {
  const currentTime = bn(Date.now()/ 1000)
  const totalTime = cooldownTimestamp.value.plus(cooldownPeriod.value)
  return cooldownUnits.value.gt(0) && currentTime.gt(totalTime) && currentTime.lt(totalTime.plus(unstakeWindow.value))
})

onMounted(() => {
  injectTokens([
    appNetworkConfig.xEmbr.poolAddress,
    appNetworkConfig.xEmbr.address
  ]);
});

const dataLoading = computed(
  () =>
    xEmbrLoading.value ||
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

