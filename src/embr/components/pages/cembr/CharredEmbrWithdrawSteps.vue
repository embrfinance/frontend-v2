<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import StepContainer from '@/embr/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import FarmWithdrawForm from '@/embr/components/pages/farm/FarmWithdrawForm.vue';
import CharredEmbrWithdrawForm from '@/embr/components/pages/cembr/CharredEmbrWithdrawForm.vue';
import { useCharredEmbr } from '@/embr/composables/stake/useCharredEmbr';
import useFarmUserQuery from '@/embr/composables/farms/useFarmUserQuery';

type Props = {
  hasBpt: boolean;
  hasUnstakedCembr: boolean;
  hasStakedCembr: boolean;
  loading: boolean;
};

const props = defineProps<Props>();

const { appNetworkConfig } = useWeb3();
const { CharredEmbrQuery } = useCharredEmbr();
const farmUserQuery = useFarmUserQuery(appNetworkConfig.cEmbr.farmId);

function handleFarmWithdrawal(txReceipt): void {
  CharredEmbrQuery.refetch.value();
  farmUserQuery.refetch.value();
}
</script>

<template>
  <StepContainer
    :step-number="1"
    title="Withdraw your cEMBR from the cEMBR farm"
    :complete="props.hasUnstakedCembr || props.hasBpt"
  >
    <template v-slot:content>
      <FarmWithdrawForm
        :farm-id="appNetworkConfig.cEmbr.farmId"
        :token-address="appNetworkConfig.cEmbr.address"
        token-name="cEMBR"
        @success="handleFarmWithdrawal($event)"
        :data-loading="props.loading"
      />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="2"
    title="Burn your cEMBR and receive Fidelio Duetto BPTs"
    :complete="props.hasBpt"
  >
    <template v-slot:content>
      <CharredEmbrWithdrawForm :loading="props.loading" />
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
          params: { id: appNetworkConfig.cEmbr.poolId }
        }"
        label="Withdraw"
      />
    </template>
  </StepContainer>
</template>
