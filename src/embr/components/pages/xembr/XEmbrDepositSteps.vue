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
import XEmbrChart from '@/embr/components/pages/xembr/XEmbrChart.vue';


//import FarmDepositForm from '@/embr/components/pages/farm/FarmDepositForm.vue';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';
import BigNumber from 'bignumber.js';

type Props = {
  hasUnstakedEmbr: boolean;
  hasStakedXembr: boolean;
  hasCoolingXembr: boolean;
  hasWithdrawableEmbr: boolean;
  loading: boolean;
  totalEmbrStaking: BigNumber;
  totalXembr: BigNumber;
};

const props = defineProps<Props>();
const { fNum } = useNumbers();


const { appNetworkConfig } = useWeb3();
const { XEmbrQuery } = useXEmbr();

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
  @apply flex items-center;
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
          <div>
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
          <div class="flex-1 ml-4 items-center text-center">
            <p class="text-center">
               <img
              src="~@/embr/assets/images/embry.png"
              width="32"
              style="margin-left: auto;margin-right: auto;display: block;"
            />
            </p>
            <p class="text-sm font-bold md:text-lg">
              {{ fNum(totalXembr.toString(), 'token') }}
            </p>
            <p class="text-sm md:text-base text-primary">
              Total Xembr
            </p>
          </div>
          <div class="flex-3 items-end">
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
    <BalCard class="mb-4" v-if="props.hasUnstakedEmbr && !props.hasStakedXembr">
      <div class="step-card-container">
        <div class="ml-3 flex-1">
          <span>Invest your Embr into the xEmbr reward pool</span>
        </div>
        <div class="ml-4">
          <XEmbrDepositForm :loading="props.loading" />
        </div>
      </div>
    </BalCard>
    <BalCard class="mb-4" v-if="props.hasStakedXembr">
      <div class="step-card-container">
        <div class="ml-3 flex-1">
          <span>Increase your xEMBR stake amount</span>
        </div>
        <div class="ml-4">
          <XEmbrIncreaseDepositAmountForm :loading="props.loading" />
        </div>
      </div>
    </BalCard>
    <BalCard class="mb-4" v-if="!props.hasCoolingXembr && !props.hasWithdrawableEmbr">
      <div class="step-card-container">
        <div class="ml-3 flex-1">
          <span>Start cooldown to withdraw your Embr</span>
        </div>
        <div class="ml-4">
          <XEmbrCooldownForm :loading="props.loading" />
        </div>
      </div>
    </BalCard>
    <BalCard class="mb-4" v-if="props.hasCoolingXembr && !props.hasWithdrawableEmbr">
      <div class="step-card-container">
        <div class="ml-3 flex-1">
          <span>End your cooldown to return the xEmbr to your xEmbr balance</span>
        </div>
        <div class="ml-4">
          <XEmbrWithdrawForm :loading="props.loading" />
        </div>
      </div>
    </BalCard>
    <BalCard class="mb-4" v-if="props.hasWithdrawableEmbr">
      <div class="step-card-container">
        <div class="ml-3 flex-1">
          <span>Burn your xEMBR and receive your locked EMBR</span>
        </div>
        <div class="ml-4">
          <XEmbrWithdrawForm :loading="props.loading" />
        </div>
      </div>
    </BalCard>
  </div>
</template>
