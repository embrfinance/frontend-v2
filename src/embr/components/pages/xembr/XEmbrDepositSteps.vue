<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import StepContainer from '@/embr/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import XEmbrDepositForm from '@/embr/components/pages/xembr/XEmbrDepositForm.vue';
//import FarmDepositForm from '@/embr/components/pages/farm/FarmDepositForm.vue';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';

type Props = {
  hasUnstakedEmbr: boolean;
  hasStakedXembr: boolean;
  loading: boolean;
};

const props = defineProps<Props>();

const { appNetworkConfig } = useWeb3();
const { XEmbrQuery } = useXEmbr();

function handleEmbrDeposit(txReceipt): void {
  XEmbrQuery.refetch.value();
}
</script>

<template>
  <StepContainer
    :step-number="1"
    title="Invest your Embr into the xEmbr reward pool"
    :complete="props.hasUnstakedEmbr"
  >
    <template v-slot:right>
      <BalBtn
        class="w-40"
        tag="router-link"
        :to="{
          name: 'invest',
          params: { id: appNetworkConfig.xEmbr.poolId }
        }"
        label="Invest"
      />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="2"
    title="Increase your xEMBR stake or increase your locktime"
    :complete="props.hasUnstakedEmbr || props.hasStakedXembr"
  >
    <template v-slot:content>
      <XEmbrDepositForm :loading="props.loading" />
    </template>
  </StepContainer>
</template>
