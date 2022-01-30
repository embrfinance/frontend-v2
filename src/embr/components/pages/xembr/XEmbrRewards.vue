<script setup lang="ts">
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { useXEmbrReward } from '@/embr/composables/stake/useXEmbrReward';
import useNumbers from '@/composables/useNumbers';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import useTokens from '@/composables/useTokens';
import numeral from 'numeral';

type Props = {
  loading: boolean;
  rewardTokens: [];
  earned: []
};

const props = defineProps<Props>();

const { fNum } = useNumbers();



const { tokens, nativeAsset } = useTokens();

const calcEarned = function(index: number) {
  return props.earned[index] ? props.earned[index] : 0;
}
/**
 * STATE
 */
</script>

<template>
  <BalCard class="mb-4 pb-1">
    <div class="flex flex-col flex-grow">
      <h2 class="text-lg font-light mb-2">
        xEmbr Rewards
      </h2>
    </div>

    <BalLoadingBlock v-if="props.loading" class="h-64 w-128 mb-1" white />
    <div
      v-else
      v-for="(item) in props.rewardTokens"
      :key="item.index"
    >
      <div class="flex flex-col flex-grow">
        <div class="flex items-center space-x-4">
            <img :src="tokens[item.address].logoURI" width="36" />
            <div class="flex flex-col justify-center">
              <p  class="text-sm font-bold md:text-lg">
                  {{ tokens[item.address].name }}
              </p>
              <p class="text-sm md:text-base text-primary">Pending: {{ calcEarned(item.index) }}</p>
            </div>
        </div>
        <div class="pb-4">
          <BalBtn
            color="transparent"
            flat
            :size="'sm'"
            class="mr-2 text-base"
            :circle="false"
          >
            <img
              src="~@/embr/assets/images/farmAPR.png"
              width="26"
              class="mr-2"
            /> Claim {{ tokens[item.address].symbol }}
            <img
              src="~@/embr/assets/images/farmAPR.png"
              width="26"
              class="ml-2"
            />
          </BalBtn>
        </div>
      </div>
    </div>
  </BalCard>
</template>
