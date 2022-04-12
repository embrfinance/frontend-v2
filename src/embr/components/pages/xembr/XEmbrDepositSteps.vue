<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import useNumbers from '@/composables/useNumbers';
import useXEmbrSnapshotsQuery from '@/embr/composables/queries/useXEmbrSnapshotsQuery';

import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import XEmbrDepositForm from '@/embr/components/pages/xembr/XEmbrDepositForm.vue';
import XEmbrIncreaseDepositLocktimeForm from '@/embr/components/pages/xembr/XEmbrIncreaseDepositLocktimeForm.vue';
import XEmbrIncreaseDepositAmountForm from '@/embr/components/pages/xembr/XEmbrIncreaseDepositAmountForm.vue';
import XEmbrWithdrawForm from '@/embr/components/pages/xembr/XEmbrWithdrawForm.vue';
import XEmbrCooldownForm from '@/embr/components/pages/xembr/XEmbrCooldownForm.vue';
import XEmbrCoolingDown from '@/embr/components/pages/xembr/XEmbrCoolingDown.vue';
import XEmbrChart from '@/embr/components/pages/xembr/XEmbrChart.vue';
import XEmbrReviewTimestamp from '@/embr/components/pages/xembr/XEmbrReviewTimestamp.vue';



//import FarmDepositForm from '@/embr/components/pages/farm/FarmDepositForm.vue';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';
import BigNumber from 'bignumber.js';

type Props = {
  hasUnstakedEmbr: boolean;
  hasStakedXembr: boolean;
  hasCoolingEmbr: boolean;
  hasWithdrawableEmbr: boolean;
  loading: boolean;
  totalEmbrStaking: BigNumber;
  totalEmbrCooling: BigNumber;
  totalXembr: BigNumber;
};

const props = defineProps<Props>();
const { fNum } = useNumbers();


const { appNetworkConfig } = useWeb3();
const { XEmbrQuery, weightedTimestamp, userStakedEmbrBalance, requireReviewTimestamp } = useXEmbr();

function handleEmbrDeposit(txReceipt): void {
  XEmbrQuery.refetch.value();
}

/*const xembrSnapshotsQuery = useXEmbrSnapshotsQuery(
      30
    );

const snapshots = computed(() => xembrSnapshotsQuery.data.value?.snapshots);
const isLoadingSnapshots = computed(
    () =>
      xembrSnapshotsQuery.isLoading.value || xembrSnapshotsQuery.isIdle.value
  );*/
</script>

<style scoped>
.step-card-container {
  @apply flex ;
}

.center-text-container {
  text-align: center;
}

.step-card-step {
  @apply w-9 h-9 flex items-center justify-center border rounded-full dark:border-gray-700;
}
</style>

<template>
  <BalLoadingBlock v-if="props.loading" class="h-64 w-128 mb-1" white />
  <div v-else>
    <BalCard class="mb-4">
      <div class="step-card-container">
          <div  class="flex-1 text-center">
            <p class="text-center">
               <img
              src="~@/embr/assets/images/embr.png"
              width="32"
              style="margin-left: auto;margin-right: auto;display: block;"
            />
            </p>
            <p class="text-sm font-bold md:text-lg text-center">
             {{ fNum(totalEmbrStaking.toString(), 'token') }}
            </p>
            <p class="text-sm md:text-base text-primary">
              Embr Staking
            </p>
          </div>
          <div  class="flex-1 text-center">
            <p class="text-center">
               <img
              src="~@/embr/assets/images/embr.png"
              width="32"
              style="margin-left: auto;margin-right: auto;display: block;"
            />
            </p>
            <p class="text-sm font-bold md:text-lg text-center">
             {{ fNum(totalEmbrCooling.toString(), 'token') }}
            </p>
            <p class="text-sm md:text-base text-primary">
              Embr Cooling
            </p>
          </div>
          <div class="flex-1 text-center">
            <p class="text-center">
               <img
              src="~@/embr/assets/images/embry.png"
              width="32"
              style="margin-left: auto;margin-right: auto;display: block;"
            />
            </p>
            <p class="text-sm font-bold md:text-lg ">
              {{ fNum(totalXembr.toString(), 'token') }}
            </p>
            <p class="text-sm md:text-base text-primary">
              Total Xembr
            </p>
          </div>
          <div class="flex-1 text-center">
            <p class="text-center">
               <img
              src="~@/embr/assets/images/farmAPR.png"
              width="32"
              style="margin-left: auto;margin-right: auto;display: block;"
            />
            </p>
            <p class="text-sm font-bold md:text-lg text-center">
              {{ fNum(totalXembr.div(totalEmbrStaking), 'default') }}x
            </p>
            <p class="text-sm md:text-base text-primary">
              Avg Multiplier
            </p>
          </div>
          <!--<div class="px-1 lg:px-0">
            <BalLoadingBlock v-if="isLoadingSnapshots" class="h-96" />
            <XEmbrChart v-else :snapshots="snapshots" />
          </div>-->
      </div>
    </BalCard>
    <BalCard class="mb-4" v-if="requireReviewTimestamp && hasStakedXembr">
      <div class="step-card-container">
        <div class="ml-3 flex-1 mt-4">
          <XEmbrReviewTimestamp :loading="props.loading" />
        </div>
      </div>
    </BalCard>
    <BalCard class="mb-4">
      <div class="step-card-container">
        <div class="ml-3 flex-1 mt-4 text-sm font-bold md:text-lg" style="text-align: center">
          <div class="mt-4">
            <span>Stake your Embr</span>
          </div>
          <div class="mt-4">
            <span>into the</span>
          </div>
          <div class="mt-4">
            <span>xEmbr reward pool</span>
          </div>
          
        </div>
        <div class="ml-4">
          <XEmbrDepositForm :loading="props.loading" />
        </div>
      </div>
    </BalCard>
    <BalCard class="mb-4" v-if="!props.hasCoolingEmbr && !props.hasWithdrawableEmbr && props.hasStakedXembr">
      <div class="step-card-container">
         <XEmbrCooldownForm :loading="props.loading" />
      </div>
    </BalCard>
    <BalCard class="mb-4" v-if="props.hasCoolingEmbr && !props.hasWithdrawableEmbr">
      <div class="step-card-container">
          <XEmbrCoolingDown :loading="props.loading" />
      </div>
    </BalCard>
    <BalCard class="mb-4" v-if="props.hasWithdrawableEmbr">
      <div class="step-card-container">
        <XEmbrWithdrawForm :loading="props.loading" />
      </div>
    </BalCard>
  </div>
</template>
