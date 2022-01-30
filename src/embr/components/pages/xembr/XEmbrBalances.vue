<script setup lang="ts">
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';
import useNumbers from '@/composables/useNumbers';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import numeral from 'numeral';

type Props = {
  loading: boolean;
  xEmbrBalance: string;
  embrBalance: string;
};

const props = defineProps<Props>();

const { fNum } = useNumbers();

const {
  userStakedEmbrBalance,
  userXembrBalance,
  userUnstakedEmbrBalance,
  //currentExchangeRate,
  //embrPerShare,
  //avaxPerShare,
  xEmbrLoading
} = useXEmbr();

/**
 * STATE
 */
</script>

<template>
  <BalCard class="mb-4 pb-1">
    <div class="flex flex-col flex-grow">
      <div class="text-sm text-gray-200 font-medium mb-3">
        Embr Available For Stake
      </div>
      <div class="flex items-center space-x-4">
        <img src="~@/embr/assets/images/embr.png" width="52" />
        <div class="flex flex-col justify-center">
          <BalLoadingBlock v-if="props.loading" class="h-6 w-24 mb-1" white />
          <p v-else class="text-sm font-bold md:text-lg">
            {{ fNum(userUnstakedEmbrBalance.toString(), 'token') }}
          </p>
          <p class="text-sm md:text-base text-primary">
            Embr
          </p>
        </div>
      </div>
    </div>
    <div class="flex items-center my-5">
      <div class="h-1 w-full flex-1 bg-gray-700 rounded-3xl" />
      <div class="text-gray-200 mx-2">STAKING</div>
      <div class="h-1 w-full flex-1 bg-gray-700 rounded-3xl" />
    </div>
    <div class="flex flex-col flex-grow">
      <div class="flex items-center space-x-4">
        <img src="~@/embr/assets/images/embrE.png" width="52" />
        <div class="flex flex-col justify-center">
          <BalLoadingBlock v-if="props.loading" class="h-6 w-24 mb-1" white />
          <p v-else class="text-sm font-bold md:text-lg">
            {{ fNum(xEmbrBalance.toString(), 'token') }}
          </p>
          <p class="text-sm md:text-base text-primary">xEMBR</p>
        </div>
      </div>
    </div>
  </BalCard>
</template>
