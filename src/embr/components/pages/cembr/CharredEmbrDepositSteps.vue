<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import StepContainer from '@/embr/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import CharredEmbrDepositForm from '@/embr/components/pages/cembr/CharredEmbrDepositForm.vue';
import FarmDepositForm from '@/embr/components/pages/farm/FarmDepositForm.vue';
import { useCharredEmbr } from '@/embr/composables/stake/useCharredEmbr';
import useFarmUserQuery from '@/embr/composables/farms/useFarmUserQuery';

type Props = {
  hasBpt: boolean;
  hasUnstakedFembr: boolean;
  hasStakedFembr: boolean;
  loading: boolean;
};

const props = defineProps<Props>();

const { appNetworkConfig } = useWeb3();
const { CharredEmbrQuery } = useCharredEmbr();
const farmUserQuery = useFarmUserQuery(appNetworkConfig.cEmbr.farmId);

function handleFarmDeposit(txReceipt): void {
  CharredEmbrQuery.refetch.value();
  farmUserQuery.refetch.value();
}
</script>

<template>
  <StepContainer
    :step-number="1"
    title="Invest your Embr into the Fidelio Duetto pool"
    :complete="props.hasBpt || props.hasUnstakedFembr || props.hasStakedFembr"
  >
    <template v-slot:right>
      <BalBtn
        class="w-40"
        tag="router-link"
        :to="{
          name: 'invest',
          params: { id: appNetworkConfig.cEmbr.poolId }
        }"
        label="Invest"
      />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="2"
    title="Stake your Fidelio Duetto BPTs and receive cEMBR"
    :complete="props.hasUnstakedFembr || props.hasStakedFembr"
  >
    <template v-slot:content>
      <CharredEmbrDepositForm :loading="props.loading" />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="3"
    title="Stake your cEMBR into the cEMBR farm"
    :complete="props.hasStakedFembr"
  >
    <template v-slot:content>
      <FarmDepositForm
        :farm-id="appNetworkConfig.cEmbr.farmId"
        :token-address="appNetworkConfig.cEmbr.address"
        token-name="cEMBR"
        :data-loading="props.loading"
        @success="handleFarmDeposit($event)"
      />
    </template>
  </StepContainer>
</template>
