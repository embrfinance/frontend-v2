<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import StepContainer from '@/embr/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import XEmbrDepositForm from '@/embr/components/pages/xembr/XEmbrDepositForm.vue';
import FarmDepositForm from '@/embr/components/pages/farm/FarmDepositForm.vue';
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

function handleFarmDeposit(txReceipt): void {
  XEmbrQuery.refetch.value();
  farmUserQuery.refetch.value();
}
</script>

<template>
  <StepContainer
    :step-number="1"
    title="Invest your Embr into the Fidelio Duetto pool"
    :complete="props.hasBpt || props.hasUnstakedXembr || props.hasStakedXembr"
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
    title="Stake your Fidelio Duetto BPTs and receive xEMBR"
    :complete="props.hasUnstakedXembr || props.hasStakedXembr"
  >
    <template v-slot:content>
      <XEmbrDepositForm :loading="props.loading" />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="3"
    title="Stake your xEMBR into the xEMBR farm"
    :complete="props.hasStakedXembr"
  >
    <template v-slot:content>
      <FarmDepositForm
        :farm-id="appNetworkConfig.xEmbr.farmId"
        :token-address="appNetworkConfig.xEmbr.address"
        token-name="xEMBR"
        :data-loading="props.loading"
        @success="handleFarmDeposit($event)"
      />
    </template>
  </StepContainer>
</template>
