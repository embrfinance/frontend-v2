<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import StepContainer from '@/embr/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import XEmbrWithdrawForm from '@/embr/components/pages/xembr/XEmbrWithdrawForm.vue';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';

type Props = {
  hasBpt: boolean;
  hasUnstakedXembr: boolean;
  hasStakedXembr: boolean;
  loading: boolean;
}; 

const props = defineProps<Props>();

const { appNetworkConfig } = useWeb3();
const { XEmbrQuery } = useXEmbr();

function handleXembrWithdrawal(txReceipt): void {
  XEmbrQuery.refetch.value();
}
</script>

<template>
  <StepContainer
    :step-number="1"
    title="Burn your xEMBR and receive your locked EMBR"
    :complete="props.hasBpt"
  >
    <template v-slot:content>
      <XEmbrWithdrawForm :loading="props.loading" />
    </template>
  </StepContainer>
</template>
