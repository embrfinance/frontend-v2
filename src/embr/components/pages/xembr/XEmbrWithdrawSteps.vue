<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import StepContainer from '@/embr/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import FarmWithdrawForm from '@/embr/components/pages/farm/FarmWithdrawForm.vue';
import XEmbrWithdrawForm from '@/embr/components/pages/xembr/XEmbrWithdrawForm.vue';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';
import useFarmUserQuery from '@/embr/composables/farms/useFarmUserQuery';

type Props = {
  hasBpt: boolean;
  hasUnstakedXembr: boolean;
  hasStakedXembr: boolean;
  loading: boolean;
};

const props = defineProps<Props>();

const { appNetworkConfig } = useWeb3();
const { XEmbrQuery } = useXEmbr();
const farmUserQuery = useFarmUserQuery(appNetworkConfig.xEmbr.farmId);

function handleFarmWithdrawal(txReceipt): void {
  XEmbrQuery.refetch.value();
  farmUserQuery.refetch.value();
}
</script>

<template>
  <StepContainer
    :step-number="1"
    title="Withdraw your xEMBR from the xEMBR farm"
    :complete="props.hasUnstakedXembr || props.hasBpt"
  >
    <template v-slot:content>
      <FarmWithdrawForm
        :farm-id="appNetworkConfig.xEmbr.farmId"
        :token-address="appNetworkConfig.xEmbr.address"
        token-name="xEMBR"
        @success="handleFarmWithdrawal($event)"
        :data-loading="props.loading"
      />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="2"
    title="Burn your xEMBR and receive Fidelio Duetto BPTs"
    :complete="props.hasBpt"
  >
    <template v-slot:content>
      <XEmbrWithdrawForm :loading="props.loading" />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="3"
    title="Withdraw your Embr/FTM from the Fidelio Duetto pool"
    :complete="false"
  >
    <template v-slot:right>
      <BalBtn
        class="w-40"
        tag="router-link"
        :to="{
          name: 'withdraw',
          params: { id: appNetworkConfig.xEmbr.poolId }
        }"
        label="Withdraw"
      />
    </template>
  </StepContainer>
</template>
